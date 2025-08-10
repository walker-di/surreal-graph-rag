# UI Audit and Fix Plan — File Explorer and File Upload

## Overview

This plan documents issues found via a live UI audit (Playwright MCP at http://localhost:5173/) and a code audit of the Svelte components, and provides focused, junior-friendly fixes. It follows the docs/plans style and focuses on improving:

- Initial render consistency for File Explorer data
- Tree view expand/collapse correctness
- Navigation history and breadcrumb behavior
- Accessibility and UX polish (icon-only buttons, sorting a11y)
- SPA navigation between routes
- Minor polish to File Upload UX (non-blocking)

Scope is limited to UI/UX correctness and small structural tweaks; no changes to data backend are included.

## Why These Fixes?

1. Prevent confusing states (0 items render on first load)
2. Ensure tree view behaves as expected by default
3. Provide discoverable navigation with history and breadcrumb correctness
4. Meet accessibility best practices (icon-only controls and sorting feedback)
5. Keep SPA navigation snappy without full reloads

## Live UI Audit Highlights

Using Playwright MCP:

- Landing page title: “File Explorer Demo”
- Header shows icon-only nav buttons (Back/Forward disabled), breadcrumb “Home › Documents”
- Left “Folders” tree shows a single “Documents” node (collapsed)
- Center table showed both:
  - First load: 3 items (Images folder, notes.txt, Projects folder)
  - Later refresh: 0 items with “No files or folders found” (intermittent)
- “File Upload” nav button routes to /file-upload and shows a working selection UI (drag and drop, folder mode, keyboard activation)

Console: Vite client connects OK; no runtime errors observed.

## Code Audit Highlights

- File Explorer state derives items in $effect, which should work, but we saw an intermittent 0 items render. A $derived is more deterministic.
- Tree initial expansion set uses path, but expand/collapse keys use folder.id (“root”). Mismatch prevents initial expansion of Documents.
- Header navigation history is never updated when navigating (Back/Forward remain disabled forever).
- Icon-only buttons lack explicit aria-labels/title attributes in several places.
- +page.svelte uses window.location.href for navigation instead of SPA-friendly links or goto().
- Table sorting lacks aria-sort attributes for accessible feedback.

## Implementation Plan (Step-by-step)

### 1) File Explorer: Deterministic data loading via $derived

Problem: Intermittent “0 items” rendered at /Documents despite mock data having 3 children. $effect should trigger, but $derived tied directly to currentPath removes any timing ambiguity.

File to Modify: [src/lib/ui/FileExplorer.svelte](src/lib/ui/FileExplorer.svelte:1)

Replace imperative currentItems updates with a $derived:

```svelte
<script lang="ts">
  // ...existing imports and state

  // Remove:
  // let currentItems: FileSystemItem[] = $state([]);
  // $effect(() => {
  //   currentItems = getFileSystemItems(explorerState.currentPath);
  // });

  // Add:
  let currentItems = $derived(getFileSystemItems(explorerState.currentPath));
</script>
```

Notes:

- Keep handleNavigate as-is; $derived will recompute when currentPath changes.

### 2) TreeView: Fix initial expanded state by using folder.id instead of path

Problem: expandedFolders is initialized with "/Documents", but toggle and checks use folder.id (“root”). This prevents Documents from appearing expanded initially.

File to Modify: [src/lib/ui/TreeView.svelte](src/lib/ui/TreeView.svelte:1)

Change the initialization:

```svelte
// Before
let expandedFolders: Set<string> = $state(new Set(["/Documents"]));

// After (expand the root "Documents" folder by its id)
let expandedFolders: Set<string> = $state(new Set(["root"]));
```

Optional polish: Render an “open” icon when expanded.

### 3) Header: Maintain navigation history and wire breadcrumb clicks

Problem: Back/Forward are permanently disabled because nothing ever pushes to navigationHistory.

Approach: Push currentPath on initial mount, and push new paths whenever onNavigate is called through UI. The header has no direct control over FileExplorer’s state, so we add a lightweight callback contract: FileExplorer passes onNavigate; Header calls onNavigate and also manages its history. The header can update its own navigationHistory whenever handleBreadcrumbClick or goHome/goForward/goBack calls onNavigate.

File to Modify: [src/lib/ui/FileExplorerHeader.svelte](src/lib/ui/FileExplorerHeader.svelte:1)

Add history updates:

- On component mount (first render), ensure the currentPath is represented.
- When calling onNavigate from header controls, update navigationHistory and historyIndex.

Exact changes:

```svelte
<script lang="ts">
  // ...existing code

  // Ensure we start with the first known path
  $effect(() => {
    if (navigationHistory.length === 0 || navigationHistory[0] !== currentPath) {
      navigationHistory = [currentPath];
      historyIndex = 0;
    }
  });

  function pushToHistory(nextPath: string) {
    // Drop any forward history
    if (historyIndex < navigationHistory.length - 1) {
      navigationHistory = navigationHistory.slice(0, historyIndex + 1);
    }
    navigationHistory = [...navigationHistory, nextPath];
    historyIndex = navigationHistory.length - 1;
  }

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
    const next = "/Documents";
    onNavigate(next);
    pushToHistory(next);
  }

  function refresh() {
    onNavigate(currentPath);
    // Do not push duplicate entries on refresh
  }

  function handleBreadcrumbClick(item: BreadcrumbItem) {
    onNavigate(item.path);
    pushToHistory(item.path);
  }
</script>
```

### 4) Accessibility: Add aria-labels/titles to icon-only buttons

Problem: Icon-only buttons rely on title in some places; ensure consistent aria-label on all icon-only buttons.

File to Modify: [src/lib/ui/FileExplorerHeader.svelte](src/lib/ui/FileExplorerHeader.svelte:90)

Add aria-labels:

```svelte
<Button variant="ghost" size="sm" disabled={!canGoBack} onclick={goBack} title="Go back" aria-label="Go back">
  <ChevronLeft class="h-4 w-4" />
</Button>

<Button variant="ghost" size="sm" disabled={!canGoForward} onclick={goForward} title="Go forward" aria-label="Go forward">
  <ChevronRight class="h-4 w-4" />
</Button>

<Button variant="ghost" size="sm" onclick={refresh} title="Refresh" aria-label="Refresh">
  <RotateCcw class="h-4 w-4" />
</Button>

<Button variant="ghost" size="sm" onclick={goHome} title="Go to home" aria-label="Go to home">
  <Home class="h-4 w-4" />
</Button>

<!-- Right-side actions -->
<Button variant="ghost" size="sm" title="Search" aria-label="Search">
  <Search class="h-4 w-4" />
</Button>
<Button variant="ghost" size="sm" title="New folder" aria-label="New folder">
  <Plus class="h-4 w-4" />
</Button>
<Button variant="ghost" size="sm" title="More options" aria-label="More options">
  <MoreHorizontal class="h-4 w-4" />
</Button>
```

File to Modify: [src/lib/ui/FileList.svelte](src/lib/ui/FileList.svelte:1)

Add aria-sort to headers and aria-label to menu trigger:

```svelte
<!-- Table Head buttons: set aria-sort on the TH based on current state -->
<Table.Head aria-sort={sortBy === "name" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}>
  <Button ... onclick={() => handleSort("name")}>...</Button>
</Table.Head>
<!-- repeat for size, type, dateModified -->

<!-- Menu trigger -->
<Button {...props} variant="ghost" size="sm" class="h-8 w-8 p-0" aria-label="Open row menu">
  <MoreHorizontal class="h-4 w-4" />
  <span class="sr-only">Open menu</span>
</Button>
```

### 5) SPA Navigation for top-right buttons

Problem: window.location.href causes a full reload and is less accessible. Prefer SvelteKit links for SPA smoothness.

File to Modify: [src/routes/+page.svelte](src/routes/+page.svelte:1)

Replace buttons with anchor links or use SvelteKit’s goto(). Easiest path: anchors with proper styling via Button as child.

```svelte
<div class="absolute top-4 right-4 z-10 flex gap-2">
  <a href="/file-upload" aria-label="Go to File Upload">
    <Button>File Upload</Button>
  </a>
  <a href="/debug/files" aria-label="Go to Debug Files">
    <Button variant="outline">Debug Files</Button>
  </a>
</div>
```

### 6) Optional: File Upload UX — replace alert() with inline feedback (non-blocking)

Problem: Validation uses `alert()`. Replace with a small visible inline error list to avoid blocking dialogs. This is optional; included here for completeness.

File to Modify: [src/lib/ui/FileUpload.svelte](src/lib/ui/FileUpload.svelte:1)

Add state to hold validationErrors and render a small error area above the upload button.

```svelte
<script lang="ts">
  // ...
  let validationErrors: string[] = $state([]);

  async function uploadSelectedFiles() {
    if (selectedFiles.length === 0) return;

    validationErrors = [];
    selectedFiles.forEach((file) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        validationErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (validationErrors.length > 0) {
      showResults = false;
      return;
    }

    // ...continue as before
  }
</script>

<!-- Render validation error list -->
{#if validationErrors.length > 0}
  <div role="alert" class="text-red-600 text-sm">
    <ul class="list-disc ml-6">
      {#each validationErrors as err}<li>{err}</li>{/each}
    </ul>
  </div>
{/if}
```

## Validation

Commands:

- Start dev server and verify routes:
  - npm run dev
  - Visit http://localhost:5173/
  - Confirm:
    - Tree “Documents” expanded by default
    - Center shows 3 items consistently
    - Back/Forward remain disabled initially; after clicking breadcrumb into “Projects” then back, they should enable/disable appropriately
    - Header icon-only controls have tooltips and aria-labels
    - Table headers announce aria-sort as you toggle sorting
    - Top buttons navigate SPA to /file-upload and /debug/files without full reloads
- Playwright MCP quick checks:
  - Navigate to http://localhost:5173/
  - Click “File Upload” and confirm the page changes
  - Snapshot shows expected headings and controls

## Success Criteria

- No intermittent “0 items” on first render; items reflect mock data deterministically
- “Documents” is expanded by default in tree view
- Breadcrumb clicks and home/back/forward update history as expected (Back/Forward enable correctly)
- Icon-only buttons include aria-labels
- Table headers expose aria-sort accurately when sorting
- Navigation between main page and /file-upload is SPA and accessible

## What This Plan Does NOT Include

- Backend API changes for uploads or DB
- Real filesystem integration
- Complex keyboard nav in the table beyond existing shadcn defaults
- Adding tests (can be a follow-up plan; see below)

## Follow-up (Recommended)

- Add Playwright specs:
  - Load /, assert 3 items show
  - Click breadcrumb to navigate into Projects then goBack, assert items and breadcrumb update
  - Navigate to /file-upload and verify drag/drop focuses and keyboard activation works

## Exact Edits Summary (for reference)

- [src/lib/ui/FileExplorer.svelte](src/lib/ui/FileExplorer.svelte:1): Change currentItems from $state + $effect to a $derived from currentPath
- [src/lib/ui/TreeView.svelte](src/lib/ui/TreeView.svelte:1): Initialize expandedFolders with ["root"] instead of ["/Documents"]
- [src/lib/ui/FileExplorerHeader.svelte](src/lib/ui/FileExplorerHeader.svelte:1): Add pushToHistory(), update goBack(), goForward(), goHome(), handleBreadcrumbClick(), add initial $effect for history
- [src/lib/ui/FileExplorerHeader.svelte](src/lib/ui/FileExplorerHeader.svelte:1): Add aria-labels to icon-only buttons
- [src/lib/ui/FileList.svelte](src/lib/ui/FileList.svelte:1): Add aria-sort to headers and aria-label to row menu trigger
- [src/routes/+page.svelte](src/routes/+page.svelte:1): Replace window.location.href usage with anchor links for SPA nav
- [src/lib/ui/FileUpload.svelte](src/lib/ui/FileUpload.svelte:1): Optional — replace alert() with inline validation error list

## Mermaid: High-level Interaction Flow

```mermaid
flowchart LR
  A[Load /] --> B[FileExplorer.svelte]
  B --> C[$derived currentItems from currentPath]
  B --> D[TreeView expandedFolders uses ids]
  B --> E[FileExplorerHeader with history]
  E -- breadcrumb/home --> B
  B --> F[FileList sorting aria-sort]
  A -- Top buttons --> G[/file-upload]
```
