<script lang="ts">
  /**
   * Main File Explorer Component
   * Implements a three-panel Windows Explorer-like interface
   */

  import { Separator } from "$lib/components/ui/separator/index.js";
  import TreeView from "./TreeView.svelte";
  import FileList from "./FileList.svelte";
  import PreviewPanel from "./PreviewPanel.svelte";
  import FileExplorerHeader from "./FileExplorerHeader.svelte";
  import type { FileSystemItem, FileExplorerState } from "./file-explorer-types.js";
  import { getFileSystemItems } from "./file-explorer-mock-data.js";

  // Component props using Svelte 5 $props
  interface Props {
    initialPath?: string;
    showPreview?: boolean;
  }

  let { initialPath = "/Documents", showPreview = true }: Props = $props();

  // Component state using Svelte 5 $state
  let explorerState: FileExplorerState = $state({
    currentPath: initialPath,
    selectedItems: [],
    viewMode: "list",
    sortBy: "name",
    sortOrder: "asc",
    showHidden: false
  });

  let currentItems: FileSystemItem[] = $state([]);
  let selectedItem: FileSystemItem | null = $state(null);

  // Load initial data using Svelte 5 $effect
  $effect(() => {
    currentItems = getFileSystemItems(explorerState.currentPath);
  });

  // Handle navigation
  function handleNavigate(path: string) {
    explorerState.currentPath = path;
    explorerState.selectedItems = [];
    selectedItem = null;
  }

  // Handle item selection
  function handleItemSelect(item: FileSystemItem) {
    selectedItem = item;
    explorerState.selectedItems = [item.id];
  }

  // Handle folder double-click
  function handleFolderOpen(item: FileSystemItem) {
    if (item.type === 'folder') {
      handleNavigate(item.path);
    }
  }
</script>

<div class="file-explorer h-screen flex flex-col bg-background text-foreground">
  <!-- Header with breadcrumb and toolbar -->
  <FileExplorerHeader
    currentPath={explorerState.currentPath}
    onNavigate={handleNavigate}
  />

  <!-- Main content area with three panels -->
  <div class="flex-1 flex overflow-hidden">
    <!-- Left Panel: Tree View -->
    <div class="w-64 border-r bg-sidebar">
      <TreeView
        currentPath={explorerState.currentPath}
        onNavigate={handleNavigate}
      />
    </div>

    <!-- Center Panel: File List -->
    <main class="flex-1 flex flex-col">
      <FileList
        items={currentItems}
        selectedItems={explorerState.selectedItems}
        viewMode={explorerState.viewMode}
        sortBy={explorerState.sortBy}
        sortOrder={explorerState.sortOrder}
        onItemSelect={handleItemSelect}
        onItemDoubleClick={handleFolderOpen}
      />
    </main>

    <!-- Right Panel: Preview (conditional) -->
    {#if showPreview}
      <Separator orientation="vertical" />
      <aside class="w-80 border-l bg-sidebar">
        <PreviewPanel
          selectedItem={selectedItem}
        />
      </aside>
    {/if}
  </div>
</div>
