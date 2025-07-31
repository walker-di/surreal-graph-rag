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
 */
export async function uploadFiles(
  files: File[],
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResponse> {
  const formData = new FormData();

  // Add all files to form data
  files.forEach((file) => {
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
          fileName: `${files.length} files`,
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
        } catch (error) {
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
