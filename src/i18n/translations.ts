/**
 * All translations for the Primebrick landing page.
 * 6 languages: EN (default), IT, DE, ES, PT, FR
 */

export const LANGUAGES = [
  { code: 'en', label: 'English', hreflang: 'en' },
  { code: 'it', label: 'Italiano', hreflang: 'it' },
  { code: 'de', label: 'Deutsch', hreflang: 'de' },
  { code: 'es', label: 'Español', hreflang: 'es' },
  { code: 'pt', label: 'Português', hreflang: 'pt' },
  { code: 'fr', label: 'Français', hreflang: 'fr' },
] as const;

export type LangCode = (typeof LANGUAGES)[number]['code'];

export const translations = {
  en: {
    nav: { features: 'Features', docs: 'Docs', apiExplorer: 'API Explorer', github: 'GitHub', license: 'MIT License' },
    hero: {
      headline: 'The opinionated backoffice framework for serious teams',
      subheadline: 'Primebrick v3 is an open-source framework that defines infrastructure, architecture, and coding rules according to best practices. MIT license: use it in commercial projects, no strings attached.',
      ctaGithub: 'See on GitHub',
      ctaArchitecture: 'Discover the architecture',
    },
    stats: { license: 'MIT License', deploy: '6+ Deploy targets', lockin: 'Zero vendor lock-in' },
    multicloud: {
      title: 'Multi-cloud, truly.',
      text: 'Your infrastructure, your rules. No vendor lock-in: Primebrick runs identically from your laptop to the enterprise datacenter, from K8s cluster to the public cloud closest to your users.',
      providers: ['AWS', 'GCP', 'Azure', 'Alibaba Cloud', 'Docker Swarm', 'Kubernetes / On-prem'],
    },
    concept: {
      title: 'A backoffice that starts with its own rules.',
      text: 'Every backoffice starts well and ends in chaos. Primebrick v3 flips the perspective: we start from best practices and enforce them through the framework.',
      cards: [
        { title: 'Infrastructure as Code', text: 'K8s manifests, Helm charts, Terraform templates ready for staging and production.' },
        { title: 'Layered architecture', text: 'Clean separation between domain, application, infrastructure, and UI. Testable by construction.' },
        { title: 'Opinionated coding rules', text: 'Linting, strict types, mandatory patterns: technical debt is prevented, not paid later.' },
        { title: 'Native observability', text: 'OpenTelemetry, structured logging, health-checks integrated from the first commit.' },
      ],
    },
    bricks: {
      title: 'Everything you need. Nothing you don\'t.',
      text: 'We made the hard decisions once, so your teams don\'t make them every sprint. Every brick is tested, integrated, and documented.',
      cards: [
        { label: '/ AUTH', title: 'Identity & RBAC', text: 'OIDC, role management, granular schema-level permissions.' },
        { label: '/ DATA', title: 'Persistence layer', text: 'PostgreSQL adapter, soft-delete, audit fields, bulk operations.' },
        { label: '/ UI', title: 'Backoffice engine', text: 'CRUD, tables, forms, filters generated from domain schemas.' },
        { label: '/ OBS', title: 'Full observability', text: 'OpenTelemetry integrated, tracing, metrics, correlated logs.' },
        { label: '/ MULTI', title: 'Multi-tenant ready', text: 'Logical and physical isolation for thousands of organizations.' },
        { label: '/ SDK', title: 'Type-safe SDK', text: 'TypeScript clients generated from endpoints, end-to-end type safety.' },
      ],
    },
    forDevs: {
      title: 'Less boilerplate, more value.',
      text: 'Clear structure, objective coding rules, DX designed for speed. Clone, run, and you\'re already in a best-practice environment — CI/CD, linting, types, tests, observability all ready.',
      bullets: ['Onboarding in hours, not weeks', 'Zero discussions about "how we do things here"', 'Modern, typed, tested stack'],
    },
    forCtos: {
      title: 'Software selection without risk.',
      text: 'MIT license, open and inspectable code, deploy where you decide. Reduce time-to-market and technical debt from minute zero. No vendor lock-in, no contractual surprises.',
      bullets: ['Free commercial use (MIT)', 'Host it where needed: cloud or on-prem', 'Verifiable standards, not promises'],
    },
    openSource: {
      title: 'Open source. Even for commercial use.',
      text: 'Primebrick v3 is released under the MIT license: you can use, modify, redistribute, and integrate it in commercial products without royalties. Code is public on GitHub, design decisions are documented, contributions are welcome.',
      githubLink: 'GitHub repository',
      licenseLink: 'License text',
    },
    finalCta: {
      title: 'Build your next backoffice with the right rules.',
      text: 'Clone the repo, follow the quick-start, and you\'re in production with an architecture your future developers will thank you for choosing.',
      ctaGithub: 'Start on GitHub',
      ctaDocs: 'Read the architecture',
    },
    footer: { copyright: 'Primebrick. MIT License.' },
  },

  it: {
    nav: { features: 'Funzionalità', docs: 'Docs', apiExplorer: 'API Explorer', github: 'GitHub', license: 'Licenza MIT' },
    hero: {
      headline: 'Il framework backoffice opinionato per team seri',
      subheadline: 'Primebrick v3 è un framework open-source che definisce infrastruttura, architettura e regole di codifica secondo le best practice. Licenza MIT: usalo in progetti commerciali, senza vincoli.',
      ctaGithub: 'Vedi su GitHub',
      ctaArchitecture: 'Scopri l\'architettura',
    },
    stats: { license: 'Licenza MIT', deploy: '6+ destinazioni', lockin: 'Zero vendor lock-in' },
    multicloud: {
      title: 'Multi-cloud, davvero.',
      text: 'La tua infrastruttura, le tue regole. Nessun vendor lock-in: Primebrick gira identico dal tuo laptop al datacenter aziendale, dal cluster K8s al cloud pubblico più vicino ai tuoi utenti.',
      providers: ['AWS', 'GCP', 'Azure', 'Alibaba Cloud', 'Docker Swarm', 'Kubernetes / On-prem'],
    },
    concept: {
      title: 'Un backoffice che inizia con le proprie regole.',
      text: 'Ogni backoffice inizia bene e finisce nel caos. Primebrick v3 ribalta la prospettiva: partiamo dalle best practice e le applichiamo tramite il framework.',
      cards: [
        { title: 'Infrastructure as Code', text: 'Manifest K8s, chart Helm, template Terraform pronti per staging e produzione.' },
        { title: 'Architettura a strati', text: 'Separazione pulita tra dominio, applicazione, infrastruttura e UI. Testabile per costruzione.' },
        { title: 'Regole di codifica opinionate', text: 'Linting, tipi strict, pattern obbligatori: il debito tecnico è prevenuto, non pagato dopo.' },
        { title: 'Osservabilità nativa', text: 'OpenTelemetry, logging strutturato, health-check integrati dal primo commit.' },
      ],
    },
    bricks: {
      title: 'Tutto ciò che serve. Niente di più.',
      text: 'Abbiamo preso le decisioni difficili una volta, così i tuoi team non le prendono ogni sprint. Ogni brick è testato, integrato e documentato.',
      cards: [
        { label: '/ AUTH', title: 'Identità & RBAC', text: 'OIDC, gestione ruoli, permessi granulari a livello di schema.' },
        { label: '/ DATA', title: 'Layer di persistenza', text: 'Adattatore PostgreSQL, soft-delete, campi di audit, operazioni bulk.' },
        { label: '/ UI', title: 'Motore backoffice', text: 'CRUD, tabelle, form, filtri generati dagli schemi di dominio.' },
        { label: '/ OBS', title: 'Osservabilità completa', text: 'OpenTelemetry integrato, tracing, metriche, log correlati.' },
        { label: '/ MULTI', title: 'Multi-tenant ready', text: 'Isolamento logico e fisico per migliaia di organizzazioni.' },
        { label: '/ SDK', title: 'SDK type-safe', text: 'Client TypeScript generati dagli endpoint, type safety end-to-end.' },
      ],
    },
    forDevs: {
      title: 'Meno boilerplate, più valore.',
      text: 'Struttura chiara, regole di codifica oggettive, DX progettata per la velocità. Clona, esegui, e sei già in un ambiente di best practice — CI/CD, linting, tipi, test, osservabilità pronti.',
      bullets: ['Onboarding in ore, non settimane', 'Zero discussioni su "come facciamo le cose qui"', 'Stack moderno, tipizzato, testato'],
    },
    forCtos: {
      title: 'Selezione software senza rischio.',
      text: 'Licenza MIT, codice aperto e ispezionabile, deploy dove decidi tu. Riduci il time-to-market e il debito tecnico dal minuto zero. Nessun vendor lock-in, nessuna sorpresa contrattuale.',
      bullets: ['Uso commerciale gratuito (MIT)', 'Host dove serve: cloud o on-prem', 'Standard verificabili, non promesse'],
    },
    openSource: {
      title: 'Open source. Anche per uso commerciale.',
      text: 'Primebrick v3 è rilasciato sotto licenza MIT: puoi usare, modificare, ridistribuire e integrare in prodotti commerciali senza royalty. Il codice è pubblico su GitHub, le decisioni di design sono documentate, i contributi sono benvenuti.',
      githubLink: 'Repository GitHub',
      licenseLink: 'Testo della licenza',
    },
    finalCta: {
      title: 'Costruisci il tuo prossimo backoffice con le regole giuste.',
      text: 'Clona il repo, segui il quick-start, e sei in produzione con un\'architettura per cui i tuoi futuri sviluppatori ti ringrazieranno.',
      ctaGithub: 'Inizia su GitHub',
      ctaDocs: 'Leggi l\'architettura',
    },
    footer: { copyright: 'Primebrick. Licenza MIT.' },
  },

  de: {
    nav: { features: 'Funktionen', docs: 'Doku', apiExplorer: 'API Explorer', github: 'GitHub', license: 'MIT-Lizenz' },
    hero: {
      headline: 'Das Opinionated Backoffice-Framework für ernsthafte Teams',
      subheadline: 'Primebrick v3 ist ein Open-Source-Framework, das Infrastruktur, Architektur und Codierungsregeln nach Best Practices definiert. MIT-Lizenz: kommerzielle Nutzung ohne Einschränkungen.',
      ctaGithub: 'Auf GitHub ansehen',
      ctaArchitecture: 'Architektur entdecken',
    },
    stats: { license: 'MIT-Lizenz', deploy: '6+ Deploy-Ziele', lockin: 'Zero Vendor Lock-in' },
    multicloud: {
      title: 'Multi-cloud, wirklich.',
      text: 'Ihre Infrastruktur, Ihre Regeln. Kein Vendor Lock-in: Primebrick läuft identisch vom Laptop bis zum Enterprise-Rechenzentrum, vom K8s-Cluster zur öffentlichen Cloud.',
      providers: ['AWS', 'GCP', 'Azure', 'Alibaba Cloud', 'Docker Swarm', 'Kubernetes / On-prem'],
    },
    concept: {
      title: 'Ein Backoffice, das mit eigenen Regeln beginnt.',
      text: 'Jedes Backoffice startet gut und endet im Chaos. Primebrick v3 dreht die Perspektive um: wir starten von Best Practices und setzen sie durch das Framework durch.',
      cards: [
        { title: 'Infrastructure as Code', text: 'K8s-Manifeste, Helm-Charts, Terraform-Templates für Staging und Produktion.' },
        { title: 'Schichtenarchitektur', text: 'Saubere Trennung zwischen Domäne, Anwendung, Infrastruktur und UI. Konstruktiv testbar.' },
        { title: 'Opinionated Codierungsregeln', text: 'Linting, strenge Typen, obligatorische Patterns: technische Schulden werden verhindert, nicht später bezahlt.' },
        { title: 'Native Observability', text: 'OpenTelemetry, strukturiertes Logging, Health-Checks ab dem ersten Commit.' },
      ],
    },
    bricks: {
      title: 'Alles was Sie brauchen. Nichts, was Sie nicht brauchen.',
      text: 'Wir haben die schweren Entscheidungen einmal getroffen, damit Ihre Teams sie nicht jeden Sprint treffen. Jeder Baustein ist getestet, integriert und dokumentiert.',
      cards: [
        { label: '/ AUTH', title: 'Identität & RBAC', text: 'OIDC, Rollenverwaltung, granulare Berechtigungen auf Schema-Ebene.' },
        { label: '/ DATA', title: 'Persistenz-Layer', text: 'PostgreSQL-Adapter, Soft-Delete, Audit-Felder, Bulk-Operationen.' },
        { label: '/ UI', title: 'Backoffice-Engine', text: 'CRUD, Tabellen, Formulare, Filter aus Domänen-Schemas generiert.' },
        { label: '/ OBS', title: 'Volle Observability', text: 'OpenTelemetry integriert, Tracing, Metriken, korrelierte Logs.' },
        { label: '/ MULTI', title: 'Multi-tenant ready', text: 'Logische und physische Isolierung für Tausende von Organisationen.' },
        { label: '/ SDK', title: 'Type-safe SDK', text: 'TypeScript-Clients aus Endpoints generiert, End-to-End-Typsicherheit.' },
      ],
    },
    forDevs: {
      title: 'Weniger Boilerplate, mehr Wert.',
      text: 'Klare Struktur, objektive Codierungsregeln, DX für Geschwindigkeit. Klonen, ausführen, und Sie sind bereits in einer Best-Practice-Umgebung — CI/CD, Linting, Typen, Tests, Observability.',
      bullets: ['Onboarding in Stunden, nicht Wochen', 'Keine Diskussionen über "wie wir es hier machen"', 'Modern, getippt, getestet'],
    },
    forCtos: {
      title: 'Software-Auswahl ohne Risiko.',
      text: 'MIT-Lizenz, offener und prüfbarer Code, deploy wo Sie entscheiden. Reduzieren Sie Time-to-Market und technische Schulden ab Minute Null. Kein Vendor Lock-in, keine vertraglichen Überraschungen.',
      bullets: ['Kostenlose kommerzielle Nutzung (MIT)', 'Hosten wo nötig: Cloud oder On-prem', 'Überprüfbare Standards, keine Versprechen'],
    },
    openSource: {
      title: 'Open Source. Auch für kommerzielle Nutzung.',
      text: 'Primebrick v3 ist unter der MIT-Lizenz veröffentlicht: verwenden, ändern, weiterverbreiten und in kommerziellen Produkten integrieren ohne Lizenzgebühren. Code ist öffentlich auf GitHub.',
      githubLink: 'GitHub-Repository',
      licenseLink: 'Lizenztext',
    },
    finalCta: {
      title: 'Bauen Sie Ihr nächstes Backoffice mit den richtigen Regeln.',
      text: 'Repo klonen, Quick-Start folgen, und Sie sind in Produktion mit einer Architektur, für die Ihre zukünftigen Entwickler dankbar sein werden.',
      ctaGithub: 'Auf GitHub starten',
      ctaDocs: 'Architektur lesen',
    },
    footer: { copyright: 'Primebrick. MIT-Lizenz.' },
  },

  es: {
    nav: { features: 'Características', docs: 'Docs', apiExplorer: 'API Explorer', github: 'GitHub', license: 'Licencia MIT' },
    hero: {
      headline: 'El framework backoffice opinionated para equipos serios',
      subheadline: 'Primebrick v3 es un framework open-source que define infraestructura, arquitectura y reglas de codificación según las mejores prácticas. Licencia MIT: úsalo en proyectos comerciales sin ataduras.',
      ctaGithub: 'Ver en GitHub',
      ctaArchitecture: 'Descubre la arquitectura',
    },
    stats: { license: 'Licencia MIT', deploy: '6+ destinos', lockin: 'Zero vendor lock-in' },
    multicloud: {
      title: 'Multi-cloud, de verdad.',
      text: 'Tu infraestructura, tus reglas. Sin vendor lock-in: Primebrick funciona igual desde tu laptop hasta el datacenter empresarial, del cluster K8s a la nube pública más cercana.',
      providers: ['AWS', 'GCP', 'Azure', 'Alibaba Cloud', 'Docker Swarm', 'Kubernetes / On-prem'],
    },
    concept: {
      title: 'Un backoffice que empieza con sus propias reglas.',
      text: 'Todo backoffice empieza bien y termina en caos. Primebrick v3 invierte la perspectiva: empezamos desde las mejores prácticas y las aplicamos through el framework.',
      cards: [
        { title: 'Infrastructure as Code', text: 'Manifiestos K8s, charts Helm, plantillas Terraform listos para staging y producción.' },
        { title: 'Arquitectura por capas', text: 'Separación limpia entre dominio, aplicación, infraestructura y UI. Testable por construcción.' },
        { title: 'Reglas de codificación opinionated', text: 'Linting, tipos estrictos, patrones obligatorios: la deuda técnica se previene, no se paga después.' },
        { title: 'Observabilidad nativa', text: 'OpenTelemetry, logging estructurado, health-checks integrados desde el primer commit.' },
      ],
    },
    bricks: {
      title: 'Todo lo que necesitas. Nada que no.',
      text: 'Tomamos las decisiones difíciles una vez, para que tus equipos no las tomen cada sprint. Cada brick está testado, integrado y documentado.',
      cards: [
        { label: '/ AUTH', title: 'Identidad & RBAC', text: 'OIDC, gestión de roles, permisos granulares a nivel de schema.' },
        { label: '/ DATA', title: 'Capa de persistencia', text: 'Adaptador PostgreSQL, soft-delete, campos de auditoría, operaciones bulk.' },
        { label: '/ UI', title: 'Motor de backoffice', text: 'CRUD, tablas, formularios, filtros generados desde schemas de dominio.' },
        { label: '/ OBS', title: 'Observabilidad completa', text: 'OpenTelemetry integrado, tracing, métricas, logs correlacionados.' },
        { label: '/ MULTI', title: 'Multi-tenant ready', text: 'Aislamiento lógico y físico para miles de organizaciones.' },
        { label: '/ SDK', title: 'SDK type-safe', text: 'Clientes TypeScript generados desde endpoints, type safety end-to-end.' },
      ],
    },
    forDevs: {
      title: 'Menos boilerplate, más valor.',
      text: 'Estructura clara, reglas de codificación objetivas, DX diseñada para velocidad. Clona, ejecuta, y ya estás en un entorno de mejores prácticas — CI/CD, linting, tipos, tests, observabilidad.',
      bullets: ['Onboarding en horas, no semanas', 'Cero discusiones sobre "cómo hacemos las cosas aquí"', 'Stack moderno, tipado, testado'],
    },
    forCtos: {
      title: 'Selección de software sin riesgo.',
      text: 'Licencia MIT, código abierto e inspeccionable, deploy donde decidas. Reduce el time-to-market y la deuda técnica desde el minuto cero. Sin vendor lock-in, sin sorpresas contractuales.',
      bullets: ['Uso comercial gratuito (MIT)', 'Hóstalo donde necesites: cloud o on-prem', 'Estándares verificables, no promesas'],
    },
    openSource: {
      title: 'Open source. También para uso comercial.',
      text: 'Primebrick v3 se publica bajo licencia MIT: puedes usar, modificar, redistribuir e integrar en productos comerciales sin regalías. El código es público en GitHub.',
      githubLink: 'Repositorio GitHub',
      licenseLink: 'Texto de la licencia',
    },
    finalCta: {
      title: 'Construye tu próximo backoffice con las reglas correctas.',
      text: 'Clona el repo, sigue el quick-start, y estás en producción con una arquitectura por la que tus futuros desarrolladores te agradecerán.',
      ctaGithub: 'Empezar en GitHub',
      ctaDocs: 'Leer la arquitectura',
    },
    footer: { copyright: 'Primebrick. Licencia MIT.' },
  },

  pt: {
    nav: { features: 'Funcionalidades', docs: 'Docs', apiExplorer: 'API Explorer', github: 'GitHub', license: 'Licença MIT' },
    hero: {
      headline: 'O framework backoffice opinionated para equipas sérias',
      subheadline: 'Primebrick v3 é um framework open-source que define infraestrutura, arquitetura e regras de codificação segundo as melhores práticas. Licença MIT: use em projetos comerciais, sem amarras.',
      ctaGithub: 'Ver no GitHub',
      ctaArchitecture: 'Descobrir a arquitetura',
    },
    stats: { license: 'Licença MIT', deploy: '6+ destinos', lockin: 'Zero vendor lock-in' },
    multicloud: {
      title: 'Multi-cloud, a sério.',
      text: 'A sua infraestrutura, as suas regras. Sem vendor lock-in: Primebrick corre igual do laptop ao datacenter empresarial, do cluster K8s à nuvem pública mais próxima dos utilizadores.',
      providers: ['AWS', 'GCP', 'Azure', 'Alibaba Cloud', 'Docker Swarm', 'Kubernetes / On-prem'],
    },
    concept: {
      title: 'Um backoffice que começa com as suas próprias regras.',
      text: 'Todo backoffice começa bem e acaba em caos. Primebrick v3 inverte a perspetiva: começamos pelas melhores práticas e aplicamo-las através do framework.',
      cards: [
        { title: 'Infrastructure as Code', text: 'Manifestos K8s, charts Helm, templates Terraform prontos para staging e produção.' },
        { title: 'Arquitetura em camadas', text: 'Separação limpa entre domínio, aplicação, infraestrutura e UI. Testável por construção.' },
        { title: 'Regras de codificação opinionated', text: 'Linting, tipos estritos, padrões obrigatórios: a dívida técnica é prevenida, não paga depois.' },
        { title: 'Observabilidade nativa', text: 'OpenTelemetry, logging estruturado, health-checks integrados desde o primeiro commit.' },
      ],
    },
    bricks: {
      title: 'Tudo o que precisa. Nada que não.',
      text: 'Tomámos as decisões difíceis uma vez, para que as suas equipas não as tomem a cada sprint. Cada brick é testado, integrado e documentado.',
      cards: [
        { label: '/ AUTH', title: 'Identidade & RBAC', text: 'OIDC, gestão de roles, permissões granulares ao nível de schema.' },
        { label: '/ DATA', title: 'Camada de persistência', text: 'Adaptador PostgreSQL, soft-delete, campos de auditoria, operações bulk.' },
        { label: '/ UI', title: 'Motor de backoffice', text: 'CRUD, tabelas, formulários, filtros gerados a partir de schemas de domínio.' },
        { label: '/ OBS', title: 'Observabilidade completa', text: 'OpenTelemetry integrado, tracing, métricas, logs correlacionados.' },
        { label: '/ MULTI', title: 'Multi-tenant ready', text: 'Isolamento lógico e físico para milhares de organizações.' },
        { label: '/ SDK', title: 'SDK type-safe', text: 'Clientes TypeScript gerados a partir de endpoints, type safety end-to-end.' },
      ],
    },
    forDevs: {
      title: 'Menos boilerplate, mais valor.',
      text: 'Estrutura clara, regras de codificação objetivas, DX desenhada para velocidade. Clona, executa, e já estás num ambiente de melhores práticas — CI/CD, linting, tipos, testes, observabilidade.',
      bullets: ['Onboarding em horas, não semanas', 'Zero discussões sobre "como fazemos as coisas aqui"', 'Stack moderno, tipado, testado'],
    },
    forCtos: {
      title: 'Seleção de software sem risco.',
      text: 'Licença MIT, código aberto e inspeccionável, deploy onde decides. Reduz o time-to-market e a dívida técnica desde o minuto zero. Sem vendor lock-in, sem surpresas contratuais.',
      bullets: ['Uso comercial gratuito (MIT)', 'Hospeda onde precisar: cloud ou on-prem', 'Padrões verificáveis, não promessas'],
    },
    openSource: {
      title: 'Open source. Mesmo para uso comercial.',
      text: 'Primebrick v3 é publicado sob licença MIT: podes usar, modificar, redistribuir e integrar em produtos comerciais sem royalties. O código é público no GitHub.',
      githubLink: 'Repositório GitHub',
      licenseLink: 'Texto da licença',
    },
    finalCta: {
      title: 'Constrói o teu próximo backoffice com as regras certas.',
      text: 'Clona o repo, segue o quick-start, e estás em produção com uma arquitetura pela qual os teus futuros desenvolvedores te agradecerão.',
      ctaGithub: 'Começar no GitHub',
      ctaDocs: 'Ler a arquitetura',
    },
    footer: { copyright: 'Primebrick. Licença MIT.' },
  },

  fr: {
    nav: { features: 'Fonctionnalités', docs: 'Docs', apiExplorer: 'API Explorer', github: 'GitHub', license: 'Licence MIT' },
    hero: {
      headline: 'Le framework backoffice opinionated pour les équipes sérieuses',
      subheadline: 'Primebrick v3 est un framework open-source qui définit l\'infrastructure, l\'architecture et les règles de codage selon les meilleures pratiques. Licence MIT : utilisation commerciale sans contraintes.',
      ctaGithub: 'Voir sur GitHub',
      ctaArchitecture: 'Découvrir l\'architecture',
    },
    stats: { license: 'Licence MIT', deploy: '6+ cibles', lockin: 'Zero vendor lock-in' },
    multicloud: {
      title: 'Multi-cloud, vraiment.',
      text: 'Votre infrastructure, vos règles. Pas de vendor lock-in : Primebrick fonctionne identiquement de votre laptop au datacenter d\'entreprise, du cluster K8s au cloud public le plus proche.',
      providers: ['AWS', 'GCP', 'Azure', 'Alibaba Cloud', 'Docker Swarm', 'Kubernetes / On-prem'],
    },
    concept: {
      title: 'Un backoffice qui commence par ses propres règles.',
      text: 'Tout backoffice commence bien et finit dans le chaos. Primebrick v3 inverse la perspective : nous partons des meilleures pratiques et les appliquons via le framework.',
      cards: [
        { title: 'Infrastructure as Code', text: 'Manifestes K8s, charts Helm, templates Terraform prêts pour staging et production.' },
        { title: 'Architecture en couches', text: 'Séparation propre entre domaine, application, infrastructure et UI. Testable par construction.' },
        { title: 'Règles de codage opinionated', text: 'Linting, types stricts, patterns obligatoires : la dette technique est prévenue, non payée après.' },
        { title: 'Observabilité native', text: 'OpenTelemetry, logging structuré, health-checks intégrés dès le premier commit.' },
      ],
    },
    bricks: {
      title: 'Tout ce dont vous avez besoin. Rien de superflu.',
      text: 'Nous avons pris les décisions difficiles une fois, pour que vos équipes ne les prennent pas à chaque sprint. Chaque brique est testée, intégrée et documentée.',
      cards: [
        { label: '/ AUTH', title: 'Identité & RBAC', text: 'OIDC, gestion des rôles, permissions granulaires au niveau schema.' },
        { label: '/ DATA', title: 'Couche de persistance', text: 'Adaptateur PostgreSQL, soft-delete, champs d\'audit, opérations bulk.' },
        { label: '/ UI', title: 'Moteur backoffice', text: 'CRUD, tableaux, formulaires, filtres générés depuis les schémas de domaine.' },
        { label: '/ OBS', title: 'Observabilité complète', text: 'OpenTelemetry intégré, tracing, métriques, logs corrélés.' },
        { label: '/ MULTI', title: 'Multi-tenant ready', text: 'Isolation logique et physique pour des milliers d\'organisations.' },
        { label: '/ SDK', title: 'SDK type-safe', text: 'Clients TypeScript générés depuis les endpoints, type safety end-to-end.' },
      ],
    },
    forDevs: {
      title: 'Moins de boilerplate, plus de valeur.',
      text: 'Structure claire, règles de codage objectives, DX conçue pour la vitesse. Clonez, lancez, et vous êtes déjà dans un environnement de meilleures pratiques — CI/CD, linting, types, tests, observabilité.',
      bullets: ['Onboarding en heures, pas en semaines', 'Zéro discussions sur « comment on fait ici »', 'Stack moderne, typé, testé'],
    },
    forCtos: {
      title: 'Sélection logicielle sans risque.',
      text: 'Licence MIT, code ouvert et inspectable, déployez où vous décidez. Réduisez le time-to-market et la dette technique dès la minute zéro. Pas de vendor lock-in, pas de surprises contractuelles.',
      bullets: ['Usage commercial gratuit (MIT)', 'Hébergez où nécessaire : cloud ou on-prem', 'Standards vérifiables, pas des promesses'],
    },
    openSource: {
      title: 'Open source. Même pour un usage commercial.',
      text: 'Primebrick v3 est publié sous licence MIT : vous pouvez utiliser, modifier, redistribuer et intégrer dans des produits commerciaux sans redevances. Le code est public sur GitHub.',
      githubLink: 'Dépôt GitHub',
      licenseLink: 'Texte de la licence',
    },
    finalCta: {
      title: 'Construisez votre prochain backoffice avec les bonnes règles.',
      text: 'Clonez le repo, suivez le quick-start, et vous êtes en production avec une architecture dont vos futurs développeurs vous remercieront.',
      ctaGithub: 'Commencer sur GitHub',
      ctaDocs: 'Lire l\'architecture',
    },
    footer: { copyright: 'Primebrick. Licence MIT.' },
  },
} as const;
