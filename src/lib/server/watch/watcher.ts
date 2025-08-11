// src/lib/server/watch/watcher.ts
import { readFile, access } from "node:fs/promises";
import {
  resolve as resolvePath,
  isAbsolute as isAbsolutePath,
} from "node:path";
import {
  getAllFilesWithPaths,
  createWatchRun,
  finishWatchRun,
  type FileRow,
} from "../infra/files-repo.js";
import { reprocessFile } from "./reprocess.js";
import { sha256Hex } from "../hash.js";

let timer: NodeJS.Timeout | undefined;
let running = false;
let lastOpts: WatcherOptions | undefined;

export interface WatcherOptions {
  intervalMs: number;
  rootPath: string; // prefix for files.upload_path
  mode?: "fs";
  maxConcurrent?: number;
}

export function startWatcher(opts: WatcherOptions) {
  // store latest options
  lastOpts = opts;
  if (timer) return; // already started
  const interval = Math.max(5_000, opts.intervalMs || 60_000);
  // Guard interval run to prevent unhandled rejections from crashing the process
  timer = setInterval(async () => {
    try {
      await runOnce(opts);
    } catch (e) {
      console.error("[Watcher] Interval run failed", e);
    }
  }, interval);
  // Run immediately at startup, guarded
  (async () => {
    try {
      await runOnce(opts);
    } catch (e) {
      console.error("[Watcher] Initial run failed", e);
    }
  })();
  console.log("[Watcher] Started with interval", interval);
}

export function stopWatcher() {
  if (timer) clearInterval(timer);
  timer = undefined;
}

/**
 * Force a single watch cycle immediately with the last known options.
 * If the watcher hasn't been started yet, no-ops.
 */
export async function triggerWatchNow(): Promise<void> {
  if (!lastOpts) {
    console.warn(
      "[Watcher] triggerWatchNow called but no options available yet"
    );
    return;
  }
  await runOnce(lastOpts);
}

async function runOnce(opts: WatcherOptions) {
  if (running) {
    console.log("[Watcher] Skipping: previous run still in progress");
    return;
  }
  running = true;
  const runId = await createWatchRun();
  let scanned = 0;
  let changed = 0;
  let errors = 0;

  console.log("[Watcher] Run start", { runId: String(runId) });
  // limit noisy "missing on disk" logs but still count errors
  let missingLogCount = 0;
  const missingLogLimit = 20;

  try {
    const files = await getAllFilesWithPaths();
    const candidates = files.filter((f) => f.upload_path);

    for (const file of candidates) {
      scanned++;
      try {
        // Normalize upload_path to avoid accidental absolute root (e.g., "C:\uploads")
        // - If absolute, use as-is
        // - If it starts with a leading slash, treat it as relative to rootPath
        const raw = file.upload_path!;
        // Treat only drive-letter (C:\...) or UNC (\\server\share) as absolute on Windows.
        // Leading "/" is treated as relative to rootPath to avoid resolving to "C:\uploads\..."
        const isDriveAbs =
          /^[A-Za-z]:[\\/]/.test(raw) || raw.startsWith("\\\\");
        const rel = raw.replace(/^[/\\]+/, "");
        const fullPath = isDriveAbs ? raw : resolvePath(opts.rootPath, rel);

        // Skip gracefully if file doesn't exist on disk (common when uploads aren't persisted)
        try {
          await access(fullPath);
        } catch {
          errors++;
          if (missingLogCount < missingLogLimit) {
            console.warn(
              "[Watcher] File missing on disk, skipping",
              String(file.id),
              fullPath
            );
          }
          missingLogCount++;
          continue;
        }

        const buff = await readFile(fullPath);
        const content = buff.toString("utf-8");
        const currentSha = await sha256Hex(content);

        if (currentSha !== (file.original_sha256 ?? "")) {
          const res = await reprocessFile(file as FileRow, content, runId);
          if (res.changed) changed++;
        }
      } catch (e) {
        errors++;
        console.error("[Watcher] Failed processing file", file.id, e);
        // reprocessFile handles status + event on its own; failures here are reading/IO
      }
    }
  } finally {
    try {
      console.log("[Watcher] Run end", {
        runId: String(runId),
        scanned,
        changed,
        errors,
        missingFilesLogged: Math.min(missingLogCount, missingLogLimit),
        missingFilesTotal: missingLogCount,
      });
    } catch {
      // ignore logging errors
    }
    await finishWatchRun(runId, { scanned, changed, errors });
    running = false;
  }
}
