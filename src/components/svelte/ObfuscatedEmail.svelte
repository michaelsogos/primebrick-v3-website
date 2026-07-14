<script lang="ts">
  // Anti-scraper email link. The email address is NEVER present in the
  // HTML source as plain text — not in the href, not in the visible text,
  // not in any attribute. It's base64-encoded and only decoded on user
  // interaction (click/focus/hover). Bots that scrape raw HTML see only
  // "Click to reveal email".

  interface Props {
    encoded: string; // base64-encoded email
  }

  let { encoded }: Props = $props();

  let href = $state('#');
  let display = $state('Click to reveal email');

  function reveal() {
    const decoded = atob(encoded);
    href = `mailto:${decoded}`;
    display = decoded;
  }
</script>

<a
  href={href}
  onclick={reveal}
  onfocus={reveal}
  onmouseenter={reveal}
  class="text-sky-400 hover:text-sky-300 transition-colors"
  rel="nofollow"
>{display}</a>
