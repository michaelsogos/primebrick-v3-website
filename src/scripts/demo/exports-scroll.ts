/* ============================================================
   Primebrick Demo — Exports scroll-jacking engine
   Progressive disassembly pattern (same as entity-list-table).
   ONE screen-mock (customers table) stays visible the entire time.
   As the user scrolls, elements EXTRACT from the mock with
   annotations and SVG connector lines.
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

export function initExportsScroll(): void {
  (function () {
    const track = document.getElementById('track');
    const screenMock = document.getElementById('screen-mock');
    const contentArea = document.getElementById('content-area');
    const railFill = document.getElementById('rail-fill');
    const dotsContainer = document.getElementById('dots');
    const phaseLabel = document.getElementById('phase-label');
    const canvas = document.getElementById('canvas');
    if (!track || !screenMock || !contentArea) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ===== Phases (11) =====
    const PHASES = [
      { name: 'The Export System',  start: 0.000, end: 0.048 },
      { name: 'Scope selection',    start: 0.048, end: 0.130 },
      { name: 'Export buttons',     start: 0.130, end: 0.220 },  // Toolbar extracts + annotation
      { name: 'Export dialog',      start: 0.220, end: 0.290 },  // Dialog appears (toolbar still held)
      { name: 'HTML export',        start: 0.290, end: 0.370 },  // HTML confirm dialog
      { name: 'Preview modes',      start: 0.370, end: 0.570 },  // One dialog, 3 mode transitions (HTML→PDF→Email)
      { name: 'Reassembly',         start: 0.570, end: 0.640 },
      { name: 'Zoom back',          start: 0.640, end: 0.720 },
      { name: 'Conclusion',         start: 0.720, end: 0.820 },
    ];

    // Section ranges (for section-claim opacity): [startPhaseIdx, endPhaseIdx]
    const SECTIONS = [
      { id: 'claim-1', start: 1, end: 1 },  // Scope selection (modal preview) — "Selected or all"
      { id: 'claim-2', start: 2, end: 3 },  // Export buttons + dialog — "Real files, built server-side"
      { id: 'claim-3', start: 4, end: 4 },  // HTML export — "Visual export, not data export"
      { id: 'claim-4', start: 5, end: 5 },  // Preview modes — "One source, three formats"
    ];

    // Sub-extractions: each {id, exId, annId, lineId, dotId, phaseIdx, side}
    // phaseIdx 2+ = disassembly starts AFTER mock is settled at 0.82 scale
    const SUBS = [
      { id: 'export-buttons',  exId: 'ex-export-buttons',  annId: 'ann-export-buttons',  lineId: 'line-export-buttons',  dotId: 'dot-export-buttons',  phaseIdx: 2, side: 'top' as AnnotationSide, special: 'bulk-mock' as any },
      { id: 'html-dialog',     exId: 'ex-html-dialog',     annId: 'ann-html-dialog',     lineId: 'line-html-dialog',     dotId: 'dot-html-dialog',     phaseIdx: 4, side: 'left' as AnnotationSide, special: 'html-dialog' as any },
      { id: 'preview-html',    exId: 'ex-preview-dialog',  annId: 'ann-preview-html',    lineId: 'line-preview-html',    dotId: 'dot-preview-html',    phaseIdx: 5, side: 'right' as AnnotationSide, special: 'preview-mode' as any, mode: 'html' as any },
      { id: 'preview-pdf',     exId: 'ex-preview-dialog',  annId: 'ann-preview-pdf',     lineId: 'line-preview-pdf',     dotId: 'dot-preview-pdf',     phaseIdx: 5, side: 'right' as AnnotationSide, special: 'preview-mode' as any, mode: 'pdf' as any },
      { id: 'preview-email',   exId: 'ex-preview-dialog',  annId: 'ann-preview-email',   lineId: 'line-preview-email',   dotId: 'dot-preview-email',   phaseIdx: 5, side: 'right' as AnnotationSide, special: 'preview-mode' as any, mode: 'email' as any },
    ];

    // Build scene dots
    if (dotsContainer) {
      buildSceneDots(dotsContainer as HTMLElement, track as HTMLElement, [
        { label: 'Start', target: 0.0 },
        { label: 'Scope', target: 0.09 },
        { label: 'Buttons', target: 0.17 },
        { label: 'Dialog', target: 0.25 },
        { label: 'HTML', target: 0.33 },
        { label: 'Preview', target: 0.48 },
        { label: 'Conclusion', target: 0.74 },
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

    // ===== Compute extraction target position =====
    function getExtractionTarget(sub: any, contentRect: DOMRect, canvasRect: DOMRect) {
      const cw = canvasRect.width, ch = canvasRect.height;
      const cLeft = contentRect.left - canvasRect.left;
      const cTop = contentRect.top - canvasRect.top;
      const cW = contentRect.width, cH = contentRect.height;
      const exEl = document.getElementById(sub.exId);
      let natW = exEl?.offsetWidth || 300, natH = exEl?.offsetHeight || 120;

      switch (sub.side) {
        case 'center':
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

      // ===== Resize SVG connector layer to match canvas (same as entity-list-table) =====
      const connectorsSvg = document.getElementById('connectors') as SVGElement | null;
      if (connectorsSvg && canvas) {
        connectorsSvg.setAttribute('width', String(canvas.offsetWidth));
        connectorsSvg.setAttribute('height', String(canvas.offsetHeight));
      }

      if (railFill) railFill.style.height = (progress * 100) + '%';
      fadeScrollHint(progress);

      // ===== Canvas rect (used by modal/annotation positioning AND SUBS loop) =====
      const canvasRect = canvas ? canvas.getBoundingClientRect() : new DOMRect();

      // ===== Section claims opacity =====
      SECTIONS.forEach(s => {
        const claimEl = document.getElementById(s.id);
        if (!claimEl) return;
        const startP = PHASES[s.start].start;
        const endP = PHASES[s.end].end;
        // First claim (phase 0) is visible immediately — no fade-in delay
        const claimIn = s.start === 0 ? 1 : smoothstep(startP, startP + 0.02, progress);
        const claimOut = smoothstep(endP - 0.02, endP, progress);
        claimEl.style.opacity = String(claimIn * (1 - claimOut));
      });

      // Final conclusion claim
      const claimFinalEl = document.getElementById('claim-final');
      if (claimFinalEl) {
        const lastPh = PHASES[PHASES.length - 1];
        const lastDur = lastPh.end - lastPh.start;
        claimFinalEl.style.opacity = smoothstep(lastPh.start + lastDur * 0.3, lastPh.start + lastDur * 0.7, progress);
      }

      // ===== Phase tracking =====
      let phaseIdx = 0;
      for (let i = PHASES.length - 1; i >= 0; i--) {
        if (progress >= PHASES[i].start) { phaseIdx = i; break; }
      }
      if (phaseIdx !== currentPhaseIdx) {
        currentPhaseIdx = phaseIdx;
        if (dotsContainer) {
          // Map phaseIdx to bullet dot index.
          // Bullets: 0=Start, 1=Scope, 2=Buttons, 3=Dialog, 4=HTML, 5=Preview, 6=Conclusion
          // Phases: 0=Export System, 1=Scope, 2=Buttons, 3=Dialog, 4=HTML export, 5=Preview modes, 6=Reassembly, 7=Zoom back, 8=Conclusion
          let dotIdx;
          if (phaseIdx <= 3) dotIdx = phaseIdx;
          else if (phaseIdx === 4) dotIdx = 4; // HTML export → HTML bullet
          else if (phaseIdx === 5) dotIdx = 5; // Preview modes → Preview bullet
          else dotIdx = 6; // Reassembly, Zoom back, Conclusion → Conclusion bullet
          dotsContainer.querySelectorAll('.scene-dot').forEach((d, i) => d.classList.toggle('active', i === dotIdx));
        }
        if (phaseLabel) phaseLabel.textContent = PHASES[phaseIdx].name;
      }

      // ===== Screen mock transform =====
      // RULE: No disassembly animation can start while mock is still moving.
      // Phase 0: full size centered, claim-0 visible
      // Phase 1 (scope selection): mock stays centered, slight shrink to 0.95,
      //   modal-preview (export dialog with choicebox) fades in OVER the mock,
      //   claim-1 visible on left. End of phase 1: modal fades out, mock shrinks to 0.82.
      // Phase 2+ (features): mock is FULLY SETTLED at 0.82 scale, centered.
      // Last phase: zoom back to 1.0
      const ph0 = PHASES[0], ph1 = PHASES[1];
      const ph0Dur = ph0.end - ph0.start, ph1Dur = ph1.end - ph1.start;
      // Slight shrink during phase 1 (1.0 → 0.95) for depth behind modal
      const pShrinkModal = smoothstep(ph0.start + ph0Dur * 0.60, ph1.start + ph1Dur * 0.30, progress);
      // Shrink to features size at end of phase 1
      const pShrinkFeatures = smoothstep(ph1.start + ph1Dur * 0.80, ph1.end, progress);
      // Zoom back during phase 9 (Zoom back)
      const zoomPh = PHASES[7];
      const zoomDur = zoomPh.end - zoomPh.start;
      const pZoomBack = smoothstep(zoomPh.start, zoomPh.end - zoomDur * 0.1, progress);
      // Scale: 1.0 → 0.95 (modal phase) → 0.82 (features) → 1.0 (zoom back)
      const scale = lerp(lerp(1.0, 0.95, pShrinkModal), 0.82, pShrinkFeatures) * lerp(1.0, 1.0 / 0.82, pZoomBack);
      // No horizontal slide — mock stays centered
      const tx = 0;
      const ty = lerp(0, 8, pShrinkFeatures) * (1 - pZoomBack);
      screenMock.style.transform = `translate(-50%, -50%) scale(${scale}) translate(${tx}%, ${ty}%)`;

      // ===== Modal preview (export dialog over mock) =====
      // Phase 1: fade in after claim-1, HOLD, fade out at end of phase 1
      // Phase 3: fade in again for export dialog phase, HOLD, fade out at end
      const modalEl = document.getElementById('modal-preview');
      if (modalEl) {
        const ph3 = PHASES[3];
        const ph3Dur = ph3.end - ph3.start;
        // Phase 1: modal for scope selection
        const modalIn1 = smoothstep(ph1.start + ph1Dur * 0.20, ph1.start + ph1Dur * 0.50, progress);
        const modalOut1 = smoothstep(ph1.start + ph1Dur * 0.80, ph1.end, progress);
        // Phase 3: modal for export dialog (appears at 15-40% of phase)
        const modalIn3 = smoothstep(ph3.start + ph3Dur * 0.15, ph3.start + ph3Dur * 0.40, progress);
        const modalOut3 = smoothstep(ph3.start + ph3Dur * 0.85, ph3.end, progress);
        const op1 = modalIn1 * (1 - modalOut1);
        const op3 = modalIn3 * (1 - modalOut3);
        modalEl.style.opacity = String(Math.max(op1, op3));
      }

      // ===== Phase 3: Export dialog annotations (choicebox + CTA real formats) =====
      const ph3 = PHASES[3];
      const ph3Dur = ph3.end - ph3.start;
      const annChoicebox = document.getElementById('ann-export-choicebox');
      const annChoiceboxRbac = document.getElementById('ann-export-choicebox-rbac');
      const annCtaReal = document.getElementById('ann-export-cta-real');
      const lineChoicebox = document.getElementById('line-export-choicebox');
      const dotChoicebox = document.getElementById('dot-export-choicebox');
      const lineChoiceboxRbac = document.getElementById('line-export-choicebox-rbac');
      const dotChoiceboxRbac = document.getElementById('dot-export-choicebox-rbac');
      const lineCtaReal = document.getElementById('line-export-cta-real');
      const dotCtaReal = document.getElementById('dot-export-cta-real');

      if (progress < ph3.start + ph3Dur * 0.40 - 0.001 || progress > ph3.end + 0.001) {
        if (annChoicebox) annChoicebox.style.opacity = '0';
        if (annChoiceboxRbac) annChoiceboxRbac.style.opacity = '0';
        if (annCtaReal) annCtaReal.style.opacity = '0';
        if (lineChoicebox) lineChoicebox.classList.remove('visible');
        if (dotChoicebox) dotChoicebox.classList.remove('visible');
        if (lineChoiceboxRbac) lineChoiceboxRbac.classList.remove('visible');
        if (dotChoiceboxRbac) dotChoiceboxRbac.classList.remove('visible');
        if (lineCtaReal) lineCtaReal.classList.remove('visible');
        if (dotCtaReal) dotCtaReal.classList.remove('visible');
      } else {
        // Annotations fade in at 50-65% of phase (after modal is visible)
        const pAnnIn = smoothstep(ph3.start + ph3Dur * 0.50, ph3.start + ph3Dur * 0.65, progress);
        const pAnnOut = smoothstep(ph3.start + ph3Dur * 0.85, ph3.end, progress);
        const annOp = pAnnIn * (1 - pAnnOut);
        if (annChoicebox) annChoicebox.style.opacity = String(annOp);
        if (annChoiceboxRbac) annChoiceboxRbac.style.opacity = String(annOp);
        if (annCtaReal) annCtaReal.style.opacity = String(annOp);
        if (lineChoicebox) lineChoicebox.classList.toggle('visible', annOp > 0.5);
        if (dotChoicebox) dotChoicebox.classList.toggle('visible', annOp > 0.5);
        if (lineChoiceboxRbac) lineChoiceboxRbac.classList.toggle('visible', annOp > 0.5);
        if (dotChoiceboxRbac) dotChoiceboxRbac.classList.toggle('visible', annOp > 0.5);
        if (lineCtaReal) lineCtaReal.classList.toggle('visible', annOp > 0.5);
        if (dotCtaReal) dotCtaReal.classList.toggle('visible', annOp > 0.5);

        // Position annotations relative to modal
        if (annOp > 0.05 && modalEl) {
          const modalRect = modalEl.querySelector('.mp-content')?.getBoundingClientRect();
          if (modalRect) {
            const annWidth = 220;
            const gap = 16;
            // Choicebox annotation: LEFT of modal, HORIZONTAL connector to "Export 3 customers" label
            if (annChoicebox) {
              const annH = annChoicebox.offsetHeight || 90;
              // Target the .mp-description ("Export 3 customers") label inside the modal
              const questionEl = modalEl.querySelector('.mp-description');
              const questionRect = questionEl?.getBoundingClientRect();
              const targetCenterY = questionRect
                ? (questionRect.top + questionRect.height / 2) - canvasRect.top
                : modalRect.top - canvasRect.top + 40;
              let leftPx = modalRect.left - canvasRect.left - annWidth - gap;
              let topPx = targetCenterY - annH / 2;
              leftPx = Math.max(10, leftPx);
              if (topPx < 10) topPx = 10;
              annChoicebox.style.left = leftPx + 'px';
              annChoicebox.style.top = topPx + 'px';
              annChoicebox.style.width = annWidth + 'px';
              const card = annChoicebox.querySelector('.ann-card');
              if (card) card.style.width = annWidth + 'px';
              // Horizontal connector: from right-center of annotation to left of modal (same Y = label centerY)
              const dotX = leftPx + annWidth;
              const dotY = topPx + annH / 2;
              const targetX = modalRect.left - canvasRect.left;
              const targetY = targetCenterY;
              drawConnector(lineChoicebox, dotChoicebox, dotX, dotY, targetX, targetY);
            }
            // RBAC annotation: LEFT of modal, BELOW scope selection, HORIZONTAL connector to choicebox below
            if (annChoiceboxRbac) {
              const annH = annChoiceboxRbac.offsetHeight || 90;
              // Position below the scope annotation
              const scopeTop = parseFloat(annChoicebox?.style.top || '0');
              const scopeH = annChoicebox?.offsetHeight || 90;
              let leftPx = modalRect.left - canvasRect.left - annWidth - gap;
              let topPx = scopeTop + scopeH + gap;
              leftPx = Math.max(10, leftPx);
              if (topPx < 10) topPx = 10;
              annChoiceboxRbac.style.left = leftPx + 'px';
              annChoiceboxRbac.style.top = topPx + 'px';
              annChoiceboxRbac.style.width = annWidth + 'px';
              const card = annChoiceboxRbac.querySelector('.ann-card');
              if (card) card.style.width = annWidth + 'px';
              // Horizontal connector: from right-center of annotation to left of modal (same Y)
              const dotX = leftPx + annWidth;
              const dotY = topPx + annH / 2;
              const targetX = modalRect.left - canvasRect.left;
              const targetY = dotY; // Same Y = horizontal line
              drawConnector(lineChoiceboxRbac, dotChoiceboxRbac, dotX, dotY, targetX, targetY);
            }
            // CTA real formats annotation: BELOW modal, pointing to footer buttons
            if (annCtaReal) {
              const annH = annCtaReal.offsetHeight || 90;
              let leftPx = (modalRect.left + modalRect.right) / 2 - canvasRect.left - annWidth / 2;
              let topPx = modalRect.bottom - canvasRect.top + gap;
              leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
              if (topPx + annH > canvasRect.height - 10) topPx = canvasRect.height - annH - 10;
              annCtaReal.style.left = leftPx + 'px';
              annCtaReal.style.top = topPx + 'px';
              annCtaReal.style.width = annWidth + 'px';
              const card = annCtaReal.querySelector('.ann-card');
              if (card) card.style.width = annWidth + 'px';
              const dotX = leftPx + annWidth / 2;
              const dotY = topPx;
              const targetX = (modalRect.left + modalRect.right) / 2 - canvasRect.left;
              const targetY = modalRect.bottom - canvasRect.top;
              drawConnector(lineCtaReal, dotCtaReal, dotX, dotY, targetX, targetY);
            }
          }
        }
      }

      // ===== Row selection animation during phase 1 (same as entity-list-table selection-mock) =====
      // Sequentially select 3 rows to show "Export 3 customers?" context
      if (progress < ph1.start - 0.001) {
        for (let i = 1; i <= 5; i++) {
          const check = document.getElementById('src-check-' + i);
          const row = document.getElementById('src-row-' + i);
          if (check) { check.classList.remove('checked'); check.style.opacity = ''; }
          if (row) { row.classList.remove('selected'); }
        }
      } else if (progress > ph1.end + 0.001) {
        // Hold selection through phase 2 (export buttons), reset at phase 3
        const ph3 = PHASES[3];
        if (progress >= ph3.start) {
          for (let i = 1; i <= 5; i++) {
            const check = document.getElementById('src-check-' + i);
            const row = document.getElementById('src-row-' + i);
            if (check) { check.classList.remove('checked'); check.style.opacity = ''; }
            if (row) { row.classList.remove('selected'); }
          }
        }
      } else {
        // Sequential selection during phase 1: rows 1-3 selected in sequence
        const p1 = smoothstep(ph1.start, ph1.start + ph1Dur * 0.20, progress);
        const p2 = smoothstep(ph1.start + ph1Dur * 0.25, ph1.start + ph1Dur * 0.45, progress);
        const p3 = smoothstep(ph1.start + ph1Dur * 0.50, ph1.start + ph1Dur * 0.70, progress);
        const applySelection = (rowIdx: number, p: number) => {
          const check = document.getElementById('src-check-' + rowIdx);
          const row = document.getElementById('src-row-' + rowIdx);
          if (check) {
            if (p > 0.5) { check.classList.add('checked'); }
            else { check.classList.remove('checked'); }
            check.style.opacity = p > 0.1 ? '1' : '';
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
      }

      // ===== Reassembly: reset mock toolbar to filters mode during reassembly phase =====
      const reassemblyPh = PHASES[6];
      const reassemblyDur = reassemblyPh.end - reassemblyPh.start;
      const pReassembleAll = smoothstep(reassemblyPh.start, reassemblyPh.start + reassemblyDur * 0.5, progress);
      const toolbarFiltersReset = document.getElementById('src-toolbar-filters');
      const toolbarBulkReset = document.getElementById('src-toolbar-bulk');
      if (pReassembleAll > 0.5) {
        if (toolbarFiltersReset) { toolbarFiltersReset.style.display = 'flex'; toolbarFiltersReset.style.opacity = '1'; }
        if (toolbarBulkReset) { toolbarBulkReset.style.display = 'none'; toolbarBulkReset.style.opacity = '0'; }
      }

      // ===== Per-sub extraction + annotation =====
      const contentRect = contentArea.getBoundingClientRect();

      // Track which exIds are currently active (for shared overlays)
      const activeExIds = new Set<string>();

      SUBS.forEach(sub => {
        const exEl = document.getElementById(sub.exId);
        const annEl = document.getElementById(sub.annId);
        const line = document.getElementById(sub.lineId);
        const dot = document.getElementById(sub.dotId);
        if (!exEl || !annEl) return;

        const ph = PHASES[sub.phaseIdx];
        const phaseDur = ph.end - ph.start;

        // For shared overlays (same exId, different annotation), handle specially
        // export-choicebox shares ex-export-dialog with export-dialog
        // preview-html, preview-pdf, preview-email share ex-preview-dialog (3 mode transitions)

        const pExtract = smoothstep(ph.start, ph.start + phaseDur * 0.4, progress);

        // Reassembly phase: fade everything out
        const pReassemble = smoothstep(PHASES[6].start, PHASES[6].start + (PHASES[6].end - PHASES[6].start) * 0.5, progress);

        // For phases before reassembly: hold through end of phase
        // For phases during/after reassembly: fade out
        // Shared overlays (export-dialog, preview-dock) hold through reassembly
        // because later phases reuse the same exEl with different annotations.
        const holdThroughReassembly = sub.id === 'export-dialog' || sub.id === 'preview-html';
        let amount: number;
        if (sub.phaseIdx >= 6 || holdThroughReassembly) {
          amount = pExtract * (1 - pReassemble);
        } else {
          // Hold until the next phase starts, then fade out quickly
          const pFadeOut = smoothstep(ph.end - phaseDur * 0.2, ph.end, progress);
          amount = pExtract * (1 - pFadeOut);
        }

        // Special handling for shared overlays
        if (sub.id === 'export-choicebox') {
          // Shares ex-export-dialog — only show choicebox annotation during phase 3
          if (progress < ph.start - 0.001 || progress > ph.end + 0.001) {
            annEl.style.opacity = '0';
            if (line) line.classList.remove('visible');
            if (dot) dot.classList.remove('visible');
            return;
          }
          // The dialog overlay is controlled by export-dialog sub
          // We just handle the annotation + connector
          const pAnnIn = smoothstep(ph.start + phaseDur * 0.3, ph.start + phaseDur * 0.5, progress);
          const pAnnOut = smoothstep(ph.end - phaseDur * 0.2, ph.end, progress);
          const annOpacity = pAnnIn * (1 - pAnnOut);
          annEl.style.opacity = String(annOpacity);
          if (line) line.classList.toggle('visible', annOpacity > 0.5);
          if (dot) dot.classList.toggle('visible', annOpacity > 0.5);
          if (annOpacity > 0.05) {
            positionAnnotation(sub, exEl, annEl);
            updateConnector(sub, exEl, annEl);
          }
          return;
        }

        if (sub.special === 'preview-mode') {
          // Shares ex-preview-dialog — 3 mode transitions within one phase
          // Each sub handles its own mode's annotation + dock icon + content visibility
          if (progress < ph.start - 0.001 || progress > ph.end + 0.001) {
            annEl.style.opacity = '0';
            if (line) line.classList.remove('visible');
            if (dot) dot.classList.remove('visible');
            // Reset dialog opacity when outside the phase
            if (sub.id === 'preview-html') {
              exEl.style.opacity = '0';
              const dockIcons = exEl.querySelectorAll('.export-dock-icon');
              if (dockIcons.length >= 3) {
                dockIcons[0].classList.add('selected');
                dockIcons[1].classList.remove('selected');
                dockIcons[2].classList.remove('selected');
              }
              const htmlContent = exEl.querySelector('#preview-html-content');
              const pdfContent = exEl.querySelector('#preview-pdf-content');
              const emailContent = exEl.querySelector('#preview-email-content');
              if (htmlContent) (htmlContent as HTMLElement).style.opacity = '1';
              if (pdfContent) (pdfContent as HTMLElement).style.opacity = '0';
              if (emailContent) (emailContent as HTMLElement).style.opacity = '0';
              const footerHtml = exEl.querySelector('#preview-footer-html') as HTMLElement;
              const footerPdf = exEl.querySelector('#preview-footer-pdf') as HTMLElement;
              const footerEmail = exEl.querySelector('#preview-footer-email') as HTMLElement;
              if (footerHtml) { footerHtml.style.opacity = '1'; footerHtml.style.display = 'inline-flex'; }
              if (footerPdf) { footerPdf.style.opacity = '0'; footerPdf.style.display = 'none'; }
              if (footerEmail) { footerEmail.style.opacity = '0'; footerEmail.style.display = 'none'; }
            }
            return;
          }

          // Mode transitions: HTML (0-33%), PDF (33-66%), Email (66-100%) of phase
          const modeStart = ph.start + phaseDur * (sub.mode === 'html' ? 0.0 : sub.mode === 'pdf' ? 0.33 : 0.66);
          const modeEnd = ph.start + phaseDur * (sub.mode === 'html' ? 0.33 : sub.mode === 'pdf' ? 0.66 : 1.0);

          // Annotation fades in/out within its mode window
          const pAnnIn = smoothstep(modeStart + (modeEnd - modeStart) * 0.1, modeStart + (modeEnd - modeStart) * 0.3, progress);
          const pAnnOut = smoothstep(modeEnd - (modeEnd - modeStart) * 0.2, modeEnd, progress);
          const annOpacity = pAnnIn * (1 - pAnnOut);
          annEl.style.opacity = String(annOpacity);
          if (line) line.classList.toggle('visible', annOpacity > 0.5);
          if (dot) dot.classList.toggle('visible', annOpacity > 0.5);

          // Only the first preview sub (preview-html) controls the dialog extraction + mode transitions
          if (sub.id === 'preview-html') {
            // Extract the preview dialog — centered on canvas (near-fullscreen)
            const pExtractLocal = smoothstep(ph.start, ph.start + phaseDur * 0.15, progress);
            exEl.style.opacity = String(pExtractLocal);

            // Center the dialog on the canvas, pushed down a bit for annotation spacing
            const natW = exEl.offsetWidth || 1400;
            const natH = exEl.offsetHeight || 820;
            const cw = canvasRect.width, ch = canvasRect.height;
            exEl.style.left = (cw * 0.5 - natW / 2) + 'px';
            exEl.style.top = (ch * 0.5 - natH / 2 + 40) + 'px';
            exEl.style.width = natW + 'px';
            exEl.style.transform = 'scale(1)';
            exEl.style.transformOrigin = 'center center';
            exEl.classList.toggle('detached', pExtractLocal > 0.1);

            if (pExtractLocal > 0.05) {
              positionAnnotation(sub, exEl, annEl);
            }

            // Mode transitions: update dock icons, content visibility, footer buttons
            const pModeHtml = 1 - smoothstep(ph.start + phaseDur * 0.28, ph.start + phaseDur * 0.38, progress);
            const pModePdf = smoothstep(ph.start + phaseDur * 0.28, ph.start + phaseDur * 0.38, progress) * (1 - smoothstep(ph.start + phaseDur * 0.61, ph.start + phaseDur * 0.71, progress));
            const pModeEmail = smoothstep(ph.start + phaseDur * 0.61, ph.start + phaseDur * 0.71, progress);

            // Dock icon selection
            const dockIcons = exEl.querySelectorAll('.export-dock-icon');
            if (dockIcons.length >= 3) {
              dockIcons[0].classList.toggle('selected', pModeHtml > 0.5);
              dockIcons[1].classList.toggle('selected', pModePdf > 0.5);
              dockIcons[2].classList.toggle('selected', pModeEmail > 0.5);
            }

            // Content mode visibility
            const htmlContent = exEl.querySelector('#preview-html-content');
            const pdfContent = exEl.querySelector('#preview-pdf-content');
            const emailContent = exEl.querySelector('#preview-email-content');
            if (htmlContent) (htmlContent as HTMLElement).style.opacity = String(pModeHtml);
            if (pdfContent) (pdfContent as HTMLElement).style.opacity = String(pModePdf);
            if (emailContent) (emailContent as HTMLElement).style.opacity = String(pModeEmail);

            // Footer button visibility — hide non-active CTAs completely (display:none)
            // so they don't take space and the active CTA sits at the right edge
            const footerHtml = exEl.querySelector('#preview-footer-html') as HTMLElement;
            const footerPdf = exEl.querySelector('#preview-footer-pdf') as HTMLElement;
            const footerEmail = exEl.querySelector('#preview-footer-email') as HTMLElement;
            if (footerHtml) {
              footerHtml.style.opacity = String(pModeHtml);
              footerHtml.style.display = pModeHtml > 0.1 ? 'inline-flex' : 'none';
            }
            if (footerPdf) {
              footerPdf.style.opacity = String(pModePdf);
              footerPdf.style.display = pModePdf > 0.1 ? 'inline-flex' : 'none';
            }
            if (footerEmail) {
              footerEmail.style.opacity = String(pModeEmail);
              footerEmail.style.display = pModeEmail > 0.1 ? 'inline-flex' : 'none';
            }
          }

          // Position annotation ABOVE the dock, connected with vertical line to dock icon
          if (annOpacity > 0.05) {
            const exRect = exEl.getBoundingClientRect();
            const canvasRect2 = canvas.getBoundingClientRect();
            const dock = exEl.querySelector('.export-dock');
            const dockIcons = exEl.querySelectorAll('.export-dock-icon');
            // Find the currently selected dock icon as the target
            let targetIcon = null;
            dockIcons.forEach(ic => { if (ic.classList.contains('selected')) targetIcon = ic; });
            if (!targetIcon && dockIcons.length > 0) targetIcon = dockIcons[0];
            const iconR = targetIcon ? targetIcon.getBoundingClientRect() : dock?.getBoundingClientRect();

            const annW = 240;
            const annH = annEl.offsetHeight || 90;
            // Center annotation horizontally above the target dock icon
            const annCenterX = iconR.left + iconR.width / 2;
            let leftPx = annCenterX - canvasRect2.left - annW / 2;
            // Clamp to dialog bounds
            const dialogLeft = exRect.left - canvasRect2.left + 16;
            const dialogRight = exRect.right - canvasRect2.left - 16 - annW;
            leftPx = Math.max(dialogLeft, Math.min(dialogRight, leftPx));
            // Position above the dock with more gap so annotation is clearly separated from dialog
            const topPx = (iconR.top - canvasRect2.top) - annH - 30;

            annEl.style.left = leftPx + 'px';
            annEl.style.top = topPx + 'px';
            annEl.style.width = annW + 'px';
            annEl.style.zIndex = '20';
            const card = annEl.querySelector('.ann-card');
            if (card) {
              (card as HTMLElement).style.width = annW + 'px';
              (card as HTMLElement).classList.add('ann-overlay');
            }

            // Draw vertical connector line from annotation bottom-center to dock icon top-center
            if (line && dot) {
              const annBottomX = leftPx + canvasRect2.left + annW / 2;
              const annBottomY = topPx + canvasRect2.top + annH;
              const iconTopX = iconR.left + iconR.width / 2;
              const iconTopY = iconR.top;
              const svgX = annBottomX - canvasRect2.left;
              const svgY1 = annBottomY - canvasRect2.top;
              const svgY2 = iconTopY - canvasRect2.top;
              line.setAttribute('x1', String(svgX));
              line.setAttribute('y1', String(svgY1));
              line.setAttribute('x2', String(svgX));
              line.setAttribute('y2', String(svgY2));
              line.classList.add('visible');
              dot.setAttribute('cx', String(svgX));
              dot.setAttribute('cy', String(svgY2));
              dot.classList.add('visible');
            }
          }
          return;
        }

        // ===== Special case: bulk-mock (toolbar extracts in phase 2, HOLDS through phases 3-5) =====
        // Toolbar stays extracted and in BULK MODE until reassembly phase (phase 6)
        if (sub.special === 'bulk-mock') {
          const ph3 = PHASES[3]; // Export dialog phase
          const phReassembly = PHASES[6]; // Reassembly phase — toolbar reassembles here
          const phHoldEnd = phReassembly.start; // Hold until reassembly begins

          // Reset when before phase 2 or when reassembly is done
          if (progress < ph.start - 0.001 || progress > phReassembly.end + 0.001) {
            const toolbarFilters0 = document.getElementById('src-toolbar-filters');
            const toolbarBulk0 = document.getElementById('src-toolbar-bulk');
            if (toolbarFilters0) { toolbarFilters0.style.display = 'flex'; toolbarFilters0.style.opacity = 1; }
            if (toolbarBulk0) { toolbarBulk0.style.display = 'none'; toolbarBulk0.style.opacity = 0; }
            exEl.style.opacity = '0';
            annEl.style.opacity = '0';
            if (line) line.classList.remove('visible');
            if (dot) dot.classList.remove('visible');
            return;
          }

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

          // Amount: extract during phase 2, HOLD at 1.0 through phases 3-5, reassemble in phase 6
          const pExtractLocal = smoothstep(ph.start, ph.start + phaseDur * 0.4, progress);
          const pReassembleToolbar = smoothstep(phReassembly.start, phReassembly.start + (phReassembly.end - phReassembly.start) * 0.5, progress);
          const bulkAmount = pExtractLocal * (1 - pReassembleToolbar);

          const curLeft = lerp(startLeft, endLeft, bulkAmount);
          const curTop = lerp(startTop, endTop, bulkAmount);
          const curW = lerp(natW, endW, bulkAmount);
          const exScale = lerp(scale, 1.0, bulkAmount);

          exEl.style.opacity = '1';
          exEl.style.left = curLeft + 'px';
          exEl.style.top = curTop + 'px';
          exEl.style.width = curW + 'px';
          exEl.style.height = natHReal + 'px';
          exEl.style.transform = `scale(${exScale})`;
          exEl.style.transformOrigin = 'center center';
          exEl.classList.toggle('detached', bulkAmount > 0.1);
          exEl.classList.toggle('glow-border', bulkAmount > 0.9 && pReassemble < 0.1);

          // Mock toolbar: toggle from filters to bulk mode at 30-40% of phase 2
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

          // Single annotation about Export CTA (CSV/XLSX) — fade in at 45-55% of phase 2
          // Fade out during phase 3 (when dialog annotations appear)
          const pAnnIn = smoothstep(ph.start + phaseDur * 0.45, ph.start + phaseDur * 0.55, progress);
          const pAnnOut = smoothstep(ph3.start + (ph3.end - ph3.start) * 0.30, ph3.start + (ph3.end - ph3.start) * 0.45, progress);
          const annOpacity = pAnnIn * (1 - pAnnOut);
          annEl.style.opacity = String(annOpacity);
          if (line) line.classList.toggle('visible', annOpacity > 0.5);
          if (dot) dot.classList.toggle('visible', annOpacity > 0.5);

          if (annOpacity > 0.05) {
            const exRect = exEl.getBoundingClientRect();
            const annWidth = 220;
            const annH = annEl.offsetHeight || 90;
            const gap = 16;

            // Find the Export button (first .pb-btn-soft-xs in extracted toolbar)
            const exportBtns = exEl.querySelectorAll('.pb-btn-soft-xs');
            const exportBtn = exportBtns.length > 0 ? exportBtns[0] : null;
            const exportRect = exportBtn ? exportBtn.getBoundingClientRect() : exRect;
            const exportCenterX = (exportRect.left + exportRect.width / 2) - canvasRect.left;

            // Annotation: ABOVE the Export button, centered on it, vertical connector
            let leftPx1 = exportCenterX - annWidth / 2;
            let topPx1 = exRect.top - canvasRect.top - annH - gap;
            leftPx1 = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx1));
            if (topPx1 < 10) topPx1 = 10;
            annEl.style.left = leftPx1 + 'px';
            annEl.style.top = topPx1 + 'px';
            annEl.style.width = annWidth + 'px';
            const card1 = annEl.querySelector('.ann-card');
            if (card1) card1.style.width = annWidth + 'px';

            // Connector: vertical line from bottom-center of annotation to top-center of Export button
            const dot1X = leftPx1 + annWidth / 2;
            const dot1Y = topPx1 + annH;
            const target1X = exportCenterX;
            const target1Y = exportRect.top - canvasRect.top;
            drawConnector(line, dot, dot1X, dot1Y, target1X, target1Y);
          }

          return;
        }

        // ===== Special case: html-dialog (phase 4 — HTML confirm dialog) =====
        // Dialog is positioned lower to avoid overlapping the held bulk toolbar.
        // Annotation is on the LEFT of the dialog with a horizontal connector to dialog.
        // A second vertical connector goes from annotation bottom to the EXPORT HTML CTA in toolbar.
        if (sub.special === 'html-dialog') {
          if (amount < 0.01) {
            exEl.style.opacity = '0';
            annEl.style.opacity = '0';
            if (line) line.classList.remove('visible');
            if (dot) dot.classList.remove('visible');
            const ctaLine = document.getElementById('line-html-dialog-cta');
            const ctaDot = document.getElementById('dot-html-dialog-cta');
            if (ctaLine) ctaLine.classList.remove('visible');
            if (ctaDot) ctaDot.classList.remove('visible');
            exEl.classList.remove('detached', 'glow-border');
            return;
          }

          activeExIds.add(sub.exId);

          // Position dialog: pushed DOWN by 80px to clear toolbar, and pushed RIGHT
          // so the annotation (centered on CTA's X) fits to the left without overlap
          const centerSub = { ...sub, side: 'center' as AnnotationSide };
          const target = getExtractionTarget(centerSub, contentRect, canvasRect);
          const exScale = lerp(scale, 1.0, amount);
          const dialogOffsetY = 80; // push dialog down to avoid toolbar overlap
          const dialogOffsetX = 180; // push dialog right so annotation fits on left

          exEl.style.opacity = String(amount);
          exEl.style.left = (target.left + dialogOffsetX) + 'px';
          exEl.style.top = (target.top + dialogOffsetY) + 'px';
          exEl.style.width = target.width + 'px';
          exEl.style.transform = `scale(${exScale})`;
          exEl.style.transformOrigin = 'center center';
          exEl.classList.toggle('detached', amount > 0.1);
          exEl.classList.toggle('glow-border', amount > 0.9);

          // Annotation on LEFT of dialog, moved down by same offset
          const pAnnIn = smoothstep(ph.start + phaseDur * 0.35, ph.start + phaseDur * 0.45, progress);
          const pAnnOut = smoothstep(ph.end - phaseDur * 0.2, ph.end, progress);
          const annOpacity = pAnnIn * (1 - pAnnOut);
          annEl.style.opacity = String(annOpacity);

          // Connector 1: horizontal line from annotation to dialog
          if (line) line.classList.toggle('visible', annOpacity > 0.5);
          if (dot) dot.classList.toggle('visible', annOpacity > 0.5);

          // Connector 2: vertical line from annotation to EXPORT HTML CTA in toolbar
          const ctaLine = document.getElementById('line-html-dialog-cta') as SVGLineElement | null;
          const ctaDot = document.getElementById('dot-html-dialog-cta') as SVGCircleElement | null;
          if (ctaLine) ctaLine.classList.toggle('visible', annOpacity > 0.5);
          if (ctaDot) ctaDot.classList.toggle('visible', annOpacity > 0.5);

          if (annOpacity > 0.05) {
            // Position annotation to the LEFT of the dialog, centered on CTA's X for vertical connector
            const exRect = exEl.getBoundingClientRect();
            const canvasRect2 = canvas.getBoundingClientRect();
            const annW = 210;
            const annH = annEl.offsetHeight || 90;
            const gap = 24;

            // Get CTA button from EXTRACTED toolbar (#ex-export-buttons), not the mock
            // Export HTML is the 3rd button (idx=2) in the bulk toolbar
            const exToolbar = document.getElementById('ex-export-buttons');
            const exBtns = exToolbar ? exToolbar.querySelectorAll('button') : [];
            const ctaBtnEl = exBtns.length > 2 ? exBtns[2] : null;
            const ctaRect = ctaBtnEl ? ctaBtnEl.getBoundingClientRect() : null;
            const ctaCenterX = ctaRect ? (ctaRect.left + ctaRect.width / 2 - canvasRect2.left) : (exRect.left - canvasRect2.left - annW / 2 - gap);

            // Center annotation horizontally on CTA's center X
            let leftPx = ctaCenterX - annW / 2;
            let topPx = exRect.top + exRect.height / 2 - canvasRect2.top - annH / 2;
            // Clamp: keep left of dialog with gap, and within canvas
            const maxLeft = exRect.left - canvasRect2.left - gap;
            leftPx = Math.min(leftPx, maxLeft);
            leftPx = Math.max(10, leftPx);
            if (topPx < 10) topPx = 10;
            if (topPx > canvasRect2.height - annH - 10) topPx = canvasRect2.height - annH - 10;

            annEl.style.left = leftPx + 'px';
            annEl.style.top = topPx + 'px';
            annEl.style.width = annW + 'px';
            const card = annEl.querySelector('.ann-card');
            if (card) (card as HTMLElement).style.width = annW + 'px';

            // Connector 1: horizontal line from annotation right-center to dialog left-center
            if (line && dot) {
              const dot1X = leftPx + annW;
              const dot1Y = topPx + annH / 2;
              const target1X = exRect.left - canvasRect2.left;
              const target1Y = exRect.top + exRect.height / 2 - canvasRect2.top;
              drawConnector(line, dot, dot1X, dot1Y, target1X, target1Y);
            }

            // Connector 2: VERTICAL line from annotation TOP-center to EXPORT HTML CTA BOTTOM in EXTRACTED toolbar
            // Line comes from below (annotation), so it targets the BOTTOM of the CTA button
            // drawConnector places the dot at fromX/fromY, so we pass CTA bottom as "from" to put dot on CTA
            if (ctaLine && ctaDot) {
              const exToolbar = document.getElementById('ex-export-buttons');
              const exBtns = exToolbar ? exToolbar.querySelectorAll('button') : [];
              // Export HTML is the 3rd button (idx=2) in the bulk toolbar
              const ctaBtnEl = exBtns.length > 2 ? exBtns[2] : null;
              const ctaRect = ctaBtnEl ? ctaBtnEl.getBoundingClientRect() : null;
              if (ctaRect) {
                const ctaCenterX = ctaRect.left + ctaRect.width / 2 - canvasRect2.left;
                const ctaBottomY = ctaRect.bottom - canvasRect2.top;
                const annTopY = topPx; // TOP of annotation
                drawConnector(ctaLine, ctaDot, ctaCenterX, ctaBottomY, ctaCenterX, annTopY);
              }
            }
          }
          return;
        }

        // Standard extraction handling
        if (amount < 0.01) {
          exEl.style.opacity = '0';
          annEl.style.opacity = '0';
          if (line) line.classList.remove('visible');
          if (dot) dot.classList.remove('visible');
          exEl.classList.remove('detached', 'glow-border');
          return;
        }

        activeExIds.add(sub.exId);

        // Position the extracted overlay
        const target = getExtractionTarget(sub, contentRect, canvasRect);
        const exScale = lerp(scale, 1.0, amount);

        exEl.style.opacity = String(amount);
        exEl.style.left = target.left + 'px';
        exEl.style.top = target.top + 'px';
        exEl.style.width = target.width + 'px';
        exEl.style.transform = `scale(${exScale})`;
        exEl.style.transformOrigin = 'center center';
        exEl.classList.toggle('detached', amount > 0.1);
        exEl.classList.toggle('glow-border', amount > 0.9);

        // Annotation
        const pAnnIn = smoothstep(ph.start + phaseDur * 0.35, ph.start + phaseDur * 0.45, progress);
        const pAnnOut = smoothstep(ph.end - phaseDur * 0.2, ph.end, progress);
        const annOpacity = pAnnIn * (1 - pAnnOut);
        annEl.style.opacity = String(annOpacity);
        if (line) line.classList.toggle('visible', annOpacity > 0.5);
        if (dot) dot.classList.toggle('visible', annOpacity > 0.5);

        if (annOpacity > 0.05) {
          positionAnnotation(sub, exEl, annEl);
          updateConnector(sub, exEl, annEl);
        }
      });

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
