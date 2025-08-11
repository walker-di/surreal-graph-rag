// src/routes/api/admin/backfill/+server.ts
import { json, type RequestHandler } from "@sveltejs/kit";
import {
  getAllFilesWithPaths,
  markFileStatus,
} from "$lib/server/infra/files-repo.js";
import { sha256Hex } from "$lib/server/hash.js";

export const POST: RequestHandler = async () => {
  const files = await getAllFilesWithPaths();
  let updated = 0;
  for (const f of files) {
    if (f.original_text && !f.original_sha256) {
      const hash = await sha256Hex(f.original_text);
      await markFileStatus(f.id, f.status ?? "uploaded", {
        original_sha256: hash,
        original_length: f.original_text.length,
      });
      updated++;
    }
  }
  return json({ success: true, updated });
};
