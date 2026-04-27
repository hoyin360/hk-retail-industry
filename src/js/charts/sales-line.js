import { select } from 'd3-selection';
import { scaleTime, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { extent, max } from 'd3-array';
import { line as d3Line, curveMonotoneX } from 'd3-shape';
import { timeFormat } from 'd3-time-format';

import { cssVar, parseYearMonth, reduceMotionForPerf } from '../utils.js';

export function init(container, data) {
  const root = typeof container === 'string' ? document.querySelector(container) : container;
  if (!root) return;
  root.innerHTML = '';

  const series = (data?.series ?? []).map((d) => ({ date: parseYearMonth(d.date), value: Number(d.value) }));
  if (series.length === 0) return;

  const w = 820;
  const h = 360;
  const m = { top: 18, right: 18, bottom: 42, left: 52 };

  const svg = select(root)
    .append('svg')
    .attr('viewBox', `0 0 ${w} ${h}`)
    .attr('role', 'img')
    .attr('aria-hidden', 'true');

  const x = scaleTime().domain(extent(series, (d) => d.date)).range([m.left, w - m.right]);
  const y = scaleLinear()
    .domain([0, max(series, (d) => d.value) * 1.1])
    .nice()
    .range([h - m.bottom, m.top]);

  const gAxis = svg.append('g');
  gAxis
    .append('g')
    .attr('transform', `translate(0,${h - m.bottom})`)
    .call(axisBottom(x).ticks(6).tickFormat(timeFormat('%Y')));

  gAxis.append('g').attr('transform', `translate(${m.left},0)`).call(axisLeft(y).ticks(5));

  gAxis.selectAll('path, line').attr('stroke', cssVar('--c-border-light')).attr('stroke-width', 1);
  gAxis.selectAll('text').attr('fill', cssVar('--c-text-muted')).attr('font-size', 12);

  const path = d3Line()
    .x((d) => x(d.date))
    .y((d) => y(d.value))
    .curve(curveMonotoneX);

  const stroke = cssVar('--c-accent-up');

  const p = svg
    .append('path')
    .datum(series)
    .attr('fill', 'none')
    .attr('stroke', stroke)
    .attr('stroke-width', 2.5)
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round')
    .attr('d', path);

  if (!reduceMotionForPerf()) {
    const len = p.node().getTotalLength();
    p.attr('stroke-dasharray', `${len} ${len}`)
      .attr('stroke-dashoffset', len)
      .transition()
      .duration(2250)
      .ease((t) => t)
      .attr('stroke-dashoffset', 0);
  }
}
