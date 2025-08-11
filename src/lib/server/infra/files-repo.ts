// src/lib/server/infra/files-repo.ts
import { getDb } from "./db.js";
import type { RecordId } from "surrealdb";

export type FileId = RecordId<"files">;
export type RunId = RecordId<"watch_runs">;

export interface FileRow {
  id: FileId;
  name: string;
  original_name: string;
  original_text?: string;
  original_length?: number;
  original_sha256?: string;
  upload_path?: string;
  status?: string;
  chunk_count?: number;
  updated_at?: string;
}

export interface ChunkRow {
  id: RecordId<"chunks">;
  file_id: FileId;
  content: string;
  chunk_index: number;
  start_char: number;
  end_char: number;
  token_count: number;
  run_id?: RecordId<"ingest_runs"> | RunId;
}

export async function getAllFilesWithPaths(): Promise<FileRow[]> {
  const db = await getDb();
  return (await db.select("files")) as unknown as FileRow[];
}

export async function getFileById(id: FileId): Promise<FileRow | null> {
  const db = await getDb();
  const res = (await db.select(id)) as unknown as FileRow | null;
  return res;
}

export async function deleteChunksByFile(fileId: FileId): Promise<void> {
  const db = await getDb();
  await db.query("DELETE FROM chunks WHERE file_id = $fileId", { fileId });
}

export async function insertChunks(
  fileId: FileId,
  chunks: string[],
  runId?: RunId
): Promise<void> {
  const db = await getDb();
  const records = chunks.map((content, index) => ({
    file_id: fileId,
    content,
    chunk_index: index,
    start_char: index * (1000 - 200),
    end_char: index * (1000 - 200) + content.length,
    token_count: Math.ceil(content.length / 4),
    run_id: runId,
  }));
  for (const rec of records) {
    await db.create("chunks", rec as any);
  }
}

export async function markFileStatus(
  fileId: FileId,
  status: string,
  patch?: Partial<FileRow>
): Promise<void> {
  const db = await getDb();
  await db.merge(fileId, {
    status,
    updated_at: new Date().toISOString(),
    ...(patch || {}),
  });
}

export async function createWatchRun(): Promise<RunId> {
  const db = await getDb();
  const [run] = await db.create("watch_runs", {
    started_at: new Date().toISOString(),
    mode: "fs",
    scanned_count: 0,
    changed_count: 0,
    error_count: 0,
  } as any);
  return run.id as RunId;
}

export async function finishWatchRun(
  runId: RunId,
  summary: { scanned: number; changed: number; errors: number }
): Promise<void> {
  const db = await getDb();
  await db.merge(runId, {
    finished_at: new Date().toISOString(),
    file_count: summary.scanned,
    changed_count: summary.changed,
    error_count: summary.errors,
  } as any);
}

export async function createReindexEvent(args: {
  fileId: FileId;
  runId?: RunId;
  oldSha?: string;
  newSha: string;
  status: "ok" | "error";
  message?: string;
  durationMs: number;
}): Promise<void> {
  const db = await getDb();
  await db.create("reindex_events", {
    file_id: args.fileId,
    run_id: args.runId,
    old_sha256: args.oldSha,
    new_sha256: args.newSha,
    status: args.status,
    message: args.message ?? "",
    duration_ms: args.durationMs,
    created_at: new Date().toISOString(),
  } as any);
}
