import { select } from 'd3-selection';
import { max } from 'd3-array';
import 'd3-transition';

import { cssVar, clamp01, reduceMotionForPerf } from '../utils.js';

const STORE_ICON_PATH = `${import.meta.env.BASE_URL}images/${encodeURIComponent('图表进度条.png')}`;

export function init(container, data) {
  const root = typeof container === 'string' ? document.querySelector(container) : container;
  if (!root) return;
  root.innerHTML = '';

  const series = (data?.series ?? []).map((d) => ({
    period: d.period,
    value: Number(d.value)
  }));
  if (series.length === 0) return;

  const width = 940;
  const height = 310;
  const plotLeft = 130;
  const plotTop = 58;
  const rowGap = 90;
  const iconSize = 54;
  const iconGap = 10;

  const text = cssVar('--c-text');
  const muted = cssVar('--c-text-muted');
  const maxIcons = Math.ceil(max(series, (d) => d.value) ?? 0);

  const svg = select(root)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', '\u5e73\u5747\u6bcf\u6708\u7d50\u696d\u5e97\u92ea\u6578\u91cf\u5716\u6a19\u9032\u5ea6\u689d');

  svg
    .append('g')
    .selectAll('text')
    .data(series)
    .join('text')
    .attr('x', plotLeft - 22)
    .attr('y', (_, row) => plotTop + row * rowGap + iconSize / 2 + 5)
    .attr('text-anchor', 'end')
    .attr('fill', text)
    .attr('font-size', 15)
    .attr('font-weight', 700)
    .text((d) => d.period.replace(' ', ''));

  const rows = svg
    .append('g')
    .selectAll('g')
    .data(series)
    .join('g')
    .attr('transform', (_, row) => `translate(${plotLeft},${plotTop + row * rowGap})`);

  rows.each(function renderRow(d, row) {
    const rowGroup = select(this);
    const icons = Array.from({ length: maxIcons }, (_, iconIndex) => ({
      clipId: `ds-store-icon-clip-${row}-${iconIndex}`,
      index: iconIndex,
      fillRatio: clamp01(d.value - iconIndex)
    }));

    const iconGroup = rowGroup
      .selectAll('g')
      .data(icons)
      .join('g')
      .attr('transform', (icon) => `translate(${icon.index * (iconSize + iconGap)},0)`);

    iconGroup
      .append('clipPath')
      .attr('id', (icon) => icon.clipId)
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', iconSize)
      .attr('width', (icon) => iconSize * icon.fillRatio);

    const activeIcons = iconGroup
      .append('image')
      .attr('href', STORE_ICON_PATH)
      .attr('width', iconSize)
      .attr('height', iconSize)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('clip-path', (icon) => `url(#${icon.clipId})`)
      .attr('opacity', reduceMotionForPerf() ? 1 : 0);

    if (!reduceMotionForPerf()) {
      activeIcons
        .transition()
        .delay((icon) => row * 220 + icon.index * 85)
        .duration(420)
        .attr('opacity', 1);
    }
  });

  svg
    .append('g')
    .selectAll('text')
    .data(series)
    .join('text')
    .attr('x', plotLeft + maxIcons * (iconSize + iconGap) + 18)
    .attr('y', (_, row) => plotTop + row * rowGap + iconSize / 2 + 6)
    .attr('fill', text)
    .attr('font-size', 16)
    .attr('font-weight', 800)
    .attr('opacity', reduceMotionForPerf() ? 1 : 0)
    .text((d) => `${d.value}\u5bb6\u5e97\u92ea`);

  if (!reduceMotionForPerf()) {
    svg
      .selectAll('text')
      .transition()
      .delay(420)
      .duration(360)
      .attr('opacity', 1);
  }

  svg
    .append('text')
    .attr('x', plotLeft)
    .attr('y', height - 10)
    .attr('fill', muted)
    .attr('font-size', 12)
    .text('\u6b64\u5716\u5c07\u4e00\u5e74\u5206\u70baQ1(1\u6708-4\u6708)\u3001Q2(5\u6708-8\u6708)\u3001Q3(9\u6708-12\u6708)');

}
