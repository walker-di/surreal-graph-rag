/**
 * File Upload Types
 * TypeScript interfaces for file upload and backend processing
 */

// Database record types (matches existing SurrealDB tables)
export interface FileRecord {
  id: string;
  name: string;
  original_name: string;
  size: number;
  mime_type: string;
  extension: string;
  upload_path: string;
  status: "pending" | "uploading" | "processing" | "uploaded" | "indexing" | "re-indexing" | "ready" | "error";
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChunkRecord {
  id: string;
  file_id: string;
  content: string;
  chunk_index: number;
  start_char: number;
  end_char: number;
  token_count: number;
  created_at: string;
}

// Frontend upload types
export interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  lastModified: Date;
  status: "pending" | "uploading" | "processing" | "uploaded" | "indexing" | "re-indexing" | "ready" | "error";
  progress: number; // 0-100
  errorMessage?: string;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  loaded: number;
  total: number;
  progress: number; // 0-100
  status: "uploading" | "processing" | "completed" | "error";
}

export interface UploadResult {
  success: boolean;
  fileId?: string;
  fileName: string;
  chunkCount?: number;
  processingTime?: number;
  errorMessage?: string;
}

export interface UploadResponse {
  success: boolean;
  results: UploadResult[];
  totalFiles: number;
  successCount: number;
  errorCount: number;
}
