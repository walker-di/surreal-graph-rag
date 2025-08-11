// src/routes/api/files/reindex/[id]/+server.ts
import { json, type RequestHandler } from "@sveltejs/kit";
import type { RecordId } from "surrealdb";
import { getFileById } from "$lib/server/infra/files-repo.js";
import { reprocessFile } from "$lib/server/watch/reprocess.js";

export const POST: RequestHandler = async ({ params, request }) => {
  try {
    const id = params.id as unknown as RecordId<"files">;
    const file = await getFileById(id);
    if (!file)
      return json({ success: false, message: "Not found" }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const overrideText =
      (body?.overrideText as string | undefined) ?? undefined;

    if (!overrideText && !file.original_text) {
      return json(
        {
          success: false,
          message: "No source text available; provide overrideText",
        },
        { status: 400 }
      );
    }

    const source = overrideText ?? file.original_text!;
    const res = await reprocessFile(file, source);
    return json({ success: true, changed: res.changed, newSha: res.newSha });
  } catch (e) {
    console.error("Reindex error:", e);
    return json({ success: false, message: "Reindex failed" }, { status: 500 });
  }
};
