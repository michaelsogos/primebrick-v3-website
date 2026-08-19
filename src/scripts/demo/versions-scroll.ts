/* ============================================================
   Primebrick Demo — Versions scroll-jacking engine
   Progressive disassembly with TWO screen mocks (cross-fade):
   - Mock A: Entity list table (phases 0-1, 8-10)
   - Mock B: Entity form page (phases 2-7)
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

export function initVersionsScroll(): void {
  (function () {
    const track = document.getElementById('track');
    const mockA = document.getElementById('screen-mock-a');
    const mockB = document.getElementById('screen-mock-b');
    const railFill = document.getElementById('rail-fill');
    const dotsContainer = document.getElementById('dots');
    const phaseLabel = document.getElementById('phase-label');
    const canvas = document.getElementById('canvas');
    if (!track || !mockA || !mockB || !canvas) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ===== Phases (8) =====
    const PHASES = [
      { name: 'The Audit System',     start: 0.000, end: 0.040 },
      { name: 'Row Action Entry',     start: 0.040, end: 0.110 },
      { name: 'Form Footer Entry',    start: 0.110, end: 0.190 },
      { name: 'Version History',      start: 0.190, end: 0.320 },
      { name: 'Error Panel',          start: 0.320, end: 0.450 },
      { name: 'Reassembly',           start: 0.450, end: 0.520 },
      { name: 'Zoom Back',            start: 0.520, end: 0.590 },
      { name: 'Conclusion',           start: 0.590, end: 0.620 },
    ];

    // Section ranges (for section-claim opacity)
    const SECTIONS = [
      { id: 'claim-1', start: 1, end: 2 },  // Persistent across both entry-point phases
      { id: 'claim-2', start: 3, end: 3 },  // Version panel (with diffs inside)
      { id: 'claim-3', start: 4, end: 4 },  // Error panel
    ];

    // Sub-extractions
    const SUBS = [
      { id: 'row-action',    exId: 'ex-row-action',    annId: 'ann-row-action',    lineId: 'line-row-action',    dotId: 'dot-row-action',    phaseIdx: 1, side: 'top' as AnnotationSide,    special: 'rowactions-dropdown' as any },
      { id: 'form-footer',   exId: 'ex-form-footer',   annId: 'ann-form-footer',   lineId: 'line-form-footer',   dotId: 'dot-form-footer',   phaseIdx: 2, side: 'bottom' as AnnotationSide, special: 'form-footer-badge' as any },
      { id: 'version-panel', exId: 'ex-version-panel', annId: 'ann-version-panel', lineId: 'line-version-panel', dotId: 'dot-version-panel', phaseIdx: 3, side: 'left' as AnnotationSide,  special: 'sheet-right' as any },
      { id: 'field-diff',    exId: 'ex-field-diff',    annId: 'ann-field-diff',    lineId: 'line-field-diff',    dotId: 'dot-field-diff',    phaseIdx: 3, side: 'top' as AnnotationSide,    special: 'field-diff-in-panel' as any },
      { id: 'error-panel',   exId: 'ex-error-panel',   annId: 'ann-error-panel',   lineId: 'line-error-panel',   dotId: 'dot-error-panel',   phaseIdx: 4, side: 'left' as AnnotationSide,  special: 'sheet-right' as any },
    ];

    // Build scene dots
    if (dotsContainer) {
      buildSceneDots(dotsContainer as HTMLElement, track as HTMLElement, [
        { label: 'Start', target: 0.0 },
        { label: 'Row Action', target: 0.07 },
        { label: 'Form Footer', target: 0.15 },
        { label: 'History', target: 0.25 },
        { label: 'Errors', target: 0.38 },
        { label: 'Conclusion', target: 0.60 },
      ], reducedMotion);
    }

    if (reducedMotion) {
      mockA.style.transform = 'translate(-50%, -50%) scale(0.75)';
      return;
    }

    let currentPhaseIdx = -1;
    let ticking = false;

    function positionAnnotation(sub: any, exEl: HTMLElement, annEl: HTMLElement) {
      _positionAnnotation(canvas, exEl, annEl, sub.side as AnnotationSide);
    }

    function updateConnector(sub: any, exEl: HTMLElement, annEl: HTMLElement) {
      const lineEl = document.getElementById(sub.lineId) as SVGLineElement | null;
      const dotEl = document.getElementById(sub.dotId) as SVGCircleElement | null;
      _updateConnector(canvas, exEl, annEl, lineEl, dotEl, sub.side as AnnotationSide);
    }

    // ===== Compute extraction target position =====
    function getExtractionTarget(sub: any, contentRect: DOMRect, canvasRect: DOMRect, activeMock: HTMLElement) {
      const cw = canvasRect.width, ch = canvasRect.height;
      const cLeft = contentRect.left - canvasRect.left;
      const cTop = contentRect.top - canvasRect.top;
      const cW = contentRect.width, cH = contentRect.height;
      const exEl = document.getElementById(sub.exId);
      let natW = exEl?.offsetWidth || 300, natH = exEl?.offsetHeight || 120;

      switch (sub.side) {
        case 'bottom':
          return { left: cw * 0.5 - natW / 2, top: cTop + cH + 30, width: natW, height: natH };
        case 'top':
          return { left: cw * 0.5 - natW / 2, top: Math.max(120, cTop - natH - 30), width: natW, height: natH };
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

      // Resize SVG connector layer
      const connectorsSvg = document.getElementById('connectors') as SVGElement | null;
      if (connectorsSvg && canvas) {
        connectorsSvg.setAttribute('width', String(canvas.offsetWidth));
        connectorsSvg.setAttribute('height', String(canvas.offsetHeight));
      }

      if (railFill) railFill.style.height = (progress * 100) + '%';
      fadeScrollHint(progress);

      const canvasRect = canvas.getBoundingClientRect();

      // ===== Section claims opacity =====
      SECTIONS.forEach(s => {
        const claimEl = document.getElementById(s.id);
        if (!claimEl) return;
        const startP = PHASES[s.start].start;
        const endP = PHASES[s.end].end;
        const claimIn = smoothstep(startP, startP + 0.02, progress);
        const claimOut = smoothstep(endP - 0.02, endP, progress);
        claimEl.style.opacity = String(claimIn * (1 - claimOut));
      });

      // Claim-0 (intro) — visible immediately at phase 0, fades out at end of phase 0
      const claim0 = document.getElementById('claim-0');
      if (claim0) {
        const ph0 = PHASES[0];
        const claimOut = smoothstep(ph0.end - 0.02, ph0.end, progress);
        claim0.style.opacity = String(1 - claimOut);
      }

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
          // Map phaseIdx to bullet dot index
          let dotIdx;
          if (phaseIdx <= 1) dotIdx = phaseIdx;           // 0=Start, 1=Row Action
          else if (phaseIdx === 2) dotIdx = 2;             // Form Footer
          else if (phaseIdx === 3) dotIdx = 3;             // History
          else if (phaseIdx === 4) dotIdx = 4;             // Errors
          else dotIdx = 5;                                  // Conclusion
          dotsContainer.querySelectorAll('.scene-dot').forEach((d, i) => d.classList.toggle('active', i === dotIdx));
        }
        if (phaseLabel) phaseLabel.textContent = PHASES[phaseIdx].name;
      }

      // ===== Two-mock cross-fade =====
      // Mock A: phases 0-1, 5-7 (opacity 1)
      // Mock B: phases 2-4 (opacity 1)
      // Cross-fade at phase 1→2 and phase 4→5
      const ph1 = PHASES[1], ph2 = PHASES[2];
      const ph4 = PHASES[4], ph5 = PHASES[5];
      // A→B cross-fade during phase 2 start (0.110 → 0.150)
      const pCrossAB = smoothstep(ph2.start, ph2.start + (ph2.end - ph2.start) * 0.3, progress);
      // B→A cross-fade during phase 5 start (0.450 → 0.490)
      const pCrossBA = smoothstep(ph5.start, ph5.start + (ph5.end - ph5.start) * 0.3, progress);
      // Mock A opacity: 1 until crossAB, then 0, then 1 after crossBA
      const mockAOpacity = (1 - pCrossAB) * (1 - pCrossBA) + pCrossBA;
      // Mock B opacity: 0 until crossAB, then 1, then 0 after crossBA
      const mockBOpacity = pCrossAB * (1 - pCrossBA);
      mockA.style.opacity = String(mockAOpacity);
      mockB.style.opacity = String(mockBOpacity);

      // ===== Screen mock transform (shared scale) =====
      // Phase 0: full size centered
      // Phase 1+: shrink to 0.82 for features
      // Last phases: zoom back to 1.0
      const ph0 = PHASES[0];
      const ph0Dur = ph0.end - ph0.start;
      const pShrink = smoothstep(ph0.start + ph0Dur * 0.60, ph1.start + (ph1.end - ph1.start) * 0.50, progress);
      const zoomPh = PHASES[6];
      const zoomDur = zoomPh.end - zoomPh.start;
      const pZoomBack = smoothstep(zoomPh.start, zoomPh.end - zoomDur * 0.1, progress);
      const scale = lerp(1.0, 0.82, pShrink) * lerp(1.0, 1.0 / 0.82, pZoomBack);
      const ty = lerp(0, 8, pShrink) * (1 - pZoomBack);
      const transform = `translate(-50%, -50%) scale(${scale}) translate(0%, ${ty}%)`;
      mockA.style.transform = transform;
      mockB.style.transform = transform;

      // Determine which mock is active for content-area queries
      const activeMock = mockBOpacity > 0.5 ? mockB : mockA;
      const contentArea = activeMock.querySelector('.pb-content') as HTMLElement | null;

      // ===== Sub-extractions =====
      SUBS.forEach(sub => {
        const exEl = document.getElementById(sub.exId);
        const annEl = document.getElementById(sub.annId);
        if (!annEl) return;
        // field-diff-in-panel has no separate extraction element (targets the version panel directly)
        if (!exEl && sub.special !== 'field-diff-in-panel') return;

        const ph = PHASES[sub.phaseIdx];
        const phDur = ph.end - ph.start;

        const lineEl = document.getElementById(sub.lineId);
        const dotEl = document.getElementById(sub.dotId);

        // ===== Special case: rowactions-dropdown (dropdown appears next to row action button) =====
        if (sub.special === 'rowactions-dropdown') {
          exEl.style.opacity = '0';
          const dropdown = document.getElementById('row-actions-dropdown');
          const actBtn = document.getElementById('src-act-btn-3-a');

          if (progress < ph.start - 0.001 || progress > ph.end + 0.001) {
            if (dropdown) { dropdown.style.opacity = '0'; dropdown.style.pointerEvents = 'none'; }
            const dropInner = document.getElementById('row-actions-dropdown-inner');
            if (dropInner) { dropInner.classList.remove('detached', 'glow-border'); }
            annEl.style.opacity = '0';
            if (lineEl) lineEl.classList.remove('visible');
            if (dotEl) dotEl.classList.remove('visible');
            return;
          }

          const pDropIn = smoothstep(ph.start, ph.start + phDur * 0.3, progress);
          const pDropOut = smoothstep(ph.end - phDur * 0.2, ph.end, progress);
          const dropOpacity = pDropIn * (1 - pDropOut);

          const dropInner = document.getElementById('row-actions-dropdown-inner');
          if (dropdown && actBtn) {
            dropdown.style.opacity = String(dropOpacity);
            dropdown.style.pointerEvents = dropOpacity > 0.5 ? 'auto' : 'none';
            if (dropInner) {
              dropInner.classList.toggle('detached', dropOpacity > 0.1);
              dropInner.classList.toggle('glow-border', dropOpacity > 0.9 && pDropOut < 0.1);
            }
            if (dropOpacity > 0.05) {
              const btnRect = actBtn.getBoundingClientRect();
              const dropW = 224;
              const dropH = dropdown.offsetHeight || 220;
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
          const pAnnIn = smoothstep(ph.start + phDur * 0.4, ph.start + phDur * 0.55, progress);
          const pAnnOut = smoothstep(ph.end - phDur * 0.15, ph.end, progress);
          const annOpacity = pAnnIn * (1 - pAnnOut);
          annEl.style.opacity = String(annOpacity);
          if (lineEl) lineEl.classList.toggle('visible', annOpacity > 0.5);
          if (dotEl) dotEl.classList.toggle('visible', annOpacity > 0.5);
          if (annOpacity > 0.05 && dropdown) {
            const vhItem = document.getElementById('row-action-vh');
            const targetEl = vhItem || dropdown;
            const targetRect = targetEl.getBoundingClientRect();
            const annWidth = 220;
            const annH = annEl.offsetHeight || 90;
            const gap = 40;
            let leftPx = targetRect.left - canvasRect.left - annWidth - gap;
            let topPx = targetRect.top + targetRect.height / 2 - canvasRect.top - annH / 2;
            leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
            if (topPx < 10) topPx = 10;
            if (topPx > canvasRect.height - annH - 10) topPx = canvasRect.height - annH - 10;
            annEl.style.left = leftPx + 'px';
            annEl.style.top = topPx + 'px';
            annEl.style.width = annWidth + 'px';
            const card = annEl.querySelector('.ann-card');
            if (card) (card as HTMLElement).style.width = annWidth + 'px';
            const dotX = leftPx + annWidth;
            const dotY = topPx + annH / 2;
            const targetX = targetRect.left - canvasRect.left;
            const targetY = targetRect.top + targetRect.height / 2 - canvasRect.top;
            drawConnector(lineEl as SVGLineElement | null, dotEl as SVGCircleElement | null, dotX, dotY, targetX, targetY);
          }
          return;
        }

        // ===== Special case: form-footer-badge (annotation above the v2 badge, connector to badge top) =====
        if (sub.special === 'form-footer-badge') {
          exEl.style.opacity = '0';
          const badge = document.getElementById('form-version-badge');

          if (progress < ph.start - 0.001 || progress > ph.end + 0.001) {
            annEl.style.opacity = '0';
            if (lineEl) lineEl.classList.remove('visible');
            if (dotEl) dotEl.classList.remove('visible');
            return;
          }

          const pAnnIn = smoothstep(ph.start + phDur * 0.20, ph.start + phDur * 0.50, progress);
          const pAnnOut = smoothstep(ph.end - phDur * 0.15, ph.end, progress);
          const annOpacity = pAnnIn * (1 - pAnnOut);
          annEl.style.opacity = String(annOpacity);
          if (lineEl) lineEl.classList.toggle('visible', annOpacity > 0.5);
          if (dotEl) dotEl.classList.toggle('visible', annOpacity > 0.5);

          if (annOpacity > 0.05 && badge) {
            const badgeRect = badge.getBoundingClientRect();
            const annWidth = 220;
            const annH = annEl.offsetHeight || 90;
            const gap = 32;
            // Center annotation horizontally on the badge, above it
            let leftPx = badgeRect.left + badgeRect.width / 2 - canvasRect.left - annWidth / 2;
            let topPx = badgeRect.top - canvasRect.top - annH - gap;
            leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
            if (topPx < 10) topPx = 10;
            annEl.style.left = leftPx + 'px';
            annEl.style.top = topPx + 'px';
            annEl.style.width = annWidth + 'px';
            const card = annEl.querySelector('.ann-card');
            if (card) (card as HTMLElement).style.width = annWidth + 'px';
            // Connector: from annotation bottom-center down to badge top-center
            const dotX = leftPx + annWidth / 2;
            const dotY = topPx + annH;
            const targetX = badgeRect.left + badgeRect.width / 2 - canvasRect.left;
            const targetY = badgeRect.top - canvasRect.top;
            drawConnector(lineEl as SVGLineElement | null, dotEl as SVGCircleElement | null, dotX, dotY, targetX, targetY);
          }
          return;
        }

        // ===== Special case: sheet-right (panel slides from mock's right edge, annotation on left) =====
        if (sub.special === 'sheet-right') {
          const activeMockEl = mockBOpacity > 0.5 ? mockB : mockA;
          const mockRect = activeMockEl.getBoundingClientRect();
          const mockCenterY = mockRect.top + mockRect.height / 2 - canvasRect.top;
          const sheetW = parseFloat(exEl.style.width) || 420;

          // Extraction progress
          const exIn = smoothstep(ph.start + phDur * 0.15, ph.start + phDur * 0.45, progress);
          const exOut = smoothstep(ph.end - phDur * 0.15, ph.end, progress);
          const amount = exIn * (1 - exOut);

          if (amount < 0.01) {
            exEl.style.opacity = '0';
            annEl.style.opacity = '0';
            exEl.classList.remove('detached', 'glow-border');
            if (lineEl) lineEl.classList.remove('visible');
            if (dotEl) dotEl.classList.remove('visible');
            return;
          }

          // Start: flush with mock's right edge (as if inside the screen)
          const startLeft = mockRect.right - canvasRect.left - sheetW;
          // End: slightly overlapping the mock's right edge
          const endLeft = mockRect.right - canvasRect.left - 30;
          const curLeft = lerp(startLeft, endLeft, amount);

          // Scale: start at mock's scale, grow to 1.0 as it slides out
          const exScale = lerp(scale, 1.0, amount);

          exEl.style.opacity = '1';
          exEl.style.left = curLeft + 'px';
          exEl.style.top = mockCenterY + 'px';
          exEl.style.width = sheetW + 'px';
          exEl.style.transform = `translateY(-50%) scale(${exScale})`;
          exEl.style.transformOrigin = 'center center';
          exEl.classList.toggle('detached', amount > 0.1);
          exEl.classList.toggle('glow-border', amount > 0.9 && exOut < 0.1);

          // Annotation: fades in during hold, positioned to the LEFT of the sheet, slightly above center
          const pAnnIn = smoothstep(ph.start + phDur * 0.35, ph.start + phDur * 0.45, progress);
          const pAnnOut = smoothstep(ph.end - phDur * 0.25, ph.end, progress);
          const annOpacity = pAnnIn * (1 - pAnnOut);
          annEl.style.opacity = String(annOpacity);
          if (lineEl) lineEl.classList.toggle('visible', annOpacity > 0.5);
          if (dotEl) dotEl.classList.toggle('visible', annOpacity > 0.5);

          if (annOpacity > 0.05) {
            const exRect = exEl.getBoundingClientRect();
            const annWidth = 220;
            const annH = annEl.offsetHeight || 90;
            const gap = 24;
            // Position to the LEFT of the sheet, moved up so connector is horizontal
            let leftPx = exRect.left - canvasRect.left - annWidth - gap;
            let topPx = exRect.top + exRect.height / 2 - canvasRect.top - annH / 2 - 130;
            leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
            if (topPx < 10) topPx = 10;
            if (topPx > canvasRect.height - annH - 10) topPx = canvasRect.height - annH - 10;
            annEl.style.left = leftPx + 'px';
            annEl.style.top = topPx + 'px';
            annEl.style.width = annWidth + 'px';
            const card = annEl.querySelector('.ann-card');
            if (card) (card as HTMLElement).style.width = annWidth + 'px';
            // Connector: horizontal line from right edge of annotation to left edge of sheet
            const dotX = leftPx + annWidth;
            const dotY = topPx + annH / 2;
            const targetX = exRect.left - canvasRect.left;
            const targetY = dotY; // horizontal: same Y as annotation center
            drawConnector(lineEl as SVGLineElement | null, dotEl as SVGCircleElement | null, dotX, dotY, targetX, targetY);
          }
          return;
        }

        // ===== Special case: field-diff-in-panel (annotation targets diff rows inside the version panel) =====
        if (sub.special === 'field-diff-in-panel') {
          const versionPanel = document.getElementById('ex-version-panel');
          const diffList = document.getElementById('v2-diff-list');
          if (!versionPanel || !diffList) return;

          // Only visible when the version panel is visible
          const vpOpacity = parseFloat(versionPanel.style.opacity || '0');
          if (vpOpacity < 0.5) {
            annEl.style.opacity = '0';
            if (lineEl) lineEl.classList.remove('visible');
            if (dotEl) dotEl.classList.remove('visible');
            return;
          }

          // Fade in at the SAME time as the version-panel annotation
          const pAnnIn = smoothstep(ph.start + phDur * 0.35, ph.start + phDur * 0.45, progress);
          const pAnnOut = smoothstep(ph.end - phDur * 0.25, ph.end, progress);
          const annOpacity = pAnnIn * (1 - pAnnOut);
          annEl.style.opacity = String(annOpacity);
          if (lineEl) lineEl.classList.toggle('visible', annOpacity > 0.5);
          if (dotEl) dotEl.classList.toggle('visible', annOpacity > 0.5);

          if (annOpacity > 0.05) {
            const exRect = versionPanel.getBoundingClientRect();
            const diffRows = diffList.querySelectorAll('.diff-row');
            const secondRow = diffRows[1] as HTMLElement;
            const secondRowRect = secondRow?.getBoundingClientRect();
            const annWidth = 220;
            const annH = annEl.offsetHeight || 90;
            const gap = 24;
            // Position to the LEFT of the panel, vertically centered on the 2nd diff row
            let leftPx = exRect.left - canvasRect.left - annWidth - gap;
            let topPx: number;
            if (secondRowRect) {
              // Center annotation on the 2nd diff row's vertical center
              topPx = secondRowRect.top + secondRowRect.height / 2 - canvasRect.top - annH / 2;
            } else {
              // Fallback: lower portion of the panel
              topPx = exRect.top + exRect.height * 0.65 - canvasRect.top - annH / 2;
            }
            leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
            if (topPx < 10) topPx = 10;
            if (topPx > canvasRect.height - annH - 10) topPx = canvasRect.height - annH - 10;
            annEl.style.left = leftPx + 'px';
            annEl.style.top = topPx + 'px';
            annEl.style.width = annWidth + 'px';
            const card = annEl.querySelector('.ann-card');
            if (card) (card as HTMLElement).style.width = annWidth + 'px';
            // Connector: horizontal line from right edge of annotation to left side of 2nd diff row
            const dotX = leftPx + annWidth;
            const dotY = topPx + annH / 2;
            const targetX = secondRowRect ? secondRowRect.left - canvasRect.left : exRect.left - canvasRect.left;
            const targetY = dotY; // horizontal: same Y as annotation center
            drawConnector(lineEl as SVGLineElement | null, dotEl as SVGCircleElement | null, dotX, dotY, targetX, targetY);
          }
          return;
        }

        // ===== Generic extraction =====
        const exIn = smoothstep(ph.start + phDur * 0.20, ph.start + phDur * 0.50, progress);
        const exOut = smoothstep(ph.start + phDur * 0.85, ph.end, progress);
        const exOp = exIn * (1 - exOut);

        if (exOp < 0.01) {
          exEl.style.opacity = '0';
          annEl.style.opacity = '0';
          if (lineEl) lineEl.classList.remove('visible');
          if (dotEl) dotEl.classList.remove('visible');
          return;
        }

        exEl.style.opacity = String(exOp);
        annEl.style.opacity = String(exOp);

        // Position the extracted overlay
        if (contentArea) {
          const contentRect = contentArea.getBoundingClientRect();
          const target = getExtractionTarget(sub, contentRect, canvasRect, activeMock as HTMLElement);
          exEl.style.left = target.left + 'px';
          exEl.style.top = target.top + 'px';
          if (target.width) exEl.style.width = target.width + 'px';
        }

        // Position annotation and draw connector
        positionAnnotation(sub, exEl, annEl);
        updateConnector(sub, exEl, annEl);

        if (lineEl) lineEl.classList.toggle('visible', exOp > 0.5);
        if (dotEl) dotEl.classList.toggle('visible', exOp > 0.5);
      });
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();
}
