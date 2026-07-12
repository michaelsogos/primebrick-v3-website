import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import starlight from '@astrojs/starlight';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://primebrick.dev',
  output: 'static',
  adapter: cloudflare({
    imageService: 'compile',
    platformProxy: { enabled: true },
  }),
  integrations: [
    svelte(),
    starlight({
      title: 'Primebrick',
      logo: { src: './src/assets/logo.svg' },
      social: [
        { label: 'GitHub', href: 'https://github.com/michaelsogos/primebrick-v3-website', icon: 'github' },
      ],
      sidebar: [
        { label: 'Getting Started', items: [] },
        { label: 'Backend', items: [] },
        { label: 'Frontend', items: [] },
        { label: 'Microservices', items: [] },
        { label: 'DAL', items: [] },
        { label: 'SDK', items: [] },
        { label: 'API Reference', items: [] },
      ],
      customCss: ['./src/styles/starlight-custom.css'],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
