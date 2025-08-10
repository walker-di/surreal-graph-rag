/**
 * File Upload Utilities
 * Core functions for file upload and validation
 */

import type {
  UploadFile,
  UploadProgress,
  UploadResponse,
  UploadResult,
} from "./file-upload-types.js";

// Supported file extensions for text processing
export const SUPPORTED_TEXT_EXTENSIONS = [
  "md",
  "txt",
  "html",
  "htm",
  "js",
  "ts",
  "jsx",
  "tsx",
  "py",
  "css",
  "scss",
  "sass",
  "json",
  "xml",
  "yaml",
  "yml",
  "sql",
  "sh",
  "bash",
  "zsh",
  "ps1",
  "bat",
  "cmd",
  "c",
  "cpp",
  "h",
  "hpp",
  "java",
  "kt",
  "swift",
  "go",
  "rs",
  "php",
  "rb",
  "pl",
  "r",
  "scala",
  "clj",
  "hs",
  "elm",
  "vue",
  "svelte",
  "astro",
  "mdx",
  "tex",
  "latex",
];

/**
 * Check if file extension is supported for text processing
 */
export function isSupportedTextFile(filename: string): boolean {
  const extension = getFileExtension(filename);
  return SUPPORTED_TEXT_EXTENSIONS.includes(extension);
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot === -1 ? "" : filename.slice(lastDot + 1).toLowerCase();
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Upload files to backend with progress tracking
 * Supports optional batching for large selections to avoid huge multipart bodies.
 */
export async function uploadFiles(
  files: File[],
  onProgress?: (progress: UploadProgress) => void,
  opts?: { batchSize?: number }
): Promise<UploadResponse> {
  // Helper to send a single batch
  function sendBatch(
    batchFiles: File[],
    label: string
  ): Promise<UploadResponse> {
    const formData = new FormData();
    batchFiles.forEach((file) => {
      formData.append(`files`, file);
    });

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress({
            fileId: "batch",
            fileName: label,
            loaded: event.loaded,
            total: event.total,
            progress,
            status: "uploading",
          });
        }
      });

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          try {
            const response: UploadResponse = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            reject(new Error("Invalid response format"));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      // Handle errors
      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      // Start upload
      xhr.open("POST", "/api/files/upload");
      xhr.send(formData);
    });
  }

  const batchSize = opts?.batchSize;
  if (!batchSize || files.length <= batchSize) {
    // Single request path (existing behavior)
    return sendBatch(files, `${files.length} files`);
  }

  // Batching path
  const totalBatches = Math.ceil(files.length / batchSize);
  const aggregate: UploadResponse = {
    success: true,
    results: [],
    totalFiles: 0,
    successCount: 0,
    errorCount: 0,
  };
  let batchIndex = 0;

  while (batchIndex < totalBatches) {
    const start = batchIndex * batchSize;
    const end = Math.min(start + batchSize, files.length);
    const slice = files.slice(start, end);

    // Provide clearer progress label per batch
    const label = `Batch ${batchIndex + 1}/${totalBatches} (${
      slice.length
    } files)`;
    const res = await sendBatch(slice, label);

    aggregate.results.push(...res.results);
    aggregate.totalFiles += res.totalFiles;
    aggregate.successCount += res.successCount;
    aggregate.errorCount += res.errorCount;
    // Preserve runId from the latest batch if provided
    if (res.runId) {
      (aggregate as any).runId = res.runId;
    }

    batchIndex++;
  }

  aggregate.success = aggregate.errorCount === 0;
  return aggregate;
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: "File size exceeds 10MB limit" };
  }

  // Check file type
  if (!isSupportedTextFile(file.name)) {
    return { valid: false, error: "Unsupported file type" };
  }

  return { valid: true };
}
