// src/lib/server/watch/reprocess.ts
import { buildTextSplitter } from "../chunking.js";
import { sha256Hex } from "../hash.js";
import {
  insertChunks,
  deleteChunksByFile,
  markFileStatus,
  createReindexEvent,
  type FileRow,
  type RunId,
} from "../infra/files-repo.js";

export async function reprocessFile(
  file: FileRow,
  sourceText: string,
  runId?: RunId
): Promise<{ changed: boolean; newSha: string }> {
  const start = Date.now();
  const oldSha = file.original_sha256 ?? null;
  const newSha = await sha256Hex(sourceText);

  if (oldSha && newSha === oldSha) {
    return { changed: false, newSha };
  }

  const splitter = buildTextSplitter();
  const chunks = await splitter.splitText(sourceText);

  // Defensive ordering to avoid leaving partial state
  await markFileStatus(file.id, "reindexing");

  try {
    await deleteChunksByFile(file.id);

    await insertChunks(file.id, chunks, runId);

    await markFileStatus(file.id, "uploaded", {
      original_text: sourceText,
      original_length: sourceText.length,
      original_sha256: newSha,
      chunk_count: chunks.length,
    });

    await createReindexEvent({
      fileId: file.id,
      runId,
      oldSha: oldSha ?? undefined,
      newSha,
      status: "ok",
      durationMs: Date.now() - start,
    });

    return { changed: true, newSha };
  } catch (err) {
    await markFileStatus(file.id, "error");
    await createReindexEvent({
      fileId: file.id,
      runId,
      oldSha: oldSha ?? undefined,
      newSha,
      status: "error",
      message: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    });
    throw err;
  }
}
