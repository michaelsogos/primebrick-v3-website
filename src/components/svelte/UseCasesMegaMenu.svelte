<script lang="ts">
  import { translations, type LangCode } from '../../i18n/translations';

  let {
    currentLang = 'en',
    activePersona = null,
  }: {
    currentLang?: string;
    activePersona?: 'developer' | 'tech-leader' | 'solution-architect' | 'cto' | 'visionary-entrepreneur' | 'soc-team' | null;
  } = $props();

  let open = $state(false);

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }

  const langCode = $derived((currentLang as LangCode) ?? 'en');
  const isEn = $derived(langCode === 'en');
  const useCasesHref = $derived(isEn ? '/en/use-cases/' : `/${langCode}/use-cases/`);
  const t = $derived(translations[langCode] ?? translations.en);

  // 6 persona entries: key, href suffix, color, icon SVG inner content, tagline
  const personas = $derived([
    {
      key: 'developer',
      color: 'sky',
      icon: '<path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/>',
      tagline: 'Ship code, not ceremony.',
    },
    {
      key: 'tech-leader',
      color: 'indigo',
      icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',
      tagline: 'Conventions, not meetings.',
    },
    {
      key: 'solution-architect',
      color: 'violet',
      icon: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
      tagline: 'Architecture that survives.',
    },
    {
      key: 'cto',
      color: 'emerald',
      icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
      tagline: 'Speed without lock-in.',
    },
    {
      key: 'visionary-entrepreneur',
      color: 'amber',
      icon: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
      tagline: 'Turn ideas into infrastructure.',
    },
    {
      key: 'soc-team',
      color: 'rose',
      icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="12" r="3"/>',
      tagline: 'Evidence, not promises.',
    },
  ]);

  // Persona display names (same in all languages — they're role titles)
  const personaNames: Record<string, string> = {
    developer: 'Developer',
    'tech-leader': 'Tech Leader',
    'solution-architect': 'Solution Architect',
    cto: 'CTO',
    'visionary-entrepreneur': 'Visionary Entrepreneur',
    'soc-team': 'SOC Team',
  };

  function personaHref(key: string): string {
    return `${useCasesHref}${key}`;
  }

  // Color map: bg + text + border for each color
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    sky: { bg: 'rgba(14,165,233,0.2)', text: '#38bdf8', border: 'rgba(14,165,233,0.3)' },
    indigo: { bg: 'rgba(99,102,241,0.2)', text: '#818cf8', border: 'rgba(99,102,241,0.3)' },
    violet: { bg: 'rgba(139,92,246,0.2)', text: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
    emerald: { bg: 'rgba(16,185,129,0.2)', text: '#34d399', border: 'rgba(16,185,129,0.3)' },
    amber: { bg: 'rgba(245,158,11,0.2)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
    rose: { bg: 'rgba(244,63,94,0.2)', text: '#fb7185', border: 'rgba(244,63,94,0.3)' },
  };
</script>

<svelte:window onclick={close} />

<div class="uc-menu" role="presentation" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
  <button
    onclick={toggle}
    class="uc-trigger"
    class:uc-active={activePersona !== null}
    aria-expanded={open}
    aria-current={activePersona ? 'page' : undefined}
    aria-label={t.nav.useCases}
  >
    {t.nav.useCases}
    <svg class="uc-chevron" class:uc-chevron-open={open} viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M3 4.5L6 7.5L9 4.5" />
    </svg>
  </button>

  {#if open}
    <div class="uc-panel">
      <a href={useCasesHref} class="uc-all-link">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        All Use Cases
      </a>
      <div class="uc-grid">
        {#each personas as p}
          <a
            href={personaHref(p.key)}
            class="uc-card"
            class:uc-current={activePersona === p.key}
            style={activePersona === p.key ? `border-color:${colorMap[p.color].border};background:${colorMap[p.color].bg.replace('0.2','0.05')};` : ''}
          >
            <div class="uc-card-icon" style={`background:${colorMap[p.color].bg};color:${colorMap[p.color].text}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                {@html p.icon}
              </svg>
            </div>
            <div class="uc-card-body">
              <div class="uc-card-title">{personaNames[p.key]}</div>
              <div class="uc-card-desc">{p.tagline}</div>
            </div>
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .uc-menu {
    position: relative;
    display: inline-block;
  }

  .uc-trigger {
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

  .uc-trigger:hover {
    color: #38bdf8;
  }

  .uc-active {
    color: #38bdf8;
  }

  .uc-chevron {
    width: 0.75rem;
    height: 0.75rem;
    transition: transform 0.2s;
  }

  .uc-chevron-open {
    transform: rotate(180deg);
  }

  .uc-panel {
    position: absolute;
    right: 0;
    top: 100%;
    margin-top: 0.5rem;
    width: 560px;
    border-radius: 1rem;
    border: 1px solid rgba(51, 65, 85, 0.6);
    background: rgba(15, 23, 42, 0.96);
    padding: 1.25rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(16px);
    z-index: 100;
  }

  .uc-all-link {
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

  .uc-all-link:hover {
    color: #38bdf8;
  }

  .uc-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .uc-card {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(30, 41, 59, 0.5);
    background: rgba(30, 41, 59, 0.3);
    padding: 0.75rem;
    text-decoration: none;
    transition: all 0.2s;
  }

  .uc-card:hover {
    border-color: rgba(56, 189, 248, 0.3);
    background: rgba(30, 41, 59, 0.5);
  }

  .uc-current {
    border-width: 1px;
  }

  .uc-card-icon {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
  }

  .uc-card-icon svg {
    width: 1rem;
    height: 1rem;
  }

  .uc-card-body {
    flex: 1;
    min-width: 0;
  }

  .uc-card-title {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #ffffff;
    line-height: 1.3;
  }

  .uc-card-desc {
    margin-top: 0.25rem;
    font-size: 0.6875rem;
    color: #94a3b8;
    line-height: 1.4;
  }

  @media (max-width: 768px) {
    .uc-panel {
      width: calc(100vw - 3rem);
      right: 0;
    }
    .uc-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
