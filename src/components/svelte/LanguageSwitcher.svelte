<script lang="ts">
  import { LANGUAGES } from '../../i18n/translations';

  let { currentLang = 'en' }: { currentLang?: string } = $props();

  let open = $state(false);

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }

  function getCurrentLabel() {
    return LANGUAGES.find((l) => l.code === currentLang)?.label ?? 'English';
  }

  function getLangPath(code: string) {
    if (code === 'en') return '/';
    return `/${code}/`;
  }
</script>

<svelte:window onclick={close} />

<div class="relative" onclick={(e) => e.stopPropagation()}>
  <button
    onclick={toggle}
    class="flex items-center gap-1.5 text-sm text-slate-300 hover:text-sky-400 transition-colors"
    aria-label="Select language"
  >
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
    <span>{getCurrentLabel()}</span>
    <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 9l6 6 6-6" />
    </svg>
  </button>

  {#if open}
    <div
      class="absolute right-0 mt-2 w-40 rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-lg z-50"
    >
      {#each LANGUAGES as lang}
        <a
          href={getLangPath(lang.code)}
          onclick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = getLangPath(lang.code);
          }}
          class="block px-4 py-2 text-sm transition-colors {currentLang === lang.code
            ? 'text-sky-400 bg-slate-800'
            : 'text-slate-300 hover:text-sky-400 hover:bg-slate-800'}"
        >
          {lang.label}
        </a>
      {/each}
    </div>
  {/if}
</div>
