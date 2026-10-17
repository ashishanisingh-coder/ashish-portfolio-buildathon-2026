const fs = require('fs');
const path = require('path');

const W = 2400;
const H = 4050;
const OUT = __dirname;

const C = {
  night: '#0b1113',
  night2: '#131b1d',
  paper: '#f5f4ef',
  paper2: '#e7ebe6',
  fog: '#d9dfda',
  ink: '#111617',
  muted: '#687271',
  rule: '#c6ceca',
  white: '#fafbf7',
  cobalt: '#4256d4',
  cobalt2: '#2436a5',
  coral: '#d47b67',
  yellow: '#d7b94e',
  cyan: '#8ccfd2',
  sage: '#91aa9c',
  blue: '#1d4e9b',
  lilac: '#aaaee2',
};

const DISPLAY = 'Avenir Next, Helvetica Neue, Arial, sans-serif';
const UTILITY = 'Avenir Next Condensed, Avenir Next, Helvetica Neue, Arial, sans-serif';
const EDITORIAL = 'Baskerville, New York, Georgia, serif';

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function attrs(obj = {}) {
  return Object.entries(obj)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => ` ${key}="${esc(value)}"`)
    .join('');
}

function rect(x, y, w, h, fill, extra = {}) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${attrs(extra)}/>`;
}

function line(x1, y1, x2, y2, stroke = C.rule, width = 2, extra = {}) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"${attrs(extra)}/>`;
}

function polygon(points, fill, extra = {}) {
  return `<polygon points="${points}" fill="${fill}"${attrs(extra)}/>`;
}

function pathEl(d, fill = 'none', stroke = 'none', extra = {}) {
  return `<path d="${d}" fill="${fill}" stroke="${stroke}"${attrs(extra)}/>`;
}

function circle(cx, cy, r, fill, extra = {}) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${attrs(extra)}/>`;
}

function text(x, y, value, size, fill = C.ink, extra = {}) {
  const {
    weight = 400,
    family = UTILITY,
    anchor = 'start',
    tracking = 0,
    opacity = 1,
    italic = false,
    transform,
  } = extra;
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}" font-size="${size}px" font-weight="${weight}" text-anchor="${anchor}" letter-spacing="${tracking}px" opacity="${opacity}"${italic ? ' font-style="italic"' : ''}${transform ? ` transform="${transform}"` : ''}>${esc(value)}</text>`;
}

function multi(x, y, lines, size, fill = C.ink, lineHeight = 1.08, extra = {}) {
  return lines.map((value, index) => text(x, y + index * size * lineHeight, value, size, fill, extra)).join('');
}

function label(x, y, value, fill = C.muted, extra = {}) {
  return text(x, y, value.toUpperCase(), 18, fill, { family: UTILITY, weight: 650, tracking: 2.7, ...extra });
}

function ruleLabel(y, left, right) {
  return label(150, y, left) + text(2250, y, right, 18, C.muted, { family: UTILITY, weight: 650, tracking: 2.2, anchor: 'end' }) + line(150, y + 32, 2250, y + 32, C.rule, 2);
}

function pill(x, y, value, width = 225) {
  return rect(x, y - 25, width, 40, C.ink, { rx: 20 }) + text(x + width / 2, y + 2, value, 16, C.paper, { family: UTILITY, weight: 700, tracking: 1.4, anchor: 'middle' });
}

function svgStart() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="nightGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#19272b"/>
      <stop offset="0.52" stop-color="#0b1113"/>
      <stop offset="1" stop-color="#070a0b"/>
    </linearGradient>
    <linearGradient id="paperFace" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fffefa"/>
      <stop offset="0.72" stop-color="#e8ebe5"/>
      <stop offset="1" stop-color="#c6ceca"/>
    </linearGradient>
    <linearGradient id="paperEdge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f8f8f3"/>
      <stop offset="1" stop-color="#aab3ae"/>
    </linearGradient>
    <linearGradient id="vellum" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#f7f7f0" stop-opacity="0.56"/>
      <stop offset="1" stop-color="#dce8e3" stop-opacity="0.15"/>
    </linearGradient>
    <linearGradient id="cobaltFace" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5c70eb"/>
      <stop offset="1" stop-color="#263aa9"/>
    </linearGradient>
    <filter id="deepShadow" x="-40%" y="-40%" width="190%" height="200%">
      <feDropShadow dx="0" dy="36" stdDeviation="32" flood-color="#000000" flood-opacity="0.36"/>
    </filter>
    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="180%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
    <filter id="ambientBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="34"/>
    </filter>
    <clipPath id="indiaWide"><rect x="0" y="0" width="1" height="1"/></clipPath>
  </defs>
  ${rect(0, 0, W, H, C.paper)}`;
}

function svgEnd() {
  return '</svg>';
}

function miniGrid(x, y, w, h, step = 54, color = C.rule, opacity = 0.5) {
  let out = '';
  for (let gx = x; gx <= x + w; gx += step) out += line(gx, y, gx, y + h, color, 1, { opacity });
  for (let gy = y; gy <= y + h; gy += step) out += line(x, gy, x + w, gy, color, 1, { opacity });
  return out;
}

function indiaArt(x, y, w, h, detail = false) {
  let out = rect(x, y, w, h, '#162529');
  const inset = detail ? 24 : 44;
  const ix = x + inset;
  const iy = y + inset;
  const iw = w - inset * 2;
  const ih = h - inset * 2;
  out += rect(ix, iy, iw, ih, '#1e3034');
  out += line(ix, iy + ih * 0.18, ix + iw, iy + ih * 0.18, '#d7e1db', 1, { opacity: 0.6 });
  out += line(ix, iy + ih * 0.68, ix + iw, iy + ih * 0.68, '#d7e1db', 1, { opacity: 0.55 });
  const widths = [0.15, 0.18, 0.11, 0.21, 0.17];
  const fills = [C.coral, C.yellow, C.cyan, C.cobalt, C.sage];
  let cursor = ix + iw * 0.07;
  widths.forEach((portion, index) => {
    const barW = iw * portion;
    const barH = ih * (0.47 + index * 0.055);
    const barY = iy + ih * 0.82 - barH;
    out += rect(cursor, barY, barW, barH, fills[index], { opacity: 0.97 });
    out += line(cursor, barY - 14, cursor + barW, barY - 14, C.white, 1, { opacity: 0.4 });
    cursor += barW + iw * 0.045;
  });
  const wave = `M ${ix + iw * 0.04} ${iy + ih * 0.43} C ${ix + iw * 0.24} ${iy + ih * 0.24}, ${ix + iw * 0.39} ${iy + ih * 0.69}, ${ix + iw * 0.58} ${iy + ih * 0.43} S ${ix + iw * 0.82} ${iy + ih * 0.25}, ${ix + iw * 0.95} ${iy + ih * 0.5}`;
  out += pathEl(wave, 'none', C.white, { 'stroke-width': detail ? 2 : 3, opacity: 0.78 });
  out += circle(ix + iw * 0.58, iy + ih * 0.43, detail ? 12 : 18, C.white, { opacity: 0.92 });
  out += line(ix + iw * 0.72, iy, ix + iw * 0.72, iy + ih, C.white, 1, { opacity: 0.16 });
  out += text(ix, y + h - Math.max(24, h * 0.055), 'INDIA / IN TRANSITION', Math.max(15, h * 0.038), C.white, { family: UTILITY, weight: 700, tracking: 2.1 });
  if (!detail) {
    out += label(x + 44, y + 58, 'Visual narrative / developing', C.white, { tracking: 1.8 });
    out += text(x + w - 44, y + 58, '01', 18, '#c9d5d0', { family: UTILITY, weight: 700, tracking: 2, anchor: 'end' });
  }
  return out;
}

function rotavirusArt(x, y, w, h, detail = false) {
  let out = rect(x, y, w, h, '#e7eef1');
  out += miniGrid(x + w * 0.09, y + h * 0.12, w * 0.82, h * 0.73, Math.max(28, w * 0.055), '#a7bac3', 0.52);
  const r = Math.min(w, h) * (detail ? 0.13 : 0.17);
  const cx = x + w * 0.33;
  const cy = y + h * 0.48;
  out += circle(cx, cy, r, C.cobalt, { opacity: 0.92 });
  out += circle(x + w * 0.61, y + h * 0.39, r * 0.67, C.coral, { opacity: 0.92 });
  out += circle(x + w * 0.55, y + h * 0.68, r * 0.42, C.yellow, { opacity: 0.96 });
  out += pathEl(`M ${x + w * 0.19} ${y + h * 0.26} C ${x + w * 0.4} ${y + h * 0.38}, ${x + w * 0.46} ${y + h * 0.59}, ${x + w * 0.76} ${y + h * 0.7}`, 'none', C.ink, { 'stroke-width': detail ? 2 : 3, opacity: 0.38 });
  out += line(x + w * 0.18, y + h * 0.8, x + w * 0.83, y + h * 0.8, C.ink, 1, { opacity: 0.35 });
  out += text(x + w * 0.1, y + h * 0.92, 'ROTAVIRUS / INFORMATION DESIGN', Math.max(14, h * 0.052), C.ink, { family: UTILITY, weight: 700, tracking: 1.7 });
  return out;
}

function philipsArt(x, y, w, h, detail = false) {
  let out = rect(x, y, w, h, '#d9e7ed');
  out += rect(x + w * 0.1, y + h * 0.16, w * 0.78, h * 0.5, C.blue, { rx: 16 });
  out += rect(x + w * 0.17, y + h * 0.24, w * 0.35, h * 0.33, C.paper, { rx: 8 });
  out += rect(x + w * 0.58, y + h * 0.24, w * 0.2, h * 0.33, C.cyan, { rx: 8 });
  out += line(x + w * 0.17, y + h * 0.75, x + w * 0.82, y + h * 0.75, C.blue, detail ? 2 : 4, { opacity: 0.7 });
  out += line(x + w * 0.17, y + h * 0.83, x + w * 0.54, y + h * 0.83, C.blue, 2, { opacity: 0.35 });
  out += text(x + w * 0.1, y + h * 0.92, 'PHILIPS / SELECTED SYSTEM', Math.max(14, h * 0.05), C.blue, { family: UTILITY, weight: 700, tracking: 1.7 });
  return out;
}

function unoArt(x, y, w, h, detail = false) {
  let out = rect(x, y, w, h, '#1c252b');
  out += rect(x + w * 0.12, y + h * 0.13, w * 0.76, h * 0.7, C.lilac, { rx: 22, opacity: 0.92 });
  out += rect(x + w * 0.2, y + h * 0.23, w * 0.57, h * 0.45, '#31424d', { rx: 14 });
  out += line(x + w * 0.29, y + h * 0.35, x + w * 0.64, y + h * 0.35, C.white, detail ? 2 : 4, { opacity: 0.82 });
  out += line(x + w * 0.29, y + h * 0.48, x + w * 0.55, y + h * 0.48, C.white, detail ? 2 : 4, { opacity: 0.45 });
  out += circle(x + w * 0.69, y + h * 0.66, Math.min(38, w * 0.058), C.cobalt, { opacity: 0.96 });
  out += text(x + w * 0.12, y + h * 0.91, 'SIMULANIS UNO / EXPERIENCE', Math.max(14, h * 0.049), C.white, { family: UTILITY, weight: 700, tracking: 1.5 });
  return out;
}

function art(x, y, w, h, theme, detail = false) {
  if (theme === 'rotavirus') return rotavirusArt(x, y, w, h, detail);
  if (theme === 'philips') return philipsArt(x, y, w, h, detail);
  if (theme === 'uno') return unoArt(x, y, w, h, detail);
  return indiaArt(x, y, w, h, detail);
}

function heroObject() {
  let out = '';
  out += `<ellipse cx="1665" cy="1035" rx="620" ry="92" fill="#000000" opacity="0.34" filter="url(#ambientBlur)"/>`;
  out += `<g filter="url(#deepShadow)">`;
  // A thick back sheet: the bevel and bottom edge make the object read as paper, not a flat polygon.
  out += polygon('1335,378 2044,510 2148,1008 1434,891', 'url(#paperFace)');
  out += polygon('1434,891 2148,1008 2044,1067 1325,944', 'url(#paperEdge)');
  out += polygon('1325,944 1434,891 1335,378 1240,445', '#c0c9c4');
  // The dark project plate is recessed into the back sheet.
  out += polygon('1439,456 1950,550 2020,921 1470,829', '#142326', { stroke: '#eef2ec', 'stroke-width': 2 });
  out += polygon('1470,829 2020,921 1990,943 1438,849', '#10191b');
  // Recessed visual language on the project plate.
  out += line(1488, 536, 1930, 617, '#dbe5df', 1, { opacity: 0.44 });
  out += line(1500, 767, 1990, 858, '#dbe5df', 1, { opacity: 0.32 });
  const plateBars = [
    ['#d47b67', '1510,592 1590,607 1624,789 1541,775'],
    ['#d7b94e', '1642,615 1722,630 1757,816 1673,800'],
    ['#8ccfd2', '1774,640 1856,655 1889,839 1806,823'],
    ['url(#cobaltFace)', '1906,665 1977,678 2004,854 1937,842'],
  ];
  plateBars.forEach(([fill, points]) => { out += polygon(points, fill); });
  out += pathEl('M 1507 692 C 1597 622, 1680 793, 1760 710 S 1910 640, 1988 758', 'none', C.white, { 'stroke-width': 2, opacity: 0.72 });
  out += text(1486, 886, 'INDIA / IN TRANSITION', 15, C.white, { family: UTILITY, weight: 700, tracking: 1.8 });

  // The open/front sheet overlaps the back plate and creates the fold.
  out += polygon('1122,300 1582,392 1535,868 1096,782', 'url(#paperFace)');
  out += polygon('1096,782 1535,868 1487,919 1050,833', 'url(#paperEdge)');
  out += polygon('1122,300 1185,350 1143,742 1096,782', '#d2d9d4');
  out += line(1122, 300, 1582, 392, '#ffffff', 2, { opacity: 0.74 });
  out += line(1582, 392, 1535, 868, '#a6b0ab', 2, { opacity: 0.7 });
  out += label(1170, 422, 'A VISUAL NARRATIVE', C.ink, { tracking: 1.9 });
  out += text(1170, 520, 'A story can be', 43, C.ink, { family: DISPLAY, weight: 600, tracking: -1.4 });
  out += text(1170, 575, 'held in a system.', 43, C.ink, { family: DISPLAY, weight: 600, tracking: -1.4 });
  out += line(1170, 638, 1450, 695, C.cobalt, 5);
  out += text(1170, 744, 'SELECTED WORK / 01', 15, C.muted, { family: UTILITY, weight: 700, tracking: 2.2 });

  // A translucent tracing sheet gives the hero a physical layer and a reason for the fold.
  out += polygon('1258,240 1710,330 1660,774 1210,687', 'url(#vellum)', { stroke: '#f8fbf3', 'stroke-width': 1, opacity: 0.68 });
  out += line(1285, 344, 1650, 415, '#ffffff', 1, { opacity: 0.52 });
  out += line(1250, 626, 1622, 697, '#ffffff', 1, { opacity: 0.4 });
  out += circle(1306, 368, 7, C.cobalt, { opacity: 0.9 });
  out += circle(1603, 426, 7, C.coral, { opacity: 0.9 });
  out += circle(1538, 683, 7, C.yellow, { opacity: 0.92 });
  out += pathEl('M 1306 368 C 1388 420, 1448 517, 1538 683', 'none', C.ink, { 'stroke-width': 1.4, opacity: 0.46 });
  out += `</g>`;
  // Fine registration ticks give the object the precision of a presentation proof.
  out += line(1060, 258, 1090, 258, '#a7b4b1', 1, { opacity: 0.64 });
  out += line(1060, 258, 1060, 288, '#a7b4b1', 1, { opacity: 0.64 });
  out += line(2080, 1084, 2110, 1084, '#a7b4b1', 1, { opacity: 0.64 });
  out += line(2110, 1084, 2110, 1054, '#a7b4b1', 1, { opacity: 0.64 });
  return out;
}

function mockupV2() {
  let s = svgStart();
  s += rect(0, 0, W, 1260, 'url(#nightGradient)');
  s += circle(1730, 470, 420, '#27444a', { opacity: 0.18, filter: 'url(#ambientBlur)' });
  s += text(150, 112, 'ASHISH KUMAR SINGH', 22, C.white, { family: DISPLAY, weight: 650, tracking: 2.7 });
  s += text(2250, 112, 'SELECTED WORK     APPROACH     PROFILE     CONTACT', 18, C.white, { family: UTILITY, weight: 650, tracking: 2.1, anchor: 'end', opacity: 0.84 });
  s += line(150, 152, 2250, 152, '#334246', 2);
  s += label(150, 286, 'The fold / visual practice', '#a7b5b3');
  s += multi(150, 502, ['I build the visual', 'structure behind', 'complex ideas.'], 112, C.white, 0.98, { family: DISPLAY, weight: 650, tracking: -3.5 });
  s += text(156, 904, 'Presentation, information and visual systems', 26, '#c6d0ce', { family: UTILITY, weight: 450, tracking: 0.1 });
  s += text(156, 948, 'for ideas that need to hold together.', 26, '#c6d0ce', { family: UTILITY, weight: 450, tracking: 0.1 });
  s += text(156, 1090, 'OPEN THE FOLD  ↓', 17, '#d6dfdc', { family: UTILITY, weight: 700, tracking: 2.4 });
  s += line(156, 1033, 378, 1033, C.cobalt, 5);
  s += heroObject();
  s += label(1994, 1180, '01 / 04    SINGLE GESTURE', '#8c9b9b', { anchor: 'end', tracking: 1.8 });

  // Featured project spread: a deliberately quiet, wide image stage with an evidence strip.
  s += rect(0, 1260, W, 1268, C.paper);
  s += ruleLabel(1398, 'Selected work / first spread', 'B / THE FOLD — V2');
  s += label(150, 1570, 'India in Transition', C.cobalt);
  s += text(150, 1680, 'A visual narrative', 68, C.ink, { family: DISPLAY, weight: 650, tracking: -2.5 });
  s += text(150, 1752, 'in development.', 68, C.ink, { family: DISPLAY, weight: 650, tracking: -2.5 });
  s += pill(154, 1844, 'WORK IN PROGRESS');
  s += multi(150, 1982, ['The project is shown as a', 'system of decisions, not only', 'as a finished image.'], 24, C.muted, 1.35, { family: UTILITY, weight: 450 });
  s += line(150, 2188, 610, 2188, C.rule, 2);
  s += text(150, 2243, 'VIEW CASE STUDY  ↗', 17, C.ink, { family: UTILITY, weight: 700, tracking: 2.2 });
  s += rect(820, 1530, 1390, 650, '#101a1d', { filter: 'url(#softShadow)' });
  s += indiaArt(820, 1530, 1390, 650, false);
  s += text(820, 2220, 'ART DIRECTION PROXY / REPLACE WITH SUPPLIED PROJECT ASSET', 14, C.muted, { family: UTILITY, weight: 700, tracking: 1.75 });
  s += line(820, 2290, 2210, 2290, C.rule, 2);
  s += label(820, 2360, 'Evidence strip / three decisions', C.muted);
  s += rect(820, 2400, 420, 160, '#e9eef0');
  s += miniGrid(850, 2430, 360, 96, 38, '#a9bac2', 0.45);
  s += circle(950, 2475, 27, C.cobalt, { opacity: 0.95 });
  s += circle(1060, 2455, 19, C.coral, { opacity: 0.92 });
  s += line(905, 2434, 1120, 2518, C.ink, 2, { opacity: 0.42 });
  s += text(850, 2538, '01 / MAKE THE SIGNAL LEGIBLE', 13, C.ink, { family: UTILITY, weight: 700, tracking: 1.35 });
  s += rect(1282, 2400, 420, 160, '#18272b');
  s += line(1318, 2445, 1630, 2445, '#ecf1ec', 2, { opacity: 0.78 });
  s += line(1318, 2485, 1535, 2485, '#ecf1ec', 2, { opacity: 0.48 });
  s += line(1318, 2525, 1580, 2525, '#ecf1ec', 2, { opacity: 0.36 });
  s += text(1318, 2540, '02 / BUILD THE RHYTHM', 13, C.white, { family: UTILITY, weight: 700, tracking: 1.35 });
  s += rect(1744, 2400, 466, 160, '#dfe6e2');
  s += text(1778, 2468, 'A story can be', 25, C.ink, { family: EDITORIAL, italic: true });
  s += text(1778, 2505, 'held in a system.', 25, C.ink, { family: EDITORIAL, italic: true });
  s += line(1778, 2532, 2025, 2532, C.cobalt, 3);
  s += text(1778, 2540, '03 / GIVE THE IDEA SOMEWHERE TO STAND', 13, C.ink, { family: UTILITY, weight: 700, tracking: 1.1 });

  // The archive uses A's selective row logic, but each project receives a different image rhythm.
  s += rect(0, 2590, W, H - 2590, C.paper2);
  s += ruleLabel(2668, 'Other work / selected frames', 'Three projects / no repeated cards');

  s += text(150, 2810, 'Rotavirus', 45, C.ink, { family: DISPLAY, weight: 650, tracking: -1.1 });
  s += text(150, 2860, 'Information made legible without flattening the subject.', 22, C.muted, { family: UTILITY });
  s += text(150, 2925, 'INFORMATION DESIGN  ·  SELECTED WORK', 15, C.ink, { family: UTILITY, weight: 700, tracking: 1.9 });
  s += rect(1040, 2750, 620, 240, '#e7eef1', { filter: 'url(#softShadow)' });
  s += rotavirusArt(1040, 2750, 620, 240, true);
  s += line(1710, 2750, 1710, 2990, C.rule, 2);
  s += text(1780, 2830, '01', 18, C.cobalt, { family: UTILITY, weight: 700, tracking: 2 });
  s += text(1780, 2876, 'OPEN PROJECT  ↗', 16, C.ink, { family: UTILITY, weight: 700, tracking: 2 });
  s += line(150, 3030, 2250, 3030, C.rule, 2);

  s += text(150, 3150, 'Philips', 45, C.ink, { family: DISPLAY, weight: 650, tracking: -1.1 });
  s += text(150, 3200, 'A restrained visual system for selected work.', 22, C.muted, { family: UTILITY });
  s += text(150, 3265, 'PRESENTATION SYSTEM  ·  SELECTED WORK', 15, C.ink, { family: UTILITY, weight: 700, tracking: 1.9 });
  s += rect(1500, 3090, 620, 240, '#d9e7ed', { filter: 'url(#softShadow)' });
  s += philipsArt(1500, 3090, 620, 240, true);
  s += line(1430, 3090, 1430, 3330, C.rule, 2);
  s += text(1360, 3170, '02', 18, C.cobalt, { family: UTILITY, weight: 700, tracking: 2, anchor: 'end' });
  s += text(1360, 3216, 'OPEN PROJECT  ↗', 16, C.ink, { family: UTILITY, weight: 700, tracking: 2, anchor: 'end' });
  s += line(150, 3370, 2250, 3370, C.rule, 2);

  s += text(150, 3490, 'Simulanis Uno', 45, C.ink, { family: DISPLAY, weight: 650, tracking: -1.1 });
  s += text(150, 3540, 'An experience shaped through visual order.', 22, C.muted, { family: UTILITY });
  s += text(150, 3605, 'EXPERIENCE DESIGN  ·  SELECTED WORK', 15, C.ink, { family: UTILITY, weight: 700, tracking: 1.9 });
  s += rect(1040, 3430, 620, 240, '#1c252b', { filter: 'url(#softShadow)' });
  s += unoArt(1040, 3430, 620, 240, true);
  s += line(1710, 3430, 1710, 3670, C.rule, 2);
  s += text(1780, 3510, '03', 18, C.cobalt, { family: UTILITY, weight: 700, tracking: 2 });
  s += text(1780, 3556, 'OPEN PROJECT  ↗', 16, C.ink, { family: UTILITY, weight: 700, tracking: 2 });

  // Footer shows the method as a final typographic cadence rather than another component block.
  s += line(150, 3780, 2250, 3780, C.rule, 2);
  s += label(150, 3850, 'The method', C.muted);
  s += text(2250, 3850, 'Good design gives an idea somewhere to stand.', 21, C.ink, { family: EDITORIAL, italic: true, anchor: 'end' });
  s += text(150, 3940, 'Find the signal', 30, C.ink, { family: DISPLAY, weight: 600, tracking: -0.6 });
  s += text(800, 3940, 'Shape the system', 30, C.ink, { family: DISPLAY, weight: 600, tracking: -0.6 });
  s += text(1500, 3940, 'Make it persuasive', 30, C.ink, { family: DISPLAY, weight: 600, tracking: -0.6 });
  return s + svgEnd();
}

const svg = mockupV2();
fs.writeFileSync(path.join(OUT, 'portfolio-b-the-fold-v2.svg'), svg, 'utf8');
console.log('Wrote portfolio-b-the-fold-v2.svg');
