import { select, pointer } from 'd3-selection';
import { scaleLinear, scaleTime } from 'd3-scale';
import { axisBottom, axisLeft, axisRight } from 'd3-axis';
import { extent, max } from 'd3-array';
import { timeFormat } from 'd3-time-format';
import 'd3-transition';

import { cssVar, parseYearMonth, reduceMotionForPerf } from '../utils.js';

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function cleanPct(value) {
  return `${Number(value).toFixed(2).replace(/\.?0+$/, '')}%`;
}

export function init(container, data) {
  const root = typeof container === 'string' ? document.querySelector(container) : container;
  if (!root) return;

  root.innerHTML = '';
  root.style.position = 'relative';

  const series = (data?.series ?? [])
    .map((d) => ({
      date: parseYearMonth(String(d.date)),
      retail: toNumber(d.retail_yoy_pct),
      visitors: toNumber(d.visitors_yoy_pct)
    }))
    .filter((d) => d.retail !== null && d.visitors !== null)
    .sort((a, b) => a.date - b.date);

  if (series.length === 0) return;

  const width = 900;
  const height = 410;
  const margin = { top: 54, right: 94, bottom: 64, left: 78 };
  const plotTop = margin.top;
  const plotBottom = height - margin.bottom;
  const plotLeft = margin.left;
  const plotRight = width - margin.right;

  const red = cssVar('--c-accent-up');
  const blue = cssVar('--c-accent-down');
  const text = cssVar('--c-text');
  const muted = cssVar('--c-text-muted');
  const border = cssVar('--c-border-light');
  const borderStrong = cssVar('--c-border');
  const bg = cssVar('--c-bg');

  const svg = select(root)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr(
      'aria-label',
      '零售業銷貨價值指數按年變動百分率與香港每月入境旅客人次按年變動百分率的雙軸散點圖'
    );

  const xInset = 18;
  const x = scaleTime()
    .domain(extent(series, (d) => d.date))
    .range([plotLeft + xInset, plotRight - xInset]);
  const yRetail = scaleLinear()
    .domain([0, (max(series, (d) => d.retail) ?? 0) * 1.28])
    .nice()
    .range([plotBottom, plotTop]);
  const yVisitors = scaleLinear()
    .domain([0, (max(series, (d) => d.visitors) ?? 0) * 1.18])
    .nice()
    .range([plotBottom, plotTop]);

  const month = timeFormat('%Y-%m');
  const xTicks = series.map((d) => d.date);

  svg
    .append('g')
    .attr('class', 'ds-chart-grid')
    .attr('transform', `translate(${plotLeft},0)`)
    .call(
      axisLeft(yRetail)
        .ticks(5)
        .tickSize(-(plotRight - plotLeft))
        .tickFormat('')
    )
    .call((g) => g.select('.domain').remove())
    .call((g) =>
      g
        .selectAll('line')
        .attr('stroke', border)
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', '4 4')
    );

  const axisLayer = svg.append('g').attr('class', 'ds-chart-axes');

  axisLayer
    .append('line')
    .attr('x1', plotLeft)
    .attr('x2', plotRight)
    .attr('y1', plotBottom)
    .attr('y2', plotBottom)
    .attr('stroke', borderStrong)
    .attr('stroke-width', 1);

  axisLayer
    .append('g')
    .attr('transform', `translate(0,${plotBottom})`)
    .call(axisBottom(x).tickValues(xTicks).tickFormat(month).tickSizeOuter(0))
    .call((g) => g.select('.domain').remove())
    .call((g) => g.selectAll('text').attr('dy', '1.2em'));

  axisLayer
    .append('g')
    .attr('transform', `translate(${plotLeft},0)`)
    .call(axisLeft(yRetail).ticks(5).tickFormat((d) => `${d}%`).tickSizeOuter(0));

  axisLayer
    .append('g')
    .attr('transform', `translate(${plotRight},0)`)
    .call(axisRight(yVisitors).ticks(5).tickFormat((d) => `${d}%`).tickSizeOuter(0));

  axisLayer.selectAll('path, line').attr('stroke', borderStrong).attr('stroke-width', 1);
  axisLayer.selectAll('text').attr('fill', muted).attr('font-size', 12);

  const labelLayer = svg.append('g').attr('class', 'ds-chart-axis-labels');
  labelLayer
    .append('text')
    .attr('x', plotLeft + 12)
    .attr('y', 24)
    .attr('text-anchor', 'middle')
    .attr('fill', red)
    .attr('font-size', 13)
    .attr('font-weight', 700)
    .text('零售業銷貨價值按年變動百分率');

  labelLayer
    .append('text')
    .attr('x', plotRight)
    .attr('y', 24)
    .attr('text-anchor', 'middle')
    .attr('fill', blue)
    .attr('font-size', 13)
    .attr('font-weight', 700)
    .text('訪港旅客人數按年變動百分率');

  const chartCenter = (plotLeft + plotRight) / 2;
  labelLayer.selectAll('text').each(function () {
    const bbox = this.getBBox();
    const rect = select(this.parentNode)
      .insert('rect', () => this)
      .attr('x', bbox.x - 7)
      .attr('y', bbox.y - 4)
      .attr('width', bbox.width + 14)
      .attr('height', bbox.height + 8)
      .attr('rx', 4)
      .attr('fill', '#fff');

    if (!reduceMotionForPerf()) {
      const fromX = chartCenter - Number(this.getAttribute('x'));
      const textLabel = select(this).attr('transform', `translate(${fromX},0)`);
      rect.attr('transform', `translate(${fromX},0)`);

      textLabel.transition().duration(1350).ease((t) => 1 - Math.pow(1 - t, 3)).attr('transform', 'translate(0,0)');
      rect.transition().duration(1350).ease((t) => 1 - Math.pow(1 - t, 3)).attr('transform', 'translate(0,0)');
    }
  });

  const legend = svg.append('g').attr('transform', `translate(${plotLeft},38)`);
  const legendItems = [
    { label: '零售銷貨價值', color: red, filled: true },
    { label: '訪港旅客人數', color: blue, filled: false }
  ];

  const legendRow = legend
    .selectAll('g')
    .data(legendItems)
    .join('g')
    .attr('transform', (_, i) => `translate(${i * 128},0)`);

  legendRow
    .append('circle')
    .attr('cx', 6)
    .attr('cy', 6)
    .attr('r', 5)
    .attr('fill', (d) => (d.filled ? d.color : bg))
    .attr('stroke', (d) => d.color)
    .attr('stroke-width', 2);

  legendRow
    .append('text')
    .attr('x', 18)
    .attr('y', 10)
    .attr('fill', muted)
    .attr('font-size', 12)
    .text((d) => d.label);

  const linkLayer = svg.append('g').attr('class', 'ds-chart-links');
  linkLayer
    .selectAll('line')
    .data(series)
    .join('line')
    .attr('x1', (d) => x(d.date) - 7)
    .attr('x2', (d) => x(d.date) + 7)
    .attr('y1', (d) => yRetail(d.retail))
    .attr('y2', (d) => yVisitors(d.visitors))
    .attr('stroke', borderStrong)
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '3 3')
    .attr('opacity', 0.75);

  const dotsLayer = svg.append('g').attr('class', 'ds-chart-dots');

  const visitorDots = dotsLayer
    .append('g')
    .selectAll('circle')
    .data(series)
    .join('circle')
    .attr('class', 'ds-chart-dot ds-chart-dot--visitor')
    .attr('cx', (d) => x(d.date) + 7)
    .attr('cy', (d) => yVisitors(d.visitors))
    .attr('r', 5.5)
    .attr('fill', bg)
    .attr('stroke', blue)
    .attr('stroke-width', 2.3);

  const retailDots = dotsLayer
    .append('g')
    .selectAll('circle')
    .data(series)
    .join('circle')
    .attr('class', 'ds-chart-dot ds-chart-dot--retail')
    .attr('cx', (d) => x(d.date) - 7)
    .attr('cy', (d) => yRetail(d.retail))
    .attr('r', 6.3)
    .attr('fill', red)
    .attr('stroke', bg)
    .attr('stroke-width', 1.5);

  const latest = series[series.length - 1];
  const latestX = x(latest.date);
  const latestRetailY = yRetail(latest.retail);
  const latestVisitorY = yVisitors(latest.visitors);

  const highlight = svg.append('g').attr('class', 'ds-chart-highlight');
  const highlightRect = highlight
    .append('rect')
    .attr('rx', 4)
    .attr('fill', text);

  const highlightTextEl = highlight
    .append('text')
    .attr('y', Math.min(latestRetailY, latestVisitorY) - 24)
    .attr('fill', '#fff')
    .attr('font-size', 12)
    .attr('font-weight', 700);

  const highlightPadX = 10;
  const highlightPadY = 8;
  const highlightGap = 18; // keep some space from the point
  const highlightMinLeft = plotLeft + 56; // avoid covering y-axis tick labels

  highlightTextEl
    .selectAll('tspan')
    .data([
      `2026-02：零售業銷貨價值指數按年變動百分率 ${cleanPct(latest.retail)}`,
      `訪港旅客人數按年變動百分率 ${cleanPct(latest.visitors)}`
    ])
    .join('tspan')
    .attr('x', 0)
    .attr('dy', (_, i) => (i === 0 ? 0 : 16))
    .text((d) => d);

  const positionHighlight = () => {
    const bbox0 = highlightTextEl.node()?.getBBox?.();
    if (!bbox0) return;

    // Prefer placing the box to the left of the latest point; clamp to plot bounds.
    const boxW0 = bbox0.width + highlightPadX * 2;
    const desiredLeft = latestX - highlightGap - boxW0;
    const left = Math.max(highlightMinLeft, Math.min(desiredLeft, plotRight - boxW0 - 8));
    const textX = left + highlightPadX;

    highlightTextEl.attr('x', textX);
    highlightTextEl.selectAll('tspan').attr('x', textX);

    const bbox = highlightTextEl.node()?.getBBox?.();
    if (!bbox) return;

    highlightRect
      .attr('x', bbox.x - highlightPadX)
      .attr('y', bbox.y - highlightPadY)
      .attr('width', bbox.width + highlightPadX * 2)
      .attr('height', bbox.height + highlightPadY * 2);
  };

  positionHighlight();

  svg
    .append('text')
    .attr('x', plotLeft)
    .attr('y', height - 14)
    .attr('fill', muted)
    .attr('font-size', 11)
    .text('注：每個月份以兩個散點表示；虛線連接同月兩項指標，距離越大代表升幅差距越明顯。');

  const tooltip = select(root)
    .append('div')
    .attr('class', 'ds-chart-tooltip')
    .style('position', 'absolute')
    .style('pointer-events', 'none')
    .style('z-index', '2')
    .style('opacity', '0')
    .style('transform', 'translate(-50%, -112%)')
    .style('padding', '9px 11px')
    .style('border-radius', '6px')
    .style('border', `1px solid ${borderStrong}`)
    .style('background', '#fff')
    .style('color', text)
    .style('box-shadow', reduceMotionForPerf() ? 'none' : '0 12px 28px rgba(0,0,0,0.12)')
    .style('font', '12px/1.45 var(--font-sans)');

  const showTooltip = (event, d) => {
    const [mx, my] = pointer(event, root);
    tooltip
      .style('left', `${mx}px`)
      .style('top', `${my - 12}px`)
      .style('opacity', '1')
      .html(
        `<div style="font-weight:700;margin-bottom:4px">${month(d.date)}</div>` +
          `<div><span style="color:${red};font-weight:700">●</span> 零售業銷貨價值指數按年變動百分率：${cleanPct(d.retail)}</div>` +
          `<div><span style="color:${blue};font-weight:700">○</span> 訪港旅客人數按年變動百分率：${cleanPct(d.visitors)}</div>`
      );
  };

  const hideTooltip = () => tooltip.style('opacity', '0');

  const showPointTooltip = (metric) => (event, d) => {
    const [mx, my] = pointer(event, root);
    const isRetail = metric === 'retail';
    const metricColor = isRetail ? red : blue;
    const metricLabel = isRetail
      ? '零售業銷貨價值指數按年變動百分率'
      : '訪港旅客人數按年變動百分率';
    const metricValue = cleanPct(isRetail ? d.retail : d.visitors);

    tooltip
      .style('left', `${mx}px`)
      .style('top', `${my - 12}px`)
      .style('opacity', '1')
      .html(
        `<div style="font-weight:700;margin-bottom:4px">${month(d.date)}</div>` +
          `<div><span style="color:${metricColor};font-weight:700">●</span> ${metricLabel}: ${metricValue}</div>`
      );
  };

  retailDots.on('pointerenter pointermove', showPointTooltip('retail')).on('pointerleave', hideTooltip);
  visitorDots.on('pointerenter pointermove', showPointTooltip('visitors')).on('pointerleave', hideTooltip);

  if (reduceMotionForPerf()) return;

  linkLayer.selectAll('line').attr('opacity', 0).transition().duration(900).attr('opacity', 0.75);
  retailDots.attr('opacity', 0).transition().duration(780).delay((_, i) => i * 135).attr('opacity', 1);
  visitorDots
    .attr('opacity', 0)
    .transition()
    .duration(780)
    .delay((_, i) => i * 135 + 67.5)
    .attr('opacity', 1);
}
