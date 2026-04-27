import { select } from 'd3-selection';
import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom';
import 'd3-transition';

import { reduceMotionForPerf } from '../utils.js';

function levelColor(value) {
  if (value < 10) return '#F2C94C';
  if (value <= 15) return '#F39C12';
  return '#C7352A';
}

function levelLabel(value) {
  if (value < 10) return '< 10%（低）';
  if (value < 12) return '10-12%（中）';
  if (value <= 15) return '12-15%（高）';
  return '> 15%（極高）';
}

const URBAN_CORE_BOUNDS = {
  north: 22.3268,
  south: 22.2681,
  west: 114.1491,
  east: 114.2044
};

function projectToMap(d, width, height) {
  return {
    x: ((Number(d.lon) - URBAN_CORE_BOUNDS.west) / (URBAN_CORE_BOUNDS.east - URBAN_CORE_BOUNDS.west)) * width,
    y: ((URBAN_CORE_BOUNDS.north - Number(d.lat)) / (URBAN_CORE_BOUNDS.north - URBAN_CORE_BOUNDS.south)) * height
  };
}

function drawMapBase(parent) {
  const map = parent.append('g').attr('class', 'ds-vacancy-map-base');

  map
    .append('image')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 640)
    .attr('height', 540)
    .attr('href', '/hk-retail-industry/images/hk-urban-core-osm.png')
    .attr('preserveAspectRatio', 'none');

  map.append('rect').attr('width', 640).attr('height', 540).attr('fill', 'rgba(255,255,255,0.08)');

  map
    .append('text')
    .attr('x', 10)
    .attr('y', 532)
    .attr('fill', '#334')
    .attr('font-size', 10)
    .attr('opacity', 0.65)
    .text('Map image: OpenStreetMap contributors / Wikimedia Commons');
}

function drawZoomControls(svg, zoomTarget, behavior, reduceMotion) {
  const controls = svg.append('g').attr('class', 'ds-vacancy-zoom-controls').attr('transform', 'translate(12,12)');
  controls.append('rect').attr('width', 34).attr('height', 68).attr('fill', '#fff').attr('stroke', '#C7D0D0');
  controls.append('line').attr('x1', 0).attr('x2', 34).attr('y1', 34).attr('y2', 34).attr('stroke', '#C7D0D0');

  const buttons = [
    { label: '+', y: 0, factor: 1.35 },
    { label: '−', y: 34, factor: 1 / 1.35 }
  ];

  const button = controls
    .selectAll('g')
    .data(buttons)
    .join('g')
    .attr('class', 'ds-vacancy-zoom-button')
    .attr('transform', (d) => `translate(0,${d.y})`)
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      event.stopPropagation();
      if (reduceMotion) {
        zoomTarget.call(behavior.scaleBy, d.factor);
      } else {
        zoomTarget.transition().duration(330).call(behavior.scaleBy, d.factor);
      }
    });

  button.append('rect').attr('width', 34).attr('height', 34).attr('fill', 'transparent');
  button
    .append('text')
    .attr('x', 17)
    .attr('y', 23)
    .attr('text-anchor', 'middle')
    .attr('font-size', 22)
    .attr('font-weight', 700)
    .attr('pointer-events', 'none')
    .text((d) => d.label);
}

export function init(container, data) {
  const root = typeof container === 'string' ? document.querySelector(container) : container;
  if (!root) return;
  root.innerHTML = '';

  const reduceMotion = reduceMotionForPerf();

  const districts = data?.districts ?? [];
  if (districts.length === 0) return;

  const width = 900;
  const height = 540;
  const mapWidth = 640;
  const legendX = 675;

  const svg = select(root)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', '香港四大核心區商舖空置率地圖熱力圖');

  svg
    .append('defs')
    .append('clipPath')
    .attr('id', 'ds-vacancy-map-clip')
    .append('rect')
    .attr('width', mapWidth)
    .attr('height', height);

  const viewport = svg
    .append('g')
    .attr('class', 'ds-vacancy-viewport')
    .attr('clip-path', 'url(#ds-vacancy-map-clip)')
    .style('cursor', 'grab');

  const zoomLayer = viewport.append('g').attr('class', 'ds-vacancy-zoom-layer');

  drawMapBase(zoomLayer);

  const markerLayer = zoomLayer.append('g').attr('class', 'ds-vacancy-markers');

  const markers = markerLayer
    .selectAll('g')
    .data(districts)
    .join('g')
    .attr('transform', (d) => {
      const p = projectToMap(d, mapWidth, height);
      return `translate(${p.x},${p.y})`;
    });

  markers
    .append('circle')
    .attr('r', reduceMotion ? (d) => 28 + Number(d.value) * 1.8 : 0)
    .attr('fill', (d) => levelColor(Number(d.value)))
    .attr('fill-opacity', 0.72)
    .attr('stroke', '#fff')
    .attr('stroke-width', 3)
    .call((sel) => {
      if (reduceMotion) return;
      sel.transition().duration(1275).attr('r', (d) => 28 + Number(d.value) * 1.8);
    });

  markers
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '-0.15em')
    .attr('fill', (d) => (Number(d.value) < 10 ? '#1A1714' : '#fff'))
    .attr('font-size', 14)
    .attr('font-weight', 800)
    .text((d) => d.name);

  markers
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '1.25em')
    .attr('fill', (d) => (Number(d.value) < 10 ? '#1A1714' : '#fff'))
    .attr('font-size', 12)
    .attr('font-weight', 700)
    .attr('opacity', 0.95)
    .text((d) => `${Number(d.value).toFixed(1)}%`);

  const zoomBehavior = d3Zoom()
    .scaleExtent([1, 4])
    .translateExtent([
      [0, 0],
      [mapWidth, height]
    ])
    .extent([
      [0, 0],
      [mapWidth, height]
    ])
    .on('start', () => viewport.style('cursor', 'grabbing'))
    .on('zoom', (event) => {
      zoomLayer.attr('transform', event.transform);
    })
    .on('end', () => viewport.style('cursor', 'grab'));

  viewport.call(zoomBehavior).call(zoomBehavior.transform, zoomIdentity);

  viewport.on('dblclick.zoom', null);

  drawZoomControls(svg, viewport, zoomBehavior, reduceMotion);

  const legend = svg.append('g').attr('class', 'ds-vacancy-legend').attr('transform', `translate(${legendX},0)`);
  legend
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 210)
    .attr('height', 196)
    .attr('rx', 8)
    .attr('fill', '#fff')
    .attr('stroke', '#E5E1DA')
    .attr('filter', reduceMotion ? null : 'drop-shadow(0 4px 12px rgba(26,23,20,0.10))');

  legend
    .append('text')
    .attr('x', 24)
    .attr('y', 42)
    .attr('fill', '#24443A')
    .attr('font-size', 16)
    .attr('font-weight', 800)
    .text('空置率級別');

  const levels = [
    { color: '#12B89A', label: '< 10%（低）' },
    { color: '#F39C12', label: '10-12%（中）' },
    { color: '#EC8E86', label: '12-15%（高）' },
    { color: '#C7352A', label: '> 15%（極高）' }
  ];

  const rows = legend
    .append('g')
    .attr('transform', 'translate(24,68)')
    .selectAll('g')
    .data([
      { color: '#F2C94C', label: '< 10%' },
      { color: '#F39C12', label: '12-15%' },
      { color: '#C7352A', label: '> 15%' }
    ])
    .join('g')
    .attr('transform', (_, i) => `translate(0,${i * 38})`);

  rows.append('rect').attr('width', 22).attr('height', 22).attr('rx', 3).attr('fill', (d) => d.color);
  rows
    .append('text')
    .attr('x', 46)
    .attr('y', 16)
    .attr('fill', '#21332E')
    .attr('font-size', 14)
    .text((d) => d.label);

  const overall = data?.overall;
  if (overall) {
    svg
      .append('g')
      .attr('transform', 'translate(18,504)')
      .call((g) => {
        g.append('rect').attr('width', 174).attr('height', 26).attr('rx', 4).attr('fill', 'rgba(255,255,255,0.88)');
        g.append('text')
          .attr('x', 10)
          .attr('y', 18)
          .attr('fill', '#21332E')
          .attr('font-size', 12)
          .attr('font-weight', 800)
          .text(`${overall.name}空置率：${Number(overall.value).toFixed(1)}%`);
      });
  }
}
