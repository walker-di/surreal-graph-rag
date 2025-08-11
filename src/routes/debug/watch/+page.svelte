<script lang="ts">
  import { onMount } from "svelte";

  type FileRow = {
    id: string;
    name: string;
    original_name: string;
    upload_path?: string;
    status?: string;
    original_sha256?: string;
    chunk_count?: number;
    created_at?: string;
    updated_at?: string;
  };

  type ChunkRow = {
    id: string;
    file_id: string;
    chunk_index: number;
    start_char: number;
    end_char: number;
    token_count: number;
  };

  type PidInfo = {
    pid: number;
    ppid: number;
    node: string;
    uptimeSec: number;
    startedAt: string;
    memory?: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external?: number;
      arrayBuffers?: number;
    };
  };

  let files: FileRow[] = [];
  let chunksByFile: Record<string, ChunkRow[]> = {};
  let watchRuns: Array<Record<string, unknown>> = [];
  let pidInfo: PidInfo | null = null;
  let loading = false;
  let errorMsg = "";
  let infoMsg = "";

  // Register form state
  let registerPath = "src/lib/config.ts";
  let registerName = "";

  async function loadDebug() {
    loading = true;
    errorMsg = "";
    infoMsg = "";
    try {
      const res = await fetch("/api/debug/files");
      if (!res.ok) {
        throw new Error(`Debug fetch failed: ${res.status}`);
      }
      const data = await res.json();
      files = data.files ?? [];
      chunksByFile = data.chunks ?? {};
      watchRuns = data.watchRuns ?? [];

      // Fetch PID/uptime to detect real restarts
      const pidRes = await fetch("/api/debug/pid");
      if (pidRes.ok) {
        const p = await pidRes.json();
        pidInfo = p;
      } else {
        pidInfo = null;
      }
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }

  async function triggerRun() {
    loading = true;
    errorMsg = "";
    infoMsg = "";
    try {
      const res = await fetch("/api/files/watch/run", {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message ?? `Watch run failed: ${res.status}`);
      }
      infoMsg = "Watch run triggered.";
      // Give a short delay to allow the cycle to finish, then reload
      setTimeout(loadDebug, 500);
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }

  async function triggerRunForPath() {
    loading = true;
    errorMsg = "";
    infoMsg = "";
    try {
      const res = await fetch("/api/files/watch/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path: registerPath }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.message ?? `Watch run (path) failed: ${res.status}`
        );
      }
      infoMsg = `Watch run for path complete. changed=${data.changed ?? 0}, errors=${data.errors ?? 0}`;
      // Reload quickly to reflect any updates
      setTimeout(loadDebug, 300);
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }

  async function registerFile() {
    loading = true;
    errorMsg = "";
    infoMsg = "";
    try {
      const res = await fetch("/api/files/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          path: registerPath,
          name: registerName || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message ?? `Register failed: ${res.status}`);
      }
      infoMsg = `Registered file. id=${data.fileId}, resolved=${data.resolvedPath}`;
      await loadDebug();
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }

  onMount(loadDebug);
</script>

<div class="container">
  <h1>Watch Debug</h1>
  <p class="muted">
    Use this page to register repository files for watching and trigger a scan
    immediately. The watcher compares on-disk content at rootPath + upload_path
    against the database hash and re-chunks on changes.
  </p>

  {#if errorMsg}
    <p class="err">{errorMsg}</p>
  {/if}
  {#if infoMsg}
    <p class="ok">{infoMsg}</p>
  {/if}

  <div class="card">
    <h2>Server process</h2>
    {#if pidInfo}
      <p class="mono">
        PID={pidInfo.pid} PPID={pidInfo.ppid} Node={pidInfo.node} | Uptime={pidInfo.uptimeSec.toFixed(
          1
        )}s | Started={pidInfo.startedAt}
      </p>
    {:else}
      <p class="muted">PID info unavailable</p>
    {/if}
  </div>

  <div class="card">
    <h2>Register a file</h2>
    <div class="row" style="margin: 0.5rem 0;">
      <label class="muted">Path</label>
      <input
        class="input"
        bind:value={registerPath}
        placeholder="e.g. src/lib/config.ts"
      />
      <label class="muted">Name (optional)</label>
      <input
        class="input"
        bind:value={registerName}
        placeholder="friendly name"
      />
      <button
        class="btn"
        disabled={loading}
        on:click|preventDefault={registerFile}>Register</button
      >
    </div>
    <p class="muted">
      Path is resolved relative to the watcher rootPath. Leading "/" is treated
      as relative on Windows.
    </p>
  </div>

  <div class="card">
    <h2>Trigger watch run</h2>
    <div class="row" style="margin: 0.5rem 0;">
      <button
        class="btn"
        disabled={loading}
        on:click|preventDefault={triggerRun}>Run now (full)</button
      >
      <button
        class="btn"
        disabled={loading}
        on:click|preventDefault={triggerRunForPath}>Run now for path</button
      >
      {#if loading}<span class="muted">running...</span>{/if}
    </div>
    <p class="muted">
      "Run now for path" only reprocesses the file(s) whose upload_path exactly
      match the Path field above.
    </p>
  </div>

  <div class="card">
    <h2>Recent watch runs</h2>
    {#if watchRuns.length === 0}
      <p class="muted">No runs found.</p>
    {:else}
      <table>
        <thead>
          <tr>
            <th>Started</th>
            <th>Finished</th>
            <th>Mode</th>
            <th>Scanned</th>
            <th>Changed</th>
            <th>Errors</th>
          </tr>
        </thead>
        <tbody>
          {#each watchRuns as run}
            <tr>
              <td class="mono">{String(run.started_at ?? "")}</td>
              <td class="mono">{String(run.finished_at ?? "")}</td>
              <td>{String(run.mode ?? "")}</td>
              <td
                >{String(
                  (run as any).file_count ?? (run as any).scanned_count ?? ""
                )}</td
              >
              <td>{String((run as any).changed_count ?? "")}</td>
              <td>{String((run as any).error_count ?? "")}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>

  <div class="card">
    <h2>Registered files</h2>
    {#if files.length === 0}
      <p class="muted">No files registered.</p>
    {:else}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Upload Path</th>
            <th>Status</th>
            <th>Chunks</th>
            <th>SHA256</th>
          </tr>
        </thead>
        <tbody>
          {#each files as f}
            <tr>
              <td class="mono">{f.name}</td>
              <td class="mono">{f.upload_path ?? ""}</td>
              <td>{f.status ?? ""}</td>
              <td class="mono">{f.chunk_count ?? 0}</td>
              <td class="mono" title={f.original_sha256 ?? ""}>
                {(f.original_sha256 ?? "").slice(0, 12)}{(
                  f.original_sha256 ?? ""
                ).length > 12
                  ? "…"
                  : ""}
              </td>
            </tr>
            {#if chunksByFile[String((f as any).id ?? "")]?.length}
              <tr>
                <td colspan="5">
                  <details>
                    <summary>Chunks for {f.name}</summary>
                    <ul>
                      {#each chunksByFile[String((f as any).id ?? "")] as c}
                        <li class="mono">
                          #{c.chunk_index} [{c.start_char}-{c.end_char}] (~{c.token_count}t)
                        </li>
                      {/each}
                    </ul>
                  </details>
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>

<style>
  .container {
    max-width: 1000px;
    margin: 2rem auto;
    padding: 0 1rem;
  }
  .row {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
  }
  .btn {
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    border: 1px solid #999;
    background: #f6f6f6;
    cursor: pointer;
  }
  .btn:hover {
    background: #ececec;
  }
  .input {
    padding: 0.4rem 0.6rem;
    border-radius: 6px;
    border: 1px solid #bbb;
    min-width: 280px;
  }
  .card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 0.75rem;
    margin: 0.5rem 0;
  }
  .muted {
    color: #666;
    font-size: 0.9rem;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th,
  td {
    border-bottom: 1px solid #eee;
    text-align: left;
    padding: 0.5rem;
  }
  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      "Liberation Mono", "Courier New", monospace;
  }
  .ok {
    color: #0a7d2b;
  }
  .err {
    color: #b00020;
  }
</style>
