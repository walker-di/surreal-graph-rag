<script lang="ts">
  import { FileUpload } from "$lib/ui/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import type { UploadResult } from "$lib/ui/file-upload-types.js";

  function handleUploadComplete(results: UploadResult[]) {
    console.log("Upload completed:", results);
  }
</script>

<svelte:head>
  <title>File Upload Demo</title>
  <meta name="description" content="File upload and backend processing demo" />
</svelte:head>

<div class="container mx-auto py-8 px-4">
  <div class="max-w-4xl mx-auto">
    <!-- Navigation Links -->
    <div class="flex justify-center gap-2 mb-6">
      <Button variant="outline" onclick={() => (window.location.href = "/")}>
        ← Home
      </Button>
      <Button
        variant="outline"
        onclick={() => (window.location.href = "/debug/files")}
      >
        Debug Files
      </Button>
    </div>

    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold mb-2">File Upload System</h1>
      <p class="text-muted-foreground">
        Upload text files and process them into chunks on the backend
      </p>
    </div>

    <FileUpload onUploadComplete={handleUploadComplete} />
  </div>
</div>
