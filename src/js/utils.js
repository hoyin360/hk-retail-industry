export function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

export function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

export function isMobileViewport() {
  return window.matchMedia?.('(max-width: 768px)')?.matches ?? false;
}

export function reduceMotionForPerf() {
  return prefersReducedMotion() || isMobileViewport();
}

export function parseYearMonth(s) {
  // "YYYY-MM"
  const [y, m] = s.split('-').map((d) => Number(d));
  return new Date(y, (m || 1) - 1, 1);
}

