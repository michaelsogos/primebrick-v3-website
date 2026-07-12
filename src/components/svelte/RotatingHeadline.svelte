<script lang="ts">
  let { prefix, phrases }: { prefix: string; phrases: string[] } = $props();

  let currentIndex = $state(0);
  let visible = $state(true);

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
  <span class="phrase" class:visible>{phrases[currentIndex]}</span>
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
    background: linear-gradient(to bottom, #ffffff, #94a3b8);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .phrase {
    display: block;
    background: linear-gradient(to right, #38bdf8, #22d3ee);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    opacity: 0;
    transition: opacity 0.4s ease-in-out;
  }
  .phrase.visible {
    opacity: 1;
  }
</style>
