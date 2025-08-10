import { json, type RequestHandler } from "@sveltejs/kit";
import type {
  ChunkRecord,
  FileRecord,
  UploadResponse,
} from "$lib/ui/file-upload-types.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getDb } from "$lib/server/infra/db.js";
import type { RecordId } from "surrealdb";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_TEXT_EXTENSIONS = [
  "md",
  "txt",
  "html",
  "htm",
  "js",
  "ts",
  "jsx",
  "tsx",
  "py",
  "css",
  "scss",
  "sass",
  "json",
  "xml",
  "yaml",
  "yml",
  "sql",
  "sh",
  "bash",
  "zsh",
  "ps1",
  "bat",
  "cmd",
  "c",
  "cpp",
  "h",
  "hpp",
  "java",
  "kt",
  "swift",
  "go",
  "rs",
  "php",
  "rb",
  "pl",
  "r",
  "scala",
  "clj",
  "hs",
  "elm",
  "vue",
  "svelte",
  "astro",
  "mdx",
  "tex",
  "latex",
];
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot === -1 ? "" : filename.slice(lastDot + 1).toLowerCase();
}

/**
 * Compute SHA-256 hex using Web Crypto (works in SvelteKit runtime)
 */
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hashBuffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return json(
        {
          success: false,
          results: [],
          totalFiles: 0,
          successCount: 0,
          errorCount: 1,
        },
        { status: 400 }
      );
    }

    // Initialize LangChain text splitter
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: [
        "\n\n",
        "\n",
        " ",
        ".",
        ",",
        "\u200b",
        "\uff0c",
        "\u3001",
        "\uff0e",
        "\u3002",
        "",
      ],
    });

    // Connect to SurrealDB
    const db = await getDb();

    // Create ingest run
    const startedAt = new Date().toISOString();
    const [run] = await db.create("ingest_runs", {
      started_at: startedAt,
      file_count: 0,
      chunk_count: 0,
      error_count: 0,
    });
    const runId = run.id as RecordId<"ingest_runs">;

    const results: UploadResponse["results"] = [];
    let successCount = 0;
    let errorCount = 0;
    let totalChunkCount = 0;

    for (const file of files) {
      let dbFileId: RecordId<"files"> | undefined;
      try {
        const startTime = Date.now();

        // Server-side validation: size
        if (file.size > MAX_FILE_SIZE_BYTES) {
          results.push({
            success: false,
            fileName: file.name,
            errorMessage: "File size exceeds 10MB limit",
          });
          errorCount += 1;
          continue;
        }

        // Server-side validation: extension/type
        const ext = getFileExtension(file.name);
        if (!SUPPORTED_TEXT_EXTENSIONS.includes(ext)) {
          results.push({
            success: false,
            fileName: file.name,
            errorMessage: "Unsupported file type",
          });
          errorCount += 1;
          continue;
        }

        // Generate a unique path and prepare base record
        const fileId = `file_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // 1) Create file as 'pending' to obtain DB ID
        const baseRecord: Omit<FileRecord, "id" | "created_at" | "updated_at"> =
          {
            name: fileId,
            original_name: file.name,
            size: file.size,
            mime_type: file.type || "text/plain",
            extension: ext,
            upload_path: `/uploads/${fileId}`,
            status: "pending",
            chunk_count: 0,
            // run_id is not in the shared type; will be merged post-create to avoid type mismatch
          };

        const [fileResult] = await db.create("files", baseRecord);
        dbFileId = fileResult.id as RecordId<"files">;

        // Attach additional metadata immediately (run correlation)
        await db.merge(dbFileId, {
          run_id: runId,
          name: fileId,
          updated_at: new Date().toISOString(),
        });

        // 2) Transition to 'uploading'
        await db.merge(dbFileId, {
          status: "uploading",
          updated_at: new Date().toISOString(),
        });

        // 3) Read file content and compute metadata
        const content = await file.text();
        const originalLength = content.length;
        const originalSha256 = await sha256Hex(content);

        // 4) Split text using LangChain
        const chunks = await textSplitter.splitText(content);

        // 5) Transition to 'processing' and attach original text into files table
        await db.merge(dbFileId, {
          status: "processing",
          original_text: content,
          original_length: originalLength,
          original_sha256: originalSha256,
          chunk_count: chunks.length,
          updated_at: new Date().toISOString(),
        });

        // 6) Save chunks to SurrealDB
        const chunkRecords: Omit<ChunkRecord, "id" | "created_at">[] =
          chunks.map(
            (chunk, index) =>
              ({
                file_id: dbFileId!,
                content: chunk,
                chunk_index: index,
                start_char: index * (1000 - 200), // Approximate based on chunk size and overlap
                end_char: index * (1000 - 200) + chunk.length,
                token_count: Math.ceil(chunk.length / 4), // Rough token estimation
                // run_id optional on chunks, merge via create payload
                run_id: runId,
              } as any)
          );

        for (const chunkRecord of chunkRecords) {
          await db.create("chunks", chunkRecord as any);
        }

        // 7) Transition to 'uploaded'
        await db.merge(dbFileId, {
          status: "uploaded",
          updated_at: new Date().toISOString(),
        });

        const processingTime = Date.now() - startTime;

        console.log(`Successfully processed file: ${file.name}`);
        console.log(`- Database file ID: ${dbFileId}`);
        console.log(`- Original size: ${content.length} characters`);
        console.log(`- Generated chunks: ${chunks.length}`);
        console.log(`- Processing time: ${processingTime}ms`);

        results.push({
          success: true,
          fileId: dbFileId as unknown as string,
          fileName: file.name,
          chunkCount: chunks.length,
          processingTime,
        });
        successCount += 1;
        totalChunkCount += chunks.length;
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);

        // Mark file as error if it was already created
        if (dbFileId) {
          try {
            await db.merge(dbFileId, {
              status: "error",
              updated_at: new Date().toISOString(),
            });
          } catch (mergeErr) {
            console.error("Failed to mark file as error:", mergeErr);
          }
        }

        results.push({
          success: false,
          fileName: file.name,
          errorMessage:
            error instanceof Error ? error.message : "Processing failed",
        });
        errorCount += 1;
      }
    }

    // Finalize ingest run
    await db.merge(runId, {
      finished_at: new Date().toISOString(),
      file_count: successCount + errorCount,
      chunk_count: totalChunkCount,
      error_count: errorCount,
    });

    const response: UploadResponse & { runId: string } = {
      success: true,
      results,
      totalFiles: files.length,
      successCount,
      errorCount,
      runId: String(runId),
    };

    return json(response);
  } catch (error) {
    return json(
      {
        success: false,
        results: [],
        totalFiles: 0,
        successCount: 0,
        errorCount: 1,
      },
      { status: 500 }
    );
  }
};
