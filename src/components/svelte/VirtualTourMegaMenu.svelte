<script lang="ts">
  import { translations, LANGUAGES, type LangCode } from '../../i18n/translations';

  let {
    currentLang = 'en',
    activeDemo = null,
  }: { currentLang?: string; activeDemo?: 'hub' | 'shell' | 'entity-list-table' | 'exports' | null } = $props();

  let open = $state(false);

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }

  const langCode = $derived((currentLang as LangCode) ?? 'en');
  const isEn = $derived(langCode === 'en');
  const demoHref = $derived(isEn ? '/en/demo/' : `/${langCode}/demo/`);
  const shellHref = $derived(`${demoHref}shell`);
  const entityListTableHref = $derived(`${demoHref}entity-list-table`);
  const exportsHref = $derived(`${demoHref}exports`);
  const t = $derived(translations[langCode] ?? translations.en);

  // 9 demo entries: key, href (or null = coming soon), color, icon SVG inner content
  const demos = $derived([
    { key: 'shell', href: shellHref, color: 'sky', icon: '<path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M3 9h18"/><path d="M9 21V9"/>' },
    { key: 'entities', href: entityListTableHref, color: 'indigo', icon: '<path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>' },
    { key: 'exports', href: exportsHref, color: 'violet', icon: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>' },
    { key: 'aiChat', href: null, color: 'emerald', icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
    { key: 'security', href: null, color: 'amber', icon: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>' },
    { key: 'versions', href: null, color: 'rose', icon: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5M12 7v5l4 2"/>' },
    { key: 'modules', href: null, color: 'cyan', icon: '<path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/>' },
    { key: 'collab', href: null, color: 'fuchsia', icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>' },
    { key: 'agentic', href: null, color: 'orange', icon: '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>' },
  ]);

  // Color map: bg + text for each color
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    sky: { bg: 'rgba(14,165,233,0.2)', text: '#38bdf8', border: 'rgba(14,165,233,0.3)' },
    indigo: { bg: 'rgba(99,102,241,0.2)', text: '#818cf8', border: 'rgba(99,102,241,0.3)' },
    violet: { bg: 'rgba(139,92,246,0.2)', text: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
    emerald: { bg: 'rgba(16,185,129,0.2)', text: '#34d399', border: 'rgba(16,185,129,0.3)' },
    amber: { bg: 'rgba(245,158,11,0.2)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
    rose: { bg: 'rgba(244,63,94,0.2)', text: '#fb7185', border: 'rgba(244,63,94,0.3)' },
    cyan: { bg: 'rgba(6,182,212,0.2)', text: '#22d3ee', border: 'rgba(6,182,212,0.3)' },
    fuchsia: { bg: 'rgba(217,70,239,0.2)', text: '#e879f9', border: 'rgba(217,70,239,0.3)' },
    orange: { bg: 'rgba(249,115,22,0.2)', text: '#fb923c', border: 'rgba(249,115,22,0.3)' },
  };
</script>

<svelte:window onclick={close} />

<div class="vt-menu" role="presentation" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
  <button
    onclick={toggle}
    class="vt-trigger"
    class:vt-active={activeDemo}
    aria-expanded={open}
    aria-current={activeDemo ? 'page' : undefined}
    aria-label={t.nav.virtualTour}
  >
    {t.nav.virtualTour}
    <svg class="vt-chevron" class:vt-chevron-open={open} viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M3 4.5L6 7.5L9 4.5" />
    </svg>
  </button>

  {#if open}
    <div class="vt-panel">
      <a href={demoHref} class="vt-all-link">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        {t.demo.megaAllLink}
      </a>
      <div class="vt-grid">
        {#each demos as d}
          <a
            href={d.href ?? '#'}
            class="vt-card"
            class:vt-disabled={!d.href}
            aria-disabled={!d.href}
            onclick={(e) => {
              if (!d.href) e.preventDefault();
            }}
          >
            <div class="vt-card-icon" style={`background:${colorMap[d.color].bg};color:${colorMap[d.color].text}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                {@html d.icon}
              </svg>
            </div>
            <div class="vt-card-body">
              <div class="vt-card-title">{t.demo.card[d.key].title}</div>
              <div class="vt-card-desc">{t.demo.card[d.key].megaDesc}</div>
            </div>
            {#if !d.href}
              <span class="vt-coming">{t.demo.comingSoon}</span>
            {/if}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .vt-menu {
    position: relative;
    display: inline-block;
  }

  .vt-trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: #cbd5e1;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    transition: color 0.2s;
  }

  .vt-trigger:hover {
    color: #38bdf8;
  }

  .vt-active {
    color: #38bdf8;
  }

  .vt-chevron {
    width: 0.75rem;
    height: 0.75rem;
    transition: transform 0.2s;
  }

  .vt-chevron-open {
    transform: rotate(180deg);
  }

  .vt-panel {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 100%;
    margin-top: 0.5rem;
    width: 680px;
    border-radius: 1rem;
    border: 1px solid rgba(51, 65, 85, 0.6);
    background: rgba(15, 23, 42, 0.96);
    padding: 1.25rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(16px);
    z-index: 100;
  }

  .vt-all-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: #94a3b8;
    text-decoration: none;
    transition: color 0.2s;
  }

  .vt-all-link:hover {
    color: #38bdf8;
  }

  .vt-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .vt-card {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(30, 41, 59, 0.5);
    background: rgba(30, 41, 59, 0.3);
    padding: 0.75rem;
    text-decoration: none;
    transition: all 0.2s;
    position: relative;
  }

  .vt-card:hover {
    border-color: rgba(56, 189, 248, 0.3);
    background: rgba(30, 41, 59, 0.5);
  }

  .vt-disabled {
    cursor: not-allowed;
  }

  .vt-disabled .vt-card-icon,
  .vt-disabled .vt-card-title,
  .vt-disabled .vt-card-desc {
    opacity: 0.5;
  }

  .vt-disabled:hover {
    border-color: rgba(30, 41, 59, 0.5);
    background: rgba(30, 41, 59, 0.3);
  }

  .vt-disabled:hover .vt-card-icon,
  .vt-disabled:hover .vt-card-title,
  .vt-disabled:hover .vt-card-desc {
    opacity: 0.65;
  }

  .vt-card-icon {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
  }

  .vt-card-icon svg {
    width: 1rem;
    height: 1rem;
  }

  .vt-card-body {
    flex: 1;
    min-width: 0;
  }

  .vt-card-title {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #ffffff;
    line-height: 1.3;
  }

  .vt-card-desc {
    margin-top: 0.25rem;
    font-size: 0.6875rem;
    color: #94a3b8;
    line-height: 1.4;
  }

  .vt-coming {
    position: absolute;
    bottom: -0.625rem;
    right: 0.75rem;
    font-size: 0.5625rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: #fbbf24;
    background: rgba(15, 23, 42, 0.96);
    border: 1px solid rgba(251, 191, 36, 0.3);
    padding: 2px 6px;
    border-radius: 4px;
    line-height: 1.2;
  }

  @media (max-width: 768px) {
    .vt-panel {
      width: calc(100vw - 3rem);
      left: 0;
      transform: none;
    }
    .vt-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
