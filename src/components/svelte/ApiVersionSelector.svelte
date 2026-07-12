<script lang="ts">
  const STORAGE_KEY = 'primebrick-api-version';

  interface ApiVersion {
    id: string;
    label: string;
    isLatest: boolean;
  }

  const versions: ApiVersion[] = [
    { id: 'v1', label: 'v1', isLatest: true },
  ];

  let selectedVersion = $state('v1');
  let open = $state(false);

  $effect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && versions.find(v => v.id === stored)) {
        selectedVersion = stored;
      }
    } catch {
      // ignore
    }
  });

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }

  function select(versionId: string) {
    selectedVersion = versionId;
    open = false;
    try {
      localStorage.setItem(STORAGE_KEY, versionId);
    } catch {
      // ignore
    }
    window.dispatchEvent(
      new CustomEvent('primebrick-api-version', { detail: { version: versionId } })
    );
  }

  function getSpecUrl(baseUrl: string, versionId: string) {
    return `${baseUrl}/api/${versionId}/openapi/aggregated.json`;
  }
</script>

<svelte:window onclick={close} />

<div class="version-selector" onclick={(e) => e.stopPropagation()}>
  <button class="version-btn" onclick={toggle} aria-expanded={open} aria-label="API version selector">
    <span class="version-label">API</span>
    <span class="version-current">{selectedVersion}</span>
    {#if versions.find(v => v.id === selectedVersion)?.isLatest}
      <span class="version-latest-badge">Latest</span>
    {/if}
    <svg class="version-chevron" class:open={open} viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M3 4.5L6 7.5L9 4.5" />
    </svg>
  </button>

  {#if open}
    <div class="version-menu">
      {#each versions as ver}
        <button
          onclick={() => select(ver.id)}
          class="version-item"
          class:active={ver.id === selectedVersion}
        >
          <span>{ver.label}</span>
          {#if ver.isLatest}
            <span class="version-item-latest">Latest</span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .version-selector {
    position: relative;
    display: inline-block;
  }

  .version-btn {
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
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .version-btn:hover {
    border-color: var(--scalar-color-accent, #0ea5e9);
    color: var(--scalar-color-accent, #0ea5e9);
  }

  :global([data-theme="dark"]) .version-btn {
    background: var(--scalar-background-2, #1e293b);
    border-color: var(--scalar-border-color, #334155);
    color: var(--scalar-color-1, #d1d5db);
  }

  .version-label {
    color: var(--scalar-color-2, #6b7280);
    font-weight: 600;
  }

  .version-current {
    font-weight: 700;
  }

  .version-latest-badge {
    font-size: 0.625rem;
    font-weight: 700;
    color: #22c55e;
    background: rgba(34, 197, 94, 0.15);
    padding: 0.0625rem 0.3125rem;
    border-radius: 0.25rem;
  }

  .version-chevron {
    width: 0.75rem;
    height: 0.75rem;
    transition: transform 0.2s;
  }

  .version-chevron.open {
    transform: rotate(180deg);
  }

  .version-menu {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.25rem;
    min-width: 8rem;
    border-radius: 0.375rem;
    border: 1px solid var(--scalar-border-color, #e5e7eb);
    background: var(--scalar-background-1, #ffffff);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 0.25rem;
    z-index: 100;
    opacity: 1;
  }

  :global([data-theme="dark"]) .version-menu {
    border-color: var(--scalar-border-color, #334155);
    background: var(--scalar-background-1, #0f172a);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .version-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
    font-size: 0.75rem;
    color: var(--scalar-color-1, #374151);
    background: none;
    border: none;
    padding: 0.375rem 0.5rem;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background 0.15s;
  }

  .version-item:hover {
    background: var(--scalar-background-2, #f3f4f6);
  }

  .version-item.active {
    color: var(--scalar-color-accent, #0ea5e9);
    font-weight: 600;
  }

  :global([data-theme="dark"]) .version-item {
    color: var(--scalar-color-1, #d1d5db);
  }

  :global([data-theme="dark"]) .version-item:hover {
    background: var(--scalar-background-2, #1e293b);
  }

  .version-item-latest {
    font-size: 0.625rem;
    font-weight: 700;
    color: #22c55e;
    background: rgba(34, 197, 94, 0.15);
    padding: 0.0625rem 0.3125rem;
    border-radius: 0.25rem;
  }
</style>
