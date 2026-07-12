<script lang="ts">
  const STORAGE_KEY = 'primebrick-api-explorer-config';

  interface Config {
    baseUrl: string;
    apiKey: string;
  }

  let config = $state<Config>({
    baseUrl: 'http://localhost:3001',
    apiKey: '',
  });

  let showConfig = $state(false);
  let saved = $state(false);

  // Load from localStorage on mount
  $effect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        config.baseUrl = parsed.baseUrl ?? config.baseUrl;
        config.apiKey = parsed.apiKey ?? '';
      }
    } catch {
      // ignore parse errors
    }
  });

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      saved = true;
      setTimeout(() => (saved = false), 2000);
    } catch {
      // ignore storage errors
    }
    // Dispatch event so Scalar can pick up new config
    window.dispatchEvent(
      new CustomEvent('primebrick-api-config', { detail: { ...config } })
    );
  }

  function toggleConfig() {
    showConfig = !showConfig;
  }

  const specUrl = $derived(`${config.baseUrl}/api/v1/openapi/aggregated.json`);
</script>

<div class="border-b border-slate-800 bg-slate-900/50 px-4 py-3">
  <div class="mx-auto flex max-w-6xl items-center justify-between">
    <div class="flex items-center gap-3 text-sm">
      <span class="text-slate-400">API Base URL:</span>
      <code class="rounded bg-slate-800 px-2 py-0.5 text-sky-400">{config.baseUrl}</code>
      {#if config.apiKey}
        <span class="text-slate-500">| API Key: set</span>
      {:else}
        <span class="text-slate-500">| API Key: not set</span>
      {/if}
    </div>
    <button
      onclick={toggleConfig}
      class="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-sky-500 hover:text-sky-400 transition-colors"
    >
      {showConfig ? 'Close' : 'Configure'}
    </button>
  </div>

  {#if showConfig}
    <div class="mx-auto mt-4 max-w-6xl space-y-4">
      <div>
        <label for="baseUrl" class="block text-sm font-medium text-slate-300">Base URL</label>
        <input
          id="baseUrl"
          type="text"
          bind:value={config.baseUrl}
          placeholder="http://localhost:3001"
          class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
        />
        <p class="mt-1 text-xs text-slate-500">
          The OpenAPI spec will be fetched from <code>{specUrl}</code>
        </p>
      </div>
      <div>
        <label for="apiKey" class="block text-sm font-medium text-slate-300">API Key</label>
        <input
          id="apiKey"
          type="password"
          bind:value={config.apiKey}
          placeholder="Enter your API key"
          class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
        />
        <p class="mt-1 text-xs text-slate-500">
          Stored in localStorage. The platform also supports user access tokens and OAuth2 client credentials.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          onclick={save}
          class="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400 transition-colors"
        >
          Save & Apply
        </button>
        {#if saved}
          <span class="text-sm text-green-400">Saved!</span>
        {/if}
      </div>
    </div>
  {/if}
</div>
