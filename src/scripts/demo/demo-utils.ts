/* ============================================================
   Primebrick Demo — Shared Utilities
   Extracted from common helpers used by both shell-scroll.ts
   and entity-list-table-scroll.ts (and future demo scroll engines).
   ============================================================ */

// ===== Math helpers =====

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

// ===== SVG connector drawing =====

export function drawConnector(
  lineEl: SVGLineElement | null,
  dotEl: SVGCircleElement | null,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): void {
  if (!lineEl || !dotEl) return;
  lineEl.setAttribute('x1', String(fromX));
  lineEl.setAttribute('y1', String(fromY));
  lineEl.setAttribute('x2', String(toX));
  lineEl.setAttribute('y2', String(toY));
  dotEl.setAttribute('cx', String(fromX));
  dotEl.setAttribute('cy', String(fromY));
}

// ===== Annotation side type =====

export type AnnotationSide =
  | 'center'
  | 'bottom'
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'left'
  | 'right';

// ===== Annotation positioning (generic, side-based) =====
// Positions the annotation card relative to the extracted overlay, clamped to canvas.

export function positionAnnotation(
  canvas: HTMLElement,
  exEl: HTMLElement,
  annEl: HTMLElement,
  side: AnnotationSide,
  opts?: { annWidth?: number; gap?: number },
): void {
  const canvasRect = canvas.getBoundingClientRect();
  const exRect = exEl.getBoundingClientRect();
  if (exRect.width === 0) return;
  const annWidth = opts?.annWidth ?? 210;
  const annH = annEl.offsetHeight || 90;
  const gap = opts?.gap ?? 24;
  let leftPx: number, topPx: number;

  switch (side) {
    case 'center':
      // annotation to the RIGHT of centered overlay
      leftPx = exRect.right - canvasRect.left + gap;
      topPx = exRect.top + exRect.height / 2 - canvasRect.top - annH / 2;
      break;
    case 'bottom':
      leftPx = exRect.left + exRect.width / 2 - canvasRect.left - annWidth / 2;
      topPx = exRect.bottom - canvasRect.top + gap;
      break;
    case 'top':
      leftPx = exRect.left + exRect.width / 2 - canvasRect.left - annWidth / 2;
      topPx = exRect.top - canvasRect.top - annH - gap;
      break;
    case 'top-left':
      leftPx = exRect.left - canvasRect.left - annWidth - gap;
      topPx = exRect.top - canvasRect.top - annH - gap;
      break;
    case 'top-right':
      leftPx = exRect.right - canvasRect.left + gap;
      topPx = exRect.top - canvasRect.top - annH - gap;
      break;
    case 'left':
      leftPx = exRect.left - canvasRect.left - annWidth - gap;
      topPx = exRect.top + exRect.height / 2 - canvasRect.top - annH / 2;
      break;
    case 'right':
      leftPx = exRect.right - canvasRect.left + gap;
      topPx = exRect.top + exRect.height / 2 - canvasRect.top - annH / 2;
      break;
    default:
      leftPx = exRect.right - canvasRect.left + gap;
      topPx = exRect.top - canvasRect.top - annH - gap;
  }

  leftPx = Math.max(10, Math.min(canvasRect.width - annWidth - 10, leftPx));
  if (topPx < 10) topPx = 10;
  if (topPx > canvasRect.height - annH - 10) topPx = canvasRect.height - annH - 10;

  annEl.style.left = leftPx + 'px';
  annEl.style.top = topPx + 'px';
  annEl.style.width = annWidth + 'px';
  const card = annEl.querySelector('.ann-card');
  if (card) (card as HTMLElement).style.width = annWidth + 'px';
}

// ===== Connector drawing per sub (generic, side-based) =====

export function updateConnector(
  canvas: HTMLElement,
  exEl: HTMLElement,
  annEl: HTMLElement,
  lineEl: SVGLineElement | null,
  dotEl: SVGCircleElement | null,
  side: AnnotationSide,
): void {
  const canvasRect = canvas.getBoundingClientRect();
  const exRect = exEl.getBoundingClientRect();
  const annRect = annEl.getBoundingClientRect();
  if (exRect.width === 0 || annRect.width === 0) return;

  let dotX: number, dotY: number, targetX: number, targetY: number;
  switch (side) {
    case 'left':
    case 'top-left':
      dotX = annRect.right - canvasRect.left;
      dotY = annRect.top + annRect.height / 2 - canvasRect.top;
      targetX = exRect.left - canvasRect.left;
      targetY = exRect.top + exRect.height / 2 - canvasRect.top;
      break;
    case 'right':
    case 'top-right':
      dotX = annRect.left - canvasRect.left;
      dotY = annRect.top + annRect.height / 2 - canvasRect.top;
      targetX = exRect.right - canvasRect.left;
      targetY = exRect.top + exRect.height / 2 - canvasRect.top;
      break;
    case 'top':
      dotX = annRect.left + annRect.width / 2 - canvasRect.left;
      dotY = annRect.bottom - canvasRect.top;
      targetX = exRect.left + exRect.width / 2 - canvasRect.left;
      targetY = exRect.top - canvasRect.top;
      break;
    case 'bottom':
      dotX = annRect.left + annRect.width / 2 - canvasRect.left;
      dotY = annRect.top - canvasRect.top;
      targetX = exRect.left + exRect.width / 2 - canvasRect.left;
      targetY = exRect.bottom - canvasRect.top;
      break;
    default: // center
      dotX = annRect.left - canvasRect.left;
      dotY = annRect.top + annRect.height / 2 - canvasRect.top;
      targetX = exRect.right - canvasRect.left;
      targetY = exRect.top + exRect.height / 2 - canvasRect.top;
  }
  drawConnector(lineEl, dotEl, dotX, dotY, targetX, targetY);
}

// ===== Scene dots builder =====

export interface DotPhase {
  label: string;
  target: number;
}

export function buildSceneDots(
  dotsContainer: HTMLElement,
  track: HTMLElement,
  dotPhases: DotPhase[],
  reducedMotion: boolean,
): void {
  dotsContainer.innerHTML = '';
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

// ===== Scroll hint fade =====

export function fadeScrollHint(progress: number, threshold = 0.05): void {
  const scrollHintEl = document.getElementById('scroll-hint');
  if (scrollHintEl) scrollHintEl.style.opacity = String(clamp01(1 - progress / threshold));
}
