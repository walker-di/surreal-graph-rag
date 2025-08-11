import type { Handle } from "@sveltejs/kit";
import { paraglideMiddleware } from "$lib/paraglide/server";
import { startWatcher } from "$lib/server/watch/watcher.js";
import { SERVER_CONFIG } from "$lib/config.js";

// Temporary: process-level handlers to capture unexpected errors during debugging
if (process.env.NODE_ENV !== "test") {
  process.on("unhandledRejection", (reason) => {
    console.error("[Process] UnhandledRejection", reason);
  });
  process.on("uncaughtException", (err) => {
    console.error("[Process] UncaughtException", err);
  });
}
// Start background watcher on server init (skip during tests)
if (process.env.NODE_ENV !== "test") {
  startWatcher({
    intervalMs: SERVER_CONFIG.watch.intervalMs,
    rootPath: SERVER_CONFIG.watch.rootPath,
    mode: SERVER_CONFIG.watch.mode,
  });
}

const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;

    return resolve(event, {
      transformPageChunk: ({ html }) =>
        html.replace("%paraglide.lang%", locale),
    });
  });

export const handle: Handle = handleParaglide;
