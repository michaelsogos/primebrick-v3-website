<script lang="ts">
  let showModal = $state(false);
  let injected = $state(false);

  function injectAuthLink() {
    if (injected) return;

    const sidebar = document.querySelector('.t-doc__sidebar') as HTMLElement | null;
    if (!sidebar) return;

    if (sidebar.querySelector('.pb-sidebar-auth')) {
      injected = true;
      return;
    }

    const container = document.createElement('div');
    container.className = 'pb-sidebar-auth';
    container.innerHTML = `
      <button class="pb-sidebar-auth-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Authentication How-To
      </button>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .pb-sidebar-auth {
        flex-shrink: 0 !important;
        position: sticky !important;
        bottom: 0 !important;
        background: var(--scalar-background-1, #0f0f0f) !important;
        z-index: 10 !important;
      }
      .pb-sidebar-auth {
        padding: 0.5rem 0.75rem;
        border-top: 1px solid var(--scalar-border-color, #e5e7eb);
      }
      .pb-sidebar-auth-btn {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--scalar-color-1, #374151);
        background: none;
        border: none;
        padding: 0.375rem 0.5rem;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.15s;
        width: 100%;
        text-align: left;
      }
      .pb-sidebar-auth-btn:hover {
        color: var(--scalar-color-accent, #0ea5e9);
        background: var(--scalar-background-2, #f3f4f6);
      }
    `;

    sidebar.appendChild(style);
    const ctas = sidebar.querySelector('.pb-sidebar-ctas');
    if (ctas) {
      sidebar.insertBefore(container, ctas);
    } else {
      sidebar.appendChild(container);
    }

    const btn = container.querySelector('.pb-sidebar-auth-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        showModal = true;
      });
    }

    injected = true;
  }

  $effect(() => {
    const observer = new MutationObserver(() => {
      injectAuthLink();
      if (injected) observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    let attempts = 0;
    const interval = setInterval(() => {
      if (injected || attempts > 20) {
        clearInterval(interval);
        return;
      }
      injectAuthLink();
      attempts++;
    }, 500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  });
</script>

{#if showModal}
  <div
    class="auth-modal-overlay"
    onclick={() => (showModal = false)}
    role="button"
    tabindex="0"
    aria-label="Close modal"
  >
    <div class="auth-modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-label="Authentication How-To">
      <button class="auth-modal-close" onclick={() => (showModal = false)} aria-label="Close">&times;</button>
      <h2>Authentication How-To</h2>
      <p class="auth-modal-intro">
        Primebrick supports three authentication methods. Configure auth in Scalar's auth dropdown to use the try-it feature.
      </p>

      <div class="auth-modal-method">
        <h3>1. User Access Token</h3>
        <p>Login with username/password via <code>POST /api/v1/auth/login</code>. Send the returned token as <code>Authorization: Bearer &lt;token&gt;</code>.</p>
        <p class="auth-modal-config"><strong>Scalar:</strong> Select "HTTP Bearer" and paste your token.</p>
        <pre><code>curl -X POST https://api.primebrick.dev/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '&#123;"username":"your@email.com","password":"yourpassword"&#125;'</code></pre>
      </div>

      <div class="auth-modal-method">
        <h3>2. OAuth2 Client Credentials</h3>
        <p>For server-to-server calls. Exchange client ID/secret for a token via <code>POST /api/v1/auth/token</code>.</p>
        <p class="auth-modal-config"><strong>Scalar:</strong> Select "OAuth2" → "clientCredentials", enter client ID and secret.</p>
        <pre><code>curl -X POST https://api.primebrick.dev/api/v1/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=your_client_id" \
  -d "client_secret=your_client_secret"</code></pre>
      </div>

      <div class="auth-modal-method">
        <h3>3. API Key</h3>
        <p>For integrations. Send the key in the <code>X-API-KEY</code> header.</p>
        <p class="auth-modal-config"><strong>Scalar:</strong> Select "API Key", set name to <code>X-API-KEY</code>, paste your key.</p>
        <pre><code>curl -X GET https://api.primebrick.dev/api/v1/customers \
  -H "X-API-KEY: your_api_key_here"</code></pre>
      </div>
    </div>
  </div>
{/if}

<style>
  .auth-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    overflow-y: auto;
    padding: 2rem 1rem;
  }

  .auth-modal {
    position: relative;
    max-width: 48rem;
    width: 100%;
    background: #ffffff;
    border-radius: 0.75rem;
    padding: 2rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    color: #1f2937;
  }

  :global([data-theme="dark"]) .auth-modal {
    background: #0f172a;
    color: #e2e8f0;
  }

  .auth-modal-close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    font-size: 1.5rem;
    line-height: 1;
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }

  .auth-modal-close:hover {
    color: #0ea5e9;
  }

  .auth-modal h2 {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(to right, #0ea5e9, #6366f1);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .auth-modal-intro {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    color: #6b7280;
  }

  :global([data-theme="dark"]) .auth-modal-intro {
    color: #94a3b8;
  }

  .auth-modal-method {
    margin-bottom: 1.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1.25rem;
  }

  :global([data-theme="dark"]) .auth-modal-method {
    border-color: #1e293b;
  }

  .auth-modal-method h3 {
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #0ea5e9;
  }

  :global([data-theme="dark"]) .auth-modal-method h3 {
    color: #38bdf8;
  }

  .auth-modal-method p {
    line-height: 1.6;
    margin-bottom: 0.5rem;
  }

  .auth-modal-method code {
    font-family: ui-monospace, monospace;
    font-size: 0.8125rem;
    background: #f3f4f6;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    color: #0ea5e9;
  }

  :global([data-theme="dark"]) .auth-modal-method code {
    background: #1e293b;
    color: #38bdf8;
  }

  .auth-modal-config {
    padding: 0.5rem 0.75rem;
    background: #f0f9ff;
    border-radius: 0.375rem;
    border-left: 3px solid #0ea5e9;
    margin: 0.5rem 0;
  }

  :global([data-theme="dark"]) .auth-modal-config {
    background: #0c4a6e;
  }

  .auth-modal-method pre {
    background: #1e293b;
    border-radius: 0.375rem;
    padding: 0.75rem;
    overflow-x: auto;
    margin: 0.5rem 0;
  }

  .auth-modal-method pre code {
    background: none;
    color: #e2e8f0;
    padding: 0;
    font-size: 0.75rem;
    line-height: 1.5;
  }
</style>
