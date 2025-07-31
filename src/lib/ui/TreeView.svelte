<script lang="ts">
  /**
   * Tree View Component
   * Displays hierarchical folder structure with expand/collapse functionality
   */

  import * as Collapsible from "$lib/components/ui/collapsible/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { ChevronRight, ChevronDown, Folder } from "lucide-svelte";
  import type {
    FileSystemItem,
    FileSystemFolder,
  } from "./file-explorer-types.js";
  import { mockFileSystem } from "./file-explorer-mock-data.js";

  // Component props using Svelte 5 $props
  interface Props {
    currentPath: string;
    onNavigate: (path: string) => void;
  }

  let { currentPath, onNavigate }: Props = $props();

  // Component state using Svelte 5 $state
  let expandedFolders: Set<string> = $state(new Set(["/Documents"]));

  // Build tree structure from mock data
  function buildTreeStructure(items: FileSystemItem[]): FileSystemFolder[] {
    return items.filter((item) => item.type === "folder") as FileSystemFolder[];
  }

  let treeData: FileSystemFolder[] = $state(buildTreeStructure(mockFileSystem));

  // Toggle folder expansion
  function toggleFolder(folderId: string) {
    if (expandedFolders.has(folderId)) {
      expandedFolders.delete(folderId);
    } else {
      expandedFolders.add(folderId);
    }
    expandedFolders = new Set(expandedFolders); // Trigger reactivity
  }

  // Recursive tree node component
  function renderTreeNode(folder: FileSystemFolder, level: number = 0) {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = currentPath === folder.path;
    const hasChildren =
      folder.children &&
      folder.children.some((child) => child.type === "folder");

    return {
      folder,
      isExpanded,
      isSelected,
      hasChildren,
      level,
      children:
        isExpanded && folder.children
          ? (folder.children.filter(
              (child) => child.type === "folder",
            ) as FileSystemFolder[])
          : [],
    };
  }
</script>

<div class="tree-view p-4">
  <h3 class="text-sm font-semibold mb-3 text-sidebar-foreground">Folders</h3>
  <div class="space-y-1">
    {#each treeData as rootFolder (rootFolder.id)}
      {@const nodeData = renderTreeNode(rootFolder)}
      {@render TreeNode(nodeData)}
    {/each}
  </div>
</div>

<!-- Recursive Tree Node Snippet using Svelte 5 syntax -->
{#snippet TreeNode(nodeData: any)}
  <div class="tree-node" style="padding-left: {nodeData.level * 1}rem">
    <Collapsible.Root open={nodeData.isExpanded}>
      <div class="flex items-center w-full">
        <!-- Expand/Collapse Button -->
        {#if nodeData.hasChildren}
          <Button
            variant="ghost"
            size="sm"
            class="h-6 w-6 p-0 mr-1"
            onclick={() => toggleFolder(nodeData.folder.id)}
          >
            {#if nodeData.isExpanded}
              <ChevronDown class="h-3 w-3" />
            {:else}
              <ChevronRight class="h-3 w-3" />
            {/if}
          </Button>
        {:else}
          <div class="w-7"></div>
        {/if}

        <!-- Folder Button -->
        <Button
          variant="ghost"
          class="flex-1 justify-start h-8 px-2 {nodeData.isSelected
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}"
          onclick={() => onNavigate(nodeData.folder.path)}
        >
          <div class="flex items-center gap-2 w-full">
            <Folder class="h-4 w-4" />
            <span class="truncate text-sm">{nodeData.folder.name}</span>
          </div>
        </Button>
      </div>

      <!-- Children -->
      {#if nodeData.hasChildren}
        <Collapsible.Content>
          <div class="ml-4 mt-1 space-y-1">
            {#each nodeData.children as childFolder (childFolder.id)}
              {@const childNodeData = renderTreeNode(
                childFolder,
                nodeData.level + 1,
              )}
              {@render TreeNode(childNodeData)}
            {/each}
          </div>
        </Collapsible.Content>
      {/if}
    </Collapsible.Root>
  </div>
{/snippet}
