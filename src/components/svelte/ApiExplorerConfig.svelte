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

  let selectedVersion = $state('v1');
  const versions = ['v1', 'v2'];

  function handleVersionChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    selectedVersion = target.value;
    window.dispatchEvent(new CustomEvent('primebrick-api-version', { detail: { version: selectedVersion } }));
  }
</script>

<!-- Config bar — uses CSS variables that work in both light and dark mode -->
<div class="api-config-bar">
  <div class="api-config-bar-inner">
    <div class="api-config-status">
      <span class="api-config-label">API Base URL:</span>
      <code class="api-config-url">{config.baseUrl}</code>
      {#if config.apiKey}
        <span class="api-config-key-set">| API Key: set</span>
      {:else}
        <span class="api-config-key-unset">| API Key: not set</span>
      {/if}
    </div>
    <button onclick={toggleConfig} class="api-config-toggle">
      {showConfig ? 'Close' : 'Configure'}
    </button>
  </div>

  {#if showConfig}
    <div class="api-config-panel">
      <div>
        <label for="baseUrl" class="api-config-field-label">Base URL</label>
        <input
          id="baseUrl"
          type="text"
          bind:value={config.baseUrl}
          placeholder="http://localhost:3001"
          class="api-config-input"
        />
        <p class="api-config-hint">
          The OpenAPI spec will be fetched from <code>{specUrl}</code>
        </p>
      </div>
      <div>
        <label for="apiKey" class="api-config-field-label">API Key</label>
        <input
          id="apiKey"
          type="password"
          bind:value={config.apiKey}
          placeholder="Enter your API key"
          class="api-config-input"
        />
        <p class="api-config-hint">
          Stored in localStorage. The platform also supports user access tokens and OAuth2 client credentials.
        </p>
      </div>
      <div class="config-field">
        <label for="api-version">API Version</label>
        <select id="api-version" value={selectedVersion} onchange={handleVersionChange}>
          {#each versions as v}
            <option value={v}>{v}</option>
          {/each}
        </select>
      </div>
      <div class="api-config-actions">
        <button onclick={save} class="api-config-save-btn">
          Save & Apply
        </button>
        {#if saved}
          <span class="api-config-saved">Saved!</span>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  /* Use light/dark agnostic styles that work with Scalar's theme switching */
  .api-config-bar {
    position: sticky;
    top: 3.75rem;
    z-index: 40;
    border-bottom: 1px solid var(--scalar-border-color, #e5e7eb);
    background: var(--scalar-background-1, #f9fafb);
    padding: 0.75rem 1rem;
    transition: background 0.2s, border-color 0.2s;
  }

  :global([data-theme="dark"]) .api-config-bar {
    border-bottom-color: var(--scalar-border-color, #1e293b);
    background: var(--scalar-background-1, #0f172a);
  }

  .api-config-bar-inner {
    max-width: 72rem;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .api-config-status {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
    color: var(--scalar-color-1, #374151);
  }

  :global([data-theme="dark"]) .api-config-status {
    color: var(--scalar-color-1, #d1d5db);
  }

  .api-config-label {
    color: var(--scalar-color-2, #6b7280);
  }

  .api-config-url {
    background: var(--scalar-background-2, #f3f4f6);
    color: var(--scalar-color-accent, #0ea5e9);
    padding: 0.125rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-family: monospace;
  }

  :global([data-theme="dark"]) .api-config-url {
    background: var(--scalar-background-2, #1e293b);
  }

  .api-config-key-set {
    color: var(--scalar-color-2, #6b7280);
  }

  .api-config-key-unset {
    color: var(--scalar-color-2, #6b7280);
  }

  .api-config-toggle {
    border: 1px solid var(--scalar-border-color, #e5e7eb);
    background: var(--scalar-background-2, #fff);
    color: var(--scalar-color-1, #374151);
    padding: 0.375rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .api-config-toggle:hover {
    border-color: var(--scalar-color-accent, #0ea5e9);
    color: var(--scalar-color-accent, #0ea5e9);
  }

  :global([data-theme="dark"]) .api-config-toggle {
    background: var(--scalar-background-2, #1e293b);
    border-color: var(--scalar-border-color, #334155);
    color: var(--scalar-color-1, #d1d5db);
  }

  .api-config-panel {
    max-width: 72rem;
    margin: 1rem auto 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-bottom: 1rem;
  }

  .api-config-field-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--scalar-color-1, #374151);
    margin-bottom: 0.25rem;
  }

  :global([data-theme="dark"]) .api-config-field-label {
    color: var(--scalar-color-1, #d1d5db);
  }

  .api-config-input {
    width: 100%;
    border: 1px solid var(--scalar-border-color, #e5e7eb);
    background: var(--scalar-background-2, #fff);
    color: var(--scalar-color-1, #111827);
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .api-config-input:focus {
    border-color: var(--scalar-color-accent, #0ea5e9);
  }

  :global([data-theme="dark"]) .api-config-input {
    border-color: var(--scalar-border-color, #334155);
    background: var(--scalar-background-2, #1e293b);
    color: var(--scalar-color-1, #f1f5f9);
  }

  .config-field select {
    width: 100%;
    border: 1px solid var(--scalar-border-color, #e5e7eb);
    background: var(--scalar-background-2, #fff);
    color: var(--scalar-color-1, #111827);
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.2s;
    cursor: pointer;
  }

  .config-field select:focus {
    border-color: var(--scalar-color-accent, #0ea5e9);
  }

  :global([data-theme="dark"]) .config-field select {
    border-color: var(--scalar-border-color, #334155);
    background: var(--scalar-background-2, #1e293b);
    color: var(--scalar-color-1, #f1f5f9);
  }

  .config-field label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--scalar-color-1, #374151);
    margin-bottom: 0.25rem;
  }

  :global([data-theme="dark"]) .config-field label {
    color: var(--scalar-color-1, #d1d5db);
  }

  .api-config-hint {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: var(--scalar-color-2, #6b7280);
  }

  :global([data-theme="dark"]) .api-config-hint {
    color: var(--scalar-color-2, #94a3b8);
  }

  .api-config-hint code {
    font-family: monospace;
    color: var(--scalar-color-accent, #0ea5e9);
  }

  .api-config-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .api-config-save-btn {
    background: var(--scalar-color-accent, #0ea5e9);
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .api-config-save-btn:hover {
    opacity: 0.9;
  }

  .api-config-saved {
    font-size: 0.875rem;
    color: #22c55e;
  }
</style>
