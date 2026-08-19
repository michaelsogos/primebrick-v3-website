/* ============================================================
   Primebrick Demo — Versions scroll-jacking engine
   Progressive disassembly pattern (same as exports/entity-list-table).
   TWO screen-mocks (table + form) cross-fade during scroll.
   As the user scrolls, elements EXTRACT from the mocks with
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

export function initVersionsScroll(): void {
  (function () {
    const track = document.getElementById('track');
    const stage = document.getElementById('stage');
    const canvas = document.getElementById('canvas');
    const mockA = document.getElementById('screen-mock-a');
    const mockB = document.getElementById('screen-mock-b');
    const railFill = document.getElementById('rail-fill');
    const dotsContainer = document.getElementById('dots');
    const phaseLabel = document.getElementById('phase-label');
    if (!track || !mockA || !mockB || !canvas) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ===== Phases (11) =====
    // 0: Intro (table visible)
    // 1: Row action menu extracts from table
    // 2: Cross-fade table → form
    // 3: Form footer / version badge extracts
    // 4: Version history panel extracts (right sheet)
    // 5: Action icons extract from timeline
    // 6: Field diff extracts from timeline entry
    // 7: Cross-fade form → table (errors badge visible)
    // 8: Error panel extracts (right sheet)
    // 9: Impact cards extract from error panel
    // 10: Conclusion
    const PHASES = [
      { name: 'Intro',              start: 0.000, end: 0.040 },
      { name: 'Row action',         start: 0.040, end: 0.120 },
      { name: 'Form view',          start: 0.120, end: 0.220 },
      { name: 'Audit footer',       start: 0.220, end: 0.320 },
      { name: 'Version history',    start: 0.320, end: 0.440 },
      { name: 'Action icons',       start: 0.440, end: 0.520 },
      { name: 'Field diff',         start: 0.520, end: 0.600 },
      { name: 'Error panel',        start: 0.600, end: 0.720 },
      { name: 'Impact cards',       start: 0.720, end: 0.800 },
      { name: 'Reassembly',         start: 0.800, end: 0.880 },
      { name: 'Conclusion',         start: 0.880, end: 1.000 },
    ];

    // Section claims: [startPhaseIdx, endPhaseIdx] — which phases each claim is visible
    const SECTIONS = [
      { id: 'claim-0', start: 0, end: 1 },  // The Audit Trail — intro + row action
      { id: 'claim-1', start: 2, end: 4 },  // Always Accessible — form + footer + version panel
      { id: 'claim-2', start: 5, end: 6 },  // Field by Field — action icons + field diff
      { id: 'claim-3', start: 7, end: 9 },  // Centralized Errors — error panel + impact cards
    ];

    // Sub-extractions: each {id, exId, annId, lineId, dotId, phaseIdx, side}
    const SUBS = [
      { id: 'row-action',     exId: 'ex-row-action',     annId: 'ann-row-action',     lineId: 'line-row-action',     dotId: 'dot-row-action',     phaseIdx: 1, side: 'right' as AnnotationSide },
      { id: 'form-footer',    exId: 'ex-form-footer',    annId: 'ann-form-footer',    lineId: 'line-form-footer',    dotId: 'dot-form-footer',    phaseIdx: 3, side: 'bottom' as AnnotationSide },
      { id: 'version-panel',  exId: 'ex-version-panel',  annId: 'ann-version-panel',  lineId: 'line-version-panel',  dotId: 'dot-version-panel',  phaseIdx: 4, side: 'right' as AnnotationSide },
      { id: 'action-icons',   exId: 'ex-action-icons',   annId: 'ann-action-icons',   lineId: 'line-action-icons',   dotId: 'dot-action-icons',   phaseIdx: 5, side: 'left' as AnnotationSide },
      { id: 'field-diff',     exId: 'ex-field-diff',     annId: 'ann-field-diff',     lineId: 'line-field-diff',     dotId: 'dot-field-diff',     phaseIdx: 6, side: 'left' as AnnotationSide },
      { id: 'error-panel',    exId: 'ex-error-panel',    annId: 'ann-error-panel',    lineId: 'line-error-panel',    dotId: 'dot-error-panel',    phaseIdx: 8, side: 'right' as AnnotationSide },
      { id: 'impact-cards',   exId: 'ex-impact-cards',   annId: 'ann-impact-cards',   lineId: 'line-impact-cards',   dotId: 'dot-impact-cards',   phaseIdx: 9, side: 'right' as AnnotationSide },
    ];

    // Build scene dots
    if (dotsContainer) {
      buildSceneDots(dotsContainer as HTMLElement, track as HTMLElement, [
        { label: 'Start',       target: 0.0 },
        { label: 'Row action',  target: 0.08 },
        { label: 'Form',        target: 0.17 },
        { label: 'Footer',      target: 0.27 },
        { label: 'Versions',    target: 0.38 },
        { label: 'Icons',       target: 0.48 },
        { label: 'Diff',        target: 0.56 },
        { label: 'Errors',      target: 0.66 },
        { label: 'Impact',      target: 0.76 },
        { label: 'Conclusion',  target: 0.90 },
      ], reducedMotion);
    }

    if (reducedMotion) {
      // Static mode: show mock A, no scroll-jacking
      mockA.style.transform = 'translate(-50%, -50%) scale(0.75)';
      mockB.style.opacity = '0';
      document.body.classList.add('static-mode');
      track.classList.add('hidden');
      const staticStack = document.querySelector('.static-stack');
      if (staticStack) staticStack.classList.remove('hidden');
      return;
    }

    // ===== DOM refs for sub-extractions =====
    const subEls = SUBS.map((s) => ({
      ...s,
      ex: document.getElementById(s.exId) as HTMLElement | null,
      ann: document.getElementById(s.annId) as HTMLElement | null,
      line: document.getElementById(s.lineId) as unknown as SVGLineElement | null,
      dot: document.getElementById(s.dotId) as unknown as SVGCircleElement | null,
    }));

    // Section claim elements
    const sectionEls = SECTIONS.map((s) => ({
      ...s,
      el: document.getElementById(s.id) as HTMLElement | null,
    }));

    // Final claim
    const finalClaim = document.getElementById('claim-final');

    let currentPhase = -1;
    let ticking = false;

    function update(): void {
      const rect = (track as HTMLElement).getBoundingClientRect();
      const vh = window.innerHeight;
      const totalScroll = (track as HTMLElement).offsetHeight - vh;
      const scrolled = Math.max(0, -rect.top);
      const progress = clamp01(scrolled / totalScroll);

      // Rail fill
      if (railFill) railFill.style.height = progress * 100 + '%';

      // Fade scroll hint
      fadeScrollHint(progress);

      // Current phase
      const phaseIdx = PHASES.findIndex((p) => progress >= p.start && progress < p.end);
      const currentPhaseIdx = phaseIdx >= 0 ? phaseIdx : PHASES.length - 1;

      if (currentPhaseIdx !== currentPhase) {
        currentPhase = currentPhaseIdx;
        if (phaseLabel) phaseLabel.textContent = PHASES[currentPhaseIdx].name;
      }

      // ===== Mock cross-fade =====
      // Mock A (table) visible phases 0-1, 7-10. Mock B (form) visible phases 2-6.
      const formProgress = smoothstep(0.12, 0.16, progress) - smoothstep(0.60, 0.64, progress);
      mockA.style.opacity = String(1 - formProgress);
      mockB.style.opacity = String(formProgress);
      if (formProgress > 0.5) {
        mockA.style.pointerEvents = 'none';
        mockB.style.pointerEvents = 'auto';
      } else {
        mockA.style.pointerEvents = 'auto';
        mockB.style.pointerEvents = 'none';
      }

      // Scale mocks slightly during scroll for depth
      const scaleA = lerp(1, 0.82, smoothstep(0.04, 0.12, progress));
      const scaleB = lerp(0.82, 0.82, formProgress);
      mockA.style.transform = `translate(-50%, -50%) scale(${scaleA})`;
      mockB.style.transform = `translate(-50%, -50%) scale(${scaleB})`;

      // ===== Section claims opacity =====
      sectionEls.forEach((s) => {
        if (!s.el) return;
        const phaseStart = PHASES[s.start]?.start ?? 0;
        const phaseEnd = PHASES[s.end]?.end ?? 1;
        const opacity = smoothstep(phaseStart, phaseStart + 0.02, progress) *
                        (1 - smoothstep(phaseEnd - 0.02, phaseEnd, progress));
        s.el.style.opacity = String(opacity);
      });

      // Final claim
      if (finalClaim) {
        const finalOpacity = smoothstep(0.88, 0.92, progress);
        finalClaim.style.opacity = String(finalOpacity);
      }

      // ===== Sub-extractions =====
      subEls.forEach((s) => {
        if (!s.ex) return;
        const phase = PHASES[s.phaseIdx];
        if (!phase) return;

        // Extract progress: 0 at phase start, 1 at phase mid, back to 0 at phase end
        const phaseProgress = clamp01((progress - phase.start) / (phase.end - phase.start));
        const extractIn = smoothstep(0.0, 0.15, phaseProgress);
        const extractOut = smoothstep(0.85, 1.0, phaseProgress);
        const visible = extractIn * (1 - extractOut);

        s.ex.style.opacity = String(visible);
        s.ex.style.transform = `translateY(${lerp(20, 0, extractIn)}px) scale(${lerp(0.9, 1, extractIn)})`;
        s.ex.style.pointerEvents = visible > 0.5 ? 'auto' : 'none';

        // Annotation
        if (s.ann) {
          s.ann.style.opacity = String(visible);
          if (visible > 0.1 && canvas) {
            _positionAnnotation(canvas as HTMLElement, s.ex, s.ann, s.side);
          }
        }

        // Connector line
        if (visible > 0.1 && s.line && s.dot && canvas) {
          _updateConnector(canvas as HTMLElement, s.ex, s.line, s.dot, s.side);
        } else if (s.line) {
          s.line.style.opacity = '0';
          if (s.dot) s.dot.style.opacity = '0';
        }
      });

      ticking = false;
    }

    function onScroll(): void {
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
