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
  &nbsp;
  <span class="phrase" class:visible>{phrases[currentIndex]}</span>
</span>

<noscript>
  <span>{prefix} {phrases[0]}</span>
</noscript>

<style>
  .rotating-headline {
    display: inline;
  }
  .prefix {
    display: inline;
  }
  .phrase {
    display: inline;
    opacity: 0;
    transition: opacity 0.4s ease-in-out;
  }
  .phrase.visible {
    opacity: 1;
  }
</style>
