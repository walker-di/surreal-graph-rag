<script lang="ts">
  import { FileExplorer } from "$lib/ui/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
</script>

<svelte:head>
  <title>File Explorer Demo</title>
  <meta
    name="description"
    content="Windows File Explorer-like interface demo"
  />
</svelte:head>

<div class="h-screen relative">
  <!-- Navigation Links -->
  <div class="absolute top-4 right-4 z-10 flex gap-2">
    <a href="/file-upload" aria-label="Go to File Upload">
      <Button>File Upload</Button>
    </a>
    <a href="/debug/files" aria-label="Go to Debug Files">
      <Button variant="outline">Debug Files</Button>
    </a>
  </div>

  <FileExplorer initialPath="/Documents" showPreview={true} />
</div>
