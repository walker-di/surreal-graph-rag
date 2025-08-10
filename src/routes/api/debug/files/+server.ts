import { json, type RequestHandler } from "@sveltejs/kit";
import { getDb } from "$lib/server/infra/db.js";
import type { FileRecord, ChunkRecord } from "$lib/ui/file-upload-types.js";

export const GET: RequestHandler = async (event) => {
  try {
    const db = await getDb();
    const runId = event.url.searchParams.get("run_id");

    let files: FileRecord[] = [];
    let allChunks: ChunkRecord[] = [];

    if (runId) {
      // Filter by run_id when provided
      const [filesRes] = await db.query(
        "SELECT * FROM files WHERE run_id = $runId ORDER BY created_at DESC",
        { runId }
      );
      files = ((filesRes as any)?.result ?? []) as FileRecord[];

      if (files.length > 0) {
        const fileIds = files.map((f) => f.id);
        const [chunksRes] = await db.query(
          "SELECT * FROM chunks WHERE file_id INSIDE $fileIds",
          { fileIds }
        );
        allChunks = ((chunksRes as any)?.result ?? []) as ChunkRecord[];
      } else {
        allChunks = [];
      }
    } else {
      // No filter: fetch all
      files = (await db.select("files")) as unknown as FileRecord[];
      allChunks = (await db.select("chunks")) as unknown as ChunkRecord[];
      // Newest first
      files.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
    }

    // Group chunks by file_id
    const chunks: Record<string, ChunkRecord[]> = {};
    allChunks.forEach((chunk) => {
      const key = String((chunk as any).file_id ?? "");
      if (!chunks[key]) {
        chunks[key] = [];
      }
      chunks[key].push(chunk);
    });

    // Sort chunks by chunk_index within each file
    Object.keys(chunks).forEach((fileId) => {
      chunks[fileId].sort((a, b) => a.chunk_index - b.chunk_index);
    });

    return json({
      success: true,
      files,
      chunks,
      totalFiles: files.length,
      totalChunks: allChunks.length,
      runId: runId ?? null,
    });
  } catch (error) {
    console.error("Error fetching debug files:", error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch files",
        files: [],
        chunks: {},
        totalFiles: 0,
        totalChunks: 0,
      },
      { status: 500 }
    );
  }
};
