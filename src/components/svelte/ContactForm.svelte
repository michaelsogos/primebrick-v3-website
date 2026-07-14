<script lang="ts">
  // Contact form island — client-hydrated via client:load.
  // Renders Cloudflare Turnstile widget, validates client-side, POSTs to
  // /api/contact. The sitekey is a PUBLIC build-time env (no secret here).
  // The two secrets (Turnstile secret + Brevo key) live only in the Worker.

  interface Props {
    sitekey: string;
    labels: {
      name: string;
      namePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      message: string;
      messagePlaceholder: string;
      submit: string;
      sending: string;
      success: string;
      error: string;
      required: string;
      invalidEmail: string;
      messageTooShort: string;
      turnstileExpired: string;
      turnstileNotSolved: string;
    };
  }

  let { sitekey, labels }: Props = $props();

  let name = $state('');
  let email = $state('');
  let message = $state('');
  let turnstileToken = $state<string | null>(null);
  let turnstileWidgetId: string | null = null;

  let status = $state<'idle' | 'sending' | 'success' | 'error'>('idle');
  let errorMsg = $state('');
  let fieldErrors = $state<Record<string, string>>({});

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = labels.required;
    if (!email.trim()) errs.email = labels.required;
    else if (!emailRe.test(email.trim())) errs.email = labels.invalidEmail;
    if (!message.trim()) errs.message = labels.required;
    else if (message.trim().length < 10) errs.message = labels.messageTooShort;
    fieldErrors = errs;
    return Object.keys(errs).length === 0;
  }

  // Cloudflare Turnstile: explicit render so we control the widget lifecycle.
  // The Turnstile script is loaded once via a <script> tag in the template.
  function renderTurnstile() {
    const w = (window as any).turnstile;
    if (!w) return;
    const container = document.getElementById('cf-turnstile');
    if (!container || turnstileWidgetId) return;
    turnstileWidgetId = w.render(container, {
      sitekey,
      callback: (token: string) => { turnstileToken = token; },
      'expired-callback': () => { turnstileToken = null; },
      'error-callback': () => { turnstileToken = null; },
      theme: 'dark',
    });
  }

  // Load the Turnstile API script once, then render the widget.
  $effect(() => {
    let cancelled = false;
    const existing = document.querySelector('script[data-cf-turnstile]');

    function tryRender() {
      if (cancelled) return;
      if ((window as any).turnstile) {
        renderTurnstile();
      } else {
        setTimeout(tryRender, 150);
      }
    }

    if (existing || (window as any).turnstile) {
      tryRender();
    } else {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.defer = true;
      s.setAttribute('data-cf-turnstile', '');
      s.onload = () => tryRender();
      document.head.appendChild(s);
    }

    return () => { cancelled = true; };
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    status = 'idle';
    errorMsg = '';

    if (!validate()) return;
    if (!turnstileToken) {
      errorMsg = labels.turnstileNotSolved;
      status = 'error';
      return;
    }

    status = 'sending';
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          turnstileToken,
        }),
      });
      if (res.ok) {
        status = 'success';
        name = ''; email = ''; message = '';
        turnstileToken = null;
        if (turnstileWidgetId && (window as any).turnstile) {
          (window as any).turnstile.reset(turnstileWidgetId);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        errorMsg = data?.error || labels.error;
        status = 'error';
        // Turnstile token is single-use; reset for next attempt.
        if (turnstileWidgetId && (window as any).turnstile) {
          (window as any).turnstile.reset(turnstileWidgetId);
          turnstileToken = null;
        }
      }
    } catch {
      errorMsg = labels.error;
      status = 'error';
    }
  }
</script>

{#if status === 'success'}
  <div class="rounded-2xl border border-green-500/40 bg-green-500/10 p-8 text-center">
    <svg class="mx-auto mb-4 h-10 w-10 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
    </svg>
    <p class="text-lg font-medium text-green-300">{labels.success}</p>
  </div>
{:else}
  <form onsubmit={handleSubmit} class="space-y-5" novalidate>
    <!-- Name -->
    <div>
      <label for="cf-name" class="mb-1.5 block text-sm font-medium text-slate-300">{labels.name}</label>
      <input
        id="cf-name"
        type="text"
        bind:value={name}
        placeholder={labels.namePlaceholder}
        class="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder-slate-500 transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        autocomplete="name"
      />
      {#if fieldErrors.name}<p class="mt-1 text-xs text-red-400">{fieldErrors.name}</p>{/if}
    </div>

    <!-- Email -->
    <div>
      <label for="cf-email" class="mb-1.5 block text-sm font-medium text-slate-300">{labels.email}</label>
      <input
        id="cf-email"
        type="email"
        bind:value={email}
        placeholder={labels.emailPlaceholder}
        class="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder-slate-500 transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        autocomplete="email"
      />
      {#if fieldErrors.email}<p class="mt-1 text-xs text-red-400">{fieldErrors.email}</p>{/if}
    </div>

    <!-- Message -->
    <div>
      <label for="cf-message" class="mb-1.5 block text-sm font-medium text-slate-300">{labels.message}</label>
      <textarea
        id="cf-message"
        bind:value={message}
        placeholder={labels.messagePlaceholder}
        rows="6"
        class="w-full resize-y rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder-slate-500 transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
      ></textarea>
      {#if fieldErrors.message}<p class="mt-1 text-xs text-red-400">{fieldErrors.message}</p>{/if}
    </div>

    <!-- Cloudflare Turnstile -->
    <div class="flex justify-center">
      <div id="cf-turnstile"></div>
    </div>

    <!-- Error banner -->
    {#if status === 'error' && errorMsg}
      <div class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {errorMsg}
      </div>
    {/if}

    <!-- Submit -->
    <button
      type="submit"
      disabled={status === 'sending'}
      class="w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:from-sky-400 hover:to-indigo-400 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
    >
      {status === 'sending' ? labels.sending : labels.submit}
    </button>
  </form>
{/if}

