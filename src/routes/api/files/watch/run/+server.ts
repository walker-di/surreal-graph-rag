// src/routes/api/files/watch/run/+server.ts
import { json, type RequestHandler } from "@sveltejs/kit";
import { startWatcher, triggerWatchNow } from "$lib/server/watch/watcher.js";
import { SERVER_CONFIG } from "$lib/config.js";
import { getAllFilesWithPaths } from "$lib/server/infra/files-repo.js";
import { getDb } from "$lib/server/infra/db.js";
import { reprocessFile } from "$lib/server/watch/reprocess.js";
import { readFile, access } from "node:fs/promises";
import { resolve as resolvePath } from "node:path";

export const POST: RequestHandler = async ({ request }) => {
  // Optional targeted run for a single path to avoid scanning all DB rows
  const body = await request.json().catch(() => ({}));
  const pathArg = typeof body?.path === "string" ? body.path.trim() : "";

  // DB preflight to avoid starting runs when DB is unavailable
  try {
    const db = await getDb();
    await db.info();
  } catch (err) {
    console.error("[WatchRun] DB preflight failed", err);
    return json(
      { success: false, message: "Database unavailable" },
      { status: 503 }
    );
  }

  // Always ensure watcher is initialized with current config (for subsequent interval cycles)
  try {
    startWatcher({
      intervalMs: SERVER_CONFIG.watch.intervalMs,
      rootPath: SERVER_CONFIG.watch.rootPath,
      mode: SERVER_CONFIG.watch.mode,
    });
  } catch (err) {
    console.error("[WatchRun] startWatcher failed", err);
    return json(
      { success: false, message: "Failed to start watcher" },
      { status: 500 }
    );
  }

  if (pathArg) {
    // Targeted: resolve path and reprocess only matching file records by upload_path
    const resolved = resolvePath(
      SERVER_CONFIG.watch.rootPath,
      pathArg.replace(/^[/\\]+/, "")
    );
    try {
      await access(resolved);
    } catch {
      return json(
        { success: false, message: `File not found on disk: ${resolved}` },
        { status: 404 }
      );
    }

    const content = await readFile(resolved, "utf8");
    const all = await getAllFilesWithPaths();
    // Normalize stored upload_path to compare with provided pathArg as given
    const normalizedPathArg = pathArg.replaceAll("\\", "/");
    const targets = all.filter(
      (f) => (f.upload_path || "").replaceAll("\\", "/") === normalizedPathArg
    );

    if (targets.length === 0) {
      return json(
        {
          success: false,
          message:
            "No files record found with upload_path matching provided path. Use /api/files/register to register this path first.",
        },
        { status: 404 }
      );
    }

    let changed = 0;
    let errors = 0;
    const results: Array<{ id: string; changed: boolean }> = [];
    for (const f of targets) {
      try {
        const res = await reprocessFile(f, content);
        results.push({ id: String((f as any).id), changed: res.changed });
        if (res.changed) changed++;
      } catch {
        errors++;
      }
    }
    return json({
      success: true,
      targeted: true,
      path: normalizedPathArg,
      fileCount: targets.length,
      changed,
      errors,
      results,
    });
  }

  // Full-cycle: force a single immediate run with current options
  try {
    await triggerWatchNow();
    return json({ success: true, started: true, forced: true });
  } catch (err) {
    console.error("[WatchRun] triggerWatchNow failed", err);
    return json(
      { success: false, message: "Watch run failed" },
      { status: 500 }
    );
  }
};
