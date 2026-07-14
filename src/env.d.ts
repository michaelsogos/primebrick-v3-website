/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_TURNSTILE_SITEKEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
