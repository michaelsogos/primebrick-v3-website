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
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        it: { label: 'Italiano', lang: 'it' },
        de: { label: 'Deutsch', lang: 'de' },
        es: { label: 'Español', lang: 'es' },
        pt: { label: 'Português', lang: 'pt' },
        fr: { label: 'Français', lang: 'fr' },
      },
      social: [
        { label: 'GitHub', href: 'https://github.com/michaelsogos', icon: 'github' },
      ],
      components: {
        Header: './src/components/astro/StarlightHeader.astro',
        SiteTitle: './src/components/astro/StarlightSiteTitle.astro',
        SocialIcons: './src/components/astro/StarlightSocialIcons.astro',
        ThemeProvider: './src/components/astro/StarlightThemeProvider.astro',
      },
      sidebar: [
        {
          label: 'Getting Started',
          translations: {
            it: 'Inizia qui', de: 'Beginne hier', es: 'Comienza aquí',
            pt: 'Comece aqui', fr: 'Commencez ici',
          },
          items: [
            { slug: 'getting-started/introduction', translations: { it: 'Introduzione', de: 'Einführung', es: 'Introducción', pt: 'Introdução', fr: 'Introduction' } },
            { slug: 'getting-started/quick-start', translations: { it: 'Avvio rapido', de: 'Schnellstart', es: 'Inicio rápido', pt: 'Início rápido', fr: 'Démarrage rapide' } },
            { slug: 'getting-started/architecture', translations: { it: 'Architettura', de: 'Architektur', es: 'Arquitectura', pt: 'Arquitetura', fr: 'Architecture' } },
          ],
        },
        {
          label: 'API Reference',
          translations: {
            it: 'Riferimento API', de: 'API-Referenz', es: 'Referencia API',
            pt: 'Referência da API', fr: 'Référence API',
          },
          items: [
            { slug: 'api/introduction', translations: { it: 'Introduzione', de: 'Einführung', es: 'Introducción', pt: 'Introdução', fr: 'Introduction' } },
            { slug: 'api/authentication', translations: { it: 'Autenticazione', de: 'Authentifizierung', es: 'Autenticación', pt: 'Autenticação', fr: 'Authentification' } },
            { slug: 'api/authentication-how-to', translations: { it: 'Autenticazione - Guida', de: 'Authentifizierung - Anleitung', es: 'Autenticación - Guía', pt: 'Autenticação - Guia', fr: 'Authentification - Guide' } },
            { slug: 'api/rbac', translations: {} },
            { slug: 'api/microservice-standard', translations: { it: 'Standard microservizi', de: 'Mikroservice-Standard', es: 'Estándar de microservicios', pt: 'Padrão de microsserviços', fr: 'Standard microservices' } },
            { slug: 'api/error-handling', translations: { it: 'Gestione errori', de: 'Fehlerbehandlung', es: 'Manejo de errores', pt: 'Tratamento de erros', fr: 'Gestion des erreurs' } },
          ],
        },
        {
          label: 'Backend',
          translations: {
            it: 'Backend', de: 'Backend', es: 'Backend',
            pt: 'Backend', fr: 'Backend',
          },
          collapsed: true,
          items: [
            { autogenerate: { directory: 'backend/deepwiki' } },
            { autogenerate: { directory: 'backend/manual' } },
          ],
        },
        {
          label: 'Frontend',
          translations: {
            it: 'Frontend', de: 'Frontend', es: 'Frontend',
            pt: 'Frontend', fr: 'Frontend',
          },
          collapsed: true,
          items: [
            { autogenerate: { directory: 'frontend/deepwiki' } },
            { autogenerate: { directory: 'frontend/manual' } },
          ],
        },
        {
          label: 'Microservices',
          translations: {
            it: 'Microservizi', de: 'Mikroservices', es: 'Microservicios',
            pt: 'Microsserviços', fr: 'Microservices',
          },
          collapsed: true,
          items: [
            { autogenerate: { directory: 'microservices/deepwiki' } },
            { autogenerate: { directory: 'microservices/manual' } },
          ],
        },
        {
          label: 'DAL',
          collapsed: true,
          items: [
            { autogenerate: { directory: 'dal/deepwiki' } },
            { autogenerate: { directory: 'dal/manual' } },
          ],
        },
        {
          label: 'SDK',
          collapsed: true,
          items: [
            { autogenerate: { directory: 'sdk/deepwiki' } },
            { autogenerate: { directory: 'sdk/manual' } },
          ],
        },
      ],
      customCss: ['./src/styles/starlight-custom.css'],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
