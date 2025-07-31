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
    Trash2,
  } from "lucide-svelte";
  import type { FileSystemItem } from "./file-explorer-types.js";
  import { formatFileSize, getFileIcon } from "./file-explorer-mock-data.js";

  // Component props using Svelte 5 $props
  interface Props {
    items: FileSystemItem[];
    selectedItems: string[];
    viewMode: "list" | "grid";
    sortBy: "name" | "size" | "dateModified" | "type";
    sortOrder: "asc" | "desc";
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
    onItemDoubleClick,
  }: Props = $props();

  // Sort items based on current sort settings
  let sortedItems = $derived(
    [...items].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "size":
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case "dateModified":
          comparison = a.dateModified.getTime() - b.dateModified.getTime();
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    }),
  );

  // Handle sort column click
  function handleSort(column: typeof sortBy) {
    if (sortBy === column) {
      // Toggle sort order if same column
      sortOrder = sortOrder === "asc" ? "desc" : "asc";
    } else {
      // Set new column and default to ascending
      sortBy = column;
      sortOrder = "asc";
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
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }

  // Get sort icon for column header
  function getSortIcon(column: typeof sortBy) {
    if (sortBy !== column) return ArrowUpDown;
    return sortOrder === "asc" ? ArrowUp : ArrowDown;
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
      <Button variant="outline" size="sm">View Options</Button>
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
              onclick={() => handleSort("name")}
            >
              Name
              {@const IconComponent = getSortIcon("name")}
              <IconComponent class="ml-2 h-4 w-4" />
            </Button>
          </Table.Head>
          <Table.Head>
            <Button
              variant="ghost"
              class="h-auto p-0 font-semibold"
              onclick={() => handleSort("size")}
            >
              Size
              {@const IconComponent = getSortIcon("size")}
              <IconComponent class="ml-2 h-4 w-4" />
            </Button>
          </Table.Head>
          <Table.Head>
            <Button
              variant="ghost"
              class="h-auto p-0 font-semibold"
              onclick={() => handleSort("type")}
            >
              Type
              {@const IconComponent = getSortIcon("type")}
              <IconComponent class="ml-2 h-4 w-4" />
            </Button>
          </Table.Head>
          <Table.Head>
            <Button
              variant="ghost"
              class="h-auto p-0 font-semibold"
              onclick={() => handleSort("dateModified")}
            >
              Date Modified
              {@const IconComponent = getSortIcon("dateModified")}
              <IconComponent class="ml-2 h-4 w-4" />
            </Button>
          </Table.Head>
          <Table.Head class="w-12"></Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each sortedItems as item (item.id)}
          <Table.Row
            class="cursor-pointer hover:bg-muted/50 {selectedItems.includes(
              item.id,
            )
              ? 'bg-accent'
              : ''}"
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
              {item.type === "file" && item.size
                ? formatFileSize(item.size)
                : "—"}
            </Table.Cell>
            <Table.Cell class="text-muted-foreground">
              <Badge variant="outline" class="text-xs">
                {item.type === "folder" ? "Folder" : item.extension || "File"}
              </Badge>
            </Table.Cell>
            <Table.Cell class="text-muted-foreground text-sm">
              {formatDate(item.dateModified)}
            </Table.Cell>
            <Table.Cell>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  {#snippet child({ props })}
                    <Button
                      {...props}
                      variant="ghost"
                      size="sm"
                      class="h-8 w-8 p-0"
                    >
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
            <Table.Cell
              colspan={6}
              class="h-24 text-center text-muted-foreground"
            >
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
