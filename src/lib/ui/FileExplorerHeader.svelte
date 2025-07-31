<script lang="ts">
  /**
   * File Explorer Header Component
   * Contains breadcrumb navigation and toolbar actions
   */

  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import {
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Home,
    Search,
    Plus,
    MoreHorizontal,
  } from "lucide-svelte";
  import type { BreadcrumbItem } from "./file-explorer-types.js";

  // Component props using Svelte 5 $props
  interface Props {
    currentPath: string;
    onNavigate: (path: string) => void;
  }

  let { currentPath, onNavigate }: Props = $props();

  // Navigation history (placeholder)
  let navigationHistory: string[] = $state(["/Documents"]);
  let historyIndex: number = $state(0);

  // Generate breadcrumb items from current path
  let breadcrumbItems = $derived(generateBreadcrumbs(currentPath));

  function generateBreadcrumbs(path: string): BreadcrumbItem[] {
    if (path === "/" || path === "") {
      return [{ name: "Home", path: "/" }];
    }

    const parts = path.split("/").filter(Boolean);
    const items: BreadcrumbItem[] = [{ name: "Home", path: "/" }];

    let currentPath = "";
    for (const part of parts) {
      currentPath += "/" + part;
      items.push({
        name: part,
        path: currentPath,
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
    onNavigate("/Documents");
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
  let canGoBack = $derived(historyIndex > 0);
  let canGoForward = $derived(historyIndex < navigationHistory.length - 1);
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
        <ChevronLeft class="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={!canGoForward}
        onclick={goForward}
        title="Go forward"
      >
        <ChevronRight class="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="sm" onclick={refresh} title="Refresh">
        <RotateCcw class="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="sm" onclick={goHome} title="Go to home">
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
