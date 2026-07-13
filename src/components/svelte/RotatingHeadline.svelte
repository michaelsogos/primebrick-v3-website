<script lang="ts">
  let { prefix, phrases }: { prefix: string; phrases: string[] } = $props();

  let currentIndex = $state(0);
  let visible = $state(true);

  const gradientPalettes = [
    { from: '#38bdf8', to: '#818cf8' },  // sky-400 → indigo-400
    { from: '#22d3ee', to: '#a78bfa' },  // cyan-400 → violet-400
    { from: '#34d399', to: '#38bdf8' },  // emerald-400 → sky-400
    { from: '#fbbf24', to: '#fb7185' },  // amber-400 → rose-400
    { from: '#a78bfa', to: '#f472b6' },  // violet-400 → pink-400
    { from: '#38bdf8', to: '#34d399' },  // sky-400 → emerald-400
    { from: '#fb7185', to: '#a78bfa' },  // rose-400 → violet-400
    { from: '#22d3ee', to: '#38bdf8' },  // cyan-400 → sky-400
    { from: '#f472b6', to: '#fb923c' },  // pink-400 → orange-400
  ];

  let currentGradient = $derived(
    gradientPalettes[currentIndex % gradientPalettes.length]
  );

  $effect(() => {
    const interval = setInterval(() => {
      visible = false;
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % phrases.length;
        visible = true;
      }, 400);
    }, 7000);
    return () => clearInterval(interval);
  });
</script>

<span class="rotating-headline">
  <span class="prefix">{prefix}</span>
  <span
    class="phrase"
    class:visible
    style="background-image: linear-gradient(to right, {currentGradient.from}, {currentGradient.to});"
  >{phrases[currentIndex]}</span>
</span>

<noscript>
  <span class="prefix">{prefix}</span>
  <span class="phrase">{phrases[0]}</span>
</noscript>

<style>
  .rotating-headline {
    display: inline;
  }
  .prefix {
    display: block;
    background: linear-gradient(to bottom, #ffffff, #64748b);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .phrase {
    display: block;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    opacity: 0;
    transition: opacity 0.4s ease-in-out, background-image 0.6s ease-in-out;
  }
  .phrase.visible {
    opacity: 1;
  }
</style>
