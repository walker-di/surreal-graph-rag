<script lang="ts">
  /**
   * Main File Upload Component
   * Orchestrates the complete file upload workflow
   */

  import { Button } from "$lib/components/ui/button/index.js";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card/index.js";
  import { Progress } from "$lib/components/ui/progress/index.js";

  import CheckCircleIcon from "@lucide/svelte/icons/check-circle";
  import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
  import Loader2Icon from "@lucide/svelte/icons/loader-2";
  import UploadIcon from "@lucide/svelte/icons/upload";
  import FileSelector from "./FileSelector.svelte";
  import { uploadFiles, validateFile } from "./file-upload-utils.js";
  import type { UploadResult } from "./file-upload-types.js";

  // Component props using Svelte 5 $props
  interface Props {
    onUploadComplete?: (results: UploadResult[]) => void;
  }

  let { onUploadComplete }: Props = $props();

  // Component state using Svelte 5 $state
  let selectedFiles: File[] = $state([]);
  let isUploading: boolean = $state(false);
  let uploadProgress: number = $state(0);
  let currentStatus: string = $state("");
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
    selectedFiles.forEach((file) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        validationErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (validationErrors.length > 0) {
      alert("Validation errors:\n" + validationErrors.join("\n"));
      return;
    }

    isUploading = true;
    uploadProgress = 0;
    uploadResults = [];
    showResults = false;
    currentStatus = "Preparing upload...";

    try {
      // Upload files with progress tracking
      const response = await uploadFiles(selectedFiles, (progress) => {
        uploadProgress = progress.progress;
        currentStatus = `Uploading ${progress.fileName}... ${progress.progress}%`;
      });

      uploadResults = response.results;
      currentStatus = "Upload completed";

      // Notify parent component
      onUploadComplete?.(response.results);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      currentStatus = errorMessage;

      // Create error results for all files
      uploadResults = selectedFiles.map((file) => ({
        success: false,
        fileName: file.name,
        errorMessage,
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
    currentStatus = "";
  }

  // Calculate success/failure counts using Svelte 5 $derived
  const successCount = $derived(uploadResults.filter((r) => r.success).length);
  const failureCount = $derived(uploadResults.filter((r) => !r.success).length);
  const totalChunks = $derived(
    uploadResults.reduce((sum, r) => sum + (r.chunkCount || 0), 0),
  );
</script>

<div class="space-y-6">
  <!-- File Selection -->
  <FileSelector onFilesSelected={handleFilesSelected} disabled={isUploading} />

  <!-- Upload Button -->
  {#if selectedFiles.length > 0 && !isUploading && !showResults}
    <div class="flex justify-center">
      <Button onclick={uploadSelectedFiles} size="lg" class="px-8">
        <UploadIcon class="h-4 w-4 mr-2" />
        Upload {selectedFiles.length} File{selectedFiles.length === 1
          ? ""
          : "s"}
      </Button>
    </div>
  {/if}

  <!-- Upload Status -->
  {#if isUploading}
    <Card>
      <CardContent class="pt-6">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <Loader2Icon class="h-5 w-5 animate-spin" />
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
          <CheckCircleIcon class="h-5 w-5 text-green-500" />
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
            <div
              class="flex items-center justify-between p-3 bg-muted/30 rounded"
            >
              <div class="flex items-center gap-2">
                {#if result.success}
                  <CheckCircleIcon class="h-4 w-4 text-green-500" />
                {:else}
                  <AlertCircleIcon class="h-4 w-4 text-red-500" />
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
          <Button variant="outline" onclick={reset}>Upload More Files</Button>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
