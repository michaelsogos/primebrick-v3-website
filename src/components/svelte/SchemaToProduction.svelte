<script lang="ts">
  let progress = $state(0);
  let sectionEl: HTMLElement | null = $state(null);

  const steps = [
    { title: 'Define your entity schema' },
    { title: 'AI generates migration, CRUD API, UI, tests' },
    { title: 'Review, approve, deploy' },
  ];

  const phases = [
    {
      label: 'Schema Declaration',
      lines: [
        { class: 'text-slate-500', html: '# Describe your entity' },
        { class: 'text-green-400', html: '$ primebrick generate entity Customer' },
        { class: 'text-slate-300', html: '<span class="text-sky-400">&rarr;</span> name: string (required)' },
        { class: 'text-slate-300', html: '<span class="text-sky-400">&rarr;</span> email: string (unique)' },
        { class: 'text-slate-300', html: '<span class="text-sky-400">&rarr;</span> status: enum [active, inactive]' },
        { class: 'text-slate-300', html: '<span class="text-sky-400">&rarr;</span> phone: string (optional)' },
        { class: 'text-slate-300', html: '<span class="text-sky-400">&rarr;</span> createdAt: timestamp (auto)' },
      ],
    },
    {
      label: 'API Auto-Generation',
      lines: [
        { class: 'text-slate-500', html: '# AI generates everything...' },
        { class: 'text-cyan-400', html: '&#10003; Database migration created' },
        { class: 'text-slate-400 pl-4 text-xs', html: '&rarr; 00000000000003_create_customers_table.sql' },
        { class: 'text-cyan-400', html: '&#10003; API CRUD endpoints (6 routes)' },
        { class: 'text-slate-400 pl-4 text-xs', html: '&rarr; GET /api/v1/customers' },
        { class: 'text-slate-400 pl-4 text-xs', html: '&rarr; POST /api/v1/customers' },
        { class: 'text-slate-400 pl-4 text-xs', html: '&rarr; PUT /api/v1/customers/:id' },
        { class: 'text-slate-400 pl-4 text-xs', html: '&rarr; DELETE /api/v1/customers/:id' },
        { class: 'text-cyan-400', html: '&#10003; RBAC permissions configured' },
        { class: 'text-slate-400 pl-4 text-xs', html: '&rarr; customers.read.* (guest, collaborator)' },
        { class: 'text-slate-400 pl-4 text-xs', html: '&rarr; customers.* (administrator)' },
      ],
    },
    {
      label: 'Database Migration',
      lines: [
        { class: 'text-slate-500', html: '# Review the generated code' },
        { class: 'text-green-400', html: '$ primebrick review --diff' },
        { class: 'text-slate-300', html: '<span class="text-sky-400">&rarr;</span> 14 files changed, 847 insertions(+), 0 deletions(-)' },
        { class: 'text-cyan-400 mt-2', html: '&#10003; Backoffice UI pages generated' },
        { class: 'text-slate-400 pl-4 text-xs', html: '&rarr; /admin/customers (list, detail, form)' },
        { class: 'text-cyan-400', html: '&#10003; Test scaffolding (12 tests)' },
        { class: 'text-slate-400 pl-4 text-xs', html: '&rarr; unit: 4 | integration: 6 | e2e: 2' },
        { class: 'text-cyan-400', html: '&#10003; OpenAPI spec updated' },
        { class: 'text-slate-400 pl-4 text-xs', html: '&rarr; /api/v1/openapi/aggregated.json' },
      ],
    },
    {
      label: 'UI + Tests Generated',
      lines: [
        { class: 'text-slate-500', html: '# Deploy to production' },
        { class: 'text-green-400', html: '$ primebrick deploy --env production' },
        { class: 'text-slate-300', html: '<span class="text-sky-400">&rarr;</span> Building TypeScript... <span class="text-green-400">&#10003;</span>' },
        { class: 'text-slate-300', html: '<span class="text-sky-400">&rarr;</span> Running tests... <span class="text-green-400">12/12 passed &#10003;</span>' },
        { class: 'text-slate-300', html: '<span class="text-sky-400">&rarr;</span> Migrating database... <span class="text-green-400">&#10003;</span>' },
        { class: 'text-slate-300', html: '<span class="text-sky-400">&rarr;</span> Registering microservice... <span class="text-green-400">&#10003;</span>' },
        { class: 'text-slate-300', html: '<span class="text-sky-400">&rarr;</span> Deploying to Cloudflare Workers... <span class="text-green-400">&#10003;</span>' },
        { class: 'text-slate-300', html: '<span class="text-sky-400">&rarr;</span> Health check passed... <span class="text-green-400">&#10003;</span>' },
      ],
    },
    {
      label: 'Deploy to Production',
      lines: [
        { class: 'text-green-400 mt-2', html: '&#128640; Live at https://api.primebrick.dev/v1/customers' },
        { class: 'text-slate-500 mt-2', html: '# Verify the deployment' },
        { class: 'text-green-400', html: '$ curl https://api.primebrick.dev/v1/customers | jq .' },
        { class: 'text-slate-300', html: '<span class="text-sky-400">&rarr;</span> status: 200 OK' },
        { class: 'text-slate-300', html: '<span class="text-sky-400">&rarr;</span> count: 42 customers' },
        { class: 'text-slate-300', html: '<span class="text-sky-400">&rarr;</span> response time: 18ms' },
      ],
    },
  ];

  let currentPhase = $derived(Math.min(Math.floor(progress * phases.length), phases.length - 1));

  $effect(() => {
    const handler = () => {
      if (!sectionEl) return;
      const rect = sectionEl.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      if (total <= 0) {
        progress = 0;
        return;
      }
      const scrolled = Math.max(0, -rect.top);
      progress = Math.min(1, scrolled / total);
    };
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
    };
  });
</script>

<section bind:this={sectionEl} class="relative" style="height: 300vh;">
  <div class="sticky top-0 flex h-screen items-center overflow-hidden px-6">
    <div class="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-2 lg:gap-12">
      <!-- Left: sticky text with numbered steps -->
      <div class="flex flex-col justify-center">
        <h2 class="text-3xl font-bold text-white sm:text-4xl">
          <span class="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">From schema to production</span>
        </h2>
        <p class="mt-4 text-lg text-slate-400">
          Everything is an entity — not just your domain models, but settings, configurations, and metadata too. Define your entities, and Primebrick handles the rest: database migrations, API endpoints, RBAC, backoffice UI, tests — all generated following your conventions.
        </p>
        <div class="mt-6 space-y-3 text-sm">
          {#each steps as step, i}
            <div class={`flex items-center gap-3 transition-all duration-500 ${i === currentPhase ? 'scale-105' : 'opacity-50'}`}>
              <span class={`flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors ${i === currentPhase ? 'bg-sky-500 text-white' : 'bg-sky-500/20 text-sky-400'}`}>{i + 1}</span>
              <span class={i === currentPhase ? 'text-white font-medium' : 'text-slate-300'}>{step.title}</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Right: terminal window cross-fading between phases -->
      <div class="flex items-center">
        <div class="w-full overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-950/80 shadow-2xl backdrop-blur-sm">
          <!-- Terminal header -->
          <div class="flex items-center gap-2 border-b border-slate-800/50 px-4 py-3">
            <div class="flex gap-1.5">
              <span class="h-3 w-3 rounded-full bg-red-500/70"></span>
              <span class="h-3 w-3 rounded-full bg-yellow-500/70"></span>
              <span class="h-3 w-3 rounded-full bg-green-500/70"></span>
            </div>
            <span class="ml-2 text-xs text-slate-500">primebrick@dev: ~</span>
            <span class="ml-auto text-[10px] text-slate-600">{phases[currentPhase].label}</span>
          </div>
          <!-- Terminal body — cross-fade between phases -->
          <div class="relative h-[420px] font-mono text-sm leading-relaxed overflow-hidden">
            {#each phases as phase, i}
              <div
                class="absolute inset-0 space-y-1.5 p-4 transition-opacity duration-500 overflow-hidden"
                style="opacity: {i === currentPhase ? '1' : '0'};"
              >
                {#each phase.lines as line}
                  <div class={line.class}>{@html line.html}</div>
                {/each}
              </div>
            {/each}
            <!-- Cursor -->
            <div class="absolute bottom-4 left-4 flex items-center gap-1">
              <span class="text-green-400">$</span>
              <span class="inline-block h-4 w-2 animate-pulse bg-sky-400"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
