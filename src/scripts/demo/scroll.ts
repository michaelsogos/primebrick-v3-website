/* ============================================================
   Primebrick Demo Prototype — Shared Scroll-Jacking JS
   Mirrors SchemaToProduction.svelte pattern (passive scroll)
   ============================================================ */

/**
 * smoothstep — ease-in-out curve for sub-scene interpolation
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

interface ScrollDemoOptions {
  trackSelector: string;
  stageSelector: string;
  sceneIds: string[];
  railFillId: string;
  dotsContainerId: string;
  onSceneChange?: (currentIndex: number, progress: number) => void;
  onProgress?: (sceneIdx: number, sceneProgress: number, progress: number) => void;
}

/**
 * Init scroll-jacking for a page.
 */
export function initScrollDemo(opts: ScrollDemoOptions): void {
  const { trackSelector, stageSelector, sceneIds, railFillId, dotsContainerId } = opts;
  const track = document.querySelector(trackSelector);
  const stage = document.querySelector(stageSelector);
  const railFill = document.getElementById(railFillId);
  const dotsContainer = document.getElementById(dotsContainerId);
  if (!track || !stage) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Build scene dots
  if (dotsContainer && sceneIds.length > 1) {
    dotsContainer.innerHTML = '';
    sceneIds.forEach((id, i) => {
      const dot = document.createElement('button');
      dot.className = 'scene-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to scene ${i + 1}`);
      dot.addEventListener('click', () => {
        const sceneTop = (track as HTMLElement).offsetTop + (i / sceneIds.length) * (track as HTMLElement).offsetHeight;
        window.scrollTo({ top: sceneTop + 10, behavior: reducedMotion ? 'auto' : 'smooth' });
      });
      dotsContainer.appendChild(dot);
    });
  }

  if (reducedMotion) {
    // Static stack mode: don't attach scroll listeners, show all scenes in a vertical stack
    document.body.classList.add('static-mode');
    track.classList.add('hidden');
    // Show the static stack (if present)
    const staticStack = document.querySelector('.static-stack');
    if (staticStack) staticStack.classList.remove('hidden');
    return;
  }

  const scenes = sceneIds.map((id) => document.getElementById(id));
  let currentScene = -1;
  let ticking = false;

  function update() {
    const rect = (track as HTMLElement).getBoundingClientRect();
    const vh = window.innerHeight;
    // Progress: 0 when track top hits viewport top, 1 when track bottom hits viewport bottom
    const totalScroll = (track as HTMLElement).offsetHeight - vh;
    const scrolled = Math.max(0, -rect.top);
    const progress = Math.max(0, Math.min(1, scrolled / totalScroll));

    // Rail fill
    if (railFill) railFill.style.height = progress * 100 + '%';

    // Current scene index
    const sceneIdx = Math.min(Math.floor(progress * sceneIds.length), sceneIds.length - 1);

    if (sceneIdx !== currentScene) {
      currentScene = sceneIdx;
      scenes.forEach((s, i) => {
        if (s) s.classList.toggle('active', i === sceneIdx);
      });
      // Update dots
      if (dotsContainer) {
        dotsContainer.querySelectorAll('.scene-dot').forEach((d, i) => {
          d.classList.toggle('active', i === sceneIdx);
        });
      }
      if (opts.onSceneChange) opts.onSceneChange(sceneIdx, progress);
    }

    // Sub-scene progress for fine animation
    if (opts.onProgress) {
      const sceneProgress = progress * sceneIds.length - sceneIdx;
      opts.onProgress(sceneIdx, sceneProgress, progress);
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
  update(); // initial
}

/**
 * Typewriter effect for streaming text (AI chat demo).
 */
export function typewriter(el: HTMLElement, text: string, speed = 20, onDone?: () => void): void {
  let i = 0;
  el.innerHTML = '<span class="stream-cursor"></span>';
  const cursor = el.querySelector('.stream-cursor');
  function tick() {
    if (i < text.length) {
      const node = document.createTextNode(text[i]);
      el.insertBefore(node, cursor);
      i++;
      setTimeout(tick, speed);
    } else {
      if (cursor) cursor.remove();
      if (onDone) onDone();
    }
  }
  tick();
}
