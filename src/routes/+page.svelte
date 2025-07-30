<script lang="ts">
  import { FileExplorer } from "$lib/ui/index.js";
</script>

<svelte:head>
  <title>File Explorer Demo</title>
  <meta
    name="description"
    content="Windows File Explorer-like interface demo"
  />
</svelte:head>

<div class="h-screen">
  <FileExplorer initialPath="/Documents" showPreview={true} />
</div>
