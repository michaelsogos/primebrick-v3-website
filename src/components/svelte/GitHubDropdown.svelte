<script lang="ts">
  interface Repo {
    label: string;
    href: string;
    isOrg?: boolean;
  }

  const repos: Repo[] = [
    { label: 'Primebrick Organization', href: 'https://github.com/michaelsogos', isOrg: true },
    { label: 'Backend', href: 'https://github.com/michaelsogos/primebrick-v3-backend' },
    { label: 'Frontend', href: 'https://github.com/michaelsogos/primebrick-v3-frontend' },
    { label: 'Microservices', href: 'https://github.com/michaelsogos/primebrick-v3-microservices' },
    { label: 'DAL', href: 'https://github.com/michaelsogos/primebrick-v3-dal' },
    { label: 'SDK', href: 'https://github.com/michaelsogos/primebrick-v3-sdk' },
    { label: 'Website', href: 'https://github.com/michaelsogos/primebrick-v3-website' },
  ];

  let open = $state(false);

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }
</script>

<svelte:window onclick={close} />

<div class="gh-dropdown" onclick={(e) => e.stopPropagation()}>
  <button class="gh-dropdown-btn" onclick={toggle} aria-expanded={open} aria-label="GitHub repositories">
    <svg class="gh-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
    <span>GitHub</span>
    <svg class="gh-chevron" class:gh-chevron-open={open} viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M3 4.5L6 7.5L9 4.5" />
    </svg>
  </button>

  {#if open}
    <div class="gh-dropdown-menu">
      {#each repos as repo}
        <a href={repo.href} target="_blank" rel="noopener" class="gh-dropdown-item">
          {#if repo.isOrg}
            <svg class="gh-item-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          {:else}
            <svg class="gh-item-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
            </svg>
          {/if}
          {repo.label}
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .gh-dropdown {
    position: relative;
    display: inline-block;
  }

  .gh-dropdown-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--gh-text, #d1d5db);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    transition: color 0.2s;
  }

  .gh-dropdown-btn:hover {
    color: var(--gh-accent, #38bdf8);
  }

  .gh-icon {
    width: 1rem;
    height: 1rem;
  }

  .gh-chevron {
    width: 0.75rem;
    height: 0.75rem;
    transition: transform 0.2s;
  }

  .gh-chevron-open {
    transform: rotate(180deg);
  }

  .gh-dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    min-width: 14rem;
    border-radius: 0.5rem;
    border: 1px solid var(--gh-border, #334155);
    background: #0f172a;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    padding: 0.375rem;
    z-index: 100;
  }

  .gh-dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.625rem;
    font-size: 0.8125rem;
    color: var(--gh-text, #d1d5db);
    text-decoration: none;
    border-radius: 0.375rem;
    transition: background 0.15s, color 0.15s;
  }

  .gh-dropdown-item:hover {
    background: var(--gh-hover, #1e293b);
    color: var(--gh-accent, #38bdf8);
  }

  .gh-item-icon {
    width: 0.875rem;
    height: 0.875rem;
    opacity: 0.7;
    flex-shrink: 0;
  }

  /* Light mode — for API explorer / docs context */
  :global([data-theme="light"]) .gh-dropdown-btn {
    color: var(--gh-text-light, #374151);
  }

  :global([data-theme="light"]) .gh-dropdown-btn:hover {
    color: var(--gh-accent-light, #0ea5e9);
  }

  :global([data-theme="light"]) .gh-dropdown-menu {
    border-color: var(--gh-border-light, #e5e7eb);
    background: #ffffff;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  :global([data-theme="light"]) .gh-dropdown-item {
    color: var(--gh-text-light, #374151);
  }

  :global([data-theme="light"]) .gh-dropdown-item:hover {
    background: var(--gh-hover-light, #f3f4f6);
    color: var(--gh-accent-light, #0ea5e9);
  }
</style>
