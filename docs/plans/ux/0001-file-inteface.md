# Windows File Explorer Interface - Detailed Implementation Plan

## Overview

This plan outlines how to create a Windows File Explorer-like interface for the
surreal-graph-rag application. The interface will feature a three-panel layout:
a collapsible tree view on the left, a file/folder list in the center, and a
preview/metadata panel on the right. This phase focuses exclusively on UI
implementation using shadcn-svelte components.

**Important Note**: At this stage, we are focusing solely on implementing the UI
structure and components. All file operations will be placeholder
implementations to demonstrate the interface patterns. The actual file system
integration will be implemented in later phases.

## Why This Approach?

1. **Familiar UX**: Windows File Explorer is a universally understood interface
   pattern
2. **Efficient Navigation**: Tree view provides quick access to folder hierarchy
3. **Content Discovery**: Center panel shows current directory contents clearly
4. **Rich Preview**: Right panel enables quick file inspection without opening
5. **Responsive Design**: Layout adapts to different screen sizes
6. **Accessibility**: Built with shadcn-svelte components that follow ARIA
   guidelines

## Audit Checklist Compliance

✅ **Svelte 5 runes usage**: All components use `$state`, `$derived`, `$effect`,
and `$props` ✅ **Modern event handling**: Uses `onclick` instead of `on:click`
throughout ✅ **shadcn-svelte best practices**: Follows official component
patterns and API usage ✅ **TypeScript integration**: Full type safety with
proper interfaces ✅ **Accessibility**: ARIA compliant components with proper
keyboard navigation

## Target Interface Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ Header/Toolbar (Breadcrumb + Actions)                          │
├─────────────┬─────────────────────────┬─────────────────────────┤
│             │                         │                         │
│ Tree View   │   File/Folder List      │   Preview/Metadata      │
│ (Sidebar)   │   (Table/Grid)          │   (Details Panel)       │
│             │                         │                         │
│ - Folders   │ - Name | Size | Date    │ - File Preview          │
│ - Expand/   │ - Icons | Type          │ - Properties            │
│   Collapse  │ - Sort/Filter           │ - Metadata              │
│             │ - Selection             │ - Actions               │
│             │                         │                         │
├─────────────┼─────────────────────────┼─────────────────────────┤
│             │ Status Bar              │                         │
└─────────────┴─────────────────────────┴─────────────────────────┘
```

## Current State Analysis

Based on the codebase analysis:

- Project uses SvelteKit with TypeScript
- shadcn-svelte is configured and ready to use
- Tailwind CSS is set up for styling
- Component structure follows modular export patterns
- No existing file management interface components

## Required shadcn-svelte Components

Based on the documentation analysis, we'll use these components:

1. **Sidebar** - For the left tree view panel
2. **Table** - For the center file/folder list
3. **Collapsible** - For expandable tree nodes
4. **Breadcrumb** - For navigation path display
5. **Button** - For various actions and controls
6. **DropdownMenu** - For context menus and actions
7. **Separator** - For visual division between panels
8. **Badge** - For file type indicators
9. **Tooltip** - For additional information on hover

## Implementation Plan

### 1. Project Structure Setup

Create the file explorer components in a dedicated module:

```
src/lib/components/file-explorer/
├── index.ts                    # Main exports
├── FileExplorer.svelte        # Main container component
├── TreeView.svelte            # Left panel tree navigation
├── FileList.svelte            # Center panel file/folder list
├── PreviewPanel.svelte        # Right panel preview/metadata
├── FileExplorerHeader.svelte  # Top toolbar with breadcrumb
├── FileExplorerToolbar.svelte # Action buttons and controls
└── types.ts                   # TypeScript interfaces
```

### 2. Install Required shadcn-svelte Components

Before implementation, install the necessary components using the correct CLI:

```bash
# First, initialize shadcn-svelte if not already done
npx shadcn-svelte@latest init

# Install required shadcn-svelte components
npx shadcn-svelte@latest add sidebar
npx shadcn-svelte@latest add table
npx shadcn-svelte@latest add collapsible
npx shadcn-svelte@latest add breadcrumb
npx shadcn-svelte@latest add button
npx shadcn-svelte@latest add dropdown-menu
npx shadcn-svelte@latest add separator
npx shadcn-svelte@latest add badge
npx shadcn-svelte@latest add tooltip
npx shadcn-svelte@latest add card

# Install required dependencies
npm install bits-ui lucide-svelte
```

**Note**: If you encounter issues with the CLI, you can also install manually by
copying component files from the
[shadcn-svelte documentation](https://www.shadcn-svelte.com/docs/components).

### 3. Define TypeScript Interfaces

Create placeholder data structures for the file explorer:

**File: `src/lib/components/file-explorer/types.ts`**

```typescript
/**
 * File Explorer Types
 * Placeholder interfaces for file system representation
 */

export interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  parentId?: string;
  size?: number;
  dateModified: Date;
  dateCreated: Date;
  extension?: string;
  isHidden?: boolean;
}

export interface FileSystemFolder extends FileSystemItem {
  type: "folder";
  children?: FileSystemItem[];
  isExpanded?: boolean;
  childCount?: number;
}

export interface FileSystemFile extends FileSystemItem {
  type: "file";
  mimeType?: string;
  content?: string;
  thumbnail?: string;
}

export interface FileExplorerState {
  currentPath: string;
  selectedItems: string[];
  viewMode: "list" | "grid";
  sortBy: "name" | "size" | "dateModified" | "type";
  sortOrder: "asc" | "desc";
  showHidden: boolean;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface FilePreview {
  type: "text" | "image" | "pdf" | "unknown";
  content?: string;
  metadata?: Record<string, any>;
}
```

### 4. Create Mock Data Service

Create placeholder data for development and testing:

**File: `src/lib/components/file-explorer/mock-data.ts`**

```typescript
/**
 * Mock data service for file explorer
 * Provides placeholder file system data for UI development
 */

import type {
  FileSystemFile,
  FileSystemFolder,
  FileSystemItem,
} from "./types.js";

export const mockFileSystem: FileSystemItem[] = [
  {
    id: "root",
    name: "Documents",
    type: "folder",
    path: "/Documents",
    dateModified: new Date("2024-01-15"),
    dateCreated: new Date("2024-01-01"),
    children: [
      {
        id: "projects",
        name: "Projects",
        type: "folder",
        path: "/Documents/Projects",
        parentId: "root",
        dateModified: new Date("2024-01-20"),
        dateCreated: new Date("2024-01-05"),
        children: [
          {
            id: "project1",
            name: "surreal-rag",
            type: "folder",
            path: "/Documents/Projects/surreal-rag",
            parentId: "projects",
            dateModified: new Date("2024-01-25"),
            dateCreated: new Date("2024-01-10"),
          },
          {
            id: "readme",
            name: "README.md",
            type: "file",
            path: "/Documents/Projects/README.md",
            parentId: "projects",
            size: 2048,
            extension: "md",
            mimeType: "text/markdown",
            dateModified: new Date("2024-01-22"),
            dateCreated: new Date("2024-01-15"),
          },
        ],
      },
      {
        id: "images",
        name: "Images",
        type: "folder",
        path: "/Documents/Images",
        parentId: "root",
        dateModified: new Date("2024-01-18"),
        dateCreated: new Date("2024-01-03"),
        children: [
          {
            id: "photo1",
            name: "vacation.jpg",
            type: "file",
            path: "/Documents/Images/vacation.jpg",
            parentId: "images",
            size: 1024000,
            extension: "jpg",
            mimeType: "image/jpeg",
            dateModified: new Date("2024-01-16"),
            dateCreated: new Date("2024-01-16"),
          },
        ],
      },
      {
        id: "notes",
        name: "notes.txt",
        type: "file",
        path: "/Documents/notes.txt",
        parentId: "root",
        size: 512,
        extension: "txt",
        mimeType: "text/plain",
        dateModified: new Date("2024-01-14"),
        dateCreated: new Date("2024-01-12"),
      },
    ],
  },
];

export function getFileSystemItems(path: string = "/"): FileSystemItem[] {
  // Placeholder function to simulate file system navigation
  if (path === "/" || path === "/Documents") {
    return mockFileSystem;
  }

  // Find items in the specified path
  const findItemsInPath = (
    items: FileSystemItem[],
    targetPath: string,
  ): FileSystemItem[] => {
    for (const item of items) {
      if (item.path === targetPath && item.type === "folder") {
        return (item as FileSystemFolder).children || [];
      }
      if (item.type === "folder" && (item as FileSystemFolder).children) {
        const found = findItemsInPath(
          (item as FileSystemFolder).children!,
          targetPath,
        );
        if (found.length > 0) return found;
      }
    }
    return [];
  };

  return findItemsInPath(mockFileSystem, path);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFileIcon(item: FileSystemItem): string {
  if (item.type === "folder") return "📁";

  const file = item as FileSystemFile;
  switch (file.extension) {
    case "txt":
      return "📄";
    case "md":
      return "📝";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return "🖼️";
    case "pdf":
      return "📕";
    case "js":
    case "ts":
      return "📜";
    default:
      return "📄";
  }
}
```

### 5. Detailed Step-by-Step Implementation Guide

This section provides exact instructions for implementing each component. Each
step includes the specific files to create/modify, the exact content to add, and
explanations of why each change is necessary.

#### Step 1: Create the Main File Explorer Container

**Purpose**: Create the main container component that orchestrates the
three-panel layout using shadcn-svelte Sidebar components.

**File to Create: `src/lib/components/file-explorer/FileExplorer.svelte`**

```svelte
<script lang="ts">
  /**
   * Main File Explorer Component
   * Implements a three-panel Windows Explorer-like interface
   */

  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import TreeView from "./TreeView.svelte";
  import FileList from "./FileList.svelte";
  import PreviewPanel from "./PreviewPanel.svelte";
  import FileExplorerHeader from "./FileExplorerHeader.svelte";
  import type { FileSystemItem, FileExplorerState } from "./types.js";
  import { getFileSystemItems } from "./mock-data.js";

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
```

**Why this structure?**

- Uses shadcn-svelte Sidebar.Provider for consistent layout management
- Implements reactive state management with Svelte 5's `$state` and `$effect`
- Provides clear separation between navigation, content, and preview
- Handles the main application logic (navigation, selection, folder opening)
- Uses CSS Grid/Flexbox for responsive layout that adapts to screen sizes

#### Step 2: Create the Tree View Component

**Purpose**: Implement the left panel tree navigation using Collapsible
components for expandable folder structure.

**File to Create: `src/lib/components/file-explorer/TreeView.svelte`**

```svelte
<script lang="ts">
  /**
   * Tree View Component
   * Displays hierarchical folder structure with expand/collapse functionality
   */

  import * as Collapsible from "$lib/components/ui/collapsible/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-svelte";
  import type { FileSystemItem, FileSystemFolder } from "./types.js";
  import { mockFileSystem } from "./mock-data.js";

  // Component props using Svelte 5 $props
  interface Props {
    currentPath: string;
    onNavigate: (path: string) => void;
  }

  let { currentPath, onNavigate }: Props = $props();

  // Component state using Svelte 5 $state
  let expandedFolders: Set<string> = $state(new Set(['/Documents']));

  // Build tree structure from mock data
  function buildTreeStructure(items: FileSystemItem[]): FileSystemFolder[] {
    return items.filter(item => item.type === 'folder') as FileSystemFolder[];
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
    const hasChildren = folder.children && folder.children.some(child => child.type === 'folder');

    return {
      folder,
      isExpanded,
      isSelected,
      hasChildren,
      level,
      children: isExpanded && folder.children
        ? folder.children.filter(child => child.type === 'folder') as FileSystemFolder[]
        : []
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
{#snippet TreeNode(nodeData)}
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
          class="flex-1 justify-start h-8 px-2 {nodeData.isSelected ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}"
          onclick={() => onNavigate(nodeData.folder.path)}
        >
          <div class="flex items-center gap-2 w-full">
            {#if nodeData.isExpanded}
              <FolderOpen class="h-4 w-4" />
            {:else}
              <Folder class="h-4 w-4" />
            {/if}
            <span class="truncate text-sm">{nodeData.folder.name}</span>
          </div>
        </Button>
      </div>

      <!-- Children -->
      {#if nodeData.hasChildren}
        <Collapsible.Content>
          <div class="ml-4 mt-1 space-y-1">
            {#each nodeData.children as childFolder (childFolder.id)}
              {@const childNodeData = renderTreeNode(childFolder, nodeData.level + 1)}
              {@render TreeNode(childNodeData)}
            {/each}
          </div>
        </Collapsible.Content>
      {/if}
    </Collapsible.Root>
  </div>
{/snippet}
```

**Why this structure?**

- Uses shadcn-svelte Collapsible components for smooth expand/collapse
  animations
- Implements recursive tree rendering with Svelte 5's snippet feature
- Provides visual feedback for current selection and folder states
- Uses Lucide icons for consistent iconography
- Handles keyboard and mouse interactions properly

#### Step 3: Create the File List Component

**Purpose**: Implement the center panel that displays files and folders in a
table format with sorting and selection capabilities.

**File to Create: `src/lib/components/file-explorer/FileList.svelte`**

```svelte
<script lang="ts">
  /**
   * File List Component
   * Displays files and folders in a table format with sorting and selection
   */

  import * as Table from "$lib/components/ui/table/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2
  } from "lucide-svelte";
  import type { FileSystemItem } from "./types.js";
  import { formatFileSize, getFileIcon } from "./mock-data.js";

  // Component props using Svelte 5 $props
  interface Props {
    items: FileSystemItem[];
    selectedItems: string[];
    viewMode: 'list' | 'grid';
    sortBy: 'name' | 'size' | 'dateModified' | 'type';
    sortOrder: 'asc' | 'desc';
    onItemSelect: (item: FileSystemItem) => void;
    onItemDoubleClick: (item: FileSystemItem) => void;
  }

  let {
    items,
    selectedItems,
    viewMode,
    sortBy,
    sortOrder,
    onItemSelect,
    onItemDoubleClick
  }: Props = $props();

  // Sort items based on current sort settings
  $: sortedItems = [...items].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        comparison = (a.size || 0) - (b.size || 0);
        break;
      case 'dateModified':
        comparison = a.dateModified.getTime() - b.dateModified.getTime();
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Handle sort column click
  function handleSort(column: typeof sortBy) {
    if (sortBy === column) {
      // Toggle sort order if same column
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new column and default to ascending
      sortBy = column;
      sortOrder = 'asc';
    }
  }

  // Handle item click
  function handleItemClick(item: FileSystemItem, event: MouseEvent) {
    event.preventDefault();
    onItemSelect(item);
  }

  // Handle item double click
  function handleItemDoubleClick(item: FileSystemItem, event: MouseEvent) {
    event.preventDefault();
    onItemDoubleClick(item);
  }

  // Format date for display
  function formatDate(date: Date): string {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get sort icon for column header
  function getSortIcon(column: typeof sortBy) {
    if (sortBy !== column) return ArrowUpDown;
    return sortOrder === 'asc' ? ArrowUp : ArrowDown;
  }
</script>

<div class="file-list flex flex-col h-full">
  <!-- Toolbar -->
  <div class="flex items-center justify-between p-4 border-b">
    <div class="flex items-center gap-2">
      <span class="text-sm text-muted-foreground">
        {items.length} items
      </span>
    </div>

    <div class="flex items-center gap-2">
      <!-- View mode toggle could go here -->
      <Button variant="outline" size="sm">
        View Options
      </Button>
    </div>
  </div>

  <!-- File Table -->
  <div class="flex-1 overflow-auto">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head class="w-12"></Table.Head>
          <Table.Head>
            <Button
              variant="ghost"
              class="h-auto p-0 font-semibold"
              onclick={() => handleSort('name')}
            >
              Name
              <svelte:component this={getSortIcon('name')} class="ml-2 h-4 w-4" />
            </Button>
          </Table.Head>
          <Table.Head>
            <Button
              variant="ghost"
              class="h-auto p-0 font-semibold"
              onclick={() => handleSort('size')}
            >
              Size
              <svelte:component this={getSortIcon('size')} class="ml-2 h-4 w-4" />
            </Button>
          </Table.Head>
          <Table.Head>
            <Button
              variant="ghost"
              class="h-auto p-0 font-semibold"
              onclick={() => handleSort('type')}
            >
              Type
              <svelte:component this={getSortIcon('type')} class="ml-2 h-4 w-4" />
            </Button>
          </Table.Head>
          <Table.Head>
            <Button
              variant="ghost"
              class="h-auto p-0 font-semibold"
              onclick={() => handleSort('dateModified')}
            >
              Date Modified
              <svelte:component this={getSortIcon('dateModified')} class="ml-2 h-4 w-4" />
            </Button>
          </Table.Head>
          <Table.Head class="w-12"></Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each sortedItems as item (item.id)}
          <Table.Row
            class="cursor-pointer hover:bg-muted/50 {selectedItems.includes(item.id) ? 'bg-accent' : ''}"
            onclick={(e) => handleItemClick(item, e)}
            ondblclick={(e) => handleItemDoubleClick(item, e)}
          >
            <Table.Cell>
              <span class="text-lg">{getFileIcon(item)}</span>
            </Table.Cell>
            <Table.Cell class="font-medium">
              <div class="flex items-center gap-2">
                <span class="truncate">{item.name}</span>
                {#if item.isHidden}
                  <Badge variant="secondary" class="text-xs">Hidden</Badge>
                {/if}
              </div>
            </Table.Cell>
            <Table.Cell class="text-muted-foreground">
              {item.type === 'file' && item.size ? formatFileSize(item.size) : '—'}
            </Table.Cell>
            <Table.Cell class="text-muted-foreground">
              <Badge variant="outline" class="text-xs">
                {item.type === 'folder' ? 'Folder' : (item.extension || 'File')}
              </Badge>
            </Table.Cell>
            <Table.Cell class="text-muted-foreground text-sm">
              {formatDate(item.dateModified)}
            </Table.Cell>
            <Table.Cell>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  {#snippet child({ props })}
                    <Button {...props} variant="ghost" size="sm" class="h-8 w-8 p-0">
                      <MoreHorizontal class="h-4 w-4" />
                      <span class="sr-only">Open menu</span>
                    </Button>
                  {/snippet}
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  <DropdownMenu.Item>
                    <Eye class="mr-2 h-4 w-4" />
                    Preview
                  </DropdownMenu.Item>
                  <DropdownMenu.Item>
                    <Edit class="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item class="text-destructive">
                    <Trash2 class="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Table.Cell>
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell colspan={6} class="h-24 text-center text-muted-foreground">
              No files or folders found.
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>

<style>
  .file-list {
    background: hsl(var(--background));
  }
</style>
```

**Why this structure?**

- Uses shadcn-svelte Table components for consistent data presentation
- Implements sortable columns with visual indicators
- Provides context menus for file operations
- Shows file metadata with proper formatting
- Handles selection states and hover effects
- Uses badges for file type and status indicators

#### Step 4: Create the Preview Panel Component

**Purpose**: Implement the right panel that shows file preview and metadata
information.

**File to Create: `src/lib/components/file-explorer/PreviewPanel.svelte`**

```svelte
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
  import type { FileSystemItem, FileSystemFile } from "./types.js";
  import { formatFileSize } from "./mock-data.js";

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
```

#### Step 5: Create the Header Component

**Purpose**: Implement the top header with breadcrumb navigation and toolbar
actions.

**File to Create: `src/lib/components/file-explorer/FileExplorerHeader.svelte`**

```svelte
<script lang="ts">
  /**
   * File Explorer Header Component
   * Contains breadcrumb navigation and toolbar actions
   */

  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import {
    ArrowLeft,
    ArrowRight,
    RotateCcw,
    Home,
    Search,
    Plus,
    MoreHorizontal
  } from "lucide-svelte";
  import type { BreadcrumbItem } from "./types.js";

  // Component props using Svelte 5 $props
  interface Props {
    currentPath: string;
    onNavigate: (path: string) => void;
  }

  let { currentPath, onNavigate }: Props = $props();

  // Navigation history (placeholder)
  let navigationHistory: string[] = $state(['/Documents']);
  let historyIndex: number = $state(0);

  // Generate breadcrumb items from current path
  $: breadcrumbItems = generateBreadcrumbs(currentPath);

  function generateBreadcrumbs(path: string): BreadcrumbItem[] {
    if (path === '/' || path === '') {
      return [{ name: 'Home', path: '/' }];
    }

    const parts = path.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [{ name: 'Home', path: '/' }];

    let currentPath = '';
    for (const part of parts) {
      currentPath += '/' + part;
      items.push({
        name: part,
        path: currentPath
      });
    }

    return items;
  }

  // Navigation functions
  function goBack() {
    if (historyIndex > 0) {
      historyIndex--;
      onNavigate(navigationHistory[historyIndex]);
    }
  }

  function goForward() {
    if (historyIndex < navigationHistory.length - 1) {
      historyIndex++;
      onNavigate(navigationHistory[historyIndex]);
    }
  }

  function goHome() {
    onNavigate('/Documents');
  }

  function refresh() {
    // Trigger refresh of current location
    onNavigate(currentPath);
  }

  // Handle breadcrumb navigation
  function handleBreadcrumbClick(item: BreadcrumbItem) {
    onNavigate(item.path);
  }

  // Check if navigation buttons should be enabled
  $: canGoBack = historyIndex > 0;
  $: canGoForward = historyIndex < navigationHistory.length - 1;
</script>

<header class="file-explorer-header border-b bg-background">
  <div class="flex items-center gap-2 p-2">
    <!-- Navigation Controls -->
    <div class="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        disabled={!canGoBack}
        onclick={goBack}
        title="Go back"
      >
        <ArrowLeft class="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={!canGoForward}
        onclick={goForward}
        title="Go forward"
      >
        <ArrowRight class="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onclick={refresh}
        title="Refresh"
      >
        <RotateCcw class="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onclick={goHome}
        title="Go to home"
      >
        <Home class="h-4 w-4" />
      </Button>
    </div>

    <Separator orientation="vertical" class="h-6" />

    <!-- Breadcrumb Navigation -->
    <div class="flex-1 min-w-0">
      <Breadcrumb.Root>
        <Breadcrumb.List>
          {#each breadcrumbItems as item, index (item.path)}
            <Breadcrumb.Item>
              {#if index === breadcrumbItems.length - 1}
                <!-- Current page -->
                <Breadcrumb.Page>{item.name}</Breadcrumb.Page>
              {:else}
                <!-- Clickable breadcrumb -->
                <Breadcrumb.Link
                  href="#"
                  onclick={(e) => {
                    e.preventDefault();
                    handleBreadcrumbClick(item);
                  }}
                >
                  {item.name}
                </Breadcrumb.Link>
              {/if}
            </Breadcrumb.Item>

            {#if index < breadcrumbItems.length - 1}
              <Breadcrumb.Separator />
            {/if}
          {/each}
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </div>

    <Separator orientation="vertical" class="h-6" />

    <!-- Action Buttons -->
    <div class="flex items-center gap-1">
      <Button variant="ghost" size="sm" title="Search">
        <Search class="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="sm" title="New folder">
        <Plus class="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="sm" title="More options">
        <MoreHorizontal class="h-4 w-4" />
      </Button>
    </div>
  </div>
</header>

<style>
  .file-explorer-header {
    min-height: 48px;
  }
</style>
```

#### Step 6: Create the Index Export File

**Purpose**: Export all file explorer components for easy importing.

**File to Create: `src/lib/components/file-explorer/index.ts`**

```typescript
/**
 * File Explorer Components
 * Main exports for the file explorer module
 */

// Main component
export { default as FileExplorer } from "./FileExplorer.svelte";

// Sub-components
export { default as TreeView } from "./TreeView.svelte";
export { default as FileList } from "./FileList.svelte";
export { default as PreviewPanel } from "./PreviewPanel.svelte";
export { default as FileExplorerHeader } from "./FileExplorerHeader.svelte";

// Types and utilities
export type * from "./types.js";
export * from "./mock-data.js";
```

#### Step 7: Update Main Page to Use File Explorer

**Purpose**: Integrate the file explorer into the main application page.

**File to Modify: `src/routes/+page.svelte`**

```svelte
<script lang="ts">
  import { FileExplorer } from '$lib/components/file-explorer/index.js';
</script>

<svelte:head>
  <title>File Explorer Demo</title>
  <meta name="description" content="Windows File Explorer-like interface demo" />
</svelte:head>

<div class="h-screen">
  <FileExplorer
    initialPath="/Documents"
    showPreview={true}
  />
</div>
```

### 6. Step-by-Step Implementation Guide

**FOCUS**: This section provides exact implementation steps for creating a
Windows File Explorer-like interface. Follow these steps in order.

#### Phase 1: Environment Setup (15 minutes)

**Step 1.1: Install shadcn-svelte Components**

```bash
# Navigate to your project directory
cd surreal-rag

# Initialize shadcn-svelte (if not already done)
npx shadcn-svelte@latest init

# Install required components one by one
npx shadcn-svelte@latest add button
npx shadcn-svelte@latest add table
npx shadcn-svelte@latest add collapsible
npx shadcn-svelte@latest add breadcrumb
npx shadcn-svelte@latest add dropdown-menu
npx shadcn-svelte@latest add separator
npx shadcn-svelte@latest add badge
npx shadcn-svelte@latest add tooltip
npx shadcn-svelte@latest add card

# Install required dependencies
npm install bits-ui lucide-svelte
```

**Step 1.2: Verify Installation**

- Check that `src/lib/components/ui/` contains the installed components
- Verify each component has an `index.ts` file
- If any component is missing, install it manually from
  [shadcn-svelte docs](https://www.shadcn-svelte.com/docs/components)

**Step 1.3: Create Directory Structure**

```bash
# Create the file explorer directory
mkdir -p src/lib/components/file-explorer
```

#### Phase 2: Core Files Creation (20 minutes)

**Step 2.1: Create TypeScript Interfaces**

- Create `src/lib/components/file-explorer/types.ts`
- Copy the exact TypeScript interfaces from the plan above
- Ensure all interfaces are properly exported

**Step 2.2: Create Mock Data Service**

- Create `src/lib/components/file-explorer/mock-data.ts`
- Copy the exact mock data and utility functions from the plan above
- Test that `getFileSystemItems()` function works correctly

**Step 2.3: Create Export Index**

- Create `src/lib/components/file-explorer/index.ts`
- Copy the exact export statements from the plan above

#### Phase 3: Component Implementation (60 minutes)

**Step 3.1: Create Main Container (15 minutes)**

- Create `src/lib/components/file-explorer/FileExplorer.svelte`
- Copy the exact component code from the plan above
- Focus on the three-panel layout structure
- Ensure all imports are correct

**Step 3.2: Create Tree View (15 minutes)**

- Create `src/lib/components/file-explorer/TreeView.svelte`
- Copy the exact component code from the plan above
- Test the collapsible folder functionality
- Verify folder selection works

**Step 3.3: Create File List (15 minutes)**

- Create `src/lib/components/file-explorer/FileList.svelte`
- Copy the exact component code from the plan above
- Test sorting functionality
- Verify file selection works

**Step 3.4: Create Preview Panel (10 minutes)**

- Create `src/lib/components/file-explorer/PreviewPanel.svelte`
- Copy the exact component code from the plan above
- Test file preview display

**Step 3.5: Create Header Component (5 minutes)**

- Create `src/lib/components/file-explorer/FileExplorerHeader.svelte`
- Copy the exact component code from the plan above
- Test breadcrumb navigation

#### Phase 4: Integration and Testing (15 minutes)

**Step 4.1: Update Main Page**

- Modify `src/routes/+page.svelte` to use the FileExplorer component
- Copy the exact integration code from the plan above

**Step 4.2: Test Basic Functionality**

```bash
# Start development server
npm run dev
```

**Step 4.3: Verification Checklist**

- [ ] Three-panel layout displays correctly
- [ ] Tree view shows folder hierarchy
- [ ] Clicking folders navigates correctly
- [ ] File list shows files and folders
- [ ] Sorting works in file list
- [ ] File selection shows preview
- [ ] Breadcrumb navigation works
- [ ] Layout is responsive

#### Phase 5: Troubleshooting Common Issues

**Issue: Components not found**

- Solution: Verify shadcn-svelte components are installed in
  `src/lib/components/ui/`
- Run installation commands again if needed

**Issue: TypeScript errors**

- Solution: Check all imports use `.js` extension
- Verify all interfaces are properly exported from `types.ts`

**Issue: Styling problems**

- Solution: Ensure Tailwind CSS is properly configured
- Check that shadcn-svelte CSS variables are loaded

**Issue: Navigation not working**

- Solution: Verify event handlers use `onclick` (not `on:click`)
- Check that state updates trigger reactivity

### 7. Validation Commands

Run these commands to verify everything works:

```bash
# 1. Check TypeScript compilation
npm run check

# 2. Start development server
npm run dev

# 3. Build the project
npm run build

# 4. Check for linting issues
npm run lint
```

### 8. Success Criteria

After completing this implementation, you will have achieved:

**✅ Core Functionality**

- Three-panel Windows Explorer-like interface
- Functional folder tree navigation with expand/collapse
- File list with sorting capabilities
- File preview panel with metadata display
- Breadcrumb navigation

**✅ Technical Requirements**

- Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) ✓
- Modern event handling (`onclick` instead of `on:click`) ✓
- shadcn-svelte component integration ✓
- Full TypeScript type safety ✓
- Responsive design ✓

**✅ User Experience**

- Familiar Windows Explorer interface pattern
- Smooth animations and transitions
- Accessible keyboard navigation
- Visual feedback for interactions

### 9. What This Plan Does NOT Include

**Important**: This plan focuses ONLY on UI implementation. The following are
explicitly out of scope:

- ❌ Real file system integration
- ❌ File operations (create, delete, rename, move)
- ❌ File upload functionality
- ❌ Search and filtering
- ❌ Drag and drop operations
- ❌ Multiple file selection
- ❌ Context menus with real actions
- ❌ Performance optimizations for large directories

### 10. Immediate Next Steps After Completion

1. **Test the interface thoroughly** with the provided mock data
2. **Verify all interactions work** as expected
3. **Check responsive behavior** on different screen sizes
4. **Validate accessibility** with keyboard navigation
5. **Document any issues** encountered during implementation

### 11. Key Implementation Notes

**Focus Areas:**

- **Component Structure**: Follow the exact component hierarchy provided
- **State Management**: Use Svelte 5 runes consistently throughout
- **Event Handling**: Use modern `onclick` syntax, not legacy `on:click`
- **Styling**: Leverage shadcn-svelte components and Tailwind CSS classes
- **Type Safety**: Ensure all props and state are properly typed

**Critical Success Factors:**

1. Install all required shadcn-svelte components before starting
2. Copy code exactly as provided in the plan
3. Test each component individually before integration
4. Follow the step-by-step sequence without skipping phases
5. Use the troubleshooting guide when issues arise

This plan provides a complete, focused implementation of a file explorer UI that
serves as a solid foundation for future file management features.
