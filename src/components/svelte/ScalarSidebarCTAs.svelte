<script lang="ts">
  const STORAGE_KEY = 'primebrick-api-explorer-config';

  interface Config {
    baseUrl: string;
    apiKey: string;
  }

  let config = $state<Config>({ baseUrl: 'http://localhost:3001', apiKey: '' });
  let copied = $state(false);
  let injected = $state(false);

  // Load config from localStorage
  function loadConfig() {
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
  }

  // Listen for config changes
  function handleConfigChange(e: CustomEvent) {
    config.baseUrl = e.detail.baseUrl ?? config.baseUrl;
    config.apiKey = e.detail.apiKey ?? '';
  }

  // Listen for version changes
  function handleVersionChange(e: CustomEvent) {
    // Version changed — spec URL will be recomputed
  }

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

  function injectIntoSidebar() {
    if (injected) return;

    // Try to find Scalar's sidebar — look for various possible selectors
    const sidebar = document.querySelector('.t-doc__sidebar') as HTMLElement | null;
    if (!sidebar) return;

    // Check if already injected
    if (sidebar.querySelector('.pb-sidebar-ctas')) {
      injected = true;
      return;
    }

    // Create the injection container
    const container = document.createElement('div');
    container.className = 'pb-sidebar-ctas';
    container.innerHTML = `
      <div class="pb-sidebar-ctas-label">Open API in:</div>
      <div class="pb-sidebar-ctas-buttons">
        <a href="${postmanUrl}" target="_blank" rel="noopener" class="pb-sidebar-cta-btn" title="Open in Postman">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          Postman
        </a>
        <a href="${insomniaUrl}" target="_blank" rel="noopener" class="pb-sidebar-cta-btn" title="Open in Insomnia">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Insomnia
        </a>
        <a href="${hoppscotchUrl}" target="_blank" rel="noopener" class="pb-sidebar-cta-btn" title="Open in Hoppscotch">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C8 2 5 5 5 9c0 3 2 5 4 6v3h6v-3c2-1 4-3 4-6 0-4-3-7-7-7z"/></svg>
          Hoppscotch
        </a>
        <a href="${pawUrl}" class="pb-sidebar-cta-btn" title="Open in Paw (RapidAPI for Mac)">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C8 2 5 5 5 9c0 3 2 5 4 6v3h6v-3c2-1 4-3 4-6 0-4-3-7-7-7z"/></svg>
          Paw
        </a>
        <button class="pb-sidebar-cta-btn pb-sidebar-cta-copy" title="Copy spec URL">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          Copy Spec URL
        </button>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .t-doc__sidebar {
        display: flex !important;
        flex-direction: column !important;
        height: 100dvh !important;
        max-height: 100dvh !important;
        position: sticky !important;
        top: 0 !important;
        overflow: hidden !important;
      }
      .t-doc__sidebar > *:not(.pb-sidebar-ctas):not(.pb-sidebar-auth):not(style) {
        flex: 1 1 auto;
        overflow-y: auto;
        min-height: 0;
      }
      .pb-sidebar-ctas {
        flex-shrink: 0 !important;
        position: sticky !important;
        bottom: 0 !important;
        background: var(--scalar-background-1, #0f0f0f) !important;
        z-index: 10 !important;
      }
      .pb-sidebar-ctas {
        padding: 0.75rem;
        border-top: 1px solid var(--scalar-border-color, #e5e7eb);
        margin-top: auto;
      }
      .pb-sidebar-ctas-label {
        font-size: 0.6875rem;
        font-weight: 600;
        color: var(--scalar-color-2, #6b7280);
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .pb-sidebar-ctas-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .pb-sidebar-cta-btn {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--scalar-color-1, #374151);
        background: var(--scalar-background-2, #fff);
        border: 1px solid var(--scalar-border-color, #e5e7eb);
        padding: 0.375rem 0.5rem;
        border-radius: 0.375rem;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.15s;
        white-space: nowrap;
      }
      .pb-sidebar-cta-btn:hover {
        border-color: var(--scalar-color-accent, #0ea5e9);
        color: var(--scalar-color-accent, #0ea5e9);
      }
      .pb-sidebar-cta-copy {
        border-style: dashed;
      }
    `;

    // Append the container to the sidebar
    sidebar.appendChild(style);
    sidebar.appendChild(container);

    // Wire up the copy button
    const copyBtn = container.querySelector('.pb-sidebar-cta-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await navigator.clipboard.writeText(specUrl);
          copyBtn.textContent = '✓ Copied!';
          setTimeout(() => {
            copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy Spec URL';
          }, 2000);
        } catch {
          // ignore
        }
      });
    }

    injected = true;
  }

  function updateInjectedLinks() {
    if (!injected) return;
    const container = document.querySelector('.pb-sidebar-ctas');
    if (!container) return;
    const postmanLink = container.querySelector('a[title="Open in Postman"]') as HTMLAnchorElement;
    const insomniaLink = container.querySelector('a[title="Open in Insomnia"]') as HTMLAnchorElement;
    const hoppscotchLink = container.querySelector('a[title="Open in Hoppscotch"]') as HTMLAnchorElement;
    const pawLink = container.querySelector('a[title="Open in Paw (RapidAPI for Mac)"]') as HTMLAnchorElement;
    if (postmanLink) postmanLink.href = postmanUrl;
    if (insomniaLink) insomniaLink.href = insomniaUrl;
    if (hoppscotchLink) hoppscotchLink.href = hoppscotchUrl;
    if (pawLink) pawLink.href = pawUrl;
  }

  $effect(() => {
    loadConfig();
    window.addEventListener('primebrick-api-config', handleConfigChange as EventListener);
    window.addEventListener('primebrick-api-version', handleVersionChange as EventListener);
    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) loadConfig();
    });

    // MutationObserver to detect when Scalar's sidebar appears
    const observer = new MutationObserver(() => {
      injectIntoSidebar();
      if (injected) observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Also try periodically for 10 seconds
    let attempts = 0;
    const interval = setInterval(() => {
      if (injected || attempts > 20) {
        clearInterval(interval);
        return;
      }
      injectIntoSidebar();
      attempts++;
    }, 500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
      window.removeEventListener('primebrick-api-config', handleConfigChange as EventListener);
      window.removeEventListener('primebrick-api-version', handleVersionChange as EventListener);
    };
  });

  // Update links when config changes
  $effect(() => {
    specUrl;
    updateInjectedLinks();
  });
</script>

<!-- This component has no visible DOM — it injects into Scalar's sidebar -->
