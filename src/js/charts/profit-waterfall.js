import { select } from 'd3-selection';
import { cssVar, reduceMotionForPerf } from '../utils.js';

export function init(container, data) {
  const root = typeof container === 'string' ? document.querySelector(container) : container;
  if (!root) return;
  root.innerHTML = '';

  const items = data?.waterfall ?? [];
  if (items.length === 0) return;

  const w = 820;
  const h = 360;
  const m = { top: 10, right: 18, bottom: 58, left: 18 };

  const svg = select(root).append('svg').attr('viewBox', `0 0 ${w} ${h}`).attr('aria-hidden', 'true');

  const maxH = 240; // design spec: Sales bar is 240px
  const baseY = h - m.bottom;
  const barW = window.matchMedia?.('(max-width: 768px)')?.matches ? 40 : 56;
  const gap = 22;
  const totalW = items.length * barW + (items.length - 1) * gap;
  const startX = (w - totalW) / 2;

  const cIncome = cssVar('--c-accent-up');
  const cCost = cssVar('--c-accent-warn');
  const cProfit = cssVar('--c-green');

  const heights = items.map((d) => {
    if (d.type === 'profit') return 8; // explicit: net profit only 8px tall
    if (d.type === 'income') return maxH;
    // costs: scale relative to absolute value, mapped into (maxH * 0.8) range
    const v = Math.abs(Number(d.value));
    const maxCost = Math.max(...items.filter((x) => x.type === 'cost').map((x) => Math.abs(Number(x.value))));
    const t = maxCost ? v / maxCost : 0.5;
    return Math.max(36, Math.round(t * maxH * 0.8));
  });

  const g = svg.append('g');

  const bars = g
    .selectAll('rect')
    .data(items)
    .join('rect')
    .attr('x', (_, i) => startX + i * (barW + gap))
    .attr('y', baseY)
    .attr('width', barW)
    .attr('height', 0)
    .attr('rx', 8)
    .attr('fill', (d, i) => {
      if (d.type === 'income') return cIncome;
      if (d.type === 'profit') return cProfit;
      const opacity = 0.8 - i * 0.08;
      return `rgba(212, 137, 10, ${Math.max(0.5, opacity)})`;
    });

  const labels = g
    .selectAll('text')
    .data(items)
    .join('text')
    .attr('x', (_, i) => startX + i * (barW + gap) + barW / 2)
    .attr('y', baseY + 28)
    .attr('text-anchor', 'middle')
    .attr('fill', cssVar('--c-text-muted'))
    .attr('font-size', 12)
    .text((d) => d.label);

  if (reduceMotionForPerf()) {
    bars.attr('y', (_, i) => baseY - heights[i]).attr('height', (_, i) => heights[i]);
    return;
  }

  bars
    .transition()
    .delay((_, i) => i * 180)
    .duration(1500)
    .attr('y', (_, i) => baseY - heights[i])
    .attr('height', (_, i) => heights[i]);
}
