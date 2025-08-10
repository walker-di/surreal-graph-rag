<script lang="ts">
  /**
   * File Selector Component
   * Handles file and folder selection with drag-and-drop support
   */

  import { Button } from "$lib/components/ui/button/index.js";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import UploadIcon from "@lucide/svelte/icons/upload";
  import FolderIcon from "@lucide/svelte/icons/folder";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import XIcon from "@lucide/svelte/icons/x";
  import {
    isSupportedTextFile,
    formatFileSize,
    SUPPORTED_TEXT_EXTENSIONS,
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
  let selectionMode: "files" | "folder" = $state("files");
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
    const textFiles = files.filter((file) => isSupportedTextFile(file.name));
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
    if (fileInput) fileInput.value = "";
    if (folderInput) folderInput.value = "";
  }

  // Switch selection mode
  function switchMode(mode: "files" | "folder") {
    selectionMode = mode;
    clearFiles();
  }

  // Trigger file input click
  function triggerFileInput() {
    if (selectionMode === "files") {
      fileInput?.click();
    } else {
      folderInput?.click();
    }
  }

  // Handle keyboard events for accessibility
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      triggerFileInput();
    }
  }

  // Calculate total size using Svelte 5 $derived
  const totalSize = $derived(
    selectedFiles.reduce((sum, file) => sum + file.size, 0)
  );
  const supportedCount = $derived(selectedFiles.length);
  const hasFiles = $derived(selectedFiles.length > 0);
</script>

<Card class="w-full">
  <CardHeader>
    <CardTitle class="flex items-center gap-2">
      <FileTextIcon class="h-5 w-5" />
      Select Files for Registration
    </CardTitle>
  </CardHeader>
  <CardContent class="space-y-4">
    <!-- Mode Selection -->
    <div class="flex gap-2">
      <Button
        variant={selectionMode === "files" ? "default" : "outline"}
        size="sm"
        onclick={() => switchMode("files")}
        {disabled}
      >
        <UploadIcon class="h-4 w-4 mr-2" />
        Select Files
      </Button>
      <Button
        variant={selectionMode === "folder" ? "default" : "outline"}
        size="sm"
        onclick={() => switchMode("folder")}
        {disabled}
      >
        <FolderIcon class="h-4 w-4 mr-2" />
        Select Folder
      </Button>
    </div>

    <!-- File Inputs (Hidden) -->
    <input
      bind:this={fileInput}
      type="file"
      multiple
      accept={"." + SUPPORTED_TEXT_EXTENSIONS.join(",.")}
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
      class="border-2 border-dashed rounded-lg p-8 text-center transition-colors {dragOver
        ? 'border-primary bg-primary/5'
        : 'border-muted-foreground/25'} {disabled
        ? 'opacity-50 cursor-not-allowed'
        : 'cursor-pointer'}"
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      ondrop={handleDrop}
      onclick={triggerFileInput}
      onkeydown={handleKeyDown}
      role="button"
      tabindex="0"
    >
      {#if selectionMode === "files"}
        <UploadIcon class="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 class="text-lg font-semibold mb-2">Select Multiple Files</h3>
        <p class="text-muted-foreground mb-4">
          Choose text files to register and process
        </p>
      {:else}
        <FolderIcon class="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 class="text-lg font-semibold mb-2">Select Folder</h3>
        <p class="text-muted-foreground mb-4">
          Choose a folder to register all text files within it
        </p>
      {/if}

      <Button variant="outline" {disabled}>
        {selectionMode === "files" ? "Browse Files" : "Browse Folder"}
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
              <XIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div class="max-h-40 overflow-y-auto space-y-2">
          {#each selectedFiles as file, index (`${file.webkitRelativePath || file.name}-${file.size}-${file.lastModified}-${index}`)}
            <div
              class="flex items-center justify-between p-2 bg-muted/30 rounded"
            >
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <FileTextIcon class="h-4 w-4 text-muted-foreground" />
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
                <XIcon class="h-3 w-3" />
              </Button>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </CardContent>
</Card>
