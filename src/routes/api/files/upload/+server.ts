import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import type {
  ChunkRecord,
  FileRecord,
  UploadResponse,
} from "$lib/ui/file-upload-types.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getDb } from "$lib/server/infra/db.js";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return json({
        success: false,
        results: [],
        totalFiles: 0,
        successCount: 0,
        errorCount: 1,
      }, { status: 400 });
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

    const results = [];

    for (const file of files) {
      try {
        const startTime = Date.now();

        // Read file content
        const content = await file.text();

        // Split text using LangChain
        const chunks = await textSplitter.splitText(content);

        // Generate a unique file ID
        const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Save file metadata to SurrealDB
        const fileRecord: Omit<FileRecord, "id" | "created_at" | "updated_at"> =
        {
          name: fileId,
          original_name: file.name,
          size: file.size,
          mime_type: file.type || "text/plain",
          extension: file.name.split(".").pop() || "",
          upload_path: `/uploads/${fileId}`,
          status: "processing",
          chunk_count: chunks.length,
        };

        // Insert file record
        const [fileResult] = await db.create("files", fileRecord);
        const dbFileId = fileResult.id;

        // Save chunks to SurrealDB
        const chunkRecords: Omit<ChunkRecord, "id" | "created_at">[] = chunks
          .map((chunk, index) => ({
            file_id: String(dbFileId),
            content: chunk,
            chunk_index: index,
            start_char: index * (1000 - 200), // Approximate based on chunk size and overlap
            end_char: index * (1000 - 200) + chunk.length,
            token_count: Math.ceil(chunk.length / 4), // Rough token estimation
          }));

        // Insert chunks individually
        for (const chunkRecord of chunkRecords) {
          await db.create("chunks", chunkRecord);
        }

        // Update file status to uploaded
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
          fileId: String(dbFileId),
          fileName: file.name,
          chunkCount: chunks.length,
          processingTime,
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        results.push({
          success: false,
          fileName: file.name,
          errorMessage: error instanceof Error
            ? error.message
            : "Processing failed",
        });
      }
    }

    const response: UploadResponse = {
      success: true,
      results,
      totalFiles: files.length,
      successCount: results.filter((r) => r.success).length,
      errorCount: results.filter((r) => !r.success).length,
    };

    return json(response);
  } catch (error) {
    return json({
      success: false,
      results: [],
      totalFiles: 0,
      successCount: 0,
      errorCount: 1,
    }, { status: 500 });
  }
};
