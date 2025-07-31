import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getDb } from "$lib/server/infra/db.js";

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return json({
        success: false,
        error: "File ID is required"
      }, { status: 400 });
    }

    const db = await getDb();

    // First, delete all chunks associated with this file
    await db.query("DELETE FROM chunks WHERE file_id = $fileId", {
      fileId: id
    });

    // Then delete the file record
    const deletedFiles = await db.delete(id);

    if (!deletedFiles || deletedFiles.length === 0) {
      return json({
        success: false,
        error: "File not found"
      }, { status: 404 });
    }

    console.log(`Successfully deleted file ${id} and its chunks`);

    return json({
      success: true,
      message: "File and chunks deleted successfully",
      deletedFile: deletedFiles[0]
    });

  } catch (error) {
    console.error(`Error deleting file ${params.id}:`, error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete file"
    }, { status: 500 });
  }
};
