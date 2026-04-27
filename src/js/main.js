import { setupRevealObserver, setupScrollSteps } from './scroll-reveal.js';
import { clamp01, prefersReducedMotion } from './utils.js';

import { init as initSales } from './charts/sales-dual-scatter.js';
import { init as initVacancy } from './charts/vacancy-bars.js';
import { init as initVacancyChange } from './charts/vacancy-change.js';
import { init as initRentWage } from './charts/rent-wage-bars.js';
import { init as initProfit } from './charts/profit-waterfall.js';
import { init as initDivergence } from './charts/divergence.js';

async function fetchJSON(path) {
  // 在路径前面加上你的项目名称
  const correctedPath = '/hk-retail-industry/' + path.replace(/^\//, '');
  const r = await fetch(correctedPath, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`Failed to fetch ${correctedPath}: ${r.status}`);
  return await r.json();
}

function setupTopbarAndProgress() {
  const topbar = document.querySelector('.ds-topbar');
  const bar = document.querySelector('.ds-progress__bar');
  const hint = document.querySelector('.ds-scroll-hint');

  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const dirDown = y > lastY + 2;
    const dirUp = y < lastY - 2;

    if (topbar) {
      if (dirDown && y > 80) topbar.classList.add('ds-topbar--hidden');
      if (dirUp) topbar.classList.remove('ds-topbar--hidden');
    }

    if (bar) {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      const p = total > 0 ? clamp01(y / total) : 0;
      bar.style.width = `${(p * 100).toFixed(2)}%`;
    }

    if (hint) {
      hint.style.opacity = y > 80 ? '0' : '1';
    }

    lastY = y;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  });
  onScroll();
}

function setupChartAutoInit(charts) {
  const nodes = Array.from(document.querySelectorAll('.ds-chart[data-chart]'));
  const registry = new Map(nodes.map((n) => [n.getAttribute('data-chart'), n]));

  const initFns = {
    sales: initSales,
    vacancy: initVacancy,
    'vacancy-change': initVacancyChange,
    'rent-wage': initRentWage,
    profit: initProfit,
    divergence: initDivergence
  };

  for (const [key, container] of registry.entries()) {
    const fn = initFns[key];
    const data = charts[key];
    if (fn && container && data) fn(container, data);
  }
}

function setupChartTriggerOnce(charts) {
  const cards = Array.from(document.querySelectorAll('.ds-chart-card'));
  if (cards.length === 0) return;

  const obs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const card = e.target;
        const chartEl = card.querySelector('.ds-chart[data-chart]');
        const key = chartEl?.getAttribute('data-chart');
        if (!key) continue;
        chartEl?.classList.remove('ds-chart--pending');
        obs.unobserve(card);
      }
    },
    { threshold: 0.3 }
  );

  cards.forEach((c) => obs.observe(c));

  // Animations in chart modules fire on init; we re-init on first entry to ensure "once only".
  const reinit = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const card = e.target;
        const el = card.querySelector('.ds-chart[data-chart]');
        const key = el?.getAttribute('data-chart');
        if (!key) continue;
        if (card.dataset.dsChartInited === '1') continue;
        card.dataset.dsChartInited = '1';
        const initFns = {
          sales: initSales,
          vacancy: initVacancy,
          'vacancy-change': initVacancyChange,
          'rent-wage': initRentWage,
          profit: initProfit,
          divergence: initDivergence
        };
        initFns[key]?.(el, charts[key]);
        if (key === 'divergence') {
          const table = card.querySelector('.ds-closure-table');
          window.setTimeout(() => table?.classList.add('ds-is-visible'), 300);
        }
        reinit.unobserve(card);
      }
    },
    { threshold: 0.3 }
  );

  cards.forEach((c) => reinit.observe(c));
}

document.addEventListener('DOMContentLoaded', async () => {
  setupTopbarAndProgress();
  setupRevealObserver();

  const [sales, vacancy, vacancyChange, rentWage, costs, divergence] = await Promise.all([
    fetchJSON('/data/sales.json'),
    fetchJSON('/data/vacancy.json'),
    fetchJSON('/data/vacancy-change.json'),
    fetchJSON('/data/rent-wage.json'),
    fetchJSON('/data/costs.json'),
    fetchJSON('/data/divergence.json')
  ]);

  const charts = { sales, vacancy, 'vacancy-change': vacancyChange, 'rent-wage': rentWage, profit: costs, divergence };

  if (prefersReducedMotion()) {
    setupChartAutoInit(charts);
  } else {
    setupChartTriggerOnce(charts);
  }

  setupScrollSteps({
    onStepEnter: (resp) => {
      // future: wire step -> highlight/annotation hooks; keep minimal for now.
      void resp;
    }
  });
});
