# File Upload System - Detailed Step-by-Step Implementation Plan

## Overview

This plan outlines the implementation of a file registration system that allows
users to select multiple files or entire folders, upload them via multipart form
data, and process them into text chunks on the backend. This phase focuses
exclusively on file upload UI and backend text processing without creating
embeddings.

**Important Note**: At this stage, we are implementing the complete file upload
UI and backend text processing pipeline using LangChain text splitters. Files
will be uploaded to the server using multipart form data and processed into
chunks on the backend using langchain/text_splitter. The actual embeddings
generation will be implemented in later phases.

## Why This Approach?

1. **Flexible File Selection**: Support both individual file selection and bulk
   folder processing
2. **Server-Side Processing**: Upload files to backend for secure text
   processing
3. **Text Processing Pipeline**: Process content on backend using robust text
   splitters
4. **Scalable Architecture**: Backend processing designed for future embedding
   integration
5. **Performance Focused**: Efficient multipart uploads with progress tracking
6. **Type Safety**: Full TypeScript integration with proper interfaces

## Audit Checklist Compliance

✅ **Svelte 5 runes usage**: All components use `$state`, `$derived`, `$effect`,
`$props` ✅ **Modern event handling**: Uses `onclick` instead of `on:click`
throughout ✅ **shadcn-svelte best practices**: Follows official component
patterns and API usage ✅ **TypeScript integration**: Full type safety with
proper interfaces ✅ **Package exports**: Properly distributed under correct
export paths

## Target Feature Requirements

### Core Functionality

- ✅ Accept multiple files via file input
- ✅ Allow folder selection using webkitdirectory
- ✅ Upload files using multipart form data
- ✅ Handle text files: .md, .txt, .html, .js, .ts, .py, .css, .json
- ✅ Process files on backend with text splitters
- ✅ Save chunks in dedicated database table
- ❌ NO embeddings generation (future phase)

### Technical Stack

- **Frontend**: Svelte 5 + shadcn-svelte components + File upload UI
- **Backend**: SvelteKit API routes + SurrealDB for storage
- **Text Processing**: langchain/text_splitter (RecursiveCharacterTextSplitter)
- **File Upload**: Multipart form data with progress tracking
- **Type Safety**: Full TypeScript interfaces

## Current State Analysis

Based on the codebase analysis:

- Project uses SvelteKit with TypeScript
- SurrealDB is configured for database operations
- shadcn-svelte components are available in `/ui` export
- File explorer components exist but need file registration functionality
- No existing file registration or text processing components
- Package.json exports are properly configured for modular distribution

## Required Dependencies

### Frontend (Already Available)

- Browser File API (native)
- SvelteKit API routes (built-in)
- shadcn-svelte components (need to install missing ones)

### Backend (Need to Install)

- `langchain` - Core LangChain library
- `@langchain/textsplitters` - Text splitting functionality

## Step-by-Step Implementation

### Phase 1: Install Missing Components (5 minutes)

**Step 1.1: Check Current Components**

```bash
# Check what's already installed
ls src/lib/components/ui/
```

**Step 1.2: Install Missing Components** Run these commands one by one:

```bash
# Install input component
npx shadcn-svelte@latest add input

# Install progress component  
npx shadcn-svelte@latest add progress

# Install alert component
npx shadcn-svelte@latest add alert

# Install label component
npx shadcn-svelte@latest add label
```

**Step 1.3: Verify Installation** Check that these directories now exist:

- `src/lib/components/ui/input/`
- `src/lib/components/ui/progress/`
- `src/lib/components/ui/alert/`
- `src/lib/components/ui/label/`

### Phase 2: Install Backend Dependencies (3 minutes)

**Step 2.1: Install LangChain Dependencies**

```bash
npm install langchain @langchain/textsplitters
```

**Step 2.2: Verify Installation** Check that these appear in package.json
dependencies:

```json
{
  "dependencies": {
    "langchain": "^0.x.x",
    "@langchain/textsplitters": "^0.x.x"
  }
}
```

### Phase 3: Create TypeScript Interfaces (10 minutes)

**Step 3.1: Create File Upload Types**

Create file: `src/lib/ui/file-upload-types.ts`

**IMPORTANT**: Copy this EXACTLY as written:

```typescript
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
  status: "pending" | "uploading" | "processing" | "uploaded" | "indexing" | "re-indexing" | "ready" "error";
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
  status: "pending" | "uploading" | "processing" | "uploaded" | "indexing" | "re-indexing" | "ready" "error";
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
```

**Step 3.2: Verify File Creation**

- Check that `src/lib/ui/file-upload-types.ts` exists
- Check that there are no TypeScript errors in the file

### Phase 4: Create Utility Functions (15 minutes)

**Step 4.1: Create File Upload Utils**

Create file: `src/lib/ui/file-upload-utils.ts`

**IMPORTANT**: This file is too long for one step. Create it with basic
structure first:

```typescript
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
```

**Step 4.2: Add Upload Functions**

Add these functions to `src/lib/ui/file-upload-utils.ts`:

```typescript
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
```

### Phase 5: Create FileSelector Component (20 minutes)

**Step 5.1: Create Basic FileSelector**

Create file: `src/lib/ui/FileSelector.svelte`

**IMPORTANT**: Copy this EXACTLY as written. Use Svelte 5 syntax throughout:

```svelte
<script lang="ts">
  /**
   * File Selector Component
   * Handles file and folder selection with drag-and-drop support
   */

  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import {
    Upload,
    Folder,
    FileText,
    X,
    AlertCircle
  } from "lucide-svelte";
  import {
    isSupportedTextFile,
    formatFileSize,
    SUPPORTED_TEXT_EXTENSIONS
  } from "./file-upload-utils.js";

  // Component props using Svelte 5 $props
  interface Props {
    onFilesSelected: (files: File[]) => void;
    disabled?: boolean;
  }

  let { onFilesSelected, disabled = false }: Props = $props();

  // Component state using Svelte 5 $state
  let fileInput: HTMLInputElement | null = $state(null);
  let folderInput: HTMLInputElement | null = $state(null);
  let selectedFiles: File[] = $state([]);
  let selectionMode: 'files' | 'folder' = $state('files');
  let dragOver: boolean = $state(false);

  // Handle file input change
  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    processSelectedFiles(files);
  }

  // Handle folder input change
  function handleFolderChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    processSelectedFiles(files);
  }

  // Process and filter selected files
  function processSelectedFiles(files: File[]) {
    const textFiles = files.filter(file => isSupportedTextFile(file.name));
    selectedFiles = textFiles;
    onFilesSelected(textFiles);
  }

  // Handle drag and drop
  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragOver = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;

    const files = Array.from(event.dataTransfer?.files || []);
    processSelectedFiles(files);
  }

  // Remove selected file
  function removeFile(index: number) {
    selectedFiles = selectedFiles.filter((_, i) => i !== index);
    onFilesSelected(selectedFiles);
  }

  // Clear all selected files
  function clearFiles() {
    selectedFiles = [];
    onFilesSelected([]);

    // Reset input values
    if (fileInput) fileInput.value = '';
    if (folderInput) folderInput.value = '';
  }

  // Switch selection mode
  function switchMode(mode: 'files' | 'folder') {
    selectionMode = mode;
    clearFiles();
  }

  // Trigger file input click
  function triggerFileInput() {
    if (selectionMode === 'files') {
      fileInput?.click();
    } else {
      folderInput?.click();
    }
  }

  // Calculate total size using Svelte 5 $derived
  const totalSize = $derived(selectedFiles.reduce((sum, file) => sum + file.size, 0));
  const supportedCount = $derived(selectedFiles.length);
  const hasFiles = $derived(selectedFiles.length > 0);
</script>

<Card class="w-full">
  <CardHeader>
    <CardTitle class="flex items-center gap-2">
      <FileText class="h-5 w-5" />
      Select Files for Registration
    </CardTitle>
  </CardHeader>
  <CardContent class="space-y-4">
    <!-- Mode Selection -->
    <div class="flex gap-2">
      <Button
        variant={selectionMode === 'files' ? 'default' : 'outline'}
        size="sm"
        onclick={() => switchMode('files')}
        {disabled}
      >
        <Upload class="h-4 w-4 mr-2" />
        Select Files
      </Button>
      <Button
        variant={selectionMode === 'folder' ? 'default' : 'outline'}
        size="sm"
        onclick={() => switchMode('folder')}
        {disabled}
      >
        <Folder class="h-4 w-4 mr-2" />
        Select Folder
      </Button>
    </div>

    <!-- File Inputs (Hidden) -->
    <input
      bind:this={fileInput}
      type="file"
      multiple
      accept=".{SUPPORTED_TEXT_EXTENSIONS.join(',.')}"
      onchange={handleFileChange}
      class="hidden"
      {disabled}
    />

    <input
      bind:this={folderInput}
      type="file"
      webkitdirectory
      multiple
      onchange={handleFolderChange}
      class="hidden"
      {disabled}
    />

    <!-- Drop Zone -->
    <div
      class="border-2 border-dashed rounded-lg p-8 text-center transition-colors {dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'} {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      ondrop={handleDrop}
      onclick={triggerFileInput}
      role="button"
      tabindex="0"
    >
      {#if selectionMode === 'files'}
        <Upload class="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 class="text-lg font-semibold mb-2">Select Multiple Files</h3>
        <p class="text-muted-foreground mb-4">
          Choose text files to register and process
        </p>
      {:else}
        <Folder class="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 class="text-lg font-semibold mb-2">Select Folder</h3>
        <p class="text-muted-foreground mb-4">
          Choose a folder to register all text files within it
        </p>
      {/if}

      <Button variant="outline" {disabled}>
        {selectionMode === 'files' ? 'Browse Files' : 'Browse Folder'}
      </Button>

      <p class="text-xs text-muted-foreground mt-4">
        Or drag and drop files here
      </p>
    </div>

    <!-- Selected Files List -->
    {#if hasFiles}
      <Separator />
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="font-medium">Selected Files ({supportedCount})</h4>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">
              Total: {formatFileSize(totalSize)}
            </span>
            <Button variant="ghost" size="sm" onclick={clearFiles}>
              <X class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div class="max-h-40 overflow-y-auto space-y-2">
          {#each selectedFiles as file, index (file.name + file.size)}
            <div class="flex items-center justify-between p-2 bg-muted/30 rounded">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <FileText class="h-4 w-4 text-muted-foreground" />
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium truncate">{file.name}</p>
                  <p class="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onclick={() => removeFile(index)}
                class="h-6 w-6 p-0"
              >
                <X class="h-3 w-3" />
              </Button>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </CardContent>
</Card>
```

### Phase 6: Create Main FileUpload Component (20 minutes)

**Step 6.1: Create FileUpload Component**

Create file: `src/lib/ui/FileUpload.svelte`

**IMPORTANT**: Copy this EXACTLY as written:

```svelte
<script lang="ts">
  /**
   * Main File Upload Component
   * Orchestrates the complete file upload workflow
   */

  import { Button } from "$lib/components/ui/button/index.js";
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
  import { Progress } from "$lib/components/ui/progress/index.js";
  import { Alert, AlertDescription } from "$lib/components/ui/alert/index.js";
  import { CheckCircle, AlertCircle, Loader2, Upload } from "lucide-svelte";
  import FileSelector from "./FileSelector.svelte";
  import {
    uploadFiles,
    validateFile
  } from "./file-upload-utils.js";
  import type { UploadResult, UploadProgress } from "./file-upload-types.js";

  // Component props using Svelte 5 $props
  interface Props {
    onUploadComplete?: (results: UploadResult[]) => void;
  }

  let { onUploadComplete }: Props = $props();

  // Component state using Svelte 5 $state
  let selectedFiles: File[] = $state([]);
  let isUploading: boolean = $state(false);
  let uploadProgress: number = $state(0);
  let currentStatus: string = $state('');
  let uploadResults: UploadResult[] = $state([]);
  let showResults: boolean = $state(false);

  // Handle file selection
  function handleFilesSelected(files: File[]) {
    selectedFiles = files;
    showResults = false;
    uploadResults = [];
  }

  // Upload selected files
  async function uploadSelectedFiles() {
    if (selectedFiles.length === 0) return;

    // Validate all files first
    const validationErrors: string[] = [];
    selectedFiles.forEach(file => {
      const validation = validateFile(file);
      if (!validation.valid) {
        validationErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (validationErrors.length > 0) {
      alert('Validation errors:\n' + validationErrors.join('\n'));
      return;
    }

    isUploading = true;
    uploadProgress = 0;
    uploadResults = [];
    showResults = false;
    currentStatus = 'Preparing upload...';

    try {
      // Upload files with progress tracking
      const response = await uploadFiles(selectedFiles, (progress) => {
        uploadProgress = progress.progress;
        currentStatus = `Uploading ${progress.fileName}... ${progress.progress}%`;
      });

      uploadResults = response.results;
      currentStatus = 'Upload completed';

      // Notify parent component
      onUploadComplete?.(response.results);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      currentStatus = errorMessage;

      // Create error results for all files
      uploadResults = selectedFiles.map(file => ({
        success: false,
        fileName: file.name,
        errorMessage
      }));
    }

    isUploading = false;
    showResults = true;
  }

  // Reset the component
  function reset() {
    selectedFiles = [];
    uploadResults = [];
    showResults = false;
    isUploading = false;
    uploadProgress = 0;
    currentStatus = '';
  }

  // Calculate success/failure counts using Svelte 5 $derived
  const successCount = $derived(uploadResults.filter(r => r.success).length);
  const failureCount = $derived(uploadResults.filter(r => !r.success).length);
  const totalChunks = $derived(uploadResults.reduce((sum, r) => sum + (r.chunkCount || 0), 0));
</script>
```

**Step 6.2: Add FileUpload Template**

Continue the same file with the template:

```svelte
<div class="space-y-6">
  <!-- File Selection -->
  <FileSelector
    onFilesSelected={handleFilesSelected}
    disabled={isUploading}
  />

  <!-- Upload Button -->
  {#if selectedFiles.length > 0 && !isUploading && !showResults}
    <div class="flex justify-center">
      <Button onclick={uploadSelectedFiles} size="lg" class="px-8">
        <Upload class="h-4 w-4 mr-2" />
        Upload {selectedFiles.length} File{selectedFiles.length === 1 ? '' : 's'}
      </Button>
    </div>
  {/if}

  <!-- Upload Status -->
  {#if isUploading}
    <Card>
      <CardContent class="pt-6">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <Loader2 class="h-5 w-5 animate-spin" />
            <div>
              <p class="font-medium">Uploading Files...</p>
              <p class="text-sm text-muted-foreground">
                {currentStatus}
              </p>
            </div>
          </div>
          <Progress value={uploadProgress} class="w-full" />
          <p class="text-sm text-center text-muted-foreground">
            {uploadProgress}% complete
          </p>
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Results -->
  {#if showResults}
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <CheckCircle class="h-5 w-5 text-green-500" />
          Upload Complete
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Summary -->
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <p class="text-2xl font-bold text-green-600">{successCount}</p>
            <p class="text-sm text-muted-foreground">Successful</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-red-600">{failureCount}</p>
            <p class="text-sm text-muted-foreground">Failed</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-blue-600">{totalChunks}</p>
            <p class="text-sm text-muted-foreground">Total Chunks</p>
          </div>
        </div>

        <!-- Detailed Results -->
        <div class="space-y-2 max-h-60 overflow-y-auto">
          {#each uploadResults as result}
            <div class="flex items-center justify-between p-3 bg-muted/30 rounded">
              <div class="flex items-center gap-2">
                {#if result.success}
                  <CheckCircle class="h-4 w-4 text-green-500" />
                {:else}
                  <AlertCircle class="h-4 w-4 text-red-500" />
                {/if}
                <span class="font-medium">{result.fileName}</span>
              </div>
              <div class="text-sm text-muted-foreground">
                {#if result.success}
                  {result.chunkCount} chunks
                  {#if result.processingTime}
                    • {result.processingTime}ms
                  {/if}
                {:else}
                  {result.errorMessage}
                {/if}
              </div>
            </div>
          {/each}
        </div>

        <!-- Actions -->
        <div class="flex justify-center gap-2">
          <Button variant="outline" onclick={reset}>
            Upload More Files
          </Button>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
```

**Step 3.2: Test the Implementation**

Create a test page to verify the file upload system:

**File to Create: `src/routes/file-upload/+page.svelte`**

```svelte
<script lang="ts">
  import { FileUpload } from '$lib/ui/index.js';
  import type { UploadResult } from '$lib/ui/file-upload-types.js';

  function handleUploadComplete(results: UploadResult[]) {
    console.log('Upload completed:', results);
  }
</script>

<svelte:head>
  <title>File Upload Demo</title>
  <meta name="description" content="File upload and backend processing demo" />
</svelte:head>

<div class="container mx-auto py-8 px-4">
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold mb-2">File Upload System</h1>
      <p class="text-muted-foreground">
        Upload text files and process them into chunks on the backend
      </p>
    </div>

    <FileUpload onUploadComplete={handleUploadComplete} />
  </div>
</div>
```

**Step 3.3: Create Backend API Endpoint**

Create file: `src/routes/api/files/upload/+server.ts`

**IMPORTANT**: Copy this EXACTLY as written:

```typescript
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import type {
  ChunkRecord,
  FileRecord,
  UploadResponse,
} from "$lib/ui/file-upload-types.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { connect } from "$lib/node/connect.js";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return json({
        success: false,
        results: [],
        totalFiles: 0,
        successCount: 0,
        errorCount: 1,
      }, { status: 400 });
    }

    // Initialize LangChain text splitter
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: [
        "\n\n",
        "\n",
        " ",
        ".",
        ",",
        "\u200b",
        "\uff0c",
        "\u3001",
        "\uff0e",
        "\u3002",
        "",
      ],
    });

    // Connect to SurrealDB
    const db = await connect();

    const results = [];

    for (const file of files) {
      try {
        const startTime = Date.now();

        // Read file content
        const content = await file.text();

        // Split text using LangChain
        const chunks = await textSplitter.splitText(content);

        // Save file metadata to SurrealDB
        const fileRecord: Omit<FileRecord, "id" | "created_at" | "updated_at"> =
          {
            original_name: file.name,
            size: file.size,
            mime_type: file.type || "text/plain",
            extension: file.name.split(".").pop() || "",
            upload_path: `/uploads/${fileId}`,
            status: "processing",
            chunk_count: chunks.length,
          };

        // Insert file record
        const [fileResult] = await db.create("files", fileRecord);
        const dbFileId = fileResult.id;

        // Save chunks to SurrealDB
        const chunkRecords: Omit<ChunkRecord, "id" | "created_at">[] = chunks
          .map((chunk, index) => ({
            file_id: dbFileId,
            content: chunk,
            chunk_index: index,
            start_char: index * (1000 - 200), // Approximate based on chunk size and overlap
            end_char: index * (1000 - 200) + chunk.length,
            token_count: Math.ceil(chunk.length / 4), // Rough token estimation
          }));

        // Batch insert chunks
        await db.create("chunks", chunkRecords);

        // Update file status to uploaded
        await db.merge(dbFileId, {
          status: "uploaded",
          updated_at: new Date().toISOString(),
        });

        const processingTime = Date.now() - startTime;

        console.log(`Successfully processed file: ${file.name}`);
        console.log(`- Database file ID: ${dbFileId}`);
        console.log(`- Original size: ${content.length} characters`);
        console.log(`- Generated chunks: ${chunks.length}`);
        console.log(`- Processing time: ${processingTime}ms`);

        results.push({
          success: true,
          fileId: dbFileId,
          fileName: file.name,
          chunkCount: chunks.length,
          processingTime,
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        results.push({
          success: false,
          fileName: file.name,
          errorMessage: error instanceof Error
            ? error.message
            : "Processing failed",
        });
      }
    }

    const response: UploadResponse = {
      success: true,
      results,
      totalFiles: files.length,
      successCount: results.filter((r) => r.success).length,
      errorCount: results.filter((r) => !r.success).length,
    };

    return json(response);
  } catch (error) {
    return json({
      success: false,
      results: [],
      totalFiles: 0,
      successCount: 0,
      errorCount: 1,
    }, { status: 500 });
  }
};
```

### Phase 8: Update Exports (5 minutes)

**Step 8.1: Update UI Index**

Modify `src/lib/ui/index.ts` to export new components:

**IMPORTANT**: Add these exports to the existing file:

```typescript
// Export file upload components
export { default as FileUpload } from "./FileUpload.svelte";
export { default as FileSelector } from "./FileSelector.svelte";

// Export file upload types and utilities
export type * from "./file-upload-types.js";
export * from "./file-upload-utils.js";
```

### Phase 9: Create Test Page (10 minutes)

**Step 9.1: Create Test Page**

Create file: `src/routes/file-upload/+page.svelte`

**IMPORTANT**: Copy this EXACTLY as written:

```svelte
<script lang="ts">
  import { FileUpload } from '$lib/ui/index.js';
  import type { UploadResult } from '$lib/ui/file-upload-types.js';

  function handleUploadComplete(results: UploadResult[]) {
    console.log('Upload completed:', results);
  }
</script>

<svelte:head>
  <title>File Upload Demo</title>
  <meta name="description" content="File upload and backend processing demo" />
</svelte:head>

<div class="container mx-auto py-8 px-4">
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold mb-2">File Upload System</h1>
      <p class="text-muted-foreground">
        Upload text files and process them into chunks on the backend
      </p>
    </div>

    <FileUpload onUploadComplete={handleUploadComplete} />
  </div>
</div>
```

### Phase 10: Validation (5 minutes)

**Step 10.1: Run Validation Commands**

Execute these commands in order:

```bash
# 1. Check TypeScript compilation
npm run check

# 2. Start development server
npm run dev

# 3. Test the page at: http://localhost:5173/file-upload
```

**Step 10.2: Verify Implementation**

Check that these work correctly:

- ✅ File selection (both files and folders)
- ✅ Drag and drop functionality
- ✅ File validation and filtering
- ✅ Upload progress tracking
- ✅ Backend text processing
- ✅ Results display with chunk counts
- ✅ Error handling for invalid files

## Success Criteria

After completing all steps, you should have:

✅ **Working file upload UI** with drag-and-drop support ✅ **Backend text
processing** using LangChain text splitters\
✅ **Progress tracking** during upload and processing ✅ **Error handling** for
invalid files and upload failures ✅ **TypeScript safety** throughout the
implementation ✅ **Svelte 5 compliance** with modern patterns

## What NOT to Do

❌ **Do NOT** implement embeddings generation (future phase) ❌ **Do NOT** add
search functionality\
❌ **Do NOT** modify database schemas ❌ **Do NOT** implement file management
features ❌ **Do NOT** add authentication/authorization ❌ **Do NOT** implement
real-time features

## Next Steps After Completion

1. Test with various file types and sizes
2. Verify backend processing creates correct chunks
3. Check error handling with invalid files
4. Validate upload progress tracking works
5. Confirm TypeScript compilation passes

This implementation provides the foundation for future RAG functionality while
focusing exclusively on file upload and text processing.
