// src/routes/api/files/register/+server.ts
import { json, type RequestHandler } from "@sveltejs/kit";
import { getDb } from "$lib/server/infra/db.js";
import { SERVER_CONFIG } from "$lib/config.js";
import { buildTextSplitter } from "$lib/server/chunking.js";
import { sha256Hex } from "$lib/server/hash.js";
import { resolve as resolvePath, basename, sep } from "node:path";
import { readFile, access } from "node:fs/promises";
import type { RecordId } from "surrealdb";

function resolveOnDiskPath(inputPath: string, rootPath: string): string {
  // Treat only drive-letter (C:\...) or UNC (\\server\share) as absolute on Windows.
  // Leading "/" should be considered relative to rootPath to avoid "C:\\uploads\\..."
  const isDriveAbs =
    /^[A-Za-z]:[\\/]/.test(inputPath) || inputPath.startsWith("\\\\");
  const normalizedRel = inputPath.replace(/^[/\\]+/, "");
  return isDriveAbs ? inputPath : resolvePath(rootPath, normalizedRel);
}

/**
 * Register an existing file on disk so the watcher can monitor and reindex it.
 * POST /api/files/register
 * Body: { path: string, name?: string }
 * - path: repository-relative or absolute on-disk path (e.g., "src/lib/config.ts")
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const inputPath = String(body?.path || "").trim();
    if (!inputPath) {
      return json(
        { success: false, message: "Missing 'path' in body" },
        { status: 400 }
      );
    }

    const diskPath = resolveOnDiskPath(inputPath, SERVER_CONFIG.watch.rootPath);

    try {
      await access(diskPath);
    } catch {
      return json(
        {
          success: false,
          message: `File not found on disk at resolved path: ${diskPath}`,
        },
        { status: 404 }
      );
    }

    const content = await readFile(diskPath, "utf8");
    const originalSha256 = await sha256Hex(content);

    const splitter = buildTextSplitter();
    const chunks = await splitter.splitText(content);

    const db = await getDb();

    // Create a file record using a deterministic name if provided, else based on basename+timestamp
    const safeName =
      (body?.name as string | undefined)?.trim() ||
      `registered_${basename(inputPath)}_${Date.now()}`;

    const [fileRec] = await db.create("files", {
      name: safeName,
      original_name: basename(inputPath),
      size: content.length,
      mime_type: "text/plain",
      extension: (basename(inputPath).split(".").pop() || "").toLowerCase(),
      upload_path: inputPath.replaceAll("\\", "/"), // store as provided (slash-normalized), watcher resolves at runtime
      status: "processing",
      original_text: content,
      original_length: content.length,
      original_sha256: originalSha256,
      chunk_count: chunks.length,
      updated_at: new Date().toISOString(),
    });

    const fileId = fileRec.id as RecordId<"files">;

    // Insert chunks
    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index];
      await db.create("chunks", {
        file_id: fileId,
        content: chunk,
        chunk_index: index,
        start_char: index * (1000 - 200),
        end_char: index * (1000 - 200) + chunk.length,
        token_count: Math.ceil(chunk.length / 4),
      } as any);
    }

    // Finalize status
    await db.merge(fileId, {
      status: "uploaded",
      updated_at: new Date().toISOString(),
    });

    return json({
      success: true,
      fileId: String(fileId),
      upload_path: inputPath.replaceAll("\\", "/"),
      chunkCount: chunks.length,
      resolvedPath: diskPath.split(sep).join("/"),
    });
  } catch (e) {
    console.error("Register file failed:", e);
    return json(
      { success: false, message: "Registration failed" },
      { status: 500 }
    );
  }
};
