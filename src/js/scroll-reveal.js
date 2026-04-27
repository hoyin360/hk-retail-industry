import scrollama from 'scrollama';

export function setupScrollSteps({ scrollySelector = '.ds-scrolly', stepSelector = '.ds-step', onStepEnter }) {
  const scroller = scrollama();
  scroller
    .setup({
      step: `${scrollySelector} ${stepSelector}`,
      offset: 0.7,
      progress: false
    })
    .onStepEnter((response) => {
      const el = response.element;
      document.querySelectorAll(stepSelector).forEach((n) => n.classList.remove('is-active'));
      el.classList.add('is-active');
      onStepEnter?.(response);
    });

  let resizeTicking = false;
  window.addEventListener(
    'resize',
    () => {
      if (resizeTicking) return;
      resizeTicking = true;
      requestAnimationFrame(() => {
        scroller.resize();
        resizeTicking = false;
      });
    },
    { passive: true }
  );
  return scroller;
}

export function setupRevealObserver({ selector = '.ds-reveal', threshold = 0.15, rootMargin = '0px 0px -40px 0px' } = {}) {
  const els = Array.from(document.querySelectorAll(selector));
  if (els.length === 0) return;

  const obs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('ds-is-visible');
          obs.unobserve(e.target);
        }
      }
    },
    { threshold, rootMargin }
  );

  els.forEach((el) => obs.observe(el));
}

