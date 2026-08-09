/* ============================================================
   Primebrick Demo — Entity List Table scroll-jacking engine
   Extracted from entities-v2.html inline IIFE.
   Shared helpers imported from demo-utils.ts.
   ============================================================ */

import {
  lerp,
  clamp01,
  smoothstep,
  drawConnector,
  buildSceneDots,
  fadeScrollHint,
  positionAnnotation as _positionAnnotation,
  updateConnector as _updateConnector,
  type AnnotationSide,
} from './demo-utils';

export function initEntityListTableScroll(): void {
(function() {
  const track = document.getElementById('track');
  const screenMock = document.getElementById('screen-mock');
  const contentArea = document.getElementById('content-area');
  const railFill = document.getElementById('rail-fill');
  const dotsContainer = document.getElementById('dots');
  const phaseLabel = document.getElementById('phase-label');
  const canvas = document.getElementById('canvas');
  const connectorsSvg = document.getElementById('connectors');
  if (!track || !screenMock || !contentArea) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== Phases (19) =====
  // Section 1: The Table (phases 1-2)
  // Section 2: Search & Filter (phases 3-6)
  // Section 3: Column Management (phases 7-10)
  // Section 4: Selection (phase 11)
  // Section 5: Sorting & Row Actions (phases 12-13)
  // Section 6: View Modes & Deletion (phases 14-15)
  // Section 7: Bulk Ops & Preview (phases 16-17)
  // Conclusion (phase 18)
  const PHASES = [
    { name: 'The Entity List Table', start: 0.000, end: 0.048 },
    { name: 'Metadata-driven table', start: 0.048, end: 0.145 },
    { name: 'Server-side pagination', start: 0.145, end: 0.213 },
    { name: 'Search & Search In', start: 0.213, end: 0.280 },
    { name: 'Standard filters', start: 0.280, end: 0.348 },
    { name: 'Advanced filter builder', start: 0.348, end: 0.406 },
    { name: 'Standard filters panel', start: 0.406, end: 0.464 },
    { name: 'Column selector', start: 0.464, end: 0.522 },
    { name: 'IANA datetime — browser mode', start: 0.522, end: 0.580 },
    { name: 'IANA datetime — record mode', start: 0.580, end: 0.638 },
    { name: 'Sticky columns', start: 0.638, end: 0.696 },
    { name: 'Row selection', start: 0.696, end: 0.764 },
    { name: 'Sorting — 3-state', start: 0.764, end: 0.832 },
    { name: 'CRUD row actions', start: 0.832, end: 0.880 },
    { name: 'View modes', start: 0.880, end: 0.935 },
    { name: 'Deletion filter', start: 0.935, end: 0.960 },
    { name: 'Bulk actions', start: 0.960, end: 0.975 },
    { name: 'Preview panel', start: 0.975, end: 1.00 },
  ];

  // Section ranges (for section-claim opacity): [startPhaseIdx, endPhaseIdx]
  const SECTIONS = [
    { id: 'claim-0',     start: 0, end: 0 },
    { id: 'claim-1',     start: 1, end: 1 },
    { id: 'claim-2-pag', start: 2, end: 2 },
    { id: 'claim-2',     start: 3, end: 6 },
    { id: 'claim-3',     start: 7, end: 10 },
    { id: 'claim-4',     start: 11, end: 11 }, // Selection only now
    { id: 'claim-5',     start: 12, end: 13 }, // Sorting & Row Actions
    { id: 'claim-6',     start: 14, end: 15 }, // View Modes & Deletion
    { id: 'claim-7',     start: 16, end: 17 }, // Bulk Ops & Preview
  ];

  // Sub-extractions: each {id, exId, annId, lineId, dotId}
  // phaseIdx = which PHASE index triggers this extraction
  // NOTE: 'table' removed — phases 0-1 slide the mock right instead of extracting
  // NOTE: 'pagination' handled specially (slides DOWN from mock bottom like shell-v2 topbar)
  const SUBS = [
    { id: 'pagination',  exId: 'ex-pagination',  annId: 'ann-pagination',  lineId: 'line-pagination',  dotId: 'dot-pagination',  phaseIdx: 2,  side: 'bottom', special: 'pagination-bottom' },
    { id: 'search',      exId: 'ex-search',      annId: 'ann-search',      lineId: 'line-search',      dotId: 'dot-search',      phaseIdx: 3,  side: 'top-left', special: 'search-fixed' },
    { id: 'searchin',    exId: 'ex-searchin',    annId: 'ann-searchin',    lineId: 'line-searchin',    dotId: 'dot-searchin',    phaseIdx: 3,  side: 'left', special: 'sheet-right' },
    { id: 'filterchips', exId: 'ex-filterchips', annId: 'ann-filterchips', lineId: 'line-filterchips', dotId: 'dot-filterchips', phaseIdx: 4,  side: 'top', special: 'toolbar-up' },
    { id: 'advfilter',   exId: 'ex-advfilter',   annId: 'ann-advfilter',   lineId: 'line-advfilter',   dotId: 'dot-advfilter',   phaseIdx: 5,  side: 'right', special: 'sheet-right' },
    { id: 'stdfilter',   exId: 'ex-advfilter',   annId: 'ann-stdfilter',   lineId: 'line-stdfilter',   dotId: 'dot-stdfilter',   phaseIdx: 6,  side: 'right', special: 'sheet-right-standard' },
    { id: 'datetime',    exId: 'ex-datetime',    annId: 'ann-datetime',    lineId: 'line-datetime',    dotId: 'dot-datetime',    phaseIdx: 8,  side: 'right', special: 'datetime-column' },
    { id: 'datetime-iana', exId: 'ex-datetime',  annId: 'ann-datetime-iana', lineId: 'line-datetime-iana', dotId: 'dot-datetime-iana', phaseIdx: 9, side: 'right', special: 'datetime-iana-toggle' },
    { id: 'colsel',      exId: 'ex-colsel',      annId: 'ann-colsel',      lineId: 'line-colsel',      dotId: 'dot-colsel',      phaseIdx: 7,  side: 'right', special: 'sheet-right' },
    { id: 'sticky-name',   exId: 'ex-sticky-name',   annId: 'ann-sticky-name',   lineId: 'line-sticky-name',   dotId: 'dot-sticky-name',   phaseIdx: 10, side: 'left',  special: 'sticky-name-column' },
    { id: 'sticky-action', exId: 'ex-sticky-action', annId: 'ann-sticky-action', lineId: 'line-sticky-action', dotId: 'dot-sticky-action', phaseIdx: 10, side: 'right', special: 'sticky-action-column' },
    { id: 'selection',   exId: 'ex-selection',   annId: 'ann-selection',   lineId: 'line-selection',   dotId: 'dot-selection',   phaseIdx: 11, side: 'top',  special: 'selection-mock' },
    { id: 'sorting',     exId: 'ex-sorting',     annId: 'ann-sorting',     lineId: 'line-sorting',     dotId: 'dot-sorting',     phaseIdx: 12, side: 'top',  special: 'sorting-mock' },
    { id: 'rowactions',  exId: 'ex-rowactions',  annId: 'ann-rowactions',  lineId: 'line-rowactions',  dotId: 'dot-rowactions',  phaseIdx: 13, side: 'bottom', special: 'rowactions-dropdown' },
    { id: 'viewmode',    exId: 'ex-viewmode',    annId: 'ann-viewmode',    lineId: 'line-viewmode',    dotId: 'dot-viewmode',    phaseIdx: 14, side: 'top',  special: 'viewmode-mock' },
    { id: 'deletion',    exId: 'ex-deletion',    annId: 'ann-deletion',    lineId: 'line-deletion',    dotId: 'dot-deletion',    phaseIdx: 15, side: 'top', special: 'deletion-mock' },
    { id: 'bulk',        exId: 'ex-bulk',        annId: 'ann-bulk',        lineId: 'line-bulk',        dotId: 'dot-bulk',        phaseIdx: 16, side: 'top', special: 'bulk-mock' },
    { id: 'preview',     exId: 'ex-preview',     annId: 'ann-preview',     lineId: 'line-preview',     dotId: 'dot-preview',     phaseIdx: 17, side: 'right', special: 'preview-mock' },
  ];

  // Build scene dots — 7 section landmarks + Start
  if (dotsContainer) {
    buildSceneDots(dotsContainer as HTMLElement, track as HTMLElement, [
      { label: 'Start', target: 0.0 },
      { label: 'Table', target: 0.08 },
      { label: 'Search & Filter', target: 0.30 },
      { label: 'Columns', target: 0.51 },
      { label: 'Selection', target: 0.75 },
      { label: 'Actions', target: 0.83 },
      { label: 'Conclusion', target: 1.0 },
    ], reducedMotion);
  }

    if (reducedMotion) {
    screenMock.style.transform = 'translate(-50%, -50%) scale(0.75)';
    return;
  }


  let currentPhaseIdx = -1;
  let ticking = false;


  // ===== Annotation positioning (wrapper using demo-utils) =====
  function positionAnnotation(sub: any, exEl: HTMLElement, annEl: HTMLElement) {
    _positionAnnotation(canvas, exEl, annEl, sub.side as AnnotationSide);
  }

    // ===== Connector drawing per sub (wrapper using demo-utils) =====
  function updateConnector(sub: any, exEl: HTMLElement, annEl: HTMLElement) {
    const lineEl = document.getElementById(sub.lineId) as SVGLineElement | null;
    const dotEl = document.getElementById(sub.dotId) as SVGCircleElement | null;
    _updateConnector(canvas, exEl, annEl, lineEl, dotEl, sub.side as AnnotationSide);
  }

    // ===== Compute extraction target position (where the overlay ends up) =====
  // Returns {left, top, width, height} in canvas coords, based on side + content area.
  function getExtractionTarget(sub, contentRect, canvasRect) {
    const cw = canvasRect.width, ch = canvasRect.height;
    const cLeft = contentRect.left - canvasRect.left;
    const cTop = contentRect.top - canvasRect.top;
    const cW = contentRect.width, cH = contentRect.height;
    const exEl = document.getElementById(sub.exId);
    // Measure natural size by briefly showing
    let natW = exEl.offsetWidth || 300, natH = exEl.offsetHeight || 120;

    switch (sub.side) {
      case 'center':
        // big overlay centered, slightly right of center to leave room for annotation on right
        return { left: cw * 0.5 - natW / 2 - 60, top: ch * 0.5 - natH / 2, width: natW, height: natH };
      case 'bottom':
        return { left: cw * 0.5 - natW / 2, top: cTop + cH + 30, width: natW, height: natH };
      case 'top':
        return { left: cw * 0.5 - natW / 2, top: Math.max(120, cTop - natH - 30), width: natW, height: natH };
      case 'top-left':
        return { left: Math.max(20, cLeft - natW - 30), top: Math.max(120, cTop - natH - 30), width: natW, height: natH };
      case 'top-right':
        return { left: cLeft + cW + 30, top: Math.max(120, cTop - natH - 30), width: natW, height: natH };
      case 'left':
        return { left: Math.max(20, cLeft - natW - 30), top: cTop + cH / 2 - natH / 2, width: natW, height: natH };
      case 'right':
        return { left: cLeft + cW + 30, top: cTop + cH / 2 - natH / 2, width: natW, height: natH };
      default:
        return { left: cw * 0.5 - natW / 2, top: ch * 0.5 - natH / 2, width: natW, height: natH };
    }
  }

  // ===== Main update loop =====
  function update() {
    const rect = track.getBoundingClientRect();
    const vh = window.innerHeight;
    const totalScroll = track.offsetHeight - vh;
    const scrolled = Math.max(0, -rect.top);
    const progress = clamp01(scrolled / totalScroll);

    if (railFill) railFill.style.height = (progress * 100) + '%';

    // Scroll hint fade (gone by 5%)
    fadeScrollHint(progress);

    // ===== Section claims opacity =====
    SECTIONS.forEach(s => {
      const claimEl = document.getElementById(s.id);
      if (!claimEl) return;
      const startP = PHASES[s.start].start;
      const endP = PHASES[s.end].end;
      // First claim (phase 0) is visible immediately — no fade-in delay
      let claimIn = s.start === 0 ? 1 : smoothstep(startP, startP + 0.02, progress);
      // claim-6 (View Modes) fades in at the SAME time as "View modes" annotation — fully visible together
      if (s.id === 'claim-6') {
        const vmStart = PHASES[14].start;
        const vmDur = PHASES[14].end - PHASES[14].start;
        claimIn = smoothstep(vmStart, vmStart + vmDur * 0.08, progress);
      }
      // claim-7 (Bulk Ops & Preview): fade in quickly at start of bulk phase,
      // fade out during reassembly at end of preview phase (72-85% of phase 17)
      if (s.id === 'claim-7') {
        const bulkStart = PHASES[16].start;
        const bulkDur = PHASES[16].end - PHASES[16].start;
        claimIn = smoothstep(bulkStart, bulkStart + bulkDur * 0.15, progress);
        const prevPh = PHASES[17];
        const prevDur = prevPh.end - prevPh.start;
        claimEl.style.opacity = claimIn * (1 - smoothstep(prevPh.start + prevDur * 0.72, prevPh.start + prevDur * 0.85, progress));
        return;
      }
      const claimOut = smoothstep(endP - 0.02, endP, progress);
      // claim-6 (View Modes & Deletion): fade out WITH the deletion phase's final fade-out
      // (88-100% of phase 15), so it stays visible until "All records" annotation peaks
      if (s.id === 'claim-6') {
        const delPh = PHASES[15];
        const delDur = delPh.end - delPh.start;
        claimEl.style.opacity = claimIn * (1 - smoothstep(delPh.start + delDur * 0.90, delPh.end, progress));
        return;
      }
      claimEl.style.opacity = claimIn * (1 - claimOut);
    });

    // Final conclusion claim — fades in AFTER zoom-back is well underway (92% of last phase)
    const claimFinalEl = document.getElementById('claim-final');
    if (claimFinalEl) {
      const lastPh = PHASES[PHASES.length - 1];
      const lastDur = lastPh.end - lastPh.start;
      claimFinalEl.style.opacity = smoothstep(lastPh.start + lastDur * 0.92, lastPh.end, progress);
    }

    // ===== Phase tracking =====
    let phaseIdx = 0;
    for (let i = PHASES.length - 1; i >= 0; i--) {
      if (progress >= PHASES[i].start) { phaseIdx = i; break; }
    }
    if (phaseIdx !== currentPhaseIdx) {
      currentPhaseIdx = phaseIdx;
      if (dotsContainer) {
        // 7 dots: Start(0), Table(1-2), Search&Filter(3-6), Columns(7-10), Selection(11), Actions(12-15), Conclusion(16-17)
        const dotIdx = phaseIdx >= 16 ? 6 : (phaseIdx >= 12 ? 5 : (phaseIdx >= 11 ? 4 : (phaseIdx >= 7 ? 3 : (phaseIdx >= 3 ? 2 : (phaseIdx >= 1 ? 1 : 0)))));
        dotsContainer.querySelectorAll('.scene-dot').forEach((d, i) => d.classList.toggle('active', i === dotIdx));
      }
      if (phaseLabel) phaseLabel.textContent = PHASES[phaseIdx].name;
    }

    // ===== Screen mock transform =====
    // RULE: No disassembly animation can start while mock is still moving.
    // Phase 0: full size centered
    // Phase 1 (metadata): mock slides LEFT, claim + JSON on right
    //   HOLD: mock stays left, JSON fully visible, user reads it
    //   End of phase 1: JSON fades out, mock slides back to center + shrinks (SIMULTANEOUS)
    // Phase 2 (pagination): mock shifts UP to make room for pagination bar below
    // Phase 3+ (features): mock is FULLY SETTLED at 0.82 scale, centered.
    const ph0 = PHASES[0], ph1 = PHASES[1];
    const ph0Dur = ph0.end - ph0.start, ph1Dur = ph1.end - ph1.start;
    const pSlideLeft = smoothstep(ph0.start + ph0Dur * 0.60, ph1.start + ph1Dur * 0.30, progress);
    const pSlideBack  = smoothstep(ph1.start + ph1Dur * 0.80, ph1.end, progress);
    const slideAmount = pSlideLeft * (1 - pSlideBack);
    const pShrinkFeatures = smoothstep(ph1.start + ph1Dur * 0.80, ph1.end, progress);
    // Pagination phase: mock shifts UP to create gap for pagination bar
    const pgPhase = PHASES[2]; // Server-side pagination
    const pgDur = pgPhase.end - pgPhase.start;
    const pPgUp = smoothstep(pgPhase.start, pgPhase.start + pgDur * 0.4, progress);
    const pPgDown = smoothstep(pgPhase.end - pgDur * 0.3, pgPhase.end, progress);
    const pgUpAmount = pPgUp * (1 - pPgDown);
    // Scale: 1.0 → 0.88 (slid left) → 0.82 (features) → 1.0 (zoom back at end, smoother)
    const prevPh = PHASES[17]; // Preview panel (last phase)
    const prevDur = prevPh.end - prevPh.start;
    const pZoomBack = smoothstep(prevPh.start + prevDur * 0.85, prevPh.end - prevDur * 0.02, progress);
    const scale = lerp(lerp(1.0, 0.88, pSlideLeft), 0.82, pShrinkFeatures) * lerp(1.0, 1.0 / 0.82, pZoomBack);
    // Horizontal slide: 0 → -22% (LEFT) during phase 1, back to 0 for phase 2+
    const tx = slideAmount * -22;
    // Vertical: slight down for features + UP during pagination phase, reset during zoom-back
    const ty = (lerp(0, 8, pShrinkFeatures) - pgUpAmount * 20) * (1 - pZoomBack);
    screenMock.style.transform = `translate(-50%, -50%) scale(${scale}) translate(${tx}%, ${ty}%)`;

    // ===== Reassembly: reset mock toolbar to filters mode during 72-85% of preview phase =====
    const pReassembleAll = smoothstep(prevPh.start + prevDur * 0.72, prevPh.start + prevDur * 0.85, progress);
    const toolbarFiltersReset = document.getElementById('src-toolbar-filters');
    const toolbarBulkReset = document.getElementById('src-toolbar-bulk');
    if (pReassembleAll > 0.5) {
      if (toolbarFiltersReset) { toolbarFiltersReset.style.display = 'flex'; toolbarFiltersReset.style.opacity = 1; }
      if (toolbarBulkReset) { toolbarBulkReset.style.display = 'none'; toolbarBulkReset.style.opacity = 0; }
    }

    // ===== JSON metadata snippet (phase 1 only) =====
    // Fade in after claim-1, HOLD for reading, fade out simultaneous with mock slide-back
    const jsonEl = document.getElementById('json-snippet');
    if (jsonEl) {
      const jsonIn = smoothstep(ph1.start + ph1Dur * 0.20, ph1.start + ph1Dur * 0.50, progress);
      const jsonOut = smoothstep(ph1.start + ph1Dur * 0.80, ph1.end, progress);
      jsonEl.style.opacity = jsonIn * (1 - jsonOut);
    }

    // ===== Per-sub extraction + annotation =====
    const canvasRect = canvas.getBoundingClientRect();
    const contentRect = contentArea.getBoundingClientRect();

    SUBS.forEach(sub => {
      const exEl = document.getElementById(sub.exId);
      const annEl = document.getElementById(sub.annId);
      const line = document.getElementById(sub.lineId);
      const dot = document.getElementById(sub.dotId);
      if (!exEl || !annEl) return;

      const ph = PHASES[sub.phaseIdx];
      // For stdfilter: skip entirely before its phase (it shares ex-advfilter with advfilter SUB)
      if (sub.id === 'stdfilter' && progress < ph.start - 0.001) return;
      // For datetime-iana: skip entirely before its phase (it shares ex-datetime with datetime SUB)
      if (sub.id === 'datetime-iana' && progress < ph.start - 0.001) return;
      const phaseDur = ph.end - ph.start;
      const pExtract = smoothstep(ph.start, ph.start + phaseDur * 0.4, progress);
      const pReassemble = smoothstep(ph.end - phaseDur * 0.3, ph.end, progress);
      // Viewmode + deletion + bulk + preview: hold extraction through entire phase (no reassembly during phase) —
      // the special handlers control the hold + transition at phase end
      const amount = (sub.id === 'viewmode' || sub.id === 'deletion' || sub.id === 'bulk' || sub.id === 'preview') ? pExtract : pExtract * (1 - pReassemble);

      // ===== Special case: sheet-right-standard (Standard filters — panel stays in place, then reassembles) =====
      if (sub.special === 'sheet-right-standard') {
        // Only active during phase 6 — before that, advfilter handler controls the panel
        if (progress < ph.start) {
          annEl.style.opacity = 0;
          if (line) line.classList.remove('visible');
          if (dot) dot.classList.remove('visible');
          ['ann-stdfilter', 'ann-stdfilter-field'].forEach(id => { const el = document.getElementById(id); if (el) el.style.opacity = 0; });
          ['line-stdfilter', 'line-stdfilter-field'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('visible'); });
          ['dot-stdfilter', 'dot-stdfilter-field'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('visible'); });
          return;
        }
        const mockRect = screenMock.getBoundingClientRect();
        const mockCenterY = mockRect.top + mockRect.height / 2 - canvasRect.top;
        const sheetW = 255;
        const startLeft = mockRect.right - canvasRect.left - sheetW;
        const endLeft = mockRect.right - canvasRect.left - 30;

        // Panel stays at end position during hold, then reassembles back to mock during last 25% of phase
        // Delayed reassembly (75% instead of 70%) to give more hold time — matches other phases' 30% hold
        const pReassembleLocal = smoothstep(ph.end - phaseDur * 0.25, ph.end, progress);
        const effAmount = 1 - pReassembleLocal;

        // When reassembled: hide panel (keep STD tab state — no flash back to ADV)
        if (effAmount < 0.01) {
          exEl.style.opacity = 0;
          annEl.style.opacity = 0;
          if (line) line.classList.remove('visible');
          if (dot) dot.classList.remove('visible');
          exEl.classList.remove('detached', 'glow-border');
          ['ann-stdfilter', 'ann-stdfilter-field'].forEach(id => { const el = document.getElementById(id); if (el) el.style.opacity = 0; });
          ['line-stdfilter', 'line-stdfilter-field'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('visible'); });
          ['dot-stdfilter', 'dot-stdfilter-field'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('visible'); });
          return;
        }

        const curLeft = lerp(startLeft, endLeft, effAmount);
        const exScale = lerp(scale, 1.0, effAmount);

        exEl.style.opacity = 1;
        exEl.style.left = curLeft + 'px';
        exEl.style.top = mockCenterY + 'px';
        exEl.style.width = sheetW + 'px';
        exEl.style.transform = `translateY(-50%) scale(${exScale})`;
        exEl.style.transformOrigin = 'center center';
        exEl.classList.toggle('detached', effAmount > 0.1);
        exEl.classList.toggle('glow-border', effAmount > 0.9);

        // Tab switch animation: pill slides from Advanced (right) to Standard (left) over 40% of phase
        const pTabSwitch = smoothstep(ph.start, ph.start + phaseDur * 0.4, progress);
        const pill = document.getElementById('adv-tab-pill');
        const tabStandard = document.getElementById('adv-tab-standard');
        const tabAdvanced = document.getElementById('adv-tab-advanced');
        const bodyAdvanced = document.getElementById('adv-body-advanced');
        const bodyStandard = document.getElementById('adv-body-standard');
        const panelTitle = document.getElementById('adv-panel-title');

        // Pill slides from right (50%) to left (0%)
        if (pill) {
          const pillLeft = lerp(50, 0, pTabSwitch);
          pill.style.left = `calc(${pillLeft}% + 0rem)`;
        }
        if (tabStandard) tabStandard.style.color = pTabSwitch > 0.5 ? 'var(--pb-sidebar-fg)' : 'var(--pb-sidebar-muted)';
        if (tabAdvanced) tabAdvanced.style.color = pTabSwitch > 0.5 ? 'var(--pb-sidebar-muted)' : 'var(--pb-sidebar-fg)';
        if (panelTitle) panelTitle.textContent = pTabSwitch > 0.5 ? 'Filters' : 'Advanced Filters';

        // Content fade: advanced body fades out, standard body fades in — crossfade at midpoint
        if (bodyAdvanced) bodyAdvanced.style.opacity = Math.max(0, 1 - pTabSwitch * 2);
        if (bodyStandard) bodyStandard.style.opacity = Math.max(0, pTabSwitch * 2 - 1);
        if (bodyAdvanced) bodyAdvanced.style.display = pTabSwitch > 0.5 ? 'none' : 'block';
        if (bodyStandard) bodyStandard.style.display = pTabSwitch < 0.5 ? 'none' : 'block';

        // Hide all advanced annotations during this phase
        ['ann-advfilter', 'ann-advfilter-reset', 'ann-advfilter-connector', 'ann-advfilter-preview', 'ann-advfilter-form'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.opacity = 0;
        });
        ['line-advfilter', 'line-advfilter-reset', 'line-advfilter-connector', 'line-advfilter-preview', 'line-advfilter-form'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.classList.remove('visible');
        });
        ['dot-advfilter', 'dot-advfilter-reset', 'dot-advfilter-connector', 'dot-advfilter-preview', 'dot-advfilter-form'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.classList.remove('visible');
        });

        // Standard annotations fade in after tab switch completes (earlier: 35-45% to maximize hold)
        const pAnnIn = smoothstep(ph.start + phaseDur * 0.35, ph.start + phaseDur * 0.45, progress);
        const pAnnOut = smoothstep(ph.end - phaseDur * 0.25, ph.end, progress);
        const annOpacity = pAnnIn * (1 - pAnnOut);

        if (annEl) annEl.style.opacity = annOpacity;
        if (line) line.classList.toggle('visible', annOpacity > 0.5);
        if (dot) dot.classList.toggle('visible', annOpacity > 0.5);

        // Hide the "Contains operator" annotation during STD phase (kept for ADV phase)
        const stdFieldAnn = document.getElementById('ann-stdfilter-field');
        const stdFieldLine = document.getElementById('line-stdfilter-field');
        const stdFieldDot = document.getElementById('dot-stdfilter-field');
        if (stdFieldAnn) stdFieldAnn.style.opacity = 0;
        if (stdFieldLine) stdFieldLine.classList.remove('visible');
        if (stdFieldDot) stdFieldDot.classList.remove('visible');

        if (annOpacity > 0.05) {
          const exRect = exEl.getBoundingClientRect();
          const annWidth = 210;
          const annH = annEl.offsetHeight || 90;
          const gap = 24;

          // Standard annotation: LEFT of panel, vertically centered
          let leftPx = exRect.left - canvasRect.left - annWidth - gap;
          let topPx = exRect.top + exRect.height / 2 - canvasRect.top - annH / 2;
          if (topPx < 10) topPx = 10;
          if (topPx > canvasRect.height - annH - 10) topPx = canvasRect.height - annH - 10;
          annEl.style.left = leftPx + 'px';
          annEl.style.top = topPx + 'px';
          annEl.style.width = annWidth + 'px';
          const card = annEl.querySelector('.ann-card');
          if (card) card.style.width = annWidth + 'px';
          // Connector: from right edge of annotation to left edge of panel
          const dotX = leftPx + annWidth;
          const dotY = topPx + annH / 2;
          const targetX = exRect.left - canvasRect.left;
          const targetY = exRect.top + exRect.height / 2 - canvasRect.top;
          drawConnector(line, dot, dotX, dotY, targetX, targetY);
        }

        return;
      }

      // ===== Special case: pagination slides DOWN from mock bottom (like shell-v2 topbar inverted) =====
      if (sub.special === 'pagination-bottom') {
        if (amount < 0.01) {
          exEl.style.opacity = 0;
          annEl.style.opacity = 0;
          if (line) line.classList.remove('visible');
          if (dot) dot.classList.remove('visible');
          exEl.classList.remove('detached', 'glow-border');
          // Also hide the 2 sub-annotations
          ['ann-pagination-range', 'ann-pagination-size'].forEach(aId => {
            const el = document.getElementById(aId);
            if (el) el.style.opacity = 0;
          });
          ['line-pagination-range', 'dot-pagination-range', 'line-pagination-size', 'dot-pagination-size'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('visible');
          });
          return;
        }

        const mockRect = screenMock.getBoundingClientRect();
        const mockLeft = mockRect.left - canvasRect.left;
        const mockTop = mockRect.top - canvasRect.top;
        const mockWidth = mockRect.width;
        const mockBottom = mockRect.bottom;
        const mockBottomPx = mockBottom - canvasRect.top;

        // Measure natural pagination height
        const natH = exEl.offsetHeight || 40;
        const pgWidth = mockWidth * 1.06;

        // Start: at the pagination bar's position inside the mock (bottom of content area)
        const startTop = mockBottomPx - natH - 2;
        // End: below the mock's bottom edge with more gap
        const endTop = mockBottomPx + 28;
        const curTop = lerp(startTop, endTop, amount);

        // Left: centered with mock (start aligned, end slightly wider/centered)
        const startLeft = mockLeft + (mockWidth - pgWidth) / 2;
        const endLeft = mockLeft + (mockWidth - pgWidth) / 2;
        const curLeft = lerp(startLeft, endLeft, amount);

        const pgScale = lerp(scale, 1.0, amount);

        exEl.style.opacity = 1;
        exEl.style.left = curLeft + 'px';
        exEl.style.top = curTop + 'px';
        exEl.style.width = pgWidth + 'px';
        exEl.style.height = natH + 'px';
        exEl.style.transform = `scale(${pgScale})`;
        exEl.style.transformOrigin = 'top center';
        exEl.classList.toggle('detached', amount > 0.1);
        exEl.classList.toggle('glow-border', amount > 0.9 && pReassemble < 0.1);

        // ===== 3 annotations BELOW the pagination bar, each centered under its target section =====
        // 1. "Total records" → centered under range counter ("1-25 of 247")
        // 2. "Rows per page" → centered under page-size selector
        // 3. "Server-side pagination" → centered under page controls (<< < > >>)
        const pAnnIn = smoothstep(ph.start + phaseDur * 0.35, ph.start + phaseDur * 0.45, progress);
        const pAnnOut = smoothstep(ph.end - phaseDur * 0.25, ph.end, progress);
        const annOpacity = pAnnIn * (1 - pAnnOut);

        const exRect = exEl.getBoundingClientRect();
        const annWidth = 200;
        const gapBelow = 16; // gap between bar bottom and annotation top

        // The 3 target sections inside the pagination bar
        const rangeEl = exEl.querySelector('.pag-range');
        const sizeEl = exEl.querySelector('.pag-size');
        // Nav buttons only (<< < Page 1 of 10 > >>) — target the page status text in their center
        const navEl = exEl.querySelector('.pag-status');

        const subAnnotations = [
          { annId: 'ann-pagination-range', lineId: 'line-pagination-range', dotId: 'dot-pagination-range', targetEl: rangeEl,    offset: 0   },
          { annId: 'ann-pagination-size',  lineId: 'line-pagination-size',  dotId: 'dot-pagination-size',  targetEl: sizeEl,     offset: -90 },
          { annId: 'ann-pagination',       lineId: 'line-pagination',       dotId: 'dot-pagination',       targetEl: navEl,      offset: 0   },
        ];

        subAnnotations.forEach(sub => {
          const subAnnEl = document.getElementById(sub.annId);
          const subLine = document.getElementById(sub.lineId);
          const subDot = document.getElementById(sub.dotId);
          if (!subAnnEl) return;
          subAnnEl.style.opacity = annOpacity;

          if (annOpacity > 0.05 && sub.targetEl) {
            const tRect = sub.targetEl.getBoundingClientRect();
            // Center the box directly under the target, with optional horizontal offset
            let annLeft = tRect.left + tRect.width / 2 - canvasRect.left - annWidth / 2 + (sub.offset || 0);
            let annTop = exRect.bottom - canvasRect.top + gapBelow;
            // Clamp to canvas
            annLeft = Math.max(10, Math.min(canvasRect.width - annWidth - 10, annLeft));
            if (annTop < 10) annTop = 10;
            subAnnEl.style.left = annLeft + 'px';
            subAnnEl.style.top = annTop + 'px';
            subAnnEl.style.width = annWidth + 'px';
            const card = subAnnEl.querySelector('.ann-card');
            if (card) card.style.width = annWidth + 'px';

            // Connector: dot at TOP of annotation (centered), line straight up to target center
            const dotX = annLeft + annWidth / 2;
            const dotY = annTop;
            const targetX = tRect.left + tRect.width / 2 - canvasRect.left;
            const targetY = exRect.bottom - canvasRect.top;
            drawConnector(subLine, subDot, dotX, dotY, targetX, targetY);
          }
          if (subLine) subLine.classList.toggle('visible', annOpacity > 0.5);
          if (subDot) subDot.classList.toggle('visible', annOpacity > 0.5);
        });
        return;
      }

      // ===== Special case: datetime-iana-toggle (phase 9 — toggle from browser to IANA mode, then reassemble) =====
      if (sub.special === 'datetime-iana-toggle') {
        // Column is already extracted from phase 8 — no re-extraction
        // Toggle animation in first 30%, hold with annotations, reassembly in last 30%
        const pReassembleLocal = smoothstep(ph.end - phaseDur * 0.3, ph.end, progress);
        const effAmount = 1 - pReassembleLocal;

        if (effAmount < 0.01) {
          exEl.style.opacity = 0;
          annEl.style.opacity = 0;
          if (line) line.classList.remove('visible');
          if (dot) dot.classList.remove('visible');
          exEl.classList.remove('detached', 'glow-border');
          return;
        }

        // Position: same as phase 8 — in place over the column's original position
        const mockRect = screenMock.getBoundingClientRect();
        const onboardedTh = document.getElementById('src-onboarded-th');
        const colRect = onboardedTh ? onboardedTh.getBoundingClientRect() : mockRect;
        const tbodyEl = document.getElementById('src-tbody');
        const tbodyRect = tbodyEl ? tbodyEl.getBoundingClientRect() : colRect;
        const colCenterX = colRect.left + colRect.width / 2 - canvasRect.left - 6;
        const colTop = colRect.top - canvasRect.top;
        const colBottom = tbodyRect.bottom - canvasRect.top;
        const colFullCenterY = (colTop + colBottom) / 2 + 4;
        const natW = 220;
        const natH = exEl.offsetHeight || 120;
        const endLeft = colCenterX - natW / 2;
        const endTop = colFullCenterY - natH / 2;

        // Reassembly: interpolate from extracted position (endLeft/endTop, scale 1)
        // back to the column's original position in the mock (at mock scale)
        const mockCenterX = colRect.left + colRect.width / 2 - canvasRect.left;
        const mockStartLeft = mockCenterX - natW / 2;
        const colVisTop = colRect.top - canvasRect.top;
        const colVisH = colRect.height;
        const mockStartTop = colVisTop + colVisH / 2 - natH / 2;
        const curLeft = lerp(endLeft, mockStartLeft, pReassembleLocal);
        const curTop = lerp(endTop, mockStartTop, pReassembleLocal);
        const exScale = lerp(1.0, scale, pReassembleLocal);

        exEl.style.opacity = effAmount;
        exEl.style.left = curLeft + 'px';
        exEl.style.top = curTop + 'px';
        exEl.style.width = natW + 'px';
        exEl.style.transform = `scale(${exScale})`;
        exEl.style.transformOrigin = 'center center';
        exEl.classList.toggle('detached', effAmount > 0.1);
        exEl.classList.toggle('glow-border', effAmount > 0.9 && pReassembleLocal < 0.1);

        // Toggle animation: first 30% of phase
        const pToggle = smoothstep(ph.start, ph.start + phaseDur * 0.3, progress);

        // Globe icon fades out, map-pin fades in (both always display:block, overlapping)
        const globeEl = document.getElementById('ex-datetime-globe');
        const pinEl = document.getElementById('ex-datetime-pin');
        if (globeEl) { globeEl.style.opacity = Math.max(0, 1 - pToggle * 1.5); globeEl.style.display = 'block'; }
        if (pinEl) { pinEl.style.opacity = Math.max(0, pToggle * 1.5 - 0.5); pinEl.style.display = 'block'; }

        // Cell backgrounds turn amber
        const rows = exEl.querySelectorAll('.ex-datetime-row');
        rows.forEach(row => {
          row.style.background = pToggle > 0.5 ? 'rgba(251, 191, 36, 0.08)' : '';
        });

        // Values change from browser-mode to IANA-mode
        const values = exEl.querySelectorAll('.ex-datetime-value');
        const ianaValues = ['16 May 2026, 13:00', '16 May 2026, 19:00', '17 May 2026, 02:00'];
        values.forEach((val, i) => {
          if (i < ianaValues.length) {
            val.textContent = pToggle > 0.5 ? ianaValues[i] : '16 May 2026, 19:00';
          }
        });

        // Timezone badges fade in
        const tzBadges = exEl.querySelectorAll('.ex-datetime-tz');
        tzBadges.forEach(badge => {
          if (pToggle > 0.3) {
            badge.style.display = 'inline-flex';
            badge.style.opacity = Math.min(1, (pToggle - 0.3) / 0.3);
          } else {
            badge.style.display = 'none';
            badge.style.opacity = 0;
          }
        });

        // Annotations during hold (after toggle, before reassembly)
        const pAnnIn = smoothstep(ph.start + phaseDur * 0.35, ph.start + phaseDur * 0.45, progress);
        const pAnnOut = smoothstep(ph.end - phaseDur * 0.25, ph.end, progress);
        const annOpacity = pAnnIn * (1 - pAnnOut);
        annEl.style.opacity = annOpacity;
        if (line) line.classList.toggle('visible', annOpacity > 0.5);
        if (dot) dot.classList.toggle('visible', annOpacity > 0.5);

        if (annOpacity > 0.05) {
          const exRect = exEl.getBoundingClientRect();
          const annWidth = 210;
          const annH = annEl.offsetHeight || 90;
          const gap = 24;
          let leftPx = exRect.right - canvasRect.left + gap;
          let topPx = exRect.top + exRect.height / 2 - canvasRect.top - annH / 2;
          leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
          if (topPx < 10) topPx = 10;
          if (topPx > canvasRect.height - annH - 10) topPx = canvasRect.height - annH - 10;
          annEl.style.left = leftPx + 'px';
          annEl.style.top = topPx + 'px';
          annEl.style.width = annWidth + 'px';
          const card = annEl.querySelector('.ann-card');
          if (card) card.style.width = annWidth + 'px';
          const dotX = leftPx;
          const dotY = topPx + annH / 2;
          const targetX = exRect.right - canvasRect.left;
          const targetY = exRect.top + exRect.height / 2 - canvasRect.top;
          drawConnector(line, dot, dotX, dotY, targetX, targetY);
        }

        return;
      }

      // ===== Special case: datetime-column (phase 8 — extract Onboarded At column, position above mock) =====
      if (sub.special === 'datetime-column') {
        // After phase 8 ends — datetime-iana handler controls the element
        if (progress > ph.end + 0.001) {
          annEl.style.opacity = 0;
          if (line) line.classList.remove('visible');
          if (dot) dot.classList.remove('visible');
          return;
        }

        // No reassembly during phase 8 — column stays extracted for phase 9
        const effAmount = pExtract;

        if (effAmount < 0.01) {
          exEl.style.opacity = 0;
          annEl.style.opacity = 0;
          if (line) line.classList.remove('visible');
          if (dot) dot.classList.remove('visible');
          exEl.classList.remove('detached', 'glow-border');
          return;
        }

        // Find the Onboarded At column position in the mock
        const onboardedTh = document.getElementById('src-onboarded-th');
        const colRect = onboardedTh ? onboardedTh.getBoundingClientRect() : contentRect;
        const tbodyEl = document.getElementById('src-tbody');
        const tbodyRect = tbodyEl ? tbodyEl.getBoundingClientRect() : colRect;
        // Center on the full column (header + tbody), with a small left nudge
        const colCenterX = colRect.left + colRect.width / 2 - canvasRect.left - 6;
        const colTop = colRect.top - canvasRect.top;
        const colBottom = tbodyRect.bottom - canvasRect.top;
        const colFullCenterY = (colTop + colBottom) / 2 + 4; // small downward nudge

        const natW = 220;
        const natH = exEl.offsetHeight || 120;

        // Column stays IN PLACE over its original position — only zooms out.
        const stayLeft = colCenterX - natW / 2;
        const stayTop = colFullCenterY - natH / 2;

        const exScale = lerp(scale, 1.0, effAmount);

        exEl.style.opacity = 1;
        exEl.style.left = stayLeft + 'px';
        exEl.style.top = stayTop + 'px';
        exEl.style.width = natW + 'px';
        exEl.style.transform = `scale(${exScale})`;
        exEl.style.transformOrigin = 'center center';
        exEl.classList.toggle('detached', effAmount > 0.1);
        exEl.classList.toggle('glow-border', effAmount > 0.9);

        // Reset to browser mode (in case user scrolled back from phase 9)
        const globeEl = document.getElementById('ex-datetime-globe');
        const pinEl = document.getElementById('ex-datetime-pin');
        if (globeEl) { globeEl.style.opacity = 1; globeEl.style.display = 'block'; }
        if (pinEl) { pinEl.style.opacity = 0; pinEl.style.display = 'block'; }
        const dtRows = exEl.querySelectorAll('.ex-datetime-row');
        dtRows.forEach(row => { row.style.background = ''; });
        const dtValues = exEl.querySelectorAll('.ex-datetime-value');
        dtValues.forEach(val => { val.textContent = '16 May 2026, 19:00'; });
        const dtTzBadges = exEl.querySelectorAll('.ex-datetime-tz');
        dtTzBadges.forEach(badge => { badge.style.display = 'none'; badge.style.opacity = 0; });

        // Annotations during hold
        const pAnnIn = smoothstep(ph.start + phaseDur * 0.35, ph.start + phaseDur * 0.45, progress);
        const pAnnOut = smoothstep(ph.end - phaseDur * 0.25, ph.end, progress);
        const annOpacity = pAnnIn * (1 - pAnnOut);
        annEl.style.opacity = annOpacity;
        if (line) line.classList.toggle('visible', annOpacity > 0.5);
        if (dot) dot.classList.toggle('visible', annOpacity > 0.5);

        if (annOpacity > 0.05) {
          const exRect = exEl.getBoundingClientRect();
          const annWidth = 210;
          const annH = annEl.offsetHeight || 90;
          const gap = 24;
          let leftPx = exRect.right - canvasRect.left + gap;
          let topPx = exRect.top + exRect.height / 2 - canvasRect.top - annH / 2;
          leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
          if (topPx < 10) topPx = 10;
          if (topPx > canvasRect.height - annH - 10) topPx = canvasRect.height - annH - 10;
          annEl.style.left = leftPx + 'px';
          annEl.style.top = topPx + 'px';
          annEl.style.width = annWidth + 'px';
          const card = annEl.querySelector('.ann-card');
          if (card) card.style.width = annWidth + 'px';
          const dotX = leftPx;
          const dotY = topPx + annH / 2;
          const targetX = exRect.right - canvasRect.left;
          const targetY = exRect.top + exRect.height / 2 - canvasRect.top;
          drawConnector(line, dot, dotX, dotY, targetX, targetY);
        }

        return;
      }

      // ===== Special case: sticky-name-column (phase 10 — extract Name column in place over source) =====
      if (sub.special === 'sticky-name-column') {
        const pReassembleLocal = smoothstep(ph.end - phaseDur * 0.3, ph.end, progress);
        const effAmount = pExtract * (1 - pReassembleLocal);

        if (effAmount < 0.01) {
          exEl.style.opacity = 0;
          annEl.style.opacity = 0;
          if (line) line.classList.remove('visible');
          if (dot) dot.classList.remove('visible');
          exEl.classList.remove('detached', 'glow-border');
          return;
        }

        // Find the Name column position in the mock
        const nameTh = document.getElementById('src-name-th');
        const colRect = nameTh ? nameTh.getBoundingClientRect() : contentRect;
        const tbodyEl = document.getElementById('src-tbody');
        const tbodyRect = tbodyEl ? tbodyEl.getBoundingClientRect() : colRect;
        const colCenterX = colRect.left + colRect.width / 2 - canvasRect.left - 6;
        const colTop = colRect.top - canvasRect.top;
        const colBottom = tbodyRect.bottom - canvasRect.top;
        const colFullCenterY = (colTop + colBottom) / 2 + 4;

        const natW = colRect.width;
        const natH = exEl.offsetHeight || 160;

        // Stay in place over the column — only zoom out
        const stayLeft = colCenterX - natW / 2;
        const stayTop = colFullCenterY - natH / 2;

        // Reassembly: interpolate back to mock position/scale
        const mockCenterX = colRect.left + colRect.width / 2 - canvasRect.left;
        const mockStartLeft = mockCenterX - natW / 2;
        const mockStartTop = colTop + colRect.height / 2 - natH / 2;
        const curLeft = lerp(stayLeft, mockStartLeft, pReassembleLocal);
        const curTop = lerp(stayTop, mockStartTop, pReassembleLocal);
        const exScale = lerp(1.0, scale, pReassembleLocal);

        exEl.style.opacity = effAmount;
        exEl.style.left = curLeft + 'px';
        exEl.style.top = curTop + 'px';
        exEl.style.width = natW + 'px';
        exEl.style.transform = `scale(${exScale})`;
        exEl.style.transformOrigin = 'center center';
        exEl.classList.toggle('detached', effAmount > 0.1);
        exEl.classList.toggle('glow-border', effAmount > 0.9 && pReassembleLocal < 0.1);

        // Annotation during hold
        const pAnnIn = smoothstep(ph.start + phaseDur * 0.35, ph.start + phaseDur * 0.45, progress);
        const pAnnOut = smoothstep(ph.end - phaseDur * 0.25, ph.end, progress);
        const annOpacity = pAnnIn * (1 - pAnnOut);
        annEl.style.opacity = annOpacity;
        if (line) line.classList.toggle('visible', annOpacity > 0.5);
        if (dot) dot.classList.toggle('visible', annOpacity > 0.5);

        if (annOpacity > 0.05) {
          const exRect = exEl.getBoundingClientRect();
          const annWidth = 200;
          const annH = annEl.offsetHeight || 90;
          const gap = 16;
          // Position to the RIGHT of the extracted column
          let leftPx = exRect.right - canvasRect.left + gap;
          let topPx = exRect.top + exRect.height / 2 - canvasRect.top - annH / 2;
          leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
          if (topPx < 10) topPx = 10;
          if (topPx > canvasRect.height - annH - 10) topPx = canvasRect.height - annH - 10;
          annEl.style.left = leftPx + 'px';
          annEl.style.top = topPx + 'px';
          annEl.style.width = annWidth + 'px';
          const card = annEl.querySelector('.ann-card');
          if (card) card.style.width = annWidth + 'px';
          const dotX = leftPx;
          const dotY = topPx + annH / 2;
          const targetX = exRect.right - canvasRect.left;
          const targetY = exRect.top + exRect.height / 2 - canvasRect.top;
          drawConnector(line, dot, dotX, dotY, targetX, targetY);
        }
        return;
      }

      // ===== Special case: sticky-action-column (phase 10 — extract Action column in place over source) =====
      if (sub.special === 'sticky-action-column') {
        const pReassembleLocal = smoothstep(ph.end - phaseDur * 0.3, ph.end, progress);
        const effAmount = pExtract * (1 - pReassembleLocal);

        if (effAmount < 0.01) {
          exEl.style.opacity = 0;
          annEl.style.opacity = 0;
          if (line) line.classList.remove('visible');
          if (dot) dot.classList.remove('visible');
          exEl.classList.remove('detached', 'glow-border');
          return;
        }

        // Find the Action column position in the mock
        const actionTh = document.getElementById('src-action-th');
        const colRect = actionTh ? actionTh.getBoundingClientRect() : contentRect;
        const tbodyEl = document.getElementById('src-tbody');
        const tbodyRect = tbodyEl ? tbodyEl.getBoundingClientRect() : colRect;
        const colCenterX = colRect.left + colRect.width / 2 - canvasRect.left - 6;
        const colTop = colRect.top - canvasRect.top;
        const colBottom = tbodyRect.bottom - canvasRect.top;
        const colFullCenterY = (colTop + colBottom) / 2 + 4;

        const natW = colRect.width;
        const natH = exEl.offsetHeight || 160;

        // Stay in place over the column — only zoom out
        const stayLeft = colCenterX - natW / 2;
        const stayTop = colFullCenterY - natH / 2;

        // Reassembly: interpolate back to mock position/scale
        const mockCenterX = colRect.left + colRect.width / 2 - canvasRect.left;
        const mockStartLeft = mockCenterX - natW / 2;
        const mockStartTop = colTop + colRect.height / 2 - natH / 2;
        const curLeft = lerp(stayLeft, mockStartLeft, pReassembleLocal);
        const curTop = lerp(stayTop, mockStartTop, pReassembleLocal);
        const exScale = lerp(1.0, scale, pReassembleLocal);

        exEl.style.opacity = effAmount;
        exEl.style.left = curLeft + 'px';
        exEl.style.top = curTop + 'px';
        exEl.style.width = natW + 'px';
        exEl.style.transform = `scale(${exScale})`;
        exEl.style.transformOrigin = 'center center';
        exEl.classList.toggle('detached', effAmount > 0.1);
        exEl.classList.toggle('glow-border', effAmount > 0.9 && pReassembleLocal < 0.1);

        // Annotation during hold
        const pAnnIn = smoothstep(ph.start + phaseDur * 0.35, ph.start + phaseDur * 0.45, progress);
        const pAnnOut = smoothstep(ph.end - phaseDur * 0.25, ph.end, progress);
        const annOpacity = pAnnIn * (1 - pAnnOut);
        annEl.style.opacity = annOpacity;
        if (line) line.classList.toggle('visible', annOpacity > 0.5);
        if (dot) dot.classList.toggle('visible', annOpacity > 0.5);

        if (annOpacity > 0.05) {
          const exRect = exEl.getBoundingClientRect();
          const annWidth = 200;
          const annH = annEl.offsetHeight || 90;
          const gap = 16;
          // Position to the LEFT of the extracted column
          let leftPx = exRect.left - canvasRect.left - annWidth - gap;
          let topPx = exRect.top + exRect.height / 2 - canvasRect.top - annH / 2;
          leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
          if (topPx < 10) topPx = 10;
          if (topPx > canvasRect.height - annH - 10) topPx = canvasRect.height - annH - 10;
          annEl.style.left = leftPx + 'px';
          annEl.style.top = topPx + 'px';
          annEl.style.width = annWidth + 'px';
          const card = annEl.querySelector('.ann-card');
          if (card) card.style.width = annWidth + 'px';
          const dotX = leftPx + annWidth;
          const dotY = topPx + annH / 2;
          const targetX = exRect.left - canvasRect.left;
          const targetY = exRect.top + exRect.height / 2 - canvasRect.top;
          drawConnector(line, dot, dotX, dotY, targetX, targetY);
        }
        return;
      }

      if (amount < 0.01) {
        exEl.style.opacity = 0;
        annEl.style.opacity = 0;
        if (line) line.classList.remove('visible');
        if (dot) dot.classList.remove('visible');
        exEl.classList.remove('detached', 'glow-border');
        // Hide colsel extra annotations only when colsel's own amount < 0.01
        if (sub.id === 'colsel') {
          ['ann-colsel-sticky', 'ann-colsel-audit'].forEach(id => { const el = document.getElementById(id); if (el) el.style.opacity = 0; });
          ['line-colsel-sticky', 'line-colsel-audit'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('visible'); });
          ['dot-colsel-sticky', 'dot-colsel-audit'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('visible'); });
        }
        // Hide selection extra annotations when selection sub's amount < 0.01
        if (sub.id === 'selection') {
          ['ann-select-all', 'ann-selection-counter'].forEach(id => { const el = document.getElementById(id); if (el) el.style.opacity = 0; });
          ['line-select-all', 'line-selection-counter'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('visible'); });
          ['dot-select-all', 'dot-selection-counter'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('visible'); });
          // Reset selection state on mock screen
          for (let i = 1; i <= 5; i++) {
            const check = document.getElementById('src-check-' + i);
            const row = document.getElementById('src-row-' + i);
            if (check) { check.classList.remove('checked'); check.style.opacity = ''; }
            if (row) { row.classList.remove('selected'); }
          }
          const checkAll = document.getElementById('src-check-all');
          if (checkAll) { checkAll.classList.remove('checked'); checkAll.style.opacity = ''; }
          const counter = document.getElementById('src-selection-counter');
          if (counter) { counter.style.display = 'none'; }
          const divider = document.getElementById('src-selection-divider');
          if (divider) { divider.style.display = 'none'; }
          const eyeToggle = document.getElementById('src-eye-toggle');
          if (eyeToggle) { eyeToggle.style.display = 'none'; }
        }
        // Hide sorting extra annotations when sorting sub's amount < 0.01
        if (sub.id === 'sorting') {
          ['ann-sort-none', 'ann-sort-asc', 'ann-sort-desc'].forEach(id => { const el = document.getElementById(id); if (el) el.style.opacity = 0; });
          ['line-sort-none', 'line-sort-asc', 'line-sort-desc'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('visible'); });
          ['dot-sort-none', 'dot-sort-asc', 'dot-sort-desc'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('visible'); });
          // Reset sort state on mock screen
          const sortNameIcon = document.getElementById('src-sort-name');
          const nameTh = document.getElementById('src-name-th');
          if (sortNameIcon) {
            sortNameIcon.innerHTML = '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>';
            sortNameIcon.style.opacity = '';
            sortNameIcon.style.color = '';
          }
          if (nameTh) { nameTh.classList.remove('sorted'); }
          // Reset row transforms
          for (let i = 1; i <= 5; i++) {
            const row = document.getElementById('src-row-' + i);
            if (row) row.style.transform = '';
          }
        }
        // Hide row actions dropdown when rowactions sub's amount < 0.01
        if (sub.id === 'rowactions') {
          const dropdown = document.getElementById('row-actions-dropdown');
          if (dropdown) { dropdown.style.opacity = 0; dropdown.style.pointerEvents = 'none'; }
          const dropInner = document.getElementById('row-actions-dropdown-inner');
          if (dropInner) { dropInner.classList.remove('detached', 'glow-border'); }
        }
        // Hide advfilter extra annotations when advfilter sub's amount < 0.01
        if (sub.id === 'advfilter') {
          ['ann-advfilter-reset', 'ann-advfilter-connector', 'ann-advfilter-preview', 'ann-advfilter-form'].forEach(id => { const el = document.getElementById(id); if (el) el.style.opacity = 0; });
          ['line-advfilter-reset', 'line-advfilter-connector', 'line-advfilter-preview', 'line-advfilter-form'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('visible'); });
          ['dot-advfilter-reset', 'dot-advfilter-connector', 'dot-advfilter-preview', 'dot-advfilter-form'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('visible'); });
        }
        // Hide filterchips extra annotations when filterchips sub's amount < 0.01
        if (sub.id === 'filterchips') {
          ['ann-filterchips-clear', 'ann-filterchips-2'].forEach(id => { const el = document.getElementById(id); if (el) el.style.opacity = 0; });
          ['line-filterchips-clear', 'line-filterchips-2'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('visible'); });
          ['dot-filterchips-clear', 'dot-filterchips-2'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('visible'); });
        }
        // Hide viewmode extra elements when viewmode sub's amount < 0.01
        if (sub.id === 'viewmode') {
          const vtTable = document.getElementById('src-vt-table');
          const vtCards = document.getElementById('src-vt-cards');
          const vtList = document.getElementById('src-vt-list');
          const tableScroll = document.getElementById('src-table-scroll');
          const cardGrid = document.getElementById('src-card-grid');
          const cardList = document.getElementById('src-card-list');
          if (vtTable) vtTable.classList.add('active');
          if (vtCards) vtCards.classList.remove('active');
          if (vtList) vtList.classList.remove('active');
          if (tableScroll) { tableScroll.style.opacity = ''; tableScroll.style.display = ''; }
          if (cardGrid) { cardGrid.style.opacity = 0; cardGrid.style.display = 'none'; }
          if (cardList) { cardList.style.opacity = 0; cardList.style.display = 'none'; }
          const annGrid = document.getElementById('ann-viewmode-grid');
          const lineGrid = document.getElementById('line-viewmode-grid');
          const dotGrid = document.getElementById('dot-viewmode-grid');
          const annToolbar = document.getElementById('ann-viewmode-toolbar');
          const lineToolbar = document.getElementById('line-viewmode-toolbar');
          const dotToolbar = document.getElementById('dot-viewmode-toolbar');
          const annList = document.getElementById('ann-viewmode-list');
          const lineList = document.getElementById('line-viewmode-list');
          const dotList = document.getElementById('dot-viewmode-list');
          if (annGrid) annGrid.style.opacity = 0;
          if (lineGrid) lineGrid.classList.remove('visible');
          if (dotGrid) dotGrid.classList.remove('visible');
          if (annToolbar) annToolbar.style.opacity = 0;
          if (lineToolbar) lineToolbar.classList.remove('visible');
          if (dotToolbar) dotToolbar.classList.remove('visible');
          if (annList) annList.style.opacity = 0;
          if (lineList) lineList.classList.remove('visible');
          if (dotList) dotList.classList.remove('visible');
        }
        // Reset bulk toolbar mock when bulk sub's amount < 0.01
        if (sub.id === 'bulk') {
          const toolbarFilters = document.getElementById('src-toolbar-filters');
          const toolbarBulk = document.getElementById('src-toolbar-bulk');
          if (toolbarFilters) { toolbarFilters.style.display = 'flex'; toolbarFilters.style.opacity = 1; }
          if (toolbarBulk) { toolbarBulk.style.display = 'none'; toolbarBulk.style.opacity = 0; }
          ['ann-bulk-toggle', 'ann-bulk-export', 'ann-bulk-duplicate'].forEach(id => { const el = document.getElementById(id); if (el) el.style.opacity = 0; });
          ['line-bulk-toggle', 'line-bulk-export', 'line-bulk-duplicate'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('visible'); });
          ['dot-bulk-toggle', 'dot-bulk-export', 'dot-bulk-duplicate'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('visible'); });
        }
        return;
      }

      // ===== Special case: sheet-right (Search In panel — mirrors shell sidebar, slides from right edge of mock) =====
      if (sub.special === 'sheet-right') {
        const mockRect = screenMock.getBoundingClientRect();
        const mockCenterY = mockRect.top + mockRect.height / 2 - canvasRect.top;
        const sheetW = 255;

        // For advfilter: NO reassembly — panel stays in end position (phase 6 takes over)
        const effAmount = sub.id === 'advfilter' ? Math.max(amount, pExtract) : amount;

        // Start: flush with mock's right edge (as if inside the screen)
        const startLeft = mockRect.right - canvasRect.left - sheetW;
        // End: slightly overlapping the mock's right edge (like shell sidebar overlaps mock's left edge)
        const endLeft = mockRect.right - canvasRect.left - 30;
        const curLeft = lerp(startLeft, endLeft, effAmount);

        // Scale: start at mock's scale, grow to 1.0 as it slides out
        const exScale = lerp(scale, 1.0, effAmount);

        // Same animation as shell sidebar: translateY(-50%) scale(...)
        exEl.style.opacity = 1;
        exEl.style.left = curLeft + 'px';
        exEl.style.top = mockCenterY + 'px';
        exEl.style.width = sheetW + 'px';
        exEl.style.transform = `translateY(-50%) scale(${exScale})`;
        exEl.style.transformOrigin = 'center center';
        exEl.classList.toggle('detached', effAmount > 0.1);
        // Gradient border only when in end position (like all other extractions)
        exEl.classList.toggle('glow-border', effAmount > 0.9 && pReassemble < 0.1);

        // Always set tab/body to Advanced during phase 5 — stdfilter handler will override during phase 6
        const pill = document.getElementById('adv-tab-pill');
        const tabStandard = document.getElementById('adv-tab-standard');
        const tabAdvanced = document.getElementById('adv-tab-advanced');
        const bodyAdvanced = document.getElementById('adv-body-advanced');
        const bodyStandard = document.getElementById('adv-body-standard');
        const panelTitle = document.getElementById('adv-panel-title');
        if (pill) pill.style.left = 'calc(50% + 0rem)';
        if (tabStandard) tabStandard.style.color = 'var(--pb-sidebar-muted)';
        if (tabAdvanced) tabAdvanced.style.color = 'var(--pb-sidebar-fg)';
        if (panelTitle) panelTitle.textContent = 'Advanced Filters';
        if (bodyAdvanced) { bodyAdvanced.style.display = 'block'; bodyAdvanced.style.opacity = 1; }
        if (bodyStandard) { bodyStandard.style.display = 'none'; bodyStandard.style.opacity = 0; }

        // Annotation: fades in during hold, positioned to the LEFT of the sheet
        // For colsel: all 3 annotations appear together during hold period (same as advfilter pattern)
        let pAnnIn, pAnnOut;
        if (sub.id === 'colsel') {
          pAnnIn = smoothstep(ph.start + phaseDur * 0.42, ph.start + phaseDur * 0.44, progress);
          pAnnOut = smoothstep(ph.start + phaseDur * 0.66, ph.start + phaseDur * 0.68, progress);
        } else {
          pAnnIn = smoothstep(ph.start + phaseDur * 0.35, ph.start + phaseDur * 0.45, progress);
          pAnnOut = smoothstep(ph.end - phaseDur * 0.25, ph.end, progress);
        }
        const annOpacity = pAnnIn * (1 - pAnnOut);
        annEl.style.opacity = annOpacity;
        if (line) line.classList.toggle('visible', annOpacity > 0.5);
        if (dot) dot.classList.toggle('visible', annOpacity > 0.5);

        if (annOpacity > 0.05) {
          const exRect = exEl.getBoundingClientRect();
          const annWidth = 210;
          const annH = annEl.offsetHeight || 90;
          const gap = 24;
          let leftPx, topPx, dotX, dotY, targetX, targetY;

          if (sub.id === 'advfilter') {
            // Position BELOW the panel, centered on it
            const panelCenterX = exRect.left + exRect.width / 2 - canvasRect.left;
            leftPx = panelCenterX - annWidth / 2;
            topPx = exRect.bottom - canvasRect.top + gap;
            if (topPx > canvasRect.height - annH - 10) topPx = canvasRect.height - annH - 10;
            if (topPx < 10) topPx = 10;
            // Connector: from top-center of annotation to bottom-center of panel
            dotX = leftPx + annWidth / 2;
            dotY = topPx;
            targetX = panelCenterX;
            targetY = exRect.bottom - canvasRect.top;
          } else if (sub.id === 'colsel') {
            // Position ABOVE the panel, centered on it
            const panelCenterX = exRect.left + exRect.width / 2 - canvasRect.left;
            leftPx = panelCenterX - annWidth / 2;
            topPx = exRect.top - canvasRect.top - annH - gap;
            if (topPx < 10) topPx = 10;
            // Connector: from bottom-center of annotation to top-center of panel
            dotX = leftPx + annWidth / 2;
            dotY = topPx + annH;
            targetX = panelCenterX;
            targetY = exRect.top - canvasRect.top;
          } else {
            // Position to the LEFT of the sheet, shifted DOWN to avoid overlapping the mock
            leftPx = exRect.left - canvasRect.left - annWidth - gap;
            topPx = exRect.top + exRect.height / 2 - canvasRect.top - annH / 2;
            leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
            if (topPx < 10) topPx = 10;
            if (topPx > canvasRect.height - annH - 10) topPx = canvasRect.height - annH - 10;
            // Connector 1: dot at right edge of annotation, line to left edge of sheet
            dotX = leftPx + annWidth;
            dotY = topPx + annH / 2;
            targetX = exRect.left - canvasRect.left;
            targetY = exRect.top + exRect.height / 2 - canvasRect.top;
          }
          annEl.style.left = leftPx + 'px';
          annEl.style.top = topPx + 'px';
          annEl.style.width = annWidth + 'px';
          const card = annEl.querySelector('.ann-card');
          if (card) card.style.width = annWidth + 'px';
          drawConnector(line, dot, dotX, dotY, targetX, targetY);

          // Connector 2: from LEFT side of "Search In Panel" annotation to "All Fields" CTA in ex-search (searchin only)
          if (sub.id === 'searchin') {
            const lineCta = document.getElementById('line-searchin-cta');
            const dotCta = document.getElementById('dot-searchin-cta');
            const scopeCta = document.getElementById('ex-search-scope');
            if (lineCta) lineCta.classList.toggle('visible', annOpacity > 0.5);
            if (dotCta) dotCta.classList.toggle('visible', annOpacity > 0.5);
            if (scopeCta && lineCta && dotCta) {
              const scopeRect = scopeCta.getBoundingClientRect();
              // Start: left edge of the "Search In Panel" annotation
              const ctaDotX = leftPx;
              const ctaDotY = topPx + annH / 2;
              // End: right side of the "All Fields" CTA button in ex-search
              const ctaTargetX = scopeRect.right - canvasRect.left;
              const ctaTargetY = scopeRect.top + scopeRect.height / 2 - canvasRect.top;
              drawConnector(lineCta, dotCta, ctaDotX, ctaDotY, ctaTargetX, ctaTargetY);
            }
          }

          // ===== Extra annotations for advfilter only (reset, connector, preview, form) =====
          if (sub.id === 'advfilter') {
            const extraAnnIds = [
              { annId: 'ann-advfilter-reset', lineId: 'line-advfilter-reset', dotId: 'dot-advfilter-reset', targetId: 'adv-reset-btn', position: 'above' },
              { annId: 'ann-advfilter-connector', lineId: 'line-advfilter-connector', dotId: 'dot-advfilter-connector', targetId: 'adv-connector-toggle', position: 'left' },
              { annId: 'ann-advfilter-preview', lineId: 'line-advfilter-preview', dotId: 'dot-advfilter-preview', targetId: 'adv-preview-box', position: 'left', yOffset: 80 },
              { annId: 'ann-advfilter-form', lineId: 'line-advfilter-form', dotId: 'dot-advfilter-form', targetId: 'adv-value-input', position: 'left' },
            ];
            const extraAnnWidth = 200;
            const extraGap = 16;
            extraAnnIds.forEach((info, idx) => {
              const exAnn = document.getElementById(info.annId);
              const exLine = document.getElementById(info.lineId);
              const exDot = document.getElementById(info.dotId);
              const targetEl = document.getElementById(info.targetId);
              if (exAnn) exAnn.style.opacity = annOpacity;
              if (exLine) exLine.classList.toggle('visible', annOpacity > 0.5);
              if (exDot) exDot.classList.toggle('visible', annOpacity > 0.5);
              if (exAnn && targetEl) {
                const targetRect = targetEl.getBoundingClientRect();
                const targetCenterX = (targetRect.left + targetRect.width / 2) - canvasRect.left;
                const targetCenterY = (targetRect.top + targetRect.height / 2) - canvasRect.top;
                const exAnnH = exAnn.offsetHeight || 80;

                if (info.position === 'above') {
                  // Position ABOVE the panel, centered on the reset CTA
                  let exLeft = targetCenterX - extraAnnWidth / 2;
                  let exTop = exRect.top - canvasRect.top - exAnnH - extraGap;
                  if (exTop < 10) exTop = 10;
                  exAnn.style.left = exLeft + 'px';
                  exAnn.style.top = exTop + 'px';
                  exAnn.style.width = extraAnnWidth + 'px';
                  const exCard = exAnn.querySelector('.ann-card');
                  if (exCard) exCard.style.width = extraAnnWidth + 'px';
                  // Connector: from bottom-center of annotation to top of reset CTA
                  const exDotX = exLeft + extraAnnWidth / 2;
                  const exDotY = exTop + exAnnH;
                  const exTargetX = targetCenterX;
                  const exTargetY = targetRect.top - canvasRect.top;
                  drawConnector(exLine, exDot, exDotX, exDotY, exTargetX, exTargetY);
                } else {
                  // Position to the LEFT of the panel, aligned to each target
                  let exLeft = exRect.left - canvasRect.left - extraAnnWidth - extraGap;
                  let exTop = targetCenterY - exAnnH / 2 + (info.yOffset || 0);
                  if (exTop < 10) exTop = 10;
                  if (exTop > canvasRect.height - exAnnH - 10) exTop = canvasRect.height - exAnnH - 10;
                  exAnn.style.left = exLeft + 'px';
                  exAnn.style.top = exTop + 'px';
                  exAnn.style.width = extraAnnWidth + 'px';
                  const exCard = exAnn.querySelector('.ann-card');
                  if (exCard) exCard.style.width = extraAnnWidth + 'px';
                  // Connector: from right edge of annotation to left edge of target element
                  const exDotX = exLeft + extraAnnWidth;
                  const exDotY = exTop + exAnnH / 2;
                  const exTargetX = targetRect.left - canvasRect.left;
                  const exTargetY = targetCenterY;
                  drawConnector(exLine, exDot, exDotX, exDotY, exTargetX, exTargetY);
                }
              }
            });
          }

        }

        // Reset extra advfilter annotations when not visible (prevents ghost annotations on scroll-back)
        if (sub.id === 'advfilter' && annOpacity <= 0.05) {
          ['ann-advfilter-reset', 'ann-advfilter-connector', 'ann-advfilter-preview', 'ann-advfilter-form'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.opacity = 0;
          });
          ['line-advfilter-reset', 'line-advfilter-connector', 'line-advfilter-preview', 'line-advfilter-form'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('visible');
          });
          ['dot-advfilter-reset', 'dot-advfilter-connector', 'dot-advfilter-preview', 'dot-advfilter-form'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('visible');
          });
        }

        // ===== Extra annotations for colsel only (sticky fields, auditing fields) =====
        // All 3 annotations share the same opacity (appear together during hold period)
        if (sub.id === 'colsel' && effAmount > 0.05) {
          const exRectCs = exEl.getBoundingClientRect();
          const colselExtraAnns = [
            { annId: 'ann-colsel-sticky', lineId: 'line-colsel-sticky', dotId: 'dot-colsel-sticky', targetId: 'colsel-field-name' },
            { annId: 'ann-colsel-audit', lineId: 'line-colsel-audit', dotId: 'dot-colsel-audit', targetId: 'colsel-field-createdat' },
          ];
          const colselAnnWidth = 210;
          const colselGap = 16;
          colselExtraAnns.forEach(info => {
            const exAnn = document.getElementById(info.annId);
            const exLine = document.getElementById(info.lineId);
            const exDot = document.getElementById(info.dotId);
            const targetEl = document.getElementById(info.targetId);
            // All annotations share the same opacity as the main annotation
            if (exAnn) exAnn.style.opacity = annOpacity;
            if (exLine) exLine.classList.toggle('visible', annOpacity > 0.5);
            if (exDot) exDot.classList.toggle('visible', annOpacity > 0.5);
            if (exAnn && targetEl && annOpacity > 0.05) {
              const targetRect = targetEl.getBoundingClientRect();
              const targetCenterY = (targetRect.top + targetRect.height / 2) - canvasRect.top;
              const exAnnH = exAnn.offsetHeight || 80;
              // Position to the LEFT of the panel, aligned to the target group header
              let exLeft = exRectCs.left - canvasRect.left - colselAnnWidth - colselGap;
              let exTop = targetCenterY - exAnnH / 2;
              if (exTop < 10) exTop = 10;
              if (exTop > canvasRect.height - exAnnH - 10) exTop = canvasRect.height - exAnnH - 10;
              exAnn.style.left = exLeft + 'px';
              exAnn.style.top = exTop + 'px';
              exAnn.style.width = colselAnnWidth + 'px';
              const exCard = exAnn.querySelector('.ann-card');
              if (exCard) exCard.style.width = colselAnnWidth + 'px';
              // Connector: from right edge of annotation to left edge of panel (at target height)
              const exDotX = exLeft + colselAnnWidth;
              const exDotY = exTop + exAnnH / 2;
              const exTargetX = exRectCs.left - canvasRect.left;
              const exTargetY = targetCenterY;
              drawConnector(exLine, exDot, exDotX, exDotY, exTargetX, exTargetY);
            }
          });
        }
        return;
      }

      // ===== Special case: search-fixed (search input extracts with fixed width) =====
      if (sub.special === 'search-fixed') {
        const mockRect = screenMock.getBoundingClientRect();
        const mockLeft = mockRect.left - canvasRect.left;
        const fixedW = 280;
        const natH = exEl.offsetHeight || 48;

        // Find the search input's position inside the mock
        const searchInMock = document.querySelector('.pb-search-input');
        const searchRect = searchInMock ? searchInMock.getBoundingClientRect() : null;
        const searchTopInCanvas = searchRect ? searchRect.top - canvasRect.top : (contentRect.top - canvasRect.top);
        const searchLeftInCanvas = searchRect ? searchRect.left - canvasRect.left : (contentRect.left - canvasRect.left);

        const startLeft = contentRect.left - canvasRect.left;
        const startTop = contentRect.top - canvasRect.top;
        // End: stay vertically aligned with source search input, move only slightly left
        const endLeft = searchLeftInCanvas - 40;
        const endTop = searchTopInCanvas;

        const curLeft = lerp(startLeft, endLeft, amount);
        const curTop = lerp(startTop, endTop, amount);
        const exScale = lerp(scale, 1.0, amount);

        exEl.style.opacity = 1;
        exEl.style.left = curLeft + 'px';
        exEl.style.top = curTop + 'px';
        exEl.style.width = fixedW + 'px';
        exEl.style.height = natH + 'px';
        exEl.style.transform = `scale(${exScale})`;
        exEl.style.transformOrigin = 'center center';
        exEl.classList.toggle('detached', amount > 0.1);
        exEl.classList.toggle('glow-border', amount > 0.9 && pReassemble < 0.1);

        const pAnnIn = smoothstep(ph.start + phaseDur * 0.35, ph.start + phaseDur * 0.45, progress);
        const pAnnOut = smoothstep(ph.end - phaseDur * 0.25, ph.end, progress);
        const annOpacity = pAnnIn * (1 - pAnnOut);
        annEl.style.opacity = annOpacity;
        if (line) line.classList.toggle('visible', annOpacity > 0.5);
        if (dot) dot.classList.toggle('visible', annOpacity > 0.5);

        if (annOpacity > 0.05) {
          const exRect = exEl.getBoundingClientRect();
          const annWidth = 210;
          const annH = annEl.offsetHeight || 90;
          const gap = 16;
          // Annotation to the LEFT of the search input, outside the mock
          let leftPx = exRect.left - canvasRect.left - annWidth - gap - 50;
          let topPx = exRect.top + exRect.height / 2 - canvasRect.top - annH / 2;
          leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
          if (topPx < 10) topPx = 10;
          if (topPx > canvasRect.height - annH - 10) topPx = canvasRect.height - annH - 10;
          annEl.style.left = leftPx + 'px';
          annEl.style.top = topPx + 'px';
          annEl.style.width = annWidth + 'px';
          const card = annEl.querySelector('.ann-card');
          if (card) card.style.width = annWidth + 'px';

          // Connector 1: dot at right edge of annotation, line to left edge of search input
          const dotX = leftPx + annWidth;
          const dotY = topPx + annH / 2;
          const targetX = exRect.left - canvasRect.left;
          const targetY = exRect.top + exRect.height / 2 - canvasRect.top;
          drawConnector(line, dot, dotX, dotY, targetX, targetY);

          // Connector 2: from search annotation (bottom-right) to "All Fields" CTA in ex-search (right side)
          const lineCta = document.getElementById('line-searchin-cta');
          const dotCta = document.getElementById('dot-searchin-cta');
          const scopeCta = document.getElementById('ex-search-scope');
          if (lineCta) lineCta.classList.toggle('visible', annOpacity > 0.5);
          if (dotCta) dotCta.classList.toggle('visible', annOpacity > 0.5);
          if (scopeCta && lineCta && dotCta) {
            const scopeRect = scopeCta.getBoundingClientRect();
            // Start: bottom-right of the annotation box
            const ctaDotX = leftPx + annWidth;
            const ctaDotY = topPx + annH;
            // End: right side of the "All Fields" CTA button
            const ctaTargetX = scopeRect.right - canvasRect.left;
            const ctaTargetY = scopeRect.top + scopeRect.height / 2 - canvasRect.top;
            drawConnector(lineCta, dotCta, ctaDotX, ctaDotY, ctaTargetX, ctaTargetY);
          }
        }
        return;
      }

      // ===== Special case: toolbar-up (entire second toolbar extracts, zooms out, moves slightly up) =====
      if (sub.special === 'toolbar-up') {
        const toolbar = document.getElementById('src-toolbar-second');
        const toolbarRect = toolbar ? toolbar.getBoundingClientRect() : contentRect;
        // Visual (scaled) position and size from the mock
        const visLeft = toolbarRect.left - canvasRect.left;
        const visTop = toolbarRect.top - canvasRect.top;
        const visW = toolbarRect.width;
        const visH = toolbarRect.height || 44;
        // Natural (unscaled) size — divide by mock scale to avoid double-scaling
        const natW = visW / scale;
        const natH = (exEl.offsetHeight || visH) / scale * scale; // keep natural height
        const natHReal = exEl.offsetHeight || visH / scale;

        // Start: position adjusted so the scaled element visually matches the mock toolbar
        // With transformOrigin: center, visual left = left + (natW - natW*scale)/2
        // So left = visLeft - natW*(1-scale)/2
        const startLeft = visLeft - natW * (1 - scale) / 2;
        const startTop = visTop - natHReal * (1 - scale) / 2;
        // End: slightly above, a bit wider (not taller), keep centered
        const endW = natW + 60;
        const endLeft = visLeft + visW / 2 - endW / 2; // centered on original visual center
        const endTop = visTop - 30 - natHReal * (1 - scale) / 2;

        const curLeft = lerp(startLeft, endLeft, amount);
        const curTop = lerp(startTop, endTop, amount);
        const curW = lerp(natW, endW, amount);
        const exScale = lerp(scale, 1.0, amount);

        exEl.style.opacity = 1;
        exEl.style.left = curLeft + 'px';
        exEl.style.top = curTop + 'px';
        exEl.style.width = curW + 'px';
        exEl.style.height = natHReal + 'px';
        exEl.style.transform = `scale(${exScale})`;
        exEl.style.transformOrigin = 'center center';
        exEl.classList.toggle('detached', amount > 0.1);
        exEl.classList.toggle('glow-border', amount > 0.9 && pReassemble < 0.1);

        const pAnnIn = smoothstep(ph.start + phaseDur * 0.35, ph.start + phaseDur * 0.45, progress);
        const pAnnOut = smoothstep(ph.end - phaseDur * 0.25, ph.end, progress);
        const annOpacity = pAnnIn * (1 - pAnnOut);
        annEl.style.opacity = annOpacity;
        if (line) line.classList.toggle('visible', annOpacity > 0.5);
        if (dot) dot.classList.toggle('visible', annOpacity > 0.5);

        // 2nd annotation (above, about Clear all)
        const annClear = document.getElementById('ann-filterchips-clear');
        const lineClear = document.getElementById('line-filterchips-clear');
        const dotClear = document.getElementById('dot-filterchips-clear');
        if (annClear) annClear.style.opacity = annOpacity;
        if (lineClear) lineClear.classList.toggle('visible', annOpacity > 0.5);
        if (dotClear) dotClear.classList.toggle('visible', annOpacity > 0.5);

        // 3rd annotation (below, about filter badges)
        const annEl2 = document.getElementById('ann-filterchips-2');
        const line2 = document.getElementById('line-filterchips-2');
        const dot2 = document.getElementById('dot-filterchips-2');
        if (annEl2) annEl2.style.opacity = annOpacity;
        if (line2) line2.classList.toggle('visible', annOpacity > 0.5);
        if (dot2) dot2.classList.toggle('visible', annOpacity > 0.5);

        if (annOpacity > 0.05) {
          const exRect = exEl.getBoundingClientRect();
          const annWidth = 220;
          const annH = annEl.offsetHeight || 90;
          const gap = 16;

          // Annotation 1 (toolbar): to the LEFT of the toolbar, vertically centered
          let leftPx1 = exRect.left - canvasRect.left - annWidth - gap - 40;
          let topPx1 = exRect.top + exRect.height / 2 - canvasRect.top - annH / 2;
          if (topPx1 < 10) topPx1 = 10;
          if (topPx1 > canvasRect.height - annH - 10) topPx1 = canvasRect.height - annH - 10;
          annEl.style.left = leftPx1 + 'px';
          annEl.style.top = topPx1 + 'px';
          annEl.style.width = annWidth + 'px';
          const card1 = annEl.querySelector('.ann-card');
          if (card1) card1.style.width = annWidth + 'px';

          // Connector 1: from right edge of toolbar annotation to left edge of toolbar
          const dot1X = leftPx1 + annWidth;
          const dot1Y = topPx1 + annH / 2;
          const target1X = exRect.left - canvasRect.left;
          const target1Y = exRect.top + exRect.height / 2 - canvasRect.top;
          drawConnector(line, dot, dot1X, dot1Y, target1X, target1Y);

          // Annotation 2 (Clear all): ABOVE, centered on "Clear all" CTA
          if (annClear) {
            const clearAllBtn = document.getElementById('ex-clearall');
            const clearAllRect = clearAllBtn ? clearAllBtn.getBoundingClientRect() : exRect;
            const clearAllCenterX = (clearAllRect.left + clearAllRect.width / 2) - canvasRect.left;
            const annHClear = annClear.offsetHeight || 90;
            let leftPx2 = clearAllCenterX - annWidth / 2;
            let topPx2 = exRect.top - canvasRect.top - annHClear - gap;
            leftPx2 = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx2));
            if (topPx2 < 10) topPx2 = 10;
            annClear.style.left = leftPx2 + 'px';
            annClear.style.top = topPx2 + 'px';
            annClear.style.width = annWidth + 'px';
            const cardClear = annClear.querySelector('.ann-card');
            if (cardClear) cardClear.style.width = annWidth + 'px';

            // Connector 2: from bottom-center of Clear all annotation to top of "Clear all" CTA
            const dotCX = leftPx2 + annWidth / 2;
            const dotCY = topPx2 + annHClear;
            const targetCX = clearAllCenterX;
            const targetCY = clearAllRect.top - canvasRect.top;
            drawConnector(lineClear, dotClear, dotCX, dotCY, targetCX, targetCY);
          }

          // Annotation 3 (filter badges): BELOW, centered on filter badges space
          if (annEl2) {
            const filterBadge = document.getElementById('ex-filterbadge');
            const filterBadgeRect = filterBadge ? filterBadge.getBoundingClientRect() : exRect;
            const badgesSpaceLeft = filterBadgeRect.left - canvasRect.left;
            const badgesSpaceRight = exRect.right - canvasRect.left;
            const badgesSpaceCenterX = (badgesSpaceLeft + badgesSpaceRight) / 2;
            const annH2 = annEl2.offsetHeight || 90;
            let leftPx3 = badgesSpaceCenterX - annWidth / 2;
            let topPx3 = exRect.bottom - canvasRect.top + gap;
            leftPx3 = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx3));
            if (topPx3 < 10) topPx3 = 10;
            if (topPx3 > canvasRect.height - annH2 - 10) topPx3 = canvasRect.height - annH2 - 10;
            annEl2.style.left = leftPx3 + 'px';
            annEl2.style.top = topPx3 + 'px';
            annEl2.style.width = annWidth + 'px';
            const card2 = annEl2.querySelector('.ann-card');
            if (card2) card2.style.width = annWidth + 'px';

            // Connector 3: from top-center of filter badges annotation to bottom of toolbar
            const dot2X = leftPx3 + annWidth / 2;
            const dot2Y = topPx3;
            const target2X = badgesSpaceCenterX;
            const target2Y = exRect.bottom - canvasRect.top;
            drawConnector(line2, dot2, dot2X, dot2Y, target2X, target2Y);
          }
        }
        return;
      }

      // ===== Special case: selection-mock (phase 11 — simulate selection on mock screen) =====
      if (sub.special === 'selection-mock') {
        // This phase does NOT extract — it animates directly on the mock screen
        exEl.style.opacity = 0;
        const phaseDurSel = ph.end - ph.start;

        // Reset when scrolling back before phase 11
        if (progress < ph.start - 0.001) {
          for (let i = 1; i <= 5; i++) {
            const check = document.getElementById('src-check-' + i);
            const row = document.getElementById('src-row-' + i);
            if (check) { check.classList.remove('checked'); check.style.opacity = ''; }
            if (row) { row.classList.remove('selected'); }
          }
          const checkAll = document.getElementById('src-check-all');
          if (checkAll) { checkAll.classList.remove('checked'); checkAll.style.opacity = ''; }
          const counter = document.getElementById('src-selection-counter');
          if (counter) { counter.style.display = 'none'; }
          const divider = document.getElementById('src-selection-divider');
          if (divider) { divider.style.display = 'none'; }
          const eyeToggle = document.getElementById('src-eye-toggle');
          if (eyeToggle) { eyeToggle.style.display = 'none'; }
          // Hide annotations
          annEl.style.opacity = 0;
          if (line) line.classList.remove('visible');
          if (dot) dot.classList.remove('visible');
          const annAll = document.getElementById('ann-select-all');
          const lineAll = document.getElementById('line-select-all');
          const dotAll = document.getElementById('dot-select-all');
          const annCounterEl = document.getElementById('ann-selection-counter');
          const lineCounter = document.getElementById('line-selection-counter');
          const dotCounter = document.getElementById('dot-selection-counter');
          if (annAll) annAll.style.opacity = 0;
          if (annCounterEl) annCounterEl.style.opacity = 0;
          if (lineAll) lineAll.classList.remove('visible');
          if (dotAll) dotAll.classList.remove('visible');
          if (lineCounter) lineCounter.classList.remove('visible');
          if (dotCounter) dotCounter.classList.remove('visible');
          return;
        }

        // When past phase 11, fade out everything (selection state + annotations)
        if (progress > ph.end + 0.001) {
          // Reset all checkboxes and rows
          for (let i = 1; i <= 5; i++) {
            const check = document.getElementById('src-check-' + i);
            const row = document.getElementById('src-row-' + i);
            if (check) { check.classList.remove('checked'); check.style.opacity = ''; }
            if (row) { row.classList.remove('selected'); }
          }
          const checkAll = document.getElementById('src-check-all');
          if (checkAll) { checkAll.classList.remove('checked'); checkAll.style.opacity = ''; }
          const counter = document.getElementById('src-selection-counter');
          if (counter) { counter.style.display = 'none'; }
          const divider = document.getElementById('src-selection-divider');
          if (divider) { divider.style.display = 'none'; }
          const eyeToggle = document.getElementById('src-eye-toggle');
          if (eyeToggle) { eyeToggle.style.display = 'none'; }
          // Hide annotations
          annEl.style.opacity = 0;
          if (line) line.classList.remove('visible');
          if (dot) dot.classList.remove('visible');
          const annAll2 = document.getElementById('ann-select-all');
          const lineAll2 = document.getElementById('line-select-all');
          const dotAll2 = document.getElementById('dot-select-all');
          const annCounterEl2 = document.getElementById('ann-selection-counter');
          const lineCounter2 = document.getElementById('line-selection-counter');
          const dotCounter2 = document.getElementById('dot-selection-counter');
          if (annAll2) annAll2.style.opacity = 0;
          if (annCounterEl2) annCounterEl2.style.opacity = 0;
          if (lineAll2) lineAll2.classList.remove('visible');
          if (dotAll2) dotAll2.classList.remove('visible');
          if (lineCounter2) lineCounter2.classList.remove('visible');
          if (dotCounter2) dotCounter2.classList.remove('visible');
          return;
        }

        // Sequential selection: each row selected in sequence
        const p1 = smoothstep(ph.start, ph.start + phaseDurSel * 0.20, progress);       // Row 1
        const p2 = smoothstep(ph.start + phaseDurSel * 0.25, ph.start + phaseDurSel * 0.45, progress); // Row 2
        const p3 = smoothstep(ph.start + phaseDurSel * 0.50, ph.start + phaseDurSel * 0.70, progress); // Row 3

        // Apply selection to rows
        const applySelection = (rowIdx, p) => {
          const check = document.getElementById('src-check-' + rowIdx);
          const row = document.getElementById('src-row-' + rowIdx);
          if (check) {
            if (p > 0.5) { check.classList.add('checked'); }
            else { check.classList.remove('checked'); }
            check.style.opacity = p > 0.1 ? 1 : '';
          }
          if (row) {
            if (p > 0.5) { row.classList.add('selected'); }
            else { row.classList.remove('selected'); }
          }
        };

        applySelection(1, p1);
        applySelection(2, p2);
        applySelection(3, p3);

        // Uncheck rows 4 and 5
        for (let i = 4; i <= 5; i++) {
          const check = document.getElementById('src-check-' + i);
          const row = document.getElementById('src-row-' + i);
          if (check) { check.classList.remove('checked'); check.style.opacity = ''; }
          if (row) { row.classList.remove('selected'); }
        }

        // Selection counter in footer
        const counter = document.getElementById('src-selection-counter');
        const divider = document.getElementById('src-selection-divider');
        const countEl = document.getElementById('src-selection-count');
        const eyeToggle = document.getElementById('src-eye-toggle');
        const selCount = (p1 > 0.5 ? 1 : 0) + (p2 > 0.5 ? 1 : 0) + (p3 > 0.5 ? 1 : 0);
        if (counter) {
          if (selCount > 0) {
            counter.style.display = 'flex';
            counter.style.opacity = Math.min(1, p1 * 2);
          } else {
            counter.style.display = 'none';
          }
        }
        if (divider) {
          divider.style.display = selCount > 0 ? 'block' : 'none';
        }
        if (countEl) countEl.textContent = selCount;
        if (eyeToggle) {
          eyeToggle.style.display = p3 > 0.5 ? 'inline-flex' : 'none';
        }

        // Annotations during last 25% of phase
        const pAnnIn = smoothstep(ph.start + phaseDurSel * 0.75, ph.start + phaseDurSel * 0.85, progress);
        const pAnnOut = smoothstep(ph.end - phaseDurSel * 0.05, ph.end, progress);
        const annOpacity = pAnnIn * (1 - pAnnOut);
        const mockRect = screenMock.getBoundingClientRect();

        // Select all annotation (points to header checkbox) — positioned first so row selection can go below it
        const annAll = document.getElementById('ann-select-all');
        const lineAll = document.getElementById('line-select-all');
        const dotAll = document.getElementById('dot-select-all');
        let annAllLeft = 0, annAllTop = 0, annAllH = 90, annAllW = 200;
        if (annAll) {
          annAll.style.opacity = annOpacity;
          if (lineAll) lineAll.classList.toggle('visible', annOpacity > 0.5);
          if (dotAll) dotAll.classList.toggle('visible', annOpacity > 0.5);
          if (annOpacity > 0.05) {
            const checkAllEl = document.getElementById('src-check-all');
            const targetRect = checkAllEl ? checkAllEl.getBoundingClientRect() : mockRect;
            annAllW = 200;
            annAllH = annAll.offsetHeight || 90;
            const gap = 40;
            // Position to the LEFT of the header checkbox
            annAllLeft = targetRect.left - canvasRect.left - annAllW - gap;
            let topPx2 = targetRect.top + targetRect.height / 2 - canvasRect.top - annAllH / 2;
            annAllLeft = Math.max(10, Math.min(canvasRect.width - annAllW - 10, annAllLeft));
            if (topPx2 < 10) topPx2 = 10;
            if (topPx2 > canvasRect.height - annAllH - 10) topPx2 = canvasRect.height - annAllH - 10;
            annAllTop = topPx2;
            annAll.style.left = annAllLeft + 'px';
            annAll.style.top = annAllTop + 'px';
            annAll.style.width = annAllW + 'px';
            const card2 = annAll.querySelector('.ann-card');
            if (card2) card2.style.width = annAllW + 'px';
            const dotX2 = annAllLeft + annAllW;
            const dotY2 = annAllTop + annAllH / 2;
            const targetX2 = targetRect.left - canvasRect.left;
            const targetY2 = targetRect.top + targetRect.height / 2 - canvasRect.top;
            drawConnector(lineAll, dotAll, dotX2, dotY2, targetX2, targetY2);
          }
        }

        // Main annotation (below the select-all annotation)
        annEl.style.opacity = annOpacity;
        if (line) line.classList.toggle('visible', annOpacity > 0.5);
        if (dot) dot.classList.toggle('visible', annOpacity > 0.5);
        if (annOpacity > 0.05) {
          const annWidth = 200;
          const annH = annEl.offsetHeight || 90;
          // Position just below the select-all annotation, same X
          let leftPx = annAllLeft;
          let topPx = annAllTop + annAllH + 8;
          leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
          if (topPx < 10) topPx = 10;
          if (topPx > canvasRect.height - annH - 10) topPx = canvasRect.height - annH - 10;
          annEl.style.left = leftPx + 'px';
          annEl.style.top = topPx + 'px';
          annEl.style.width = annWidth + 'px';
          const card = annEl.querySelector('.ann-card');
          if (card) card.style.width = annWidth + 'px';
          // Connector: from right edge of annotation to the 3rd row checkbox (nearly horizontal)
          const dotX = leftPx + annWidth;
          const dotY = topPx + annH / 2;
          const thirdCheck = document.getElementById('src-check-3');
          const targetRect = thirdCheck ? thirdCheck.getBoundingClientRect() : mockRect;
          const targetX = targetRect.left - canvasRect.left;
          const targetY = targetRect.top + targetRect.height / 2 - canvasRect.top;
          drawConnector(line, dot, dotX, dotY, targetX, targetY);
        }

        // Selection counter annotation (points to footer counter)
        const annCounterEl = document.getElementById('ann-selection-counter');
        const lineCounter = document.getElementById('line-selection-counter');
        const dotCounter = document.getElementById('dot-selection-counter');
        if (annCounterEl) {
          annCounterEl.style.opacity = annOpacity;
          if (lineCounter) lineCounter.classList.toggle('visible', annOpacity > 0.5);
          if (dotCounter) dotCounter.classList.toggle('visible', annOpacity > 0.5);
          if (annOpacity > 0.05) {
            const counterEl = document.getElementById('src-selection-counter');
            const targetRect = counterEl ? counterEl.getBoundingClientRect() : mockRect;
            const annWidth3 = 200;
            const annH3 = annCounterEl.offsetHeight || 90;
            const gap = 16;
            // Position BELOW the footer
            let leftPx3 = targetRect.left + targetRect.width / 2 - canvasRect.left - annWidth3 / 2;
            let topPx3 = targetRect.bottom - canvasRect.top + gap;
            leftPx3 = Math.max(10, Math.min(canvasRect.width - annWidth3 - 10, leftPx3));
            if (topPx3 < 10) topPx3 = 10;
            if (topPx3 > canvasRect.height - annH3 - 10) topPx3 = canvasRect.height - annH3 - 10;
            annCounterEl.style.left = leftPx3 + 'px';
            annCounterEl.style.top = topPx3 + 'px';
            annCounterEl.style.width = annWidth3 + 'px';
            const card3 = annCounterEl.querySelector('.ann-card');
            if (card3) card3.style.width = annWidth3 + 'px';
            const dotX3 = leftPx3 + annWidth3 / 2;
            const dotY3 = topPx3;
            const targetX3 = targetRect.left + targetRect.width / 2 - canvasRect.left;
            const targetY3 = targetRect.bottom - canvasRect.top;
            drawConnector(lineCounter, dotCounter, dotX3, dotY3, targetX3, targetY3);
          }
        }

        return;
      }

      // ===== Special case: sorting-mock (phase 12 — simulate 3-state sorting on mock screen) =====
      if (sub.special === 'sorting-mock') {
        // This phase does NOT extract — it animates directly on the mock screen
        exEl.style.opacity = 0;
        const phaseDurSort = ph.end - ph.start;

        // Reset when before or after phase 12
        if (progress < ph.start - 0.001 || progress > ph.end + 0.001) {
          // Reset Name column sort icon to default (up/down arrows)
          const sortNameIcon = document.getElementById('src-sort-name');
          const nameTh = document.getElementById('src-name-th');
          if (sortNameIcon) {
            sortNameIcon.innerHTML = '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>';
            sortNameIcon.style.opacity = '';
            sortNameIcon.style.color = '';
          }
          if (nameTh) { nameTh.classList.remove('sorted'); }
          // Reset row transforms
          for (let i = 1; i <= 5; i++) {
            const row = document.getElementById('src-row-' + i);
            if (row) row.style.transform = '';
          }
          // Hide all annotations
          annEl.style.opacity = 0;
          if (line) line.classList.remove('visible');
          if (dot) dot.classList.remove('visible');
          ['ann-sort-none', 'ann-sort-asc', 'ann-sort-desc'].forEach(id => { const el = document.getElementById(id); if (el) el.style.opacity = 0; });
          ['line-sort-none', 'line-sort-asc', 'line-sort-desc'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('visible'); });
          ['dot-sort-none', 'dot-sort-asc', 'dot-sort-desc'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('visible'); });
          return;
        }

        // Three sort states, each ~33% of the phase
        const pState1 = smoothstep(ph.start, ph.start + phaseDurSort * 0.15, progress);       // No sort (fade in)
        const pState2 = smoothstep(ph.start + phaseDurSort * 0.33, ph.start + phaseDurSort * 0.48, progress); // Ascending
        const pState3 = smoothstep(ph.start + phaseDurSort * 0.66, ph.start + phaseDurSort * 0.81, progress); // Descending
        // Fade out at the very end
        const pFadeOut = smoothstep(ph.end - phaseDurSort * 0.05, ph.end, progress);

        const sortNameIcon = document.getElementById('src-sort-name');
        const nameTh = document.getElementById('src-name-th');

        // Determine current sort state
        const inState1 = progress < ph.start + phaseDurSort * 0.33;
        const inState2 = progress >= ph.start + phaseDurSort * 0.33 && progress < ph.start + phaseDurSort * 0.66;
        const inState3 = progress >= ph.start + phaseDurSort * 0.66;

        if (inState1) {
          // No user sort — default icon
          if (sortNameIcon) {
            sortNameIcon.innerHTML = '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>';
            sortNameIcon.style.opacity = '0.4';
            sortNameIcon.style.color = '';
          }
          if (nameTh) { nameTh.classList.remove('sorted'); }
          // Reset row order (original: Acme, Globex, Initech, Umbrella, Stark)
          for (let i = 1; i <= 5; i++) {
            const row = document.getElementById('src-row-' + i);
            if (row) row.style.transform = '';
          }
        } else if (inState2) {
          // Ascending — arrow up
          if (sortNameIcon) {
            sortNameIcon.innerHTML = '<path d="m18 15-6-6-6 6"/>';
            sortNameIcon.style.opacity = '1';
            sortNameIcon.style.color = 'var(--pb-primary)';
          }
          if (nameTh) { nameTh.classList.add('sorted'); }
          // Ascending order: Acme(1), Globex(2), Initech(3), Stark(5), Umbrella(4)
          // Row 4 (Umbrella, idx 3) → target idx 4, offset +1
          // Row 5 (Stark, idx 4) → target idx 3, offset -1
          const rowH = document.getElementById('src-row-1').offsetHeight;
          const ascOffsets = { 1: 0, 2: 0, 3: 0, 4: rowH, 5: -rowH };
          for (let i = 1; i <= 5; i++) {
            const row = document.getElementById('src-row-' + i);
            if (row) row.style.transform = `translateY(${ascOffsets[i]}px)`;
          }
        } else if (inState3) {
          // Descending — arrow down
          if (sortNameIcon) {
            sortNameIcon.innerHTML = '<path d="m6 9 6 6 6-6"/>';
            sortNameIcon.style.opacity = '1';
            sortNameIcon.style.color = 'var(--pb-primary)';
          }
          if (nameTh) { nameTh.classList.add('sorted'); }
          // Descending order: Umbrella(4), Stark(5), Initech(3), Globex(2), Acme(1)
          // Row 1 (Acme, idx 0) → target idx 4, offset +4
          // Row 2 (Globex, idx 1) → target idx 3, offset +2
          // Row 3 (Initech, idx 2) → target idx 2, offset 0
          // Row 4 (Umbrella, idx 3) → target idx 0, offset -3
          // Row 5 (Stark, idx 4) → target idx 1, offset -3
          const rowH = document.getElementById('src-row-1').offsetHeight;
          const descOffsets = { 1: 4 * rowH, 2: 2 * rowH, 3: 0, 4: -3 * rowH, 5: -3 * rowH };
          for (let i = 1; i <= 5; i++) {
            const row = document.getElementById('src-row-' + i);
            if (row) row.style.transform = `translateY(${descOffsets[i]}px)`;
          }
        }

        // Main annotation visible throughout (fade in first 15%, fade out last 5%)
        const mainAnnOpacity = pState1 * (1 - pFadeOut);
        annEl.style.opacity = mainAnnOpacity;
        if (line) line.classList.toggle('visible', mainAnnOpacity > 0.5);
        if (dot) dot.classList.toggle('visible', mainAnnOpacity > 0.5);
        const mockRect = screenMock.getBoundingClientRect();
        if (mainAnnOpacity > 0.05) {
          const annWidth = 220;
          const annH = annEl.offsetHeight || 90;
          const nameRect = nameTh ? nameTh.getBoundingClientRect() : mockRect;
          const gap = 12;
          // Center horizontally on the Name column, above the header
          let leftPx = nameRect.left + nameRect.width / 2 - canvasRect.left - annWidth / 2;
          let topPx = nameRect.top - canvasRect.top - annH - gap;
          leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
          if (topPx < 10) topPx = 10;
          annEl.style.left = leftPx + 'px';
          annEl.style.top = topPx + 'px';
          annEl.style.width = annWidth + 'px';
          const card = annEl.querySelector('.ann-card');
          if (card) card.style.width = annWidth + 'px';
          // Vertical connector to the Name column header
          const dotX = leftPx + annWidth / 2;
          const dotY = topPx + annH;
          const targetX = nameRect.left + nameRect.width / 2 - canvasRect.left;
          const targetY = nameRect.top - canvasRect.top;
          drawConnector(line, dot, dotX, dotY, targetX, targetY);
        }

        // State-specific annotations (each visible during its state)
        const state1Opacity = inState1 ? pState1 * (1 - pState2) : 0;
        const state2Opacity = inState2 ? pState2 * (1 - pState3) : 0;
        const state3Opacity = inState3 ? pState3 * (1 - pFadeOut) : 0;

        // Helper to position a state annotation to the LEFT of the Name column header
        const positionStateAnn = (annEl, lineEl, dotEl, opacity) => {
          if (!annEl) return;
          annEl.style.opacity = opacity;
          if (lineEl) lineEl.classList.toggle('visible', opacity > 0.5);
          if (dotEl) dotEl.classList.toggle('visible', opacity > 0.5);
          if (opacity > 0.05) {
            const nameRect = nameTh ? nameTh.getBoundingClientRect() : mockRect;
            const annWidth = 200;
            const annH = annEl.offsetHeight || 90;
            const gap = 40;
            let leftPx = nameRect.left - canvasRect.left - annWidth - gap;
            let topPx = nameRect.top + nameRect.height / 2 - canvasRect.top - annH / 2;
            leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
            if (topPx < 10) topPx = 10;
            if (topPx > canvasRect.height - annH - 10) topPx = canvasRect.height - annH - 10;
            annEl.style.left = leftPx + 'px';
            annEl.style.top = topPx + 'px';
            annEl.style.width = annWidth + 'px';
            const card = annEl.querySelector('.ann-card');
            if (card) card.style.width = annWidth + 'px';
            const dotX = leftPx + annWidth;
            const dotY = topPx + annH / 2;
            const targetX = nameRect.left - canvasRect.left;
            const targetY = nameRect.top + nameRect.height / 2 - canvasRect.top;
            drawConnector(lineEl, dotEl, dotX, dotY, targetX, targetY);
          }
        };

        positionStateAnn(
          document.getElementById('ann-sort-none'),
          document.getElementById('line-sort-none'),
          document.getElementById('dot-sort-none'),
          state1Opacity
        );
        positionStateAnn(
          document.getElementById('ann-sort-asc'),
          document.getElementById('line-sort-asc'),
          document.getElementById('dot-sort-asc'),
          state2Opacity
        );
        positionStateAnn(
          document.getElementById('ann-sort-desc'),
          document.getElementById('line-sort-desc'),
          document.getElementById('dot-sort-desc'),
          state3Opacity
        );

        return;
      }

      // ===== Special case: rowactions-dropdown (phase 13 — dropdown menu appears next to row action button) =====
      if (sub.special === 'rowactions-dropdown') {
        exEl.style.opacity = 0;
        const dropdown = document.getElementById('row-actions-dropdown');
        const actBtn = document.getElementById('src-act-btn-3');

        // Reset when before or after phase 13
        if (progress < ph.start - 0.001 || progress > ph.end + 0.001) {
          if (dropdown) { dropdown.style.opacity = 0; dropdown.style.pointerEvents = 'none'; }
          const dropInner = document.getElementById('row-actions-dropdown-inner');
          if (dropInner) { dropInner.classList.remove('detached', 'glow-border'); }
          annEl.style.opacity = 0;
          if (line) line.classList.remove('visible');
          if (dot) dot.classList.remove('visible');
          return;
        }

        // Fade in dropdown during first 30%, hold, fade out during last 20%
        const pDropIn = smoothstep(ph.start, ph.start + phaseDur * 0.3, progress);
        const pDropOut = smoothstep(ph.end - phaseDur * 0.2, ph.end, progress);
        const dropOpacity = pDropIn * (1 - pDropOut);

        // Position dropdown below the action button, aligned to the right edge
        const dropInner = document.getElementById('row-actions-dropdown-inner');
        if (dropdown && actBtn) {
          dropdown.style.opacity = dropOpacity;
          dropdown.style.pointerEvents = dropOpacity > 0.5 ? 'auto' : 'none';
          // Toggle detached/glow-border on inner element
          if (dropInner) {
            dropInner.classList.toggle('detached', dropOpacity > 0.1);
            dropInner.classList.toggle('glow-border', dropOpacity > 0.9 && pDropOut < 0.1);
          }
          if (dropOpacity > 0.05) {
            const btnRect = actBtn.getBoundingClientRect();
            const dropW = 224;
            const dropH = dropdown.offsetHeight || 220;
            // Align right edge of dropdown with right edge of action button, below it
            let leftPx = btnRect.right - canvasRect.left - dropW;
            let topPx = btnRect.bottom - canvasRect.top + 4;
            leftPx = Math.max(10, Math.min(canvasRect.width - dropW - 10, leftPx));
            if (topPx + dropH > canvasRect.height - 10) {
              topPx = btnRect.top - canvasRect.top - dropH - 4;
            }
            dropdown.style.left = leftPx + 'px';
            dropdown.style.top = topPx + 'px';
          }
        }

        // Annotation fades in during last 60%, positioned to the left of the dropdown
        const pAnnIn = smoothstep(ph.start + phaseDur * 0.4, ph.start + phaseDur * 0.55, progress);
        const pAnnOut = smoothstep(ph.end - phaseDur * 0.15, ph.end, progress);
        const annOpacity = pAnnIn * (1 - pAnnOut);
        annEl.style.opacity = annOpacity;
        if (line) line.classList.toggle('visible', annOpacity > 0.5);
        if (dot) dot.classList.toggle('visible', annOpacity > 0.5);
        if (annOpacity > 0.05 && dropdown) {
          const dropRect = dropdown.getBoundingClientRect();
          const annWidth = 220;
          const annH = annEl.offsetHeight || 90;
          const gap = 16;
          let leftPx = dropRect.left - canvasRect.left - annWidth - gap;
          // Center vertically on the dropdown for a horizontal connector
          let topPx = dropRect.top + dropRect.height / 2 - canvasRect.top - annH / 2;
          leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
          if (topPx < 10) topPx = 10;
          if (topPx > canvasRect.height - annH - 10) topPx = canvasRect.height - annH - 10;
          annEl.style.left = leftPx + 'px';
          annEl.style.top = topPx + 'px';
          annEl.style.width = annWidth + 'px';
          const card = annEl.querySelector('.ann-card');
          if (card) card.style.width = annWidth + 'px';
          const dotX = leftPx + annWidth;
          const dotY = topPx + annH / 2;
          const targetX = dropRect.left - canvasRect.left;
          const targetY = dropRect.top + dropRect.height / 2 - canvasRect.top;
          drawConnector(line, dot, dotX, dotY, targetX, targetY);
        }

        return;
      }

      // ===== Special case: viewmode-mock (phase 14 — simulate view mode switch on mock screen) =====
      if (sub.special === 'viewmode-mock') {
        exEl.style.opacity = 0;
        const viewToggle = document.getElementById('src-view-toggle');
        const vtTable = document.getElementById('src-vt-table');
        const vtCards = document.getElementById('src-vt-cards');
        const vtList = document.getElementById('src-vt-list');
        const tableScroll = document.getElementById('src-table-scroll');
        const cardGrid = document.getElementById('src-card-grid');
        const cardList = document.getElementById('src-card-list');
        const annGrid = document.getElementById('ann-viewmode-grid');
        const lineGrid = document.getElementById('line-viewmode-grid');
        const dotGrid = document.getElementById('dot-viewmode-grid');
        const annToolbar = document.getElementById('ann-viewmode-toolbar');
        const lineToolbar = document.getElementById('line-viewmode-toolbar');
        const dotToolbar = document.getElementById('dot-viewmode-toolbar');
        const annList = document.getElementById('ann-viewmode-list');
        const lineList = document.getElementById('line-viewmode-list');
        const dotList = document.getElementById('dot-viewmode-list');

        // Helper to hide all card views
        const hideAllCards = () => {
          if (cardGrid) { cardGrid.style.opacity = 0; cardGrid.style.display = 'none'; }
          if (cardList) { cardList.style.opacity = 0; cardList.style.display = 'none'; }
        };

        // Reset when before or after phase 14
        if (progress < ph.start - 0.001 || progress > ph.end + 0.001) {
          // When BEFORE the phase: reset everything to table view (normal state)
          // When AFTER the phase: only reset annotations/toggles — let the next phase
          // (deletion) handle the card→table transition smoothly
          const isAfter = progress > ph.end + 0.001;
          if (vtTable) vtTable.classList.add('active');
          if (vtCards) vtCards.classList.remove('active');
          if (vtList) vtList.classList.remove('active');
          if (!isAfter) {
            if (tableScroll) { tableScroll.style.opacity = ''; tableScroll.style.display = ''; }
            hideAllCards();
            const cardToolbarReset = document.getElementById('src-card-toolbar');
            if (cardToolbarReset) { cardToolbarReset.style.opacity = 0; cardToolbarReset.style.display = 'none'; }
            const cardViewsReset = document.getElementById('src-card-views');
            if (cardViewsReset) { cardViewsReset.style.opacity = 0; cardViewsReset.style.display = 'none'; }
            const tableViewsReset = document.getElementById('src-table-views');
            if (tableViewsReset) { tableViewsReset.style.opacity = ''; tableViewsReset.style.display = ''; }
          }
          annEl.style.opacity = 0;
          if (line) line.classList.remove('visible');
          if (dot) dot.classList.remove('visible');
          if (annGrid) annGrid.style.opacity = 0;
          if (lineGrid) lineGrid.classList.remove('visible');
          if (dotGrid) dotGrid.classList.remove('visible');
          if (annToolbar) annToolbar.style.opacity = 0;
          if (lineToolbar) lineToolbar.classList.remove('visible');
          if (dotToolbar) dotToolbar.classList.remove('visible');
          if (annList) annList.style.opacity = 0;
          if (lineList) lineList.classList.remove('visible');
          if (dotList) dotList.classList.remove('visible');
          return;
        }

        // Phase timeline — annotations substitute each other SEQUENTIALLY in the SAME position:
        // 0-8%:    "View modes" annotation fades in
        // 8-25%:   HOLD — table showing, VM annotation + claim visible
        // 25-35%:  "View modes" annotation fades out
        // 35-45%:  Card grid view annotation fades in + content cross-fade (table→grid) + icon switch — ALL SYNCHRONIZED
        // 45-55%:  Toolbar annotation fades in
        // 55-72%:  HOLD — ALL card grid view elements at final position
        // 72-82%:  Card list view annotation fades in + content cross-fade (grid→list) + icon switch — ALL SYNCHRONIZED
        // 82-100%: HOLD — card list view at final position (extended hold, smooth handoff to deletion phase)

        const pAnnVMIn = smoothstep(ph.start, ph.start + phaseDur * 0.08, progress);
        const pAnnVMOut = smoothstep(ph.start + phaseDur * 0.25, ph.start + phaseDur * 0.35, progress);
        const pToGrid = smoothstep(ph.start + phaseDur * 0.35, ph.start + phaseDur * 0.45, progress);
        const pAnnGridIn = smoothstep(ph.start + phaseDur * 0.35, ph.start + phaseDur * 0.45, progress);
        const pAnnToolbarIn = smoothstep(ph.start + phaseDur * 0.45, ph.start + phaseDur * 0.55, progress);
        const pToList = smoothstep(ph.start + phaseDur * 0.72, ph.start + phaseDur * 0.82, progress);
        const pAnnGridOut = smoothstep(ph.start + phaseDur * 0.72, ph.start + phaseDur * 0.82, progress);
        const pAnnListIn = smoothstep(ph.start + phaseDur * 0.72, ph.start + phaseDur * 0.82, progress);
        const pAnnListOut = smoothstep(ph.start + phaseDur * 0.88, ph.end, progress);
        const pAnnToolbarOut = smoothstep(ph.start + phaseDur * 0.85, ph.start + phaseDur * 0.90, progress);
        const pFadeOut = smoothstep(ph.start + phaseDur * 0.85, ph.start + phaseDur * 0.90, progress);

        // Toggle buttons — switch at midpoint of each content transition
        // (No fade-back to table here — deletion phase handles that)
        if (pToList > 0.5) {
          if (vtTable) vtTable.classList.remove('active');
          if (vtCards) vtCards.classList.remove('active');
          if (vtList) vtList.classList.add('active');
        } else if (pToGrid > 0.5) {
          if (vtTable) vtTable.classList.remove('active');
          if (vtCards) vtCards.classList.add('active');
          if (vtList) vtList.classList.remove('active');
        } else {
          if (vtTable) vtTable.classList.add('active');
          if (vtCards) vtCards.classList.remove('active');
          if (vtList) vtList.classList.remove('active');
        }

        // Cross-fade views — continuous opacity, NO boolean jumps
        // Phase 1: table → grid (pToGrid 0→1)
        // Phase 2: grid → list (pToList 0→1)
        // (No Phase 3 fade-back — deletion phase handles list→table)
        const clamp01 = (v) => Math.max(0, Math.min(1, v));
        // Card views container — visible whenever in card mode (grid or list)
        const cardViews = document.getElementById('src-card-views');
        if (cardViews) {
          if (pToGrid > 0.01) {
            cardViews.style.display = 'block';
            cardViews.style.opacity = 1;
          } else {
            cardViews.style.display = 'none';
            cardViews.style.opacity = 0;
          }
        }
        if (tableScroll) {
          if (pToGrid > 0.01) {
            // Card mode — table hidden (display:none so it doesn't take space)
            tableScroll.style.opacity = 0;
            tableScroll.style.display = 'none';
          } else {
            // In table mode
            tableScroll.style.display = '';
            tableScroll.style.opacity = clamp01(1 - pToGrid);
          }
        }
        // Table views container — hide when in card mode so it doesn't take flex space
        const tableViewsVM = document.getElementById('src-table-views');
        if (tableViewsVM) {
          if (pToGrid > 0.01) {
            tableViewsVM.style.display = 'none';
          } else {
            tableViewsVM.style.display = '';
            tableViewsVM.style.opacity = 1;
          }
        }
        if (cardGrid) {
          if (pToList > 0.01) {
            // Fading out grid → list
            cardGrid.style.display = 'flex';
            cardGrid.style.opacity = clamp01(1 - pToList);
            if (pToList > 0.98) cardGrid.style.display = 'none';
          } else if (pToGrid > 0.01) {
            // Fading in table → grid
            cardGrid.style.display = 'flex';
            cardGrid.style.opacity = clamp01(pToGrid);
          } else {
            cardGrid.style.display = 'none';
            cardGrid.style.opacity = 0;
          }
        }
        if (cardList) {
          if (pToList > 0.01) {
            // Fading in: grid → list
            cardList.style.display = 'flex';
            cardList.style.opacity = clamp01(pToList);
          } else {
            cardList.style.display = 'none';
            cardList.style.opacity = 0;
          }
        }
        // Shared card toolbar — visible whenever in card mode (grid or list), hidden in table mode
        const cardToolbar = document.getElementById('src-card-toolbar');
        if (cardToolbar) {
          if (pToGrid > 0.01) {
            // In card mode (grid or list) — toolbar stays in place
            cardToolbar.style.display = 'flex';
            cardToolbar.style.opacity = 1;
          } else {
            cardToolbar.style.display = 'none';
            cardToolbar.style.opacity = 0;
          }
        }

        // Helper to position annotation above view toggle, vertical connector (SAME position for all 3 annotations)
        const positionAnnAboveToggle = (annEl, lineEl, dotEl, opacity) => {
          if (!annEl) return;
          annEl.style.opacity = opacity;
          if (lineEl) lineEl.classList.toggle('visible', opacity > 0.5);
          if (dotEl) dotEl.classList.toggle('visible', opacity > 0.5);
          if (opacity > 0.05 && viewToggle) {
            const vtRect = viewToggle.getBoundingClientRect();
            const annWidth = 220;
            const annH = annEl.offsetHeight || 90;
            const gap = 12;
            let leftPx = vtRect.left + vtRect.width / 2 - canvasRect.left - annWidth / 2;
            let topPx = vtRect.top - canvasRect.top - annH - gap;
            leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
            if (topPx < 10) topPx = 10;
            annEl.style.left = leftPx + 'px';
            annEl.style.top = topPx + 'px';
            annEl.style.width = annWidth + 'px';
            const card = annEl.querySelector('.ann-card');
            if (card) card.style.width = annWidth + 'px';
            const dotX = leftPx + annWidth / 2;
            const dotY = topPx + annH;
            const targetX = vtRect.left + vtRect.width / 2 - canvasRect.left;
            const targetY = vtRect.top - canvasRect.top;
            drawConnector(lineEl, dotEl, dotX, dotY, targetX, targetY);
          }
        };

        // Helper to position annotation to the left of an element with horizontal connector
        const positionAnnLeft = (annEl, lineEl, dotEl, opacity, targetEl) => {
          if (!annEl) return;
          annEl.style.opacity = opacity;
          if (lineEl) lineEl.classList.toggle('visible', opacity > 0.5);
          if (dotEl) dotEl.classList.toggle('visible', opacity > 0.5);
          if (opacity > 0.05 && targetEl) {
            const targetRect = targetEl.getBoundingClientRect();
            const annWidth = 220;
            const annH = annEl.offsetHeight || 90;
            const gap = 16;
            let leftPx = targetRect.left - canvasRect.left - annWidth - gap;
            let topPx = targetRect.top + targetRect.height / 2 - canvasRect.top - annH / 2;
            leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
            if (topPx < 10) topPx = 10;
            if (topPx > canvasRect.height - annH - 10) topPx = canvasRect.height - annH - 10;
            annEl.style.left = leftPx + 'px';
            annEl.style.top = topPx + 'px';
            annEl.style.width = annWidth + 'px';
            const card = annEl.querySelector('.ann-card');
            if (card) card.style.width = annWidth + 'px';
            const dotX = leftPx + annWidth;
            const dotY = topPx + annH / 2;
            const targetX = targetRect.left - canvasRect.left;
            const targetY = targetRect.top + targetRect.height / 2 - canvasRect.top;
            drawConnector(lineEl, dotEl, dotX, dotY, targetX, targetY);
          }
        };

        // "View modes" annotation — visible first, then substituted by card grid view
        const annVMOpacity = pAnnVMIn * (1 - pAnnVMOut) * (1 - pFadeOut);
        positionAnnAboveToggle(annEl, line, dot, annVMOpacity);

        // "Card grid view" annotation — substitutes "View modes" in the SAME position
        const annGridOpacity = annGrid ? (pAnnGridIn * (1 - pAnnGridOut) * (1 - pFadeOut)) : 0;
        positionAnnAboveToggle(annGrid, lineGrid, dotGrid, annGridOpacity);

        // Card view toolbar annotation — above-left of the toolbar, vertical connector to toolbar left side
        const annToolbarOpacity = annToolbar ? (pAnnToolbarIn * (1 - pFadeOut)) : 0;
        const activeToolbar = document.getElementById('src-card-toolbar');
        if (annToolbar) {
          annToolbar.style.opacity = annToolbarOpacity;
          if (lineToolbar) lineToolbar.classList.toggle('visible', annToolbarOpacity > 0.5);
          if (dotToolbar) dotToolbar.classList.toggle('visible', annToolbarOpacity > 0.5);
          if (annToolbarOpacity > 0.05 && activeToolbar) {
            const tbRect = activeToolbar.getBoundingClientRect();
            const annWidth = 220;
            const annH = annToolbar.offsetHeight || 90;
            const gap = 24;
            // Position to the left of the toolbar center, pointing down to the toolbar's left area
            let leftPx = tbRect.left - canvasRect.left - annWidth / 2 + 80;
            let topPx = tbRect.top - canvasRect.top - annH - gap;
            leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
            if (topPx < 10) topPx = 10;
            annToolbar.style.left = leftPx + 'px';
            annToolbar.style.top = topPx + 'px';
            annToolbar.style.width = annWidth + 'px';
            const card = annToolbar.querySelector('.ann-card');
            if (card) card.style.width = annWidth + 'px';
            // Connector from bottom-center of annotation to top of toolbar (at annotation's horizontal center)
            const dotX = leftPx + annWidth / 2;
            const dotY = topPx + annH;
            const targetX = dotX;
            const targetY = tbRect.top - canvasRect.top;
            drawConnector(lineToolbar, dotToolbar, dotX, dotY, targetX, targetY);
          }
        }

        // "Card list view" annotation — substitutes "Card grid view" in the SAME position
        const annListOpacity = annList ? (pAnnListIn * (1 - pFadeOut)) : 0;
        positionAnnAboveToggle(annList, lineList, dotList, annListOpacity);

        return;
      }

      // ===== Special case: deletion-mock (phase 15 — simulate deletion filter toggle on mock screen) =====
      if (sub.special === 'deletion-mock') {
        exEl.style.opacity = 0; // No extraction — del-filter stays in mock

        const delFilter = document.getElementById('src-del-filter');
        const dfActive = document.getElementById('src-df-active');
        const dfDeleted = document.getElementById('src-df-deleted');
        const dfAll = document.getElementById('src-df-all');
        const tableScroll = document.getElementById('src-table-scroll');
        const tableDeleted = document.getElementById('src-table-deleted');
        const tableAll = document.getElementById('src-table-all');
        const tableViews = document.getElementById('src-table-views');
        const cardViews = document.getElementById('src-card-views');
        const cardToolbar = document.getElementById('src-card-toolbar');
        const annDeleted = document.getElementById('ann-deletion-deleted');
        const lineDeleted = document.getElementById('line-deletion-deleted');
        const dotDeleted = document.getElementById('dot-deletion-deleted');
        const annAll = document.getElementById('ann-deletion-all');
        const lineAll = document.getElementById('line-deletion-all');
        const dotAll = document.getElementById('dot-deletion-all');

        const phaseDur = ph.end - ph.start;
        const clamp01 = (v) => Math.max(0, Math.min(1, v));

        // Phase timeline:
        // 0-10%:   Smooth fade back from card list → table view
        // 10-18%:  "Soft Deleted Entities" annotation fades in
        // 18-35%:  HOLD — active records showing
        // 35-42%:  Toggle to Deleted + table cross-fade + annotation swap — SYNCHRONIZED
        // 42-60%:  HOLD — deleted records showing
        // 60-67%:  Toggle to All + table cross-fade + annotation swap — SYNCHRONIZED
        // 67-90%:  HOLD — all records showing
        // 90-100%: Fade out

        const pFadeBack = smoothstep(ph.start, ph.start + phaseDur * 0.10, progress);
        const pAnnVMIn = smoothstep(ph.start + phaseDur * 0.10, ph.start + phaseDur * 0.18, progress);
        const pToDeleted = smoothstep(ph.start + phaseDur * 0.35, ph.start + phaseDur * 0.42, progress);
        const pAnnDeletedOut = smoothstep(ph.start + phaseDur * 0.35, ph.start + phaseDur * 0.42, progress);
        const pAnnDeletedIn = smoothstep(ph.start + phaseDur * 0.35, ph.start + phaseDur * 0.42, progress);
        const pToAll = smoothstep(ph.start + phaseDur * 0.60, ph.start + phaseDur * 0.67, progress);
        const pAnnAllIn = smoothstep(ph.start + phaseDur * 0.60, ph.start + phaseDur * 0.67, progress);
        const pFadeOut = smoothstep(ph.start + phaseDur * 0.90, ph.end, progress);

        // Reset when before or after phase
        if (progress < ph.start - 0.001 || progress > ph.end + 0.001) {
          if (dfActive) dfActive.classList.add('active');
          if (dfDeleted) dfDeleted.classList.remove('active');
          if (dfAll) dfAll.classList.remove('active');
          // Only reset table views when PAST the phase (after).
          // When BEFORE the phase, the view modes phase is still active
          // and controls table/card visibility — don't override it.
          if (progress > ph.end + 0.001) {
            if (tableScroll) { tableScroll.style.opacity = ''; tableScroll.style.display = ''; }
            if (tableViews) { tableViews.style.opacity = ''; tableViews.style.display = ''; }
          }
          if (tableDeleted) { tableDeleted.style.opacity = 0; tableDeleted.style.display = 'none'; }
          if (tableAll) { tableAll.style.opacity = 0; tableAll.style.display = 'none'; }
          annEl.style.opacity = 0;
          if (line) line.classList.remove('visible');
          if (dot) dot.classList.remove('visible');
          if (annDeleted) annDeleted.style.opacity = 0;
          if (lineDeleted) lineDeleted.classList.remove('visible');
          if (dotDeleted) dotDeleted.classList.remove('visible');
          if (annAll) annAll.style.opacity = 0;
          if (lineAll) lineAll.classList.remove('visible');
          if (dotAll) dotAll.classList.remove('visible');
          return;
        }

        // Fade back from card list to table view at start of phase
        if (cardViews) {
          if (pFadeBack < 0.98) {
            cardViews.style.display = 'block';
            cardViews.style.opacity = clamp01(1 - pFadeBack);
          } else {
            cardViews.style.display = 'none';
            cardViews.style.opacity = 0;
          }
        }
        const cardListEl = document.getElementById('src-card-list');
        if (cardListEl) {
          if (pFadeBack < 0.98) {
            cardListEl.style.display = 'flex';
            cardListEl.style.opacity = clamp01(1 - pFadeBack);
          } else {
            cardListEl.style.display = 'none';
            cardListEl.style.opacity = 0;
          }
        }
        if (cardToolbar) {
          if (pFadeBack < 0.98) {
            cardToolbar.style.display = 'flex';
            cardToolbar.style.opacity = clamp01(1 - pFadeBack);
          } else {
            cardToolbar.style.display = 'none';
            cardToolbar.style.opacity = 0;
          }
        }

        // Table views container — visible during deletion phase
        if (tableViews) {
          tableViews.style.display = '';
          tableViews.style.opacity = clamp01(1 - pFadeOut);
        }

        // Active table — visible when not in deleted or all mode
        if (tableScroll) {
          if (pToAll > 0.01) {
            // In all mode — active table hidden
            tableScroll.style.opacity = 0;
            tableScroll.style.display = 'none';
          } else if (pToDeleted > 0.01) {
            // Fading out active → deleted
            tableScroll.style.display = '';
            tableScroll.style.opacity = clamp01(1 - pToDeleted);
            if (pToDeleted > 0.98) tableScroll.style.display = 'none';
          } else {
            // Active mode
            tableScroll.style.display = '';
            tableScroll.style.opacity = clamp01(pFadeBack);
          }
        }

        // Deleted table — visible in deleted mode
        if (tableDeleted) {
          if (pToAll > 0.01) {
            // Fading out deleted → all
            tableDeleted.style.display = '';
            tableDeleted.style.opacity = clamp01(1 - pToAll);
            if (pToAll > 0.98) tableDeleted.style.display = 'none';
          } else if (pToDeleted > 0.01) {
            // Fading in active → deleted
            tableDeleted.style.display = '';
            tableDeleted.style.opacity = clamp01(pToDeleted);
          } else {
            tableDeleted.style.display = 'none';
            tableDeleted.style.opacity = 0;
          }
        }

        // All table — visible in all mode
        if (tableAll) {
          if (pToAll > 0.01) {
            // Fading in deleted → all
            tableAll.style.display = '';
            tableAll.style.opacity = clamp01(pToAll);
          } else {
            tableAll.style.display = 'none';
            tableAll.style.opacity = 0;
          }
        }

        // Del-filter toggle buttons — switch synchronized with content
        if (pToAll > 0.5) {
          if (dfActive) dfActive.classList.remove('active');
          if (dfDeleted) dfDeleted.classList.remove('active');
          if (dfAll) dfAll.classList.add('active');
        } else if (pToDeleted > 0.5) {
          if (dfActive) dfActive.classList.remove('active');
          if (dfDeleted) dfDeleted.classList.add('active');
          if (dfAll) dfAll.classList.remove('active');
        } else {
          if (dfActive) dfActive.classList.add('active');
          if (dfDeleted) dfDeleted.classList.remove('active');
          if (dfAll) dfAll.classList.remove('active');
        }

        // Helper to position annotation above del-filter, vertical connector
        const positionAnnAboveDelFilter = (annEl2, lineEl2, dotEl2, opacity) => {
          if (!annEl2 || !delFilter) return;
          annEl2.style.opacity = opacity;
          if (lineEl2) lineEl2.classList.toggle('visible', opacity > 0.5);
          if (dotEl2) dotEl2.classList.toggle('visible', opacity > 0.5);
          if (opacity > 0.05) {
            const dfRect = delFilter.getBoundingClientRect();
            const annW = 240;
            const annH = annEl2.offsetHeight || 80;
            const gap = 24;
            let leftPx = dfRect.left - canvasRect.left + dfRect.width / 2 - annW / 2;
            let topPx = dfRect.top - canvasRect.top - annH - gap;
            leftPx = Math.max(10, Math.min(canvasRect.width - annW - 10, leftPx));
            if (topPx < 10) topPx = 10;
            annEl2.style.left = leftPx + 'px';
            annEl2.style.top = topPx + 'px';
            // Connector from annotation bottom center to del-filter top center
            const dotX = dfRect.left - canvasRect.left + dfRect.width / 2;
            const dotY = dfRect.top - canvasRect.top;
            const targetX = leftPx + annW / 2;
            const targetY = topPx + annH;
            drawConnector(lineEl2, dotEl2, dotX, dotY, targetX, targetY);
          }
        };

        // "Soft Deleted Entities" annotation — visible first, then substituted
        const annVMOpacity = pAnnVMIn * (1 - pAnnDeletedOut) * (1 - pFadeOut);
        positionAnnAboveDelFilter(annEl, line, dot, annVMOpacity);

        // "Only deleted records" annotation — substitutes "Soft Deleted Entities"
        const annDeletedOpacity = annDeleted ? (pAnnDeletedIn * (1 - pToAll) * (1 - pFadeOut)) : 0;
        positionAnnAboveDelFilter(annDeleted, lineDeleted, dotDeleted, annDeletedOpacity);

        // "All records" annotation — substitutes "Only deleted records"
        const annAllOpacity = annAll ? (pAnnAllIn * (1 - pFadeOut)) : 0;
        positionAnnAboveDelFilter(annAll, lineAll, dotAll, annAllOpacity);

        return;
      }

      // ===== Special case: bulk-mock (phase 16 — same toolbar toggled to bulk mode, extracts upward) =====
      if (sub.special === 'bulk-mock') {
        const toolbar = document.getElementById('src-toolbar-second');
        const toolbarFilters = document.getElementById('src-toolbar-filters');
        const toolbarBulk = document.getElementById('src-toolbar-bulk');
        const toolbarRect = toolbar ? toolbar.getBoundingClientRect() : contentRect;
        const visLeft = toolbarRect.left - canvasRect.left;
        const visTop = toolbarRect.top - canvasRect.top;
        const visW = toolbarRect.width;
        const visH = toolbarRect.height || 44;
        const natW = visW / scale;
        const natHReal = exEl.offsetHeight || visH / scale;

        // Start: positioned to match the mock toolbar
        const startLeft = visLeft - natW * (1 - scale) / 2;
        const startTop = visTop - natHReal * (1 - scale) / 2;
        // End: slightly above, a bit wider, centered
        const endW = natW + 60;
        const endLeft = visLeft + visW / 2 - endW / 2;
        const endTop = visTop - 30 - natHReal * (1 - scale) / 2;

        const curLeft = lerp(startLeft, endLeft, amount);
        const curTop = lerp(startTop, endTop, amount);
        const curW = lerp(natW, endW, amount);
        const exScale = lerp(scale, 1.0, amount);

        exEl.style.opacity = 1;
        exEl.style.left = curLeft + 'px';
        exEl.style.top = curTop + 'px';
        exEl.style.width = curW + 'px';
        exEl.style.height = natHReal + 'px';
        exEl.style.transform = `scale(${exScale})`;
        exEl.style.transformOrigin = 'center center';
        exEl.classList.toggle('detached', amount > 0.1);
        exEl.classList.toggle('glow-border', amount > 0.9 && pReassemble < 0.1);

        // Mock toolbar: toggle from filters to bulk mode at 30-40% of phase
        const pToggle = smoothstep(ph.start + phaseDur * 0.30, ph.start + phaseDur * 0.40, progress);
        if (toolbarFilters && toolbarBulk) {
          if (pToggle < 0.5) {
            toolbarFilters.style.display = 'flex';
            toolbarFilters.style.opacity = clamp01(1 - pToggle * 2);
            toolbarBulk.style.display = 'none';
            toolbarBulk.style.opacity = 0;
          } else {
            toolbarFilters.style.display = 'none';
            toolbarFilters.style.opacity = 0;
            toolbarBulk.style.display = 'flex';
            toolbarBulk.style.opacity = clamp01((pToggle - 0.5) * 2);
          }
        }

        // Annotations — fade in at 45-55%, HOLD, fade out at 88-98% (leaving a small hold at the end)
        const pAnnIn = smoothstep(ph.start + phaseDur * 0.45, ph.start + phaseDur * 0.55, progress);
        const pAnnOut = smoothstep(ph.start + phaseDur * 0.88, ph.start + phaseDur * 0.98, progress);
        const annOpacity = pAnnIn * (1 - pAnnOut);
        annEl.style.opacity = annOpacity;
        if (line) line.classList.toggle('visible', annOpacity > 0.5);
        if (dot) dot.classList.toggle('visible', annOpacity > 0.5);

        // 2nd annotation (toggle button)
        const annToggle = document.getElementById('ann-bulk-toggle');
        const lineToggle = document.getElementById('line-bulk-toggle');
        const dotToggle = document.getElementById('dot-bulk-toggle');
        // 3rd annotation (export formats)
        const annExport = document.getElementById('ann-bulk-export');
        const lineExport = document.getElementById('line-bulk-export');
        const dotExport = document.getElementById('dot-bulk-export');
        // 4th annotation (duplicate)
        const annDup = document.getElementById('ann-bulk-duplicate');
        const lineDup = document.getElementById('line-bulk-duplicate');
        const dotDup = document.getElementById('dot-bulk-duplicate');
        if (annToggle) annToggle.style.opacity = annOpacity;
        if (lineToggle) lineToggle.classList.toggle('visible', annOpacity > 0.5);
        if (dotToggle) dotToggle.classList.toggle('visible', annOpacity > 0.5);
        if (annExport) annExport.style.opacity = annOpacity;
        if (lineExport) lineExport.classList.toggle('visible', annOpacity > 0.5);
        if (dotExport) dotExport.classList.toggle('visible', annOpacity > 0.5);
        if (annDup) annDup.style.opacity = annOpacity;
        if (lineDup) lineDup.classList.toggle('visible', annOpacity > 0.5);
        if (dotDup) dotDup.classList.toggle('visible', annOpacity > 0.5);

        if (annOpacity > 0.05) {
          const exRect = exEl.getBoundingClientRect();
          const annWidth = 220;
          const annH = annEl.offsetHeight || 90;
          const gap = 16;

          // Annotation 1 (bulk mode): ABOVE the toolbar, centered, vertical connector
          const exCenterX = exRect.left + exRect.width / 2 - canvasRect.left;
          let leftPx1 = exCenterX - annWidth / 2;
          let topPx1 = exRect.top - canvasRect.top - annH - gap;
          leftPx1 = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx1));
          if (topPx1 < 10) topPx1 = 10;
          annEl.style.left = leftPx1 + 'px';
          annEl.style.top = topPx1 + 'px';
          annEl.style.width = annWidth + 'px';
          const card1 = annEl.querySelector('.ann-card');
          if (card1) card1.style.width = annWidth + 'px';

          // Connector 1: from bottom-center of annotation to top-center of toolbar (vertical)
          const dot1X = leftPx1 + annWidth / 2;
          const dot1Y = topPx1 + annH;
          const target1X = exCenterX;
          const target1Y = exRect.top - canvasRect.top;
          drawConnector(line, dot, dot1X, dot1Y, target1X, target1Y);

          // Annotation 2 (toggle): ABOVE, centered on the toggle button
          if (annToggle) {
            const toggleBtn = document.getElementById('ex-bulk-toggle');
            const toggleRect = toggleBtn ? toggleBtn.getBoundingClientRect() : exRect;
            const toggleCenterX = (toggleRect.left + toggleRect.width / 2) - canvasRect.left;
            const annHToggle = annToggle.offsetHeight || 90;
            let leftPx2 = toggleCenterX - annWidth / 2;
            let topPx2 = exRect.top - canvasRect.top - annHToggle - gap;
            leftPx2 = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx2));
            if (topPx2 < 10) topPx2 = 10;
            annToggle.style.left = leftPx2 + 'px';
            annToggle.style.top = topPx2 + 'px';
            annToggle.style.width = annWidth + 'px';
            const cardToggle = annToggle.querySelector('.ann-card');
            if (cardToggle) cardToggle.style.width = annWidth + 'px';

            // Connector 2: from bottom-center of toggle annotation to top of toggle button
            const dotTX = leftPx2 + annWidth / 2;
            const dotTY = topPx2 + annHToggle;
            const targetTX = toggleCenterX;
            const targetTY = toggleRect.top - canvasRect.top;
            drawConnector(lineToggle, dotToggle, dotTX, dotTY, targetTX, targetTY);
          }

          // Annotation 3 (export formats): BELOW the toolbar, centered on Export button
          if (annExport) {
            // Find the Export button in the extracted toolbar
            const exportBtns = exEl.querySelectorAll('.pb-btn-soft-xs');
            // Export is the first button in bulk mode (after the toggle)
            const exportBtn = exportBtns.length > 0 ? exportBtns[0] : null;
            const exportRect = exportBtn ? exportBtn.getBoundingClientRect() : exRect;
            const exportCenterX = (exportRect.left + exportRect.width / 2) - canvasRect.left;
            const annHExport = annExport.offsetHeight || 90;
            let leftPx3 = exportCenterX - annWidth / 2;
            let topPx3 = exRect.bottom - canvasRect.top + gap;
            leftPx3 = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx3));
            if (topPx3 + annHExport > canvasRect.height - 10) topPx3 = canvasRect.height - annHExport - 10;
            annExport.style.left = leftPx3 + 'px';
            annExport.style.top = topPx3 + 'px';
            annExport.style.width = annWidth + 'px';
            const cardExport = annExport.querySelector('.ann-card');
            if (cardExport) cardExport.style.width = annWidth + 'px';

            // Connector 3: from top-center of export annotation to bottom of export button (vertical)
            const dotEX = leftPx3 + annWidth / 2;
            const dotEY = topPx3;
            const targetEX = exportCenterX;
            const targetEY = exRect.bottom - canvasRect.top;
            drawConnector(lineExport, dotExport, dotEX, dotEY, targetEX, targetEY);
          }

          // Annotation 4 (duplicate): ABOVE the toolbar, centered on Duplicate button, vertical connector
          if (annDup) {
            const exportBtns = exEl.querySelectorAll('.pb-btn-soft-xs');
            // Duplicate is the 3rd button (index 2) in bulk mode
            const dupBtn = exportBtns.length > 2 ? exportBtns[2] : null;
            const dupRect = dupBtn ? dupBtn.getBoundingClientRect() : exRect;
            const dupCenterX = (dupRect.left + dupRect.width / 2) - canvasRect.left;
            const annHDup = annDup.offsetHeight || 120;
            let leftPx4 = dupCenterX - annWidth / 2;
            let topPx4 = exRect.top - canvasRect.top - annHDup - gap;
            leftPx4 = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx4));
            if (topPx4 < 10) topPx4 = 10;
            annDup.style.left = leftPx4 + 'px';
            annDup.style.top = topPx4 + 'px';
            annDup.style.width = annWidth + 'px';
            const cardDup = annDup.querySelector('.ann-card');
            if (cardDup) cardDup.style.width = annWidth + 'px';

            // Connector 4: from bottom-center of duplicate annotation to top of duplicate button (vertical)
            const dotDX = leftPx4 + annWidth / 2;
            const dotDY = topPx4 + annHDup;
            const targetDX = dupCenterX;
            const targetDY = exRect.top - canvasRect.top;
            drawConnector(lineDup, dotDup, dotDX, dotDY, targetDX, targetDY);
          }
        }

        // Reset when before or after phase
        if (progress < ph.start - 0.001 || progress > ph.end + 0.001) {
          if (toolbarFilters) { toolbarFilters.style.display = 'flex'; toolbarFilters.style.opacity = 1; }
          if (toolbarBulk) { toolbarBulk.style.display = 'none'; toolbarBulk.style.opacity = 0; }
          exEl.style.opacity = 0;
          annEl.style.opacity = 0;
          if (line) line.classList.remove('visible');
          if (dot) dot.classList.remove('visible');
          if (annToggle) annToggle.style.opacity = 0;
          if (lineToggle) lineToggle.classList.remove('visible');
          if (dotToggle) dotToggle.classList.remove('visible');
          if (annExport) annExport.style.opacity = 0;
          if (lineExport) lineExport.classList.remove('visible');
          if (dotExport) dotExport.classList.remove('visible');
          if (annDup) annDup.style.opacity = 0;
          if (lineDup) lineDup.classList.remove('visible');
          if (dotDup) dotDup.classList.remove('visible');
          return;
        }

        return;
      }

      // ===== Special case: preview-mock (phase 17 — preview panel slides in from right edge of table area) =====
      if (sub.special === 'preview-mock') {
        const tableScroll = document.getElementById('src-table-scroll');
        const tableViews = document.getElementById('src-table-views');
        // The table content area is where the preview panel appears
        const contentArea = tableScroll || tableViews || contentEl;
        const contentRect2 = contentArea.getBoundingClientRect();

        // Start: positioned at the right edge of the mock (sliding in from table area)
        const mockEl0 = document.querySelector('.screen-mock');
        const mockRect0 = mockEl0 ? mockEl0.getBoundingClientRect() : contentRect2;
        const startLeft = mockRect0.right - canvasRect.left - 20;
        const startTop = mockRect0.top - canvasRect.top;
        const startW = 20; // starts thin (sliding in)
        const startH = mockRect0.height;

        // End: extracted panel slightly overlapping the mock's right edge
        const natW = 380;
        const natH = mockRect0.height / scale;
        const endLeft = mockRect0.right - canvasRect.left - 40; // slight overlap with mock
        const endTop = (mockRect0.top - canvasRect.top) - natH * (1 - scale) / 2;
        const endW = natW;
        const endH = natH;

        // Reassembly: panel slides back into the mock at 72-85% of phase (smoother)
        const pReassemblePreview = smoothstep(ph.start + phaseDur * 0.72, ph.start + phaseDur * 0.85, progress);
        const effectiveAmount = amount * (1 - pReassemblePreview);

        // Animate position and size (extract out, then reassemble back in)
        const curLeft = lerp(startLeft, endLeft, effectiveAmount);
        const curTop = lerp(startTop, endTop, effectiveAmount);
        const curW = lerp(startW, endW, effectiveAmount);
        const exScale2 = lerp(scale, 1.0, effectiveAmount);

        exEl.style.opacity = 1 - pReassemblePreview;
        exEl.style.left = curLeft + 'px';
        exEl.style.top = curTop + 'px';
        exEl.style.width = curW + 'px';
        exEl.style.height = endH + 'px';
        exEl.style.transform = `scale(${exScale2})`;
        exEl.style.transformOrigin = 'center center';
        exEl.classList.toggle('detached', amount > 0.1);
        exEl.classList.toggle('glow-border', amount > 0.9 && pReassemble < 0.1);

        // Annotation — fades in during hold (30-45% of phase), fades out with reassembly (72-85%)
        const pAnnIn = smoothstep(ph.start + phaseDur * 0.30, ph.start + phaseDur * 0.45, progress);
        const pAnnOut = pReassemblePreview;
        const annOpacity = pAnnIn * (1 - pAnnOut);
        annEl.style.opacity = annOpacity;
        if (line) line.classList.toggle('visible', annOpacity > 0.5);
        if (dot) dot.classList.toggle('visible', annOpacity > 0.5);

        if (annOpacity > 0.05) {
          const exRect = exEl.getBoundingClientRect();
          const annWidth = 240;
          const annH2 = annEl.offsetHeight || 100;
          const gap2 = 16;

          // Annotation to the LEFT of the panel, vertically centered
          let leftPx = exRect.left - canvasRect.left - annWidth - gap2;
          let topPx = exRect.top + exRect.height / 2 - canvasRect.top - annH2 / 2;
          leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
          if (topPx < 10) topPx = 10;
          if (topPx > canvasRect.height - annH2 - 10) topPx = canvasRect.height - annH2 - 10;
          annEl.style.left = leftPx + 'px';
          annEl.style.top = topPx + 'px';
          annEl.style.width = annWidth + 'px';
          const card = annEl.querySelector('.ann-card');
          if (card) card.style.width = annWidth + 'px';

          // Connector: from right edge of annotation to left edge of panel (horizontal)
          const dotX = leftPx + annWidth;
          const dotY = topPx + annH2 / 2;
          const targetX = exRect.left - canvasRect.left;
          const targetY = exRect.top + exRect.height / 2 - canvasRect.top;
          drawConnector(line, dot, dotX, dotY, targetX, targetY);
        }

        // Reset when before or after phase
        if (progress < ph.start - 0.001 || progress > ph.end + 0.001) {
          exEl.style.opacity = 0;
          annEl.style.opacity = 0;
          if (line) line.classList.remove('visible');
          if (dot) dot.classList.remove('visible');
          return;
        }

        return;
      }

      // Start position: at the content area's location inside the mock (scaled)
      const startLeft = contentRect.left - canvasRect.left;
      const startTop = contentRect.top - canvasRect.top;
      const startW = contentRect.width;
      const startH = contentRect.height;

      // End position: the extraction target
      const target = getExtractionTarget(sub, contentRect, canvasRect);

      // Interpolate
      const curLeft = lerp(startLeft, target.left, amount);
      const curTop = lerp(startTop, target.top, amount);
      const curW = lerp(startW, target.width, amount);
      const curH = lerp(startH, target.height, amount);
      const exScale = lerp(0.82, 1.0, amount); // grow from mock scale to full

      exEl.style.opacity = 1;
      exEl.style.left = curLeft + 'px';
      exEl.style.top = curTop + 'px';
      exEl.style.width = curW + 'px';
      exEl.style.height = curH + 'px';
      exEl.style.transform = `scale(${exScale})`;
      exEl.style.transformOrigin = 'center center';
      exEl.classList.toggle('detached', amount > 0.1);
      exEl.classList.toggle('glow-border', amount > 0.9 && pReassemble < 0.1);

      // Annotation: fades in during hold (35-45% of phase, after extraction completes)
      const pAnnIn = smoothstep(ph.start + phaseDur * 0.35, ph.start + phaseDur * 0.45, progress);
      const pAnnOut = smoothstep(ph.end - phaseDur * 0.25, ph.end, progress);
      const annOpacity = pAnnIn * (1 - pAnnOut);
      annEl.style.opacity = annOpacity;
      if (line) line.classList.toggle('visible', annOpacity > 0.5);
      if (dot) dot.classList.toggle('visible', annOpacity > 0.5);

      if (annOpacity > 0.05) {
        positionAnnotation(sub, exEl, annEl);
        updateConnector(sub, exEl, annEl);
      }
    });

    // Update SVG size
    if (connectorsSvg) {
      connectorsSvg.setAttribute('width', canvas.offsetWidth);
      connectorsSvg.setAttribute('height', canvas.offsetHeight);
    }

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