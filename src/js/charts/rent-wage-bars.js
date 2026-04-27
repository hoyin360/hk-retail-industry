import { pointer, select } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { axisTop } from 'd3-axis';
import { max } from 'd3-array';
import 'd3-transition';

import { reduceMotionForPerf } from '../utils.js';

function fmtPct(value) {
  return `${Number(value).toFixed(1)}%`;
}

function fmtMoney(value) {
  return `${Math.round(Number(value)).toLocaleString('zh-HK')}`;
}

function drawHorizontalBars(svg, config) {
  const {
    x,
    y,
    data,
    group,
    chartW,
    chartH,
    title,
    subtitle,
    tickValues,
    tickFormat,
    valueFormat,
    labelKey,
    valueKey,
    highlightKey,
    tooltip
  } = config;

  const blue = '#3F7EF2';
  const darkBlue = '#50618D';
  const bar = '#C7CAD4';
  const grid = '#E6E8EF';
  const axis = '#6C7DA8';

  group
    .append('text')
    .attr('x', 0)
    .attr('y', 0)
    .attr('fill', blue)
    .attr('font-size', 21)
    .attr('font-weight', 500)
    .text(title);

  if (subtitle) {
    group
      .append('text')
      .attr('x', 0)
      .attr('y', 24)
      .attr('fill', '#9CA7C6')
      .attr('font-size', 13)
      .text(subtitle);
  }

  const plot = group.append('g').attr('transform', `translate(${x},${y})`);
  const plotW = chartW;
  const plotH = chartH;
  const labelX = plotW + 28;

  const xScale = scaleLinear().domain(config.domain).range([0, plotW]);
  const yScale = scaleBand()
    .domain(data.map((d) => d[labelKey]))
    .range([0, plotH])
    .paddingInner(0.26)
    .paddingOuter(0.08);

  plot
    .append('g')
    .selectAll('line')
    .data(tickValues)
    .join('line')
    .attr('x1', (d) => xScale(d))
    .attr('x2', (d) => xScale(d))
    .attr('y1', 0)
    .attr('y2', plotH)
    .attr('stroke', grid)
    .attr('stroke-width', 1.5);

  plot
    .append('g')
    .attr('transform', 'translate(0,0)')
    .call(axisTop(xScale).tickValues(tickValues).tickFormat(tickFormat).tickSize(0).tickPadding(14))
    .call((g) => g.select('.domain').remove())
    .call((g) => g.selectAll('text').attr('fill', axis).attr('font-size', 13).attr('font-weight', 700));

  const reduceMotion = reduceMotionForPerf();

  const bars = plot
    .append('g')
    .selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', xScale(config.domain[0]))
    .attr('y', (d) => yScale(d[labelKey]) + yScale.bandwidth() * 0.12)
    .attr('height', yScale.bandwidth() * 0.76)
    .attr('rx', 0)
    .attr('fill', (d) => (d[highlightKey] ? blue : bar))
    .attr('width', reduceMotion ? (d) => xScale(d[valueKey]) - xScale(config.domain[0]) : 0);

  if (!reduceMotion) {
    bars
      .transition()
      .delay((_, i) => i * 135)
      .duration(1170)
      .attr('width', (d) => xScale(d[valueKey]) - xScale(config.domain[0]));
  }

  const showTooltip = (event, d) => {
    if (!tooltip) return;
    const [mx, my] = pointer(event, config.root);
    tooltip
      .style('left', `${mx}px`)
      .style('top', `${my}px`)
      .style('opacity', '1')
      .html(
        `<div style="font-weight:700;margin-bottom:4px">${d[labelKey]}</div>` +
          `<div>${title}: ${valueFormat(d[valueKey])}</div>`
      );
  };

  const hideTooltip = () => tooltip?.style('opacity', '0');

  bars.on('pointerenter pointermove', showTooltip).on('pointerleave', hideTooltip);

  plot
    .append('g')
    .attr('class', 'ds-rw-hit-targets')
    .selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', (d) => Math.min(xScale(config.domain[0]), xScale(d[valueKey])))
    .attr('y', (d) => yScale(d[labelKey]) + yScale.bandwidth() * 0.04)
    .attr('width', (d) => Math.max(Math.abs(xScale(d[valueKey]) - xScale(config.domain[0])), 24))
    .attr('height', yScale.bandwidth() * 0.92)
    .attr('fill', 'transparent')
    .style('cursor', 'pointer')
    .on('pointerenter pointermove', showTooltip)
    .on('pointerleave', hideTooltip);

  plot
    .append('g')
    .selectAll('text.ds-rw-value')
    .data(data)
    .join('text')
    .attr('class', 'ds-rw-value')
    .attr('x', (d) => Math.max(xScale(d[valueKey]) - 9, xScale(config.domain[0]) + 30))
    .attr('y', (d) => yScale(d[labelKey]) + yScale.bandwidth() / 2 + 5)
    .attr('text-anchor', 'end')
    .attr('fill', darkBlue)
    .attr('font-size', 14)
    .attr('font-weight', 800)
    .text((d) => valueFormat(d[valueKey]));

  plot
    .append('g')
    .selectAll('text.ds-rw-label')
    .data(data)
    .join('text')
    .attr('class', 'ds-rw-label')
    .attr('x', labelX)
    .attr('y', (d) => yScale(d[labelKey]) + yScale.bandwidth() / 2 + 5)
    .attr('fill', darkBlue)
    .attr('font-size', 14)
    .text((d) => d[labelKey]);

  plot
    .append('line')
    .attr('x1', xScale(config.domain[0]))
    .attr('x2', xScale(config.domain[0]))
    .attr('y1', 0)
    .attr('y2', plotH)
    .attr('stroke', axis)
    .attr('stroke-width', 1.2);
}

export function init(container, data) {
  const root = typeof container === 'string' ? document.querySelector(container) : container;
  if (!root) return;
  root.innerHTML = '';

  const rent = data?.rent?.series ?? [];
  const wage = data?.wage?.series ?? [];
  if (rent.length === 0 || wage.length === 0) return;

  const width = 900;
  const height = 360;
  const reduceMotion = reduceMotionForPerf();

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
    .style('border', '1px solid #DADCE4')
    .style('background', '#fff')
    .style('color', '#1A1714')
    .style('box-shadow', reduceMotion ? 'none' : '0 12px 28px rgba(0,0,0,0.12)')
    .style('font', '12px/1.45 var(--font-sans)');

  const svg = select(root)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', '圖表3四大核心區租金同比變化和圖表4零售行業工資中位數');

  const left = svg.append('g').attr('transform', 'translate(18,30)');
  const right = svg.append('g').attr('transform', 'translate(475,30)');

  drawHorizontalBars(svg, {
    group: left,
    x: 4,
    y: 70,
    root,
    tooltip,
    chartW: 260,
    chartH: 190,
    title: data.rent.title,
    subtitle: '同比變動百分比',
    data: rent,
    domain: [0, Math.ceil((max(rent, (d) => d.value) ?? 5) + 0.8)],
    tickValues: [0, 2, 4, 6],
    tickFormat: (d) => `${d}%`,
    valueFormat: fmtPct,
    labelKey: 'district',
    valueKey: 'value',
    highlightKey: 'highlight',
    source: data.rent.source.label,
    sourceY: 306
  });

  drawHorizontalBars(svg, {
    group: right,
    x: 4,
    y: 70,
    root,
    tooltip,
    chartW: 250,
    chartH: 190,
    title: data.wage.title,
    subtitle: '註：所有僱員（包括全職僱員及兼職僱員）',
    data: wage,
    domain: [13000, 15500],
    tickValues: [13000, 14000, 15000],
    tickFormat: (d) => `${Math.round(d / 1000)}k`,
    valueFormat: fmtMoney,
    labelKey: 'year',
    valueKey: 'value',
    highlightKey: 'highlight'
  });
}
