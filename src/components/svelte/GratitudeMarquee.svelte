<script lang="ts">
  /**
   * Infinite horizontal marquee of org / project names.
   * Pure CSS animation (translateX). Pauses on hover and on
   * prefers-reduced-motion. Hydrated with client:visible.
   */
  let { names, label }: { names: string[]; label: string } = $props();

  // Duplicate the list so the marquee can loop seamlessly.
  let loop = $derived([...names, ...names]);
  let reducedMotion = $state(false);

  $effect(() => {
    reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
</script>

<section class="relative z-10 overflow-hidden border-y border-slate-800/50 bg-slate-950/40 py-6">
  <p class="sr-only">{label}</p>
  <div
    class="thankyou-marquee flex w-max gap-8 whitespace-nowrap text-sm font-medium text-slate-400"
    class:marquee-static={reducedMotion}
    role="marquee"
    aria-label={label}
  >
    {#each loop as name}
      <span class="inline-flex items-center gap-2">
        <span class="h-1 w-1 rounded-full bg-sky-400/70"></span>
        <span class="hover:text-sky-400 transition-colors">{name}</span>
      </span>
    {/each}
  </div>
</section>

<style>
  .thankyou-marquee {
    animation: thankyou-marquee-scroll 40s linear infinite;
  }
  .thankyou-marquee:hover {
    animation-play-state: paused;
  }
  .marquee-static {
    animation: none;
  }
  @keyframes thankyou-marquee-scroll {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  @media (prefers-reduced-motion: reduce) {
    .thankyou-marquee {
      animation: none;
    }
  }
</style>
