// SSR contact endpoint — opts out of prerendering.
// Flow: verify Turnstile → validate/sanitize → send via Brevo → JSON response.
// Secrets (TURNSTILE_SECRET_KEY, BREVO_API_KEY) are read from the Cloudflare
// Worker runtime env via `cloudflare:workers` (Astro v6+ / adapter v14+ API).
// Uses only Web APIs (fetch, Request, Response) — no Node.js APIs.

import { env } from 'cloudflare:workers';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RECIPIENT = 'about@primebrick.dev';
// Sender must be a domain verified in your Brevo account.
const SENDER = { name: 'Primebrick Website', email: 'noreply@primebrick.dev' };

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  turnstileToken?: unknown;
}

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
}

interface BrevoResponse {
  messageId?: string;
  message?: string;
  code?: string;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function isNonEmptyString(v: unknown, max: number): v is string {
  return typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max;
}

export async function POST({ request }: { request: Request }): Promise<Response> {
  let payload: ContactPayload;
  try {
    payload = await request.json() as ContactPayload;
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }

  const { name, email, message, turnstileToken } = payload;

  // 1. Field validation + sanitization
  if (!isNonEmptyString(name, 100)) return json({ error: 'invalid_name' }, 400);
  if (!isNonEmptyString(email, 254) || !EMAIL_RE.test(email.trim())) return json({ error: 'invalid_email' }, 400);
  if (!isNonEmptyString(message, 5000) || message.trim().length < 10) return json({ error: 'invalid_message' }, 400);
  if (typeof turnstileToken !== 'string' || turnstileToken.length === 0) return json({ error: 'missing_turnstile_token' }, 400);

  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanMessage = message.trim();

  // 2. Read secrets from the Cloudflare Worker env (Astro v6+ API).
  const turnstileSecret = env.TURNSTILE_SECRET_KEY as string | undefined;
  const brevoKey = env.BREVO_API_KEY as string | undefined;

  if (!turnstileSecret) return json({ error: 'server_misconfigured' }, 500);
  if (!brevoKey) return json({ error: 'server_misconfigured' }, 500);

  // 3. Verify Turnstile token with Cloudflare
  try {
    const tsForm = new URLSearchParams();
    tsForm.set('secret', turnstileSecret);
    tsForm.set('response', turnstileToken);
    const tsRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tsForm.toString(),
    });
    const tsData = (await tsRes.json()) as TurnstileVerifyResponse;
    if (!tsData.success) return json({ error: 'turnstile_failed' }, 400);
  } catch {
    return json({ error: 'turnstile_unreachable' }, 502);
  }

  // 4. Send email via Brevo
  const html = [
    `<h3>New contact from primebrick.dev</h3>`,
    `<p><strong>Name:</strong> ${escapeHtml(cleanName)}</p>`,
    `<p><strong>Email:</strong> <a href="mailto:${escapeHtml(cleanEmail)}">${escapeHtml(cleanEmail)}</a></p>`,
    `<p><strong>Message:</strong></p>`,
    `<pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(cleanMessage)}</pre>`,
  ].join('\n');

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': brevoKey,
      },
      body: JSON.stringify({
        sender: SENDER,
        to: [{ email: RECIPIENT }],
        replyTo: { email: cleanEmail, name: cleanName },
        subject: `[primebrick.dev contact] Message from ${cleanName}`,
        htmlContent: html,
      }),
    });

    if (!brevoRes.ok) {
      // Don't leak Brevo error details to the client.
      let brevoBody: BrevoResponse | null = null;
      try { brevoBody = (await brevoRes.json()) as BrevoResponse; } catch { /* ignore */ }
      console.error('Brevo send failed', brevoRes.status, brevoBody?.code, brevoBody?.message);
      return json({ error: 'email_send_failed' }, 502);
    }

    return json({ ok: true }, 200);
  } catch {
    return json({ error: 'email_send_failed' }, 502);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Reject non-POST methods
export function ALL(): Response {
  return json({ error: 'method_not_allowed' }, 405);
}

export async function GET(): Promise<Response> {
  return json({ error: 'method_not_allowed' }, 405);
}
