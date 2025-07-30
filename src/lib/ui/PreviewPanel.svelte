<script lang="ts">
  /**
   * Preview Panel Component
   * Displays file preview and metadata in the right panel
   */

  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
  import {
    File,
    Folder,
    Calendar,
    HardDrive,
    FileText,
    Image as ImageIcon
  } from "lucide-svelte";
  import type { FileSystemItem, FileSystemFile } from "./file-explorer-types.js";
  import { formatFileSize } from "./file-explorer-mock-data.js";

  // Component props using Svelte 5 $props
  interface Props {
    selectedItem: FileSystemItem | null;
  }

  let { selectedItem }: Props = $props();

  // Format date for display
  function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get preview content based on file type
  function getPreviewContent(item: FileSystemFile): string {
    switch (item.extension) {
      case 'txt':
      case 'md':
        return `# ${item.name}\n\nThis is a placeholder preview for text files.\n\nIn a real implementation, this would show the actual file content.`;
      case 'js':
      case 'ts':
        return `// ${item.name}\n\n// This is a placeholder preview for code files\nfunction example() {\n  console.log("Hello, World!");\n}`;
      default:
        return 'Preview not available for this file type.';
    }
  }

  // Check if file can be previewed
  function canPreview(item: FileSystemFile): boolean {
    const previewableExtensions = ['txt', 'md', 'js', 'ts', 'json', 'css', 'html'];
    return previewableExtensions.includes(item.extension || '');
  }
</script>

<div class="preview-panel h-full flex flex-col">
  {#if selectedItem}
    <!-- Header -->
    <div class="p-4 border-b">
      <div class="flex items-center gap-3">
        {#if selectedItem.type === 'folder'}
          <Folder class="h-8 w-8 text-blue-500" />
        {:else}
          <File class="h-8 w-8 text-gray-500" />
        {/if}
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold truncate">{selectedItem.name}</h3>
          <p class="text-sm text-muted-foreground">
            {selectedItem.type === 'folder' ? 'Folder' : 'File'}
          </p>
        </div>
      </div>
    </div>

    <!-- Preview Content -->
    <div class="flex-1 overflow-auto p-4 space-y-4">
      <!-- File Preview -->
      {#if selectedItem.type === 'file'}
        {@const fileItem = selectedItem as FileSystemFile}

        {#if canPreview(fileItem)}
          <Card>
            <CardHeader>
              <CardTitle class="text-sm flex items-center gap-2">
                <FileText class="h-4 w-4" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre class="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40 whitespace-pre-wrap">
{getPreviewContent(fileItem)}
              </pre>
            </CardContent>
          </Card>
        {:else if fileItem.extension && ['jpg', 'jpeg', 'png', 'gif'].includes(fileItem.extension)}
          <Card>
            <CardHeader>
              <CardTitle class="text-sm flex items-center gap-2">
                <ImageIcon class="h-4 w-4" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="bg-muted rounded-md p-8 text-center">
                <ImageIcon class="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                <p class="text-sm text-muted-foreground">Image preview would appear here</p>
              </div>
            </CardContent>
          </Card>
        {:else}
          <Card>
            <CardContent class="p-6 text-center">
              <File class="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p class="text-sm text-muted-foreground">No preview available</p>
            </CardContent>
          </Card>
        {/if}
      {/if}

      <!-- Properties -->
      <Card>
        <CardHeader>
          <CardTitle class="text-sm">Properties</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <!-- Type -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Type:</span>
            <Badge variant="outline">
              {selectedItem.type === 'folder' ? 'Folder' : (selectedItem.extension || 'File')}
            </Badge>
          </div>

          <!-- Size -->
          {#if selectedItem.type === 'file' && selectedItem.size}
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground flex items-center gap-1">
                <HardDrive class="h-3 w-3" />
                Size:
              </span>
              <span class="text-sm">{formatFileSize(selectedItem.size)}</span>
            </div>
          {/if}

          <!-- Location -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Location:</span>
            <span class="text-xs font-mono truncate max-w-32" title={selectedItem.path}>
              {selectedItem.path}
            </span>
          </div>

          <Separator />

          <!-- Created -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar class="h-3 w-3" />
              Created:
            </span>
            <span class="text-xs">{formatDate(selectedItem.dateCreated)}</span>
          </div>

          <!-- Modified -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar class="h-3 w-3" />
              Modified:
            </span>
            <span class="text-xs">{formatDate(selectedItem.dateModified)}</span>
          </div>
        </CardContent>
      </Card>

      <!-- Additional Metadata for Files -->
      {#if selectedItem.type === 'file'}
        {@const fileItem = selectedItem as FileSystemFile}
        {#if fileItem.mimeType}
          <Card>
            <CardHeader>
              <CardTitle class="text-sm">File Details</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">MIME Type:</span>
                <span class="text-xs font-mono">{fileItem.mimeType}</span>
              </div>
            </CardContent>
          </Card>
        {/if}
      {/if}
    </div>
  {:else}
    <!-- No Selection State -->
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="text-center">
        <File class="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 class="font-semibold mb-2">No file selected</h3>
        <p class="text-sm text-muted-foreground">
          Select a file or folder to view its details and preview.
        </p>
      </div>
    </div>
  {/if}
</div>

<style>
  .preview-panel {
    background: hsl(var(--background));
  }
</style>
