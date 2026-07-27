<script lang="ts">
  /**
   * ThankYouScroll — drives the scroll-driven "Thank You" experience.
   *
   * Features (all respect prefers-reduced-motion):
   *  - Left progress rail that fills with scroll position.
   *  - Parallax ambient gradient blobs (different scroll speeds).
   *  - Reveal-on-scroll for credit cards via IntersectionObserver
   *    (client-side Web API; falls back to "always visible").
   *  - Staggered card entrance via CSS transition-delay.
   *
   * Uses the same scroll-listener pattern as SchemaToProduction.svelte.
   * No new dependencies. Svelte 5 runes.
   */
  import type { CreditSection } from '../../data/credits';

  let {
    sections,
    labels,
  }: {
    sections: CreditSection[];
    labels: Record<string, string>;
  } = $props();

  let progress = $state(0);
  let blobY1 = $state(0);
  let blobY2 = $state(0);
  let blobY3 = $state(0);
  let reducedMotion = $state(false);

  $effect(() => {
    reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onScroll = () => {
      const doc = document.documentElement;
      const h = doc.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      progress = p;
      // Parallax: each blob drifts at a different rate.
      blobY1 = window.scrollY * 0.15;
      blobY2 = window.scrollY * -0.1;
      blobY3 = window.scrollY * 0.08;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  });

  // Reveal-on-scroll via IntersectionObserver. Runs once on mount.
  $effect(() => {
    if (reducedMotion) {
      // No animation: mark everything shown immediately.
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        (el as HTMLElement).dataset.shown = 'true';
      });
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.shown = 'true';
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    const els = document.querySelectorAll('[data-reveal]');
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });

  // Build a flat list of section title keys for an aria-labelled landmark.
  let sectionCount = $derived(sections.length);
</script>

<!-- Parallax ambient gradient background (sits behind content) -->
<div class="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
  <div
    class="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-[120px] transition-transform duration-75"
    style={`transform:translate(-50%, ${blobY1}px)`}
  ></div>
  <div
    class="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[100px] transition-transform duration-75"
    style={`transform:translate(0, ${blobY2}px)`}
  ></div>
  <div
    class="absolute bottom-0 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px] transition-transform duration-75"
    style={`transform:translate(0, ${blobY3}px)`}
  ></div>
</div>

<!-- Left progress rail -->
<div
  class="fixed left-0 top-0 z-40 h-screen w-1 bg-slate-800/40"
  aria-hidden="true"
>
  <div
    class="bg-gradient-to-b from-sky-400 via-indigo-400 to-cyan-400"
    style={`height:${progress * 100}%`}
  ></div>
</div>

<!-- Credit sections -->
{#each sections as section, si}
  <section
    class="relative z-10 px-6 py-20"
    id={section.id}
    aria-label={labels[section.titleKey] ?? section.titleKey}
  >
    <div class="mx-auto max-w-6xl">
      <div class="mb-10 flex items-center gap-4" data-reveal>
        <span
          class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/50 text-sm font-bold text-sky-400 backdrop-blur-sm"
        >
          {String(si + 1).padStart(2, '0')}
        </span>
        <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          <span class="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            {labels[section.titleKey] ?? section.titleKey}
          </span>
        </h2>
      </div>

      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {#each section.items as item, ii}
          <a
            href={item.url}
            target="_blank"
            rel="noopener"
            data-reveal
            class="group flex flex-col rounded-2xl border border-slate-800/50 bg-slate-900/30 p-6 backdrop-blur-sm transition-all duration-700 hover:-translate-y-1 hover:border-sky-500/40 hover:bg-slate-900/60 data-[shown=true]:translate-y-0 data-[shown=true]:opacity-100 data-[shown=false]:translate-y-6 data-[shown=false]:opacity-0"
            style={`transition-delay:${Math.min(ii, 8) * 60}ms`}
          >
            <!-- Logo + external-link icon -->
            <div class="mb-4 flex items-start justify-between">
              {#if item.icon}
                <span
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-700/50 overflow-hidden transition-transform group-hover:scale-110 {item.icon.bgFill || item.icon.paths || item.icon.imgPath ? '' : 'bg-slate-950/60'}"
                  style={`color:#${item.icon.hex}`}
                  aria-hidden="true"
                >
                  {#if item.icon.imgPath}
                    <img
                      src={item.icon.imgPath}
                      alt=""
                      class="h-12 w-12 object-contain"
                      loading="lazy"
                    />
                  {:else}
                    <svg
                      class={item.icon.bgFill || item.icon.paths ? 'h-12 w-12' : 'h-7 w-7'}
                      viewBox={item.icon.viewBox ?? '0 0 24 24'}
                      fill="currentColor"
                      role="img"
                    >
                      {#if item.icon.bgFill}
                        <rect width="100%" height="100%" rx="4" fill={`#${item.icon.bgFill}`} />
                      {/if}
                      {#if item.icon.paths}
                        {#each item.icon.paths as p}
                          <path
                            d={p.d}
                            fill={p.fillNone ? 'none' : `#${p.fill}`}
                            stroke={p.stroke ? `#${p.stroke}` : undefined}
                            stroke-width={p.strokeWidth ?? undefined}
                          />
                        {/each}
                      {:else}
                        <path d={item.icon.path} />
                      {/if}
                    </svg>
                  {/if}
                </span>
              {:else}
                <span
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-700/50 bg-gradient-to-br from-sky-900/40 to-indigo-900/40 text-sm font-bold text-sky-300 transition-transform group-hover:scale-110"
                  aria-hidden="true"
                >
                  {item.project.slice(0, 2).toUpperCase()}
                </span>
              {/if}
              <svg
                class="h-4 w-4 shrink-0 text-slate-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-sky-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </div>

            <!-- "We thank" — the storytelling line -->
            <p class="mb-1 text-xs font-medium uppercase tracking-wide text-sky-400/80">
              {labels.weThank ?? 'We thank'}
            </p>
            <p class="mb-1 font-semibold leading-snug text-slate-100 group-hover:text-sky-400 transition-colors">
              {item.author}
            </p>
            <p class="mb-3 text-xs text-slate-500">
              {item.handle}
            </p>

            <!-- Project name + version -->
            <p class="mb-2 text-sm font-bold text-slate-300">
              {item.project}
              <span class="ml-1.5 rounded bg-slate-800/80 px-1.5 py-0.5 text-xs font-mono text-sky-400/90">{item.version}</span>
            </p>

            <!-- Usage — what it's used for in Primebrick -->
            <p class="mt-auto text-sm leading-relaxed text-slate-400">
              <span class="text-sky-400" aria-hidden="true">&rarr;</span>
              {#if item.usageLink && item.usageLinkText && item.usage.includes(item.usageLinkText)}
                {@const parts = item.usage.split(item.usageLinkText)}
                {parts[0]}<a
                  href={item.usageLink}
                  target="_blank"
                  rel="noopener"
                  class="font-medium text-sky-400 underline decoration-sky-400/40 underline-offset-2 transition-colors hover:text-sky-300 hover:decoration-sky-300"
                  onclick={(e) => e.stopPropagation()}
                >{item.usageLinkText}</a>{parts[1]}
              {:else}
                {item.usage}
              {/if}
            </p>
          </a>
        {/each}
      </div>
    </div>
  </section>
{/each}

<!-- Screen-reader summary of how many sections were credited -->
<p class="sr-only">
  {sectionCount} credit sections on this page.
</p>
