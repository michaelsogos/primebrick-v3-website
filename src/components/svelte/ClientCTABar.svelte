<script lang="ts">
  const STORAGE_KEY = 'primebrick-api-explorer-config';

  interface Config {
    baseUrl: string;
    apiKey: string;
  }

  let config = $state<Config>({ baseUrl: 'http://localhost:3001', apiKey: '' });
  let copied = $state(false);

  // Load from localStorage and listen for changes
  $effect(() => {
    const loadConfig = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          config.baseUrl = parsed.baseUrl ?? config.baseUrl;
          config.apiKey = parsed.apiKey ?? '';
        }
      } catch {
        // ignore
      }
    };
    loadConfig();
    window.addEventListener('primebrick-api-config', ((e: CustomEvent) => {
      config.baseUrl = e.detail.baseUrl ?? config.baseUrl;
      config.apiKey = e.detail.apiKey ?? '';
    }) as EventListener);
    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) loadConfig();
    });
  });

  const specUrl = $derived(`${config.baseUrl}/api/v1/openapi/aggregated.json`);

  const postmanUrl = $derived(
    `https://elements.getpostman.com/view/import?apiSchemaUrl=${encodeURIComponent(specUrl)}`,
  );
  const insomniaUrl = $derived(`https://app.insomnia.rest/run?specUrl=${encodeURIComponent(specUrl)}`);
  const hoppscotchUrl = $derived(
    `https://hoppscotch.io/import?type=openapi&url=${encodeURIComponent(specUrl)}`,
  );
  const pawUrl = $derived(
    `paw://current.document/open?url=${encodeURIComponent(specUrl)}&importer=com.luckymarmot.PawExtensions.OpenAPI3Importer`,
  );

  async function copySpecUrl() {
    try {
      await navigator.clipboard.writeText(specUrl);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      // ignore
    }
  }
</script>

<div class="client-cta-bar">
  <div class="client-cta-inner">
    <span class="client-cta-label">Open API in:</span>
    <a href={postmanUrl} target="_blank" rel="noopener" class="client-cta-btn" title="Open in Postman">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      Postman
    </a>
    <a href={insomniaUrl} target="_blank" rel="noopener" class="client-cta-btn" title="Open in Insomnia">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 6v6l4 2"/></svg>
      Insomnia
    </a>
    <a href={hoppscotchUrl} target="_blank" rel="noopener" class="client-cta-btn" title="Open in Hoppscotch">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C8 2 5 5 5 9c0 3 2 5 4 6v3h6v-3c2-1 4-3 4-6 0-4-3-7-7-7z"/></svg>
      Hoppscotch
    </a>
    <a href={pawUrl} class="client-cta-btn" title="Open in Paw (RapidAPI for Mac)">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C8 2 5 5 5 9c0 3 2 5 4 6v3h6v-3c2-1 4-3 4-6 0-4-3-7-7-7z"/></svg>
      Paw
    </a>
    <button onclick={copySpecUrl} class="client-cta-btn client-cta-copy" title="Copy spec URL to clipboard">
      {#if copied}
        &#10003; Copied!
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        Copy Spec URL
      {/if}
    </button>
  </div>
</div>

<style>
  .client-cta-bar {
    border-bottom: 1px solid var(--scalar-border-color, #e5e7eb);
    background: var(--scalar-background-1, #f9fafb);
    padding: 0.5rem 1rem;
    transition: background 0.2s, border-color 0.2s;
  }

  :global([data-theme="dark"]) .client-cta-bar {
    border-bottom-color: var(--scalar-border-color, #1e293b);
    background: var(--scalar-background-1, #0f172a);
  }

  .client-cta-inner {
    max-width: 72rem;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .client-cta-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--scalar-color-2, #6b7280);
    margin-right: 0.25rem;
  }

  :global([data-theme="dark"]) .client-cta-label {
    color: var(--scalar-color-2, #94a3b8);
  }

  .client-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--scalar-color-1, #374151);
    background: var(--scalar-background-2, #fff);
    border: 1px solid var(--scalar-border-color, #e5e7eb);
    padding: 0.25rem 0.625rem;
    border-radius: 0.375rem;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .client-cta-btn:hover {
    border-color: var(--scalar-color-accent, #0ea5e9);
    color: var(--scalar-color-accent, #0ea5e9);
  }

  .client-cta-btn svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  :global([data-theme="dark"]) .client-cta-btn {
    background: var(--scalar-background-2, #1e293b);
    border-color: var(--scalar-border-color, #334155);
    color: var(--scalar-color-1, #d1d5db);
  }

  .client-cta-copy {
    border-style: dashed;
  }
</style>
