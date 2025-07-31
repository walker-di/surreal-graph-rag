import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getDb } from "$lib/server/infra/db.js";
import type { FileRecord, ChunkRecord } from "$lib/ui/file-upload-types.js";

export const GET: RequestHandler = async () => {
  try {
    const db = await getDb();

    // Fetch all files
    const files = await db.select<FileRecord>("files");
    
    // Fetch all chunks grouped by file_id
    const allChunks = await db.select<ChunkRecord>("chunks");
    
    // Group chunks by file_id
    const chunks: Record<string, ChunkRecord[]> = {};
    allChunks.forEach(chunk => {
      if (!chunks[chunk.file_id]) {
        chunks[chunk.file_id] = [];
      }
      chunks[chunk.file_id].push(chunk);
    });

    // Sort chunks by chunk_index within each file
    Object.keys(chunks).forEach(fileId => {
      chunks[fileId].sort((a, b) => a.chunk_index - b.chunk_index);
    });

    // Sort files by created_at (newest first)
    files.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return json({
      success: true,
      files,
      chunks,
      totalFiles: files.length,
      totalChunks: allChunks.length
    });

  } catch (error) {
    console.error("Error fetching debug files:", error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch files",
      files: [],
      chunks: {},
      totalFiles: 0,
      totalChunks: 0
    }, { status: 500 });
  }
};
