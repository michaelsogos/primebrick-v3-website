/* ============================================================
   Primebrick Demo — The Shell scroll-jacking engine
   Extracted verbatim from shell-v2.html inline IIFE (lines 1215-1941).
   Wrapped in an exported function so Astro can import it.
   ============================================================ */

export function initShellScroll(): void {
(function() {
  const track = document.getElementById('track');
  const screenMock = document.getElementById('screen-mock');
  const sidebar = document.getElementById('sidebar');
  const sidebarGap = document.getElementById('sidebar-gap');
  const sidebarExtracted = document.getElementById('sidebar-extracted');
  const topbarExtracted = document.getElementById('topbar-extracted');
  const contentExtracted = document.getElementById('content-extracted');
  const railFill = document.getElementById('rail-fill');
  const dotsContainer = document.getElementById('dots');
  const phaseLabel = document.getElementById('phase-label');
  const canvas = document.getElementById('canvas');
  const connectorsSvg = document.getElementById('connectors');
  if (!track || !screenMock) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== Phases =====
  // Phase 1: Sidebar disassembly
  //   0: intro — screen centered, full size
  //   1: shrink + move right
  //   2: sidebar slides out from screen to the left (with gap)
  //   3: sidebar annotations appear (left side, pointing right)
  // Phase 2: Top nav disassembly
  //   4: annotations fade out, sidebar slides back into screen
  //   5: screen moves down + re-centers
  //   6: top nav elements extract upward, annotations appear above pointing down
  const PHASES = [
    { name: 'The App Shell', start: 0.00, end: 0.03 },
    { name: 'Zooming in', start: 0.03, end: 0.08 },
    { name: 'Extracting the sidebar', start: 0.08, end: 0.18 },
    { name: 'Sidebar anatomy', start: 0.18, end: 0.32 },
    { name: 'Reassembling sidebar', start: 0.32, end: 0.40 },
    { name: 'Recentering', start: 0.40, end: 0.44 },
    { name: 'Top navigation anatomy', start: 0.44, end: 0.66 },
    { name: 'Reassembling topbar', start: 0.66, end: 0.72 },
    { name: 'Recentering for content', start: 0.72, end: 0.76 },
    { name: 'Content area anatomy', start: 0.76, end: 0.92 },
    { name: 'Reassembling content', start: 0.92, end: 0.96 },
    { name: 'Returning to origin', start: 0.96, end: 0.99 },
    { name: 'The Shell', start: 0.99, end: 1.00 },
  ];

  // Sidebar annotation pieces
  const SB_ANNOTS = [
    { id: 'org', exId: 'ex-org', annId: 'ann-org', lineId: 'line-org', dotId: 'dot-org' },
    { id: 'module', exId: 'ex-module', annId: 'ann-module', lineId: 'line-module', dotId: 'dot-module' },
    { id: 'nav', exId: 'ex-nav', annId: 'ann-nav', lineId: 'line-nav', dotId: 'dot-nav' },
    { id: 'profile', exId: 'ex-footer', annId: 'ann-profile', lineId: 'line-profile', dotId: 'dot-profile' },
    { id: 'health', exId: 'ex-footer', annId: 'ann-health', lineId: 'line-health', dotId: 'dot-health' },
  ];

  // Topbar annotation pieces — point to extracted topbar elements
  const TB_ANNOTS = [
    { id: 'toggle', tbId: 'ex-tb-toggle', annId: 'ann-toggle', lineId: 'line-toggle', dotId: 'dot-toggle' },
    { id: 'search', tbId: 'ex-tb-search', annId: 'ann-search', lineId: 'line-search', dotId: 'dot-search' },
    { id: 'tz', tbId: 'ex-tb-tz', annId: 'ann-tz', lineId: 'line-tz', dotId: 'dot-tz' },
    { id: 'lang', tbId: 'ex-tb-lang', annId: 'ann-lang', lineId: 'line-lang', dotId: 'dot-lang' },
    { id: 'errors', tbId: 'ex-tb-errors', annId: 'ann-errors', lineId: 'line-errors', dotId: 'dot-errors' },
    { id: 'notif', tbId: 'ex-tb-notif', annId: 'ann-notif', lineId: 'line-notif', dotId: 'dot-notif' },
    { id: 'ai', tbId: 'ex-tb-ai', annId: 'ann-ai', lineId: 'line-ai', dotId: 'dot-ai' },
    { id: 'theme', tbId: 'ex-tb-theme', annId: 'ann-theme', lineId: 'line-theme', dotId: 'dot-theme' },
  ];

  // Content area annotation pieces — point to extracted content elements
  const CONTENT_ANNOTS = [
    { id: 'breadcrumb', ctId: 'ex-content-breadcrumb', annId: 'ann-breadcrumb', lineId: 'line-breadcrumb', dotId: 'dot-breadcrumb' },
    { id: 'bc-menu', ctId: 'ex-content-bc-menu', annId: 'ann-bc-menu', lineId: 'line-bc-menu', dotId: 'dot-bc-menu' },
    { id: 'page-title', ctId: 'ex-content-title', annId: 'ann-page-title', lineId: 'line-page-title', dotId: 'dot-page-title' },
  ];

  // Build scene dots — 5 phase bullets (Start + Sidebar + Topbar + Content + Conclusion)
  // Each target is a custom progress point where the animation is "done" (extraction complete, annotations + claim visible)
  if (dotsContainer) {
    const dotPhases = [
      { label: 'Start', target: 0.0 },        // Very beginning
      { label: 'Sidebar', target: 0.30 },     // Sidebar anatomy: annotations + claim fully visible
      { label: 'Topbar', target: 0.60 },      // Topbar anatomy: annotations + claim fully visible
      { label: 'Content', target: 0.88 },     // Content anatomy: annotations + claim fully visible
      { label: 'Conclusion', target: 1.0 },   // Final conclusion claim visible
    ];
    dotPhases.forEach((dp, i) => {
      const dot = document.createElement('button');
      dot.className = 'scene-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', dp.label);
      const mark = document.createElement('span');
      mark.className = 'dot-mark';
      const label = document.createElement('span');
      label.className = 'dot-label';
      label.textContent = dp.label;
      dot.appendChild(mark);
      dot.appendChild(label);
      dot.addEventListener('click', () => {
        const target = track.offsetTop + dp.target * (track.offsetHeight - window.innerHeight);
        window.scrollTo({ top: target + 1, behavior: reducedMotion ? 'auto' : 'smooth' });
      });
      dotsContainer.appendChild(dot);
    });
  }

  if (reducedMotion) {
    screenMock.style.transform = 'translate(-50%, -50%) scale(0.7) translateX(25%)';
    return;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function smoothstep(e0, e1, x) { const t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); }

  let currentPhaseIdx = -1;
  let ticking = false;

  // ===== Connector drawing =====
  function drawConnector(lineEl, dotEl, fromX, fromY, toX, toY) {
    if (!lineEl || !dotEl) return;
    lineEl.setAttribute('x1', fromX);
    lineEl.setAttribute('y1', fromY);
    lineEl.setAttribute('x2', toX);
    lineEl.setAttribute('y2', toY);
    dotEl.setAttribute('cx', fromX);
    dotEl.setAttribute('cy', fromY);
  }

  function updateSidebarConnectors() {
    const canvasRect = canvas.getBoundingClientRect();
    SB_ANNOTS.forEach(a => {
      const exEl = document.getElementById(a.exId);
      const annEl = document.getElementById(a.annId);
      if (!exEl || !annEl) return;
      const exRect = exEl.getBoundingClientRect();
      const annRect = annEl.getBoundingClientRect();
      if (exRect.width === 0 || annRect.width === 0) return;

      // For profile and health, both point to the footer but at different vertical positions
      let targetY;
      if (a.id === 'profile') {
        // Point to the "Profilo" label area
        const footer = document.getElementById('ex-footer');
        const fRect = footer.getBoundingClientRect();
        targetY = fRect.top + 15 - canvasRect.top;
      } else if (a.id === 'health') {
        // Point to the badges area
        const footer = document.getElementById('ex-footer');
        const fRect = footer.getBoundingClientRect();
        targetY = fRect.bottom - 15 - canvasRect.top;
      } else {
        targetY = exRect.top + exRect.height / 2 - canvasRect.top;
      }

      // Dot at right edge of annotation
      const dotX = annRect.right - canvasRect.left;
      const dotY = annRect.top + annRect.height / 2 - canvasRect.top;
      // Line to left edge of extracted sidebar
      const targetX = exRect.left - canvasRect.left;

      drawConnector(document.getElementById(a.lineId), document.getElementById(a.dotId), dotX, dotY, targetX, targetY);
    });
  }

  function updateTopbarConnectors() {
    const canvasRect = canvas.getBoundingClientRect();
    // Items that are horizontally aligned (left/right of topbar) need side connectors
    // Items below topbar need top connectors (dot on top, line goes up)
    const sideItems = { toggle: 'right', theme: 'left' };
    const belowItems = ['lang', 'notif', 'ai'];

    TB_ANNOTS.forEach(a => {
      const tbEl = document.getElementById(a.tbId);
      const annEl = document.getElementById(a.annId);
      if (!tbEl || !annEl) return;
      const tbRect = tbEl.getBoundingClientRect();
      const annRect = annEl.getBoundingClientRect();
      if (tbRect.width === 0 || annRect.width === 0) return;

      let dotX, dotY, targetX, targetY;

      if (sideItems[a.id] === 'right') {
        // toggle: dot at right edge of annotation, line to left side of topbar element
        dotX = annRect.right - canvasRect.left;
        dotY = annRect.top + annRect.height / 2 - canvasRect.top;
        targetX = tbRect.left - canvasRect.left;
        targetY = tbRect.top + tbRect.height / 2 - canvasRect.top;
      } else if (sideItems[a.id] === 'left') {
        // theme: dot at left edge of annotation, line to right side of topbar element
        dotX = annRect.left - canvasRect.left;
        dotY = annRect.top + annRect.height / 2 - canvasRect.top;
        targetX = tbRect.right - canvasRect.left;
        targetY = tbRect.top + tbRect.height / 2 - canvasRect.top;
      } else if (belowItems.includes(a.id)) {
        // below topbar: dot at top edge of annotation, line to bottom center of topbar element
        dotX = annRect.left + annRect.width / 2 - canvasRect.left;
        dotY = annRect.top - canvasRect.top;
        targetX = tbRect.left + tbRect.width / 2 - canvasRect.left;
        targetY = tbRect.bottom - canvasRect.top;
      } else {
        // default: dot at bottom edge of annotation, line to top center of topbar element
        dotX = annRect.left + annRect.width / 2 - canvasRect.left;
        dotY = annRect.bottom - canvasRect.top;
        targetX = tbRect.left + tbRect.width / 2 - canvasRect.left;
        targetY = tbRect.top - canvasRect.top;
      }

      drawConnector(document.getElementById(a.lineId), document.getElementById(a.dotId), dotX, dotY, targetX, targetY);
    });
  }

  // ===== Annotation positioning =====
  // Per-annotation Y offsets to prevent overlap
  const SB_ANN_OFFSETS = { org: -25, module: 0, nav: -20, profile: -20, health: 0 };

  function positionSidebarAnnotations() {
    const canvasRect = canvas.getBoundingClientRect();
    const exRect = sidebarExtracted.getBoundingClientRect();
    const annWidth = 200;
    const gap = 30;
    const minGap = 15;
    const annH = 60;
    const positions = [];

    SB_ANNOTS.forEach(a => {
      const exEl = document.getElementById(a.exId);
      const annEl = document.getElementById(a.annId);
      if (!exEl || !annEl) return;

      let targetY;
      if (a.id === 'profile') {
        const footer = document.getElementById('ex-footer');
        targetY = footer.getBoundingClientRect().top + 15 - canvasRect.top;
      } else if (a.id === 'health') {
        const footer = document.getElementById('ex-footer');
        targetY = footer.getBoundingClientRect().bottom - 15 - canvasRect.top;
      } else {
        const exElRect = exEl.getBoundingClientRect();
        targetY = exElRect.top + exElRect.height / 2 - canvasRect.top;
      }

      // Apply per-annotation offset
      targetY += (SB_ANN_OFFSETS[a.id] || 0);

      const leftPx = sidebarExtracted.offsetLeft - annWidth - gap;
      let topPx = targetY - annH / 2;
      positions.push({ el: annEl, leftPx, topPx });
    });

    // Enforce min spacing
    for (let i = 1; i < positions.length; i++) {
      const prevBottom = positions[i - 1].topPx + annH;
      if (positions[i].topPx < prevBottom + minGap) {
        positions[i].topPx = prevBottom + minGap;
      }
    }

    positions.forEach(p => {
      p.el.style.left = Math.max(10, p.leftPx) + 'px';
      p.el.style.top = p.topPx + 'px';
    });
  }

  function positionTopbarAnnotations() {
    const canvasRect = canvas.getBoundingClientRect();
    const annWidth = 160;
    const annH = 90;  // actual card height (title + desc)
    const gap = 15;
    const rowOffset = annH + 5;

    const exRect = topbarExtracted.getBoundingClientRect();
    const exLeft = exRect.left - canvasRect.left;
    const exRight = exRect.right - canvasRect.left;
    const exTop = exRect.top - canvasRect.top;
    const exWidth = exRect.width;

    // Positions: leftRatio is relative to topbar width (0=start, 1=end)
    // toggle → LEFT of topbar, horizontally aligned (same Y as topbar)
    // search → left area, above
    // tz → center-to-RIGHT (near its target element)
    // lang, errors, notif, ai → right side, staggered
    // theme → RIGHT of topbar, horizontally aligned (same Y as topbar)
    const positions = {
      toggle:  { leftRatio: -0.12, row: -1 },  // same Y as topbar, left
      search:  { leftRatio:  0.1947, row: 0.5 },
      tz:      { leftRatio:  0.7122, row: 0.5 },
      lang:    { leftRatio:  0.72, row: -2 },
      errors:  { leftRatio:  0.884, row: 0.5 },
      notif:   { leftRatio:  0.9244, row: -2 },
      ai:      { leftRatio:  0.362, row: -2 },
      theme:   { leftRatio:  1.12, row: -1 },  // same Y as topbar, right
    };

    TB_ANNOTS.forEach(a => {
      const annEl = document.getElementById(a.annId);
      if (!annEl) return;

      const pos = positions[a.id];
      if (!pos) return;

      let leftPx = exLeft + exWidth * pos.leftRatio - annWidth / 2;
      // row -1 = horizontally aligned with topbar (same Y center)
      // row -2 = below topbar, overlapping mock screen
      // row 0+ = above topbar, staggered up (supports fractional rows)
      let topPx;
      if (pos.row === -1) {
        topPx = exTop + exRect.height / 2 - annH / 2;
      } else if (pos.row === -2) {
        topPx = exRect.bottom + gap;
      } else {
        topPx = exTop - annH - gap - pos.row * rowOffset;
      }

      leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
      if (topPx < 10) topPx = 10;

      annEl.style.left = leftPx + 'px';
      annEl.style.top = topPx + 'px';
      annEl.style.width = annWidth + 'px';
      const card = annEl.querySelector('.ann-card');
      if (card) card.style.width = annWidth + 'px';
    });
  }

  // ===== Content annotation positioning =====
  function positionContentAnnotations() {
    const canvasRect = canvas.getBoundingClientRect();
    const ctRect = contentExtracted.getBoundingClientRect();
    const ctLeft = ctRect.left - canvasRect.left;
    const ctTop = ctRect.top - canvasRect.top;
    const ctWidth = ctRect.width;
    const ctRight = ctLeft + ctWidth;
    const annWidth = 200;
    const gap = 20;

    // breadcrumb annotation: aligned with content area TOP edge, LEFT of content
    // bc-menu annotation: to the RIGHT of the dropdown menu, overlapping only the content area
    // page-title annotation: a bit below (aligned with title text inside, but not overlapping breadcrumb)
    const titleEl = document.getElementById('ex-content-title');
    const titleRect = titleEl.getBoundingClientRect();
    const menuEl = document.getElementById('ex-content-bc-menu');
    const menuRect = menuEl.getBoundingClientRect();
    const minGap = 15;
    let breadcrumbTop = ctTop;
    let titleTop = titleRect.top - canvasRect.top;
    const annH = 90; // annotation card height
    if (titleTop < breadcrumbTop + annH + minGap) {
      titleTop = breadcrumbTop + annH + minGap;
    }
    const positions = {
      breadcrumb: breadcrumbTop,
      'bc-menu': (menuRect.top + menuRect.height / 2) - canvasRect.top - annH / 2,
      'page-title': titleTop,
    };

    CONTENT_ANNOTS.forEach(a => {
      const annEl = document.getElementById(a.annId);
      if (!annEl) return;

      const topPx = positions[a.id];
      if (topPx === undefined) return;

      let leftPx;
      if (a.id === 'bc-menu') {
        // Position to the RIGHT of the dropdown menu, with more gap, overlapping only the content area
        const menuRight = menuRect.right - canvasRect.left;
        leftPx = menuRight + 40;
        // Clamp so it doesn't go off the right edge of the content area
        leftPx = Math.min(leftPx, ctRight - annWidth - 10);
      } else {
        // Position to the LEFT of the content area
        leftPx = ctLeft - annWidth - gap;
      }

      leftPx = Math.max(10, leftPx);
      const clampedTop = Math.max(10, topPx);

      annEl.style.left = leftPx + 'px';
      annEl.style.top = clampedTop + 'px';
      annEl.style.width = annWidth + 'px';
      const card = annEl.querySelector('.ann-card');
      if (card) card.style.width = annWidth + 'px';
    });
  }

  function updateContentConnectors() {
    const canvasRect = canvas.getBoundingClientRect();

    CONTENT_ANNOTS.forEach(a => {
      const ctEl = document.getElementById(a.ctId);
      const annEl = document.getElementById(a.annId);
      if (!ctEl || !annEl) return;
      const ctRect = ctEl.getBoundingClientRect();
      const annRect = annEl.getBoundingClientRect();
      if (ctRect.width === 0 || annRect.width === 0) return;

      let dotX, dotY, targetX, targetY;
      if (a.id === 'bc-menu') {
        // bc-menu annotation is to the RIGHT of the dropdown: horizontal connector
        // Both Y values use the dropdown's vertical center for a straight horizontal line
        const menuCenterY = ctRect.top + ctRect.height / 2 - canvasRect.top;
        dotX = annRect.left - canvasRect.left;
        dotY = menuCenterY;
        targetX = ctRect.right - canvasRect.left;
        targetY = menuCenterY;
      } else {
        // Default: connector from RIGHT edge of annotation to LEFT edge of content element
        dotX = annRect.right - canvasRect.left;
        dotY = annRect.top + annRect.height / 2 - canvasRect.top;
        targetX = ctRect.left - canvasRect.left;
        targetY = ctRect.top + ctRect.height / 2 - canvasRect.top;
      }

      drawConnector(document.getElementById(a.lineId), document.getElementById(a.dotId), dotX, dotY, targetX, targetY);
    });
  }

  // ===== Main update loop =====
  function update() {
    const rect = track.getBoundingClientRect();
    const vh = window.innerHeight;
    const totalScroll = track.offsetHeight - vh;
    const scrolled = Math.max(0, -rect.top);
    const progress = clamp01(scrolled / totalScroll);

    if (railFill) railFill.style.height = (progress * 100) + '%';

    // Fade out scroll hint as user starts scrolling (gone by 5% progress)
    const scrollHintEl = document.getElementById('scroll-hint');
    if (scrollHintEl) scrollHintEl.style.opacity = clamp01(1 - progress / 0.05);

    // Section claim: appears during sidebar extraction (phase 2) and anatomy (phase 3),
    // fades out during reassembly (phase 4)
    const claimEl = document.getElementById('section-claim');
    if (claimEl) {
      const claimIn = smoothstep(PHASES[2].start + 0.02, PHASES[2].end, progress);
      const claimOut = smoothstep(PHASES[4].start, PHASES[4].end, progress);
      claimEl.style.opacity = claimIn * (1 - claimOut);
    }

    // Topbar section claim: appears during topbar extraction (phase 6), fades out during reassembly (phase 7)
    // Positioned so its bottom aligns with the mock screen's bottom
    const claimTbEl = document.getElementById('section-claim-topbar');
    if (claimTbEl) {
      const claimTbIn = smoothstep(PHASES[6].start + 0.05, PHASES[6].start + 0.15, progress);
      const claimTbOut = smoothstep(PHASES[7].start, PHASES[7].end, progress);
      claimTbEl.style.opacity = claimTbIn * (1 - claimTbOut);
      // Align claim bottom to mock bottom
      const mockRectClaim = screenMock.getBoundingClientRect();
      const claimRect = claimTbEl.getBoundingClientRect();
      claimTbEl.style.top = (mockRectClaim.bottom - claimRect.height + 26) + 'px';
    }

    // Content section claim: appears during content extraction (phase 9), fades out during reassembly (phase 10)
    const claimContentEl = document.getElementById('section-claim-content');
    if (claimContentEl) {
      const claimContentIn = smoothstep(PHASES[9].start + 0.06, PHASES[9].start + 0.10, progress);
      const claimContentOut = smoothstep(PHASES[10].start, PHASES[10].end, progress);
      claimContentEl.style.opacity = claimContentIn * (1 - claimContentOut);
    }

    // Final conclusion claim: appears during phase 12, stays till end
    const claimFinalEl = document.getElementById('section-claim-final');
    if (claimFinalEl) {
      const claimFinalIn = smoothstep(PHASES[12].start, PHASES[12].end, progress);
      claimFinalEl.style.opacity = claimFinalIn;
    }

    // Phase tracking
    let phaseIdx = 0;
    for (let i = PHASES.length - 1; i >= 0; i--) {
      if (progress >= PHASES[i].start) { phaseIdx = i; break; }
    }
    if (phaseIdx !== currentPhaseIdx) {
      currentPhaseIdx = phaseIdx;
      if (dotsContainer) {
        // 5 dots: Start (0-1), Sidebar (2-5), Topbar (6-8), Content (9-11), Conclusion (12)
        const dotIdx = phaseIdx >= 12 ? 4 : (phaseIdx >= 9 ? 3 : (phaseIdx >= 6 ? 2 : (phaseIdx >= 2 ? 1 : 0)));
        dotsContainer.querySelectorAll('.scene-dot').forEach((d, i) => d.classList.toggle('active', i === dotIdx));
      }
      if (phaseLabel) phaseLabel.textContent = PHASES[phaseIdx].name;
    }

    // ===== Screen mock transform =====
    // Phase 0: full size, centered
    // Phase 1: shrink to 0.75, move right
    // Phase 2-3: stay at 0.75, right
    // Phase 4: sidebar reassembles (stay right)
    // Phase 5: move back to center, slightly down
    // Phase 6: move down more to make room for extracted topbar above
    // Phase 7: topbar reassembles (stay in topbar position)
    // Phase 8: recenter to true center (both H and V), scale up slightly
    // Phase 9: content area extracts

    const pShrink = smoothstep(PHASES[1].start, PHASES[1].end, progress);
    const pMoveRight = smoothstep(PHASES[1].start, PHASES[2].end, progress);
    const pRecenter = smoothstep(PHASES[5].start, PHASES[5].end, progress);
    const pMoveDown = smoothstep(PHASES[6].start, PHASES[6].start + 0.08, progress);
    const pRecenterContent = smoothstep(PHASES[8].start, PHASES[8].end, progress);
    // Phase 11: return to origin — reverse all transforms back to scale 1.0, centered
    const pReturn = smoothstep(PHASES[11].start, PHASES[11].end, progress);
    const returnFactor = 1 - pReturn;

    // Scale: 1.0 → 0.75 → 0.75 (stays) → 0.75 (recenter) → 0.85 (recenter for content) → 1.0 (return)
    const scale = (lerp(1.0, 0.75, pShrink) + lerp(0, 0.10, pRecenterContent)) * returnFactor + 1.0 * pReturn;
    // TranslateX: 0 → 28% (right) → 0 (back to center) → stays 0 → 0 (return)
    const tx = lerp(0, 28, pMoveRight) * (1 - pRecenter) * returnFactor;
    // TranslateY: 0 → slight down during recenter → more down for topbar → back to 0 for content → 0 (return)
    const ty = (lerp(0, 5, pRecenter) + lerp(0, 18, pMoveDown)) * (1 - pRecenterContent) * returnFactor;

    screenMock.style.transform = `translate(-50%, -50%) scale(${scale}) translate(${tx}%, ${ty}%)`;

    // ===== Topbar extraction + reassembly =====
    // Topbar slides UP out of the mock's top edge, starting from the RIGHT edge of the mock
    // During phase 7, topbar reassembles back into the mock
    const pTbExtract = smoothstep(PHASES[6].start + 0.03, PHASES[6].start + 0.10, progress);
    const pTbReassemble = smoothstep(PHASES[7].start, PHASES[7].end, progress);
    const tbAmount = pTbExtract * (1 - pTbReassemble);

    if (topbarExtracted) {
      const mockRect2 = screenMock.getBoundingClientRect();
      const canvasRect2 = canvas.getBoundingClientRect();
      const mockTop = mockRect2.top - canvasRect2.top;
      const mockLeft = mockRect2.left - canvasRect2.left;
      const mockWidth = mockRect2.width;

      // Start: at the mock's top (as if inside the screen), right-aligned to mock
      const startTop = mockTop + 8;
      // End: just below current position, with slight overlap over the mock
      const endTop = mockTop - 25;

      const curTop = lerp(startTop, endTop, tbAmount);
      const tbScale = lerp(scale, 1.0, tbAmount);

      // Width: slightly wider than mock
      const tbWidth = mockWidth * 1.10;
      // Start position: right-aligned to mock's right edge (accounting for scale)
      const startLeft = mockLeft + mockWidth - tbWidth / 2 - (tbWidth / 2) * tbScale;
      // End position: centered over the mock (scale=1, so simple centering)
      const endLeft = mockLeft + mockWidth / 2 - tbWidth / 2;
      // Animate left from right-aligned to centered
      const curLeft = lerp(startLeft, endLeft, tbAmount);

      topbarExtracted.style.opacity = tbAmount > 0.01 ? 1 : 0;
      topbarExtracted.style.left = curLeft + 'px';
      topbarExtracted.style.top = curTop + 'px';
      topbarExtracted.style.width = tbWidth + 'px';
      topbarExtracted.style.transform = `scale(${tbScale})`;
      topbarExtracted.style.transformOrigin = 'top center';
      topbarExtracted.classList.toggle('glow-border', tbAmount > 0.95);
    }

    // ===== Sidebar extraction =====
    const pExtract = smoothstep(PHASES[2].start, PHASES[2].end, progress);
    const pReassemble = smoothstep(PHASES[4].start, PHASES[4].end, progress);

    // Show gap in the screen mock's sidebar when extracting
    sidebarGap.style.opacity = pExtract * (1 - pReassemble);

    // Extracted sidebar: slides LEFT out of the screen mock's left edge
    // NO vertical movement — same Y throughout
    // NO slow fade — appears instantly when extraction starts
    const canvasH = canvas.offsetHeight;
    const mockRect = screenMock.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    // The mock's vertical center (where the sidebar sits) — same for start and end
    const mockCenterY = mockRect.top + mockRect.height / 2 - canvasRect.top;

    // Start position: exactly at the mock's left edge (as if it's still inside the screen)
    const startLeft = mockRect.left - canvasRect.left;

    // End position: slightly overlapping the mock's left edge
    const endLeft = 380;

    // During extraction: slide left from start to end
    // During reassembly: slide back from end to start
    const extractAmount = pExtract * (1 - pReassemble);

    const curLeft = lerp(startLeft, endLeft, extractAmount);

    // Scale: start at mock's scale (0.75) and zoom in to 1.0 as it slides out
    const exScale = lerp(scale, 1.0, extractAmount);

    // Opacity: snap to 1 as soon as extraction begins (no slow fade)
    // Use a hard threshold — visible when extractAmount > 0.01
    sidebarExtracted.style.opacity = extractAmount > 0.01 ? 1 : 0;
    sidebarExtracted.style.left = curLeft + 'px';
    sidebarExtracted.style.top = mockCenterY + 'px';
    // Scale matches mock at start, grows to full size as it slides out
    sidebarExtracted.style.transform = `translateY(-50%) scale(${exScale})`;
    sidebarExtracted.classList.toggle('detached', extractAmount > 0.1);

    // ===== Sidebar annotations — all fade in together =====
    const pSbAnnotate = smoothstep(PHASES[3].start, PHASES[3].end, progress);
    const pSbFadeOut = smoothstep(PHASES[4].start, PHASES[4].end, progress);

    // Animated glow border when sidebar is in end position
    sidebarExtracted.classList.toggle('glow-border', extractAmount > 0.95 && pSbFadeOut < 0.1);

    SB_ANNOTS.forEach((a, i) => {
      const annEl = document.getElementById(a.annId);
      const line = document.getElementById(a.lineId);
      const dot = document.getElementById(a.dotId);
      if (!annEl) return;

      const opacity = pSbAnnotate * (1 - pSbFadeOut);

      annEl.style.opacity = opacity;
      if (line) line.classList.toggle('visible', opacity > 0.5);
      if (dot) dot.classList.toggle('visible', opacity > 0.5);
    });

    if (extractAmount > 0.3 && pSbFadeOut < 0.5) {
      positionSidebarAnnotations();
      updateSidebarConnectors();
    }

    // ===== Topbar annotations — fade in AFTER topbar extraction completes, fade out during reassembly =====
    const tbExtractEnd = PHASES[6].start + 0.10;  // extraction ends at start+0.10
    const pTbAnnotate = smoothstep(tbExtractEnd, tbExtractEnd + 0.05, progress);
    const pTbAnnFadeOut = smoothstep(PHASES[7].start, PHASES[7].end, progress);
    const tbAnnOpacity = pTbAnnotate * (1 - pTbAnnFadeOut);

    TB_ANNOTS.forEach((a, i) => {
      const annEl = document.getElementById(a.annId);
      const line = document.getElementById(a.lineId);
      const dot = document.getElementById(a.dotId);
      if (!annEl) return;

      annEl.style.opacity = tbAnnOpacity;
      if (line) line.classList.toggle('visible', tbAnnOpacity > 0.5);
      if (dot) dot.classList.toggle('visible', tbAnnOpacity > 0.5);
    });

    if (tbAnnOpacity > 0.05) {
      positionTopbarAnnotations();
      updateTopbarConnectors();
    }

    // ===== Content area extraction + reassembly =====
    // Step 1: slide content area left to center it (same size)
    // Step 2: zoom out from centered position to final size
    // Phase 10: reverse — zoom back in, then slide back to original position
    // Spread extraction across ~8% of scroll (matching sidebar's pacing)
    const pContentSlide = smoothstep(PHASES[9].start, PHASES[9].start + 0.04, progress);
    const pContentZoom = smoothstep(PHASES[9].start + 0.04, PHASES[9].start + 0.08, progress);
    const pContentReassemble = smoothstep(PHASES[10].start, PHASES[10].end, progress);
    // Effective amounts: extraction * (1 - reassembly)
    const effSlide = pContentSlide * (1 - pContentReassemble);
    const effZoom = pContentZoom * (1 - pContentReassemble);

    if (contentExtracted) {
      const canvasRect3 = canvas.getBoundingClientRect();
      // Get the actual content area inside the mock
      const mockContent = screenMock.querySelector('.pb-content');
      const contentRect = mockContent.getBoundingClientRect();

      // Start position: exact position and size of .pb-content inside the mock
      const startLeft = contentRect.left - canvasRect3.left;
      const startTop = contentRect.top - canvasRect3.top;
      const startWidth = contentRect.width;
      const startHeight = contentRect.height;

      // After slide: centered horizontally, same size, same vertical position
      const slidLeft = canvasRect3.width / 2 - startWidth / 2;
      const slidTop = startTop;

      // End position: centered in canvas, larger (zoom out)
      const endWidth = canvasRect3.width * 0.55;
      const endHeight = canvasRect3.height * 0.70;
      const endLeft = canvasRect3.width / 2 - endWidth / 2;
      const endTop = canvasRect3.height / 2 - endHeight / 2;

      // Step 1: slide left to center (interpolate left only)
      const curLeftSlide = lerp(startLeft, slidLeft, effSlide);
      // Step 2: zoom out from slid position to end position
      const curLeft = lerp(curLeftSlide, endLeft, effZoom);
      const curTop = lerp(slidTop, endTop, effZoom);
      const curWidth = lerp(startWidth, endWidth, effZoom);
      const curHeight = lerp(startHeight, endHeight, effZoom);

      const contentVisible = (effSlide > 0.01 || effZoom > 0.01);
      contentExtracted.style.opacity = contentVisible ? 1 : 0;
      contentExtracted.style.left = curLeft + 'px';
      contentExtracted.style.top = curTop + 'px';
      contentExtracted.style.width = curWidth + 'px';
      contentExtracted.style.height = curHeight + 'px';
      contentExtracted.style.transform = 'scale(1)';
      contentExtracted.style.transformOrigin = 'center center';
      contentExtracted.classList.toggle('glow-border', effZoom > 0.95 && pContentReassemble < 0.1);
    }

    // ===== Content annotations — fade in AFTER content zoom completes =====
    const contentExtractEnd = PHASES[9].start + 0.08;
    const pContentAnnotate = smoothstep(contentExtractEnd, contentExtractEnd + 0.03, progress);
    const pContentAnnotateOut = smoothstep(PHASES[10].start, PHASES[10].start + 0.03, progress);
    const pContentAnnotateVis = pContentAnnotate * (1 - pContentAnnotateOut);

    CONTENT_ANNOTS.forEach((a) => {
      const annEl = document.getElementById(a.annId);
      const line = document.getElementById(a.lineId);
      const dot = document.getElementById(a.dotId);
      if (!annEl) return;

      annEl.style.opacity = pContentAnnotateVis;
      if (line) line.classList.toggle('visible', pContentAnnotateVis > 0.5);
      if (dot) dot.classList.toggle('visible', pContentAnnotateVis > 0.5);
    });

    if (pContentAnnotateVis > 0.05 && contentExtracted) {
      positionContentAnnotations();
      updateContentConnectors();
    }

    // Update SVG size
    connectorsSvg.setAttribute('width', canvas.offsetWidth);
    connectorsSvg.setAttribute('height', canvas.offsetHeight);

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
}
