<script lang="ts">
  import { onMount } from "svelte";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Collapsible from "$lib/components/ui/collapsible/index.js";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
  import TrashIcon from "@lucide/svelte/icons/trash-2";
  import type { FileRecord, ChunkRecord } from "$lib/ui/file-upload-types.js";

  // Component state
  let files: FileRecord[] = $state([]);
  let chunks: Record<string, ChunkRecord[]> = $state({});
  let loading: boolean = $state(false);
  let error: string | null = $state(null);
  let expandedFiles: Set<string> = $state(new Set());

  // Load files and chunks
  async function loadFiles() {
    loading = true;
    error = null;

    try {
      const response = await fetch(
        `/api/debug/files${window.location.search || ""}`
      );
      if (!response.ok) {
        throw new Error(`Failed to load files: ${response.statusText}`);
      }

      const data = await response.json();
      files = data.files || [];
      chunks = data.chunks || {};
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load files";
      console.error("Error loading files:", err);
    } finally {
      loading = false;
    }
  }

  // Delete a file and its chunks
  async function deleteFile(fileId: string) {
    if (
      !confirm("Are you sure you want to delete this file and all its chunks?")
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/debug/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }

      // Reload the files list
      await loadFiles();
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to delete file";
      console.error("Error deleting file:", err);
    }
  }

  // Toggle file expansion
  function toggleFile(fileId: string) {
    if (expandedFiles.has(fileId)) {
      expandedFiles.delete(fileId);
    } else {
      expandedFiles.add(fileId);
    }
    expandedFiles = new Set(expandedFiles); // Trigger reactivity
  }

  // Format file size
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Format date
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  // Get status color
  function getStatusColor(status: string): string {
    switch (status) {
      case "ready":
        return "bg-green-500";
      case "uploaded":
        return "bg-blue-500";
      case "processing":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  }

  // Load files on mount
  onMount(() => {
    loadFiles();
  });
</script>

<svelte:head>
  <title>Debug: Uploaded Files</title>
  <meta name="description" content="Debug page for uploaded files and chunks" />
</svelte:head>

<div class="container mx-auto py-8 px-4">
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold mb-2">Debug: Uploaded Files</h1>
        <p class="text-muted-foreground">
          View and manage uploaded files and their processed chunks
        </p>
      </div>
      <Button onclick={loadFiles} disabled={loading}>
        <RefreshCwIcon class="h-4 w-4 mr-2 {loading ? 'animate-spin' : ''}" />
        Refresh
      </Button>
    </div>

    <!-- Error Display -->
    {#if error}
      <Card class="mb-6 border-red-200 bg-red-50">
        <CardContent class="pt-6">
          <p class="text-red-600">{error}</p>
        </CardContent>
      </Card>
    {/if}

    <!-- Loading State -->
    {#if loading}
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-center py-8">
            <RefreshCwIcon class="h-6 w-6 animate-spin mr-2" />
            <span>Loading files...</span>
          </div>
        </CardContent>
      </Card>
    {:else if files.length === 0}
      <!-- Empty State -->
      <Card>
        <CardContent class="pt-6">
          <div class="text-center py-8">
            <FileTextIcon
              class="h-12 w-12 mx-auto mb-4 text-muted-foreground"
            />
            <h3 class="text-lg font-semibold mb-2">No Files Found</h3>
            <p class="text-muted-foreground mb-4">
              No uploaded files found in the database.
            </p>
            <Button onclick={() => (window.location.href = "/file-upload")}>
              Upload Files
            </Button>
          </div>
        </CardContent>
      </Card>
    {:else}
      <!-- Files List -->
      <div class="space-y-4">
        {#each files as file (file.id)}
          <Card>
            <CardHeader>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onclick={() => toggleFile(file.id)}
                    class="p-1"
                  >
                    {#if expandedFiles.has(file.id)}
                      <ChevronDownIcon class="h-4 w-4" />
                    {:else}
                      <ChevronRightIcon class="h-4 w-4" />
                    {/if}
                  </Button>
                  <FileTextIcon class="h-5 w-5" />
                  <div>
                    <CardTitle class="text-lg">{file.original_name}</CardTitle>
                    <p class="text-sm text-muted-foreground">ID: {file.id}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <Badge class="{getStatusColor(file.status)} text-white">
                    {file.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onclick={() => deleteFile(file.id)}
                    class="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <!-- File Details -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p class="text-sm font-medium">Size</p>
                  <p class="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium">Type</p>
                  <p class="text-sm text-muted-foreground">{file.mime_type}</p>
                </div>
                <div>
                  <p class="text-sm font-medium">Chunks</p>
                  <p class="text-sm text-muted-foreground">
                    {file.chunk_count}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium">Uploaded</p>
                  <p class="text-sm text-muted-foreground">
                    {file.created_at ? formatDate(file.created_at) : "Unknown"}
                  </p>
                </div>
              </div>

              <!-- Chunks (Collapsible) -->
              {#if expandedFiles.has(file.id)}
                <Separator class="my-4" />
                <div>
                  <h4 class="font-medium mb-3">
                    Chunks ({chunks[file.id]?.length || 0})
                  </h4>
                  {#if chunks[file.id] && chunks[file.id].length > 0}
                    <div class="space-y-2 max-h-96 overflow-y-auto">
                      {#each chunks[file.id] as chunk (chunk.id)}
                        <Card class="bg-muted/30">
                          <CardContent class="p-4">
                            <div class="flex items-start justify-between mb-2">
                              <div class="text-sm font-medium">
                                Chunk {chunk.chunk_index + 1}
                              </div>
                              <div class="text-xs text-muted-foreground">
                                {chunk.token_count} tokens
                              </div>
                            </div>
                            <div class="text-sm text-muted-foreground mb-2">
                              Characters: {chunk.start_char} - {chunk.end_char}
                            </div>
                            <div
                              class="text-sm bg-background p-2 rounded border max-h-32 overflow-y-auto"
                            >
                              {chunk.content}
                            </div>
                          </CardContent>
                        </Card>
                      {/each}
                    </div>
                  {:else}
                    <p class="text-sm text-muted-foreground">
                      No chunks found for this file.
                    </p>
                  {/if}
                </div>
              {/if}
            </CardContent>
          </Card>
        {/each}
      </div>
    {/if}
  </div>
</div>
