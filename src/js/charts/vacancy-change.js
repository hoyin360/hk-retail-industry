import { pointer, select } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { axisTop } from 'd3-axis';
import { max, min } from 'd3-array';
import 'd3-transition';

import { reduceMotionForPerf } from '../utils.js';

function pct(value) {
  return `${Number(value).toFixed(2).replace(/\.?0+$/, '')}%`;
}

function diamondPath(size = 7) {
  return `M0,${-size}L${size},0L0,${size}L${-size},0Z`;
}

export function init(container, data) {
  const reduceMotion = reduceMotionForPerf();
  const root = typeof container === 'string' ? document.querySelector(container) : container;
  if (!root) return;
  root.innerHTML = '';

  const rows = (data?.series ?? []).map((d) => ({
    district: d.district,
    value2024: Number(d.value_2024),
    value2025: Number(d.value_2025)
  }));

  if (rows.length === 0) return;

  const width = 820;
  const height = 440;
  const margin = { top: 94, right: 180, bottom: 52, left: 42 };
  const plotLeft = margin.left;
  const plotRight = width - margin.right;
  const plotTop = margin.top;
  const plotBottom = height - margin.bottom;
  const blue = '#2F66D8';
  const axisBlue = '#7B8DB8';
  const grid = '#E2E4EC';
  const line = '#DADCE4';
  const muted = '#8793B5';

  const minValue = Math.floor((min(rows, (d) => Math.min(d.value2024, d.value2025)) ?? 6) / 2) * 2;
  const maxValue = Math.ceil((max(rows, (d) => Math.max(d.value2024, d.value2025)) ?? 16) / 2) * 2;

  const x = scaleLinear().domain([Math.min(6, minValue), Math.max(16, maxValue)]).range([plotLeft, plotRight]);
  const y = scaleBand()
    .domain(rows.map((d) => d.district))
    .range([plotTop, plotBottom])
    .paddingInner(0.42)
    .paddingOuter(0.18);

  const svg = select(root)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', '2024年-2025年四核心區空置率平均變化');

  svg
    .append('text')
    .attr('x', plotLeft - 14)
    .attr('y', 28)
    .attr('display', 'none')
    .attr('fill', '#6F93F0')
    .attr('font-size', 28)
    .attr('font-weight', 300)
    .text('商業街空置率');

  const ticks = [6, 8, 10, 12, 14, 16].filter((d) => d >= x.domain()[0] && d <= x.domain()[1]);

  svg
    .append('g')
    .attr('class', 'ds-vc-grid')
    .selectAll('line')
    .data(ticks)
    .join('line')
    .attr('x1', (d) => x(d))
    .attr('x2', (d) => x(d))
    .attr('y1', plotTop)
    .attr('y2', plotBottom)
    .attr('stroke', grid)
    .attr('stroke-width', 2);

  svg
    .append('g')
    .attr('transform', `translate(0,${plotTop})`)
    .call(axisTop(x).tickValues(ticks).tickFormat((d) => `${d}%`).tickSize(0).tickPadding(18))
    .call((g) => g.select('.domain').remove())
    .call((g) => g.selectAll('text').attr('fill', axisBlue).attr('font-size', 21).attr('font-weight', 700));

  const g = svg.append('g').attr('class', 'ds-vc-series');

  const changeLines = g
    .selectAll('line.ds-vc-change-line')
    .data(rows)
    .join('line')
    .attr('class', 'ds-vc-change-line')
    .attr('x1', (d) => x(d.value2024))
    .attr('x2', (d) => (reduceMotion ? x(d.value2025) : x(d.value2024)))
    .attr('y1', (d) => y(d.district) + y.bandwidth() / 2)
    .attr('y2', (d) => y(d.district) + y.bandwidth() / 2)
    .attr('stroke', line)
    .attr('stroke-width', 6)
    .attr('stroke-linecap', 'round');

  const points2024 = g
    .selectAll('path.ds-vc-point-2024')
    .data(rows)
    .join('path')
    .attr('class', 'ds-vc-point-2024')
    .attr('transform', (d) => {
      const base = `translate(${x(d.value2024)},${y(d.district) + y.bandwidth() / 2})`;
      return reduceMotion ? base : `${base} scale(0)`;
    })
    .attr('d', diamondPath(7))
    .attr('fill', '#fff')
    .attr('stroke', blue)
    .attr('stroke-width', 2.2)
    .attr('opacity', reduceMotion ? 1 : 0);

  const points2025 = g
    .selectAll('path.ds-vc-point-2025')
    .data(rows)
    .join('path')
    .attr('class', 'ds-vc-point-2025')
    .attr('transform', (d) => {
      const base = `translate(${x(d.value2025)},${y(d.district) + y.bandwidth() / 2})`;
      return reduceMotion ? base : `${base} scale(0)`;
    })
    .attr('d', diamondPath(10))
    .attr('fill', blue)
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.4)
    .attr('opacity', reduceMotion ? 1 : 0);

  svg
    .append('g')
    .selectAll('text.ds-vc-district')
    .data(rows)
    .join('text')
    .attr('class', 'ds-vc-district')
    .attr('x', plotRight + 34)
    .attr('y', (d) => y(d.district) + y.bandwidth() / 2 + 7)
    .attr('fill', '#A4AFD0')
    .attr('font-size', 20)
    .text((d) => d.district);

  const avg = rows.find((d) => d.district === '四核心區');
  if (avg) {
    const yAvg = y(avg.district) + y.bandwidth() / 2;
    svg
      .append('line')
      .attr('x1', plotLeft)
      .attr('x2', plotRight + 100)
      .attr('y1', yAvg - y.bandwidth() * 0.95)
      .attr('y2', yAvg - y.bandwidth() * 0.95)
      .attr('stroke', '#1E4AA7')
      .attr('stroke-width', 4)
      .attr('stroke-dasharray', '3 4');
  }

  const legend = svg.append('g').attr('transform', `translate(${plotLeft + 28},${margin.top - 58})`);
  const legendItems = [
    { label: '2024年', kind: 'old' },
    { label: '2025年', kind: 'new' }
  ];

  const legendRow = legend
    .selectAll('g')
    .data(legendItems)
    .join('g')
    .attr('transform', (_, i) => `translate(${i * 118},0)`);

  legendRow
    .append('path')
    .attr('d', (d) => diamondPath(d.kind === 'new' ? 7 : 5))
    .attr('fill', (d) => (d.kind === 'new' ? blue : '#fff'))
    .attr('stroke', blue)
    .attr('stroke-width', 1.8);

  legendRow
    .append('text')
    .attr('x', 12)
    .attr('y', 6)
    .attr('fill', axisBlue)
    .attr('font-size', 18)
    .text((d) => d.label);

  svg
    .append('text')
    .attr('x', plotLeft - 16)
    .attr('y', height - 14)
    .attr('display', 'none')
    .attr('fill', '#9AA5C4')
    .attr('font-size', 15)
    .attr('font-style', 'italic')
    .text(`資料來源：${data?.source?.label ?? '美聯工商舖資料研究部'}`);

  const title = svg.append('g').attr('class', 'ds-vc-values');
  title
    .selectAll('title')
    .data(rows)
    .join('title')
    .text((d) => `${d.district}：2024 ${pct(d.value2024)}，2025 ${pct(d.value2025)}`);

  const tooltip = select(root)
    .append('div')
    .attr('class', 'ds-chart-tooltip')
    .style('position', 'absolute')
    .style('pointer-events', 'none')
    .style('z-index', '2')
    .style('opacity', '0')
    .style('transform', 'translate(10px, -50%)')
    .style('padding', '9px 11px')
    .style('border-radius', '6px')
    .style('border', `1px solid ${line}`)
    .style('background', '#fff')
    .style('color', '#1A1714')
    .style('box-shadow', reduceMotion ? 'none' : '0 12px 28px rgba(0,0,0,0.12)')
    .style('font', '12px/1.45 var(--font-sans)');

  const showTooltip = (year) => (event, d) => {
    const [mx, my] = pointer(event, root);
    const value = year === 2024 ? d.value2024 : d.value2025;
    tooltip
      .style('left', `${mx}px`)
      .style('top', `${my}px`)
      .style('opacity', '1')
      .html(`<div style="font-weight:700;margin-bottom:4px">${d.district}</div><div>${year}: ${pct(value)}</div>`);
  };

  const hideTooltip = () => tooltip.style('opacity', '0');

  points2024.on('pointerenter pointermove', showTooltip(2024)).on('pointerleave', hideTooltip);
  points2025.on('pointerenter pointermove', showTooltip(2025)).on('pointerleave', hideTooltip);

  g
    .append('g')
    .attr('class', 'ds-vc-hit-targets')
    .selectAll('circle')
    .data(
      rows.flatMap((d) => [
        { ...d, year: 2024, value: d.value2024 },
        { ...d, year: 2025, value: d.value2025 }
      ])
    )
    .join('circle')
    .attr('cx', (d) => x(d.value))
    .attr('cy', (d) => y(d.district) + y.bandwidth() / 2)
    .attr('r', 14)
    .attr('fill', 'transparent')
    .style('cursor', 'pointer')
    .on('pointerenter pointermove', (event, d) => showTooltip(d.year)(event, d))
    .on('pointerleave', hideTooltip);

  if (!reduceMotion) {
    points2024
      .transition()
      .delay((_, i) => i * 165)
      .duration(540)
      .attr('opacity', 1)
      .attr('transform', (d) => `translate(${x(d.value2024)},${y(d.district) + y.bandwidth() / 2}) scale(1)`);

    changeLines
      .transition()
      .delay((_, i) => i * 165 + 330)
      .duration(1080)
      .attr('x2', (d) => x(d.value2025));

    points2025
      .transition()
      .delay((_, i) => i * 165 + 1140)
      .duration(630)
      .attr('opacity', 1)
      .attr('transform', (d) => `translate(${x(d.value2025)},${y(d.district) + y.bandwidth() / 2}) scale(1)`);
  }
}
