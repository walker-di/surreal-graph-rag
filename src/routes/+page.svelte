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
    <Button onclick={() => (window.location.href = "/file-upload")}>
      File Upload
    </Button>
    <Button
      variant="outline"
      onclick={() => (window.location.href = "/debug/files")}
    >
      Debug Files
    </Button>
  </div>

  <FileExplorer initialPath="/Documents" showPreview={true} />
</div>
