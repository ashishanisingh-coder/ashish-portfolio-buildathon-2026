const fs = require('fs');
const path = require('path');

const W = 2400;
const H = 3600;
const OUT = __dirname;

const C = {
  carbon: '#0c1113',
  carbon2: '#12191b',
  ink: '#15191b',
  paper: '#f2f3ef',
  paper2: '#e7eae5',
  rule: '#cbd1cb',
  graphite: '#596260',
  white: '#f7f8f5',
  cobalt: '#4158dc',
  blue: '#1e4b9e',
  cyan: '#8ad4d8',
  coral: '#d77361',
  yellow: '#d8b954',
  lilac: '#b5b9e8',
  mint: '#a4c9af',
};

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function tag(name, attrs = {}, content = '') {
  const attrString = Object.entries(attrs)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}="${esc(value)}"`)
    .join(' ');
  return `<${name}${attrString ? ` ${attrString}` : ''}>${content}</${name}>`;
}

function rect(x, y, w, h, fill, extra = {}) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${attrs(extra)}/>`;
}

function line(x1, y1, x2, y2, stroke = C.rule, width = 2, extra = {}) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"${attrs(extra)}/>`;
}

function attrs(obj = {}) {
  return Object.entries(obj)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => ` ${key}="${esc(value)}"`)
    .join('');
}

function text(x, y, value, size, fill = C.ink, extra = {}) {
  const {
    weight = 400,
    family = 'Helvetica Neue, Arial, sans-serif',
    anchor = 'start',
    tracking = 0,
    opacity = 1,
    italic = false,
    transform,
  } = extra;
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}" font-size="${size}px" font-weight="${weight}" text-anchor="${anchor}" letter-spacing="${tracking}px" opacity="${opacity}"${italic ? ' font-style="italic"' : ''}${transform ? ` transform="${transform}"` : ''}>${esc(value)}</text>`;
}

function multiline(x, y, lines, size, fill = C.ink, lineHeight = 1.08, extra = {}) {
  return lines.map((value, i) => text(x, y + i * size * lineHeight, value, size, fill, extra)).join('');
}

function smallLabel(x, y, value, fill = C.graphite, extra = {}) {
  return text(x, y, value.toUpperCase(), 20, fill, { weight: 600, tracking: 2.5, ...extra });
}

function pill(x, y, value, fill = C.cobalt, textFill = C.white, width = 170) {
  return rect(x, y - 26, width, 42, fill, { rx: 21 }) + text(x + width / 2, y + 2, value, 18, textFill, { weight: 600, anchor: 'middle', tracking: 1 });
}

function svgStart(background = C.paper) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="heroGlow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#182427"/>
      <stop offset="0.62" stop-color="#0c1113"/>
      <stop offset="1" stop-color="#080b0c"/>
    </linearGradient>
    <linearGradient id="cobaltFade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6c7eff"/>
      <stop offset="1" stop-color="#2636ad"/>
    </linearGradient>
    <linearGradient id="paperShadow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.14"/>
    </linearGradient>
    <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="34" stdDeviation="28" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.16"/>
    </filter>
    <clipPath id="roundClip"><rect x="0" y="0" width="1" height="1" rx="24"/></clipPath>
  </defs>
  ${rect(0, 0, W, H, background)}`;
}

function svgEnd() {
  return '</svg>';
}

function frame(x, y, w, h, fill = C.paper, stroke = 'none', radius = 0, extra = {}) {
  return rect(x, y, w, h, fill, { rx: radius, stroke, 'stroke-width': stroke === 'none' ? undefined : 2, ...extra });
}

function miniGrid(x, y, w, h, color = C.rule, step = 64, opacity = 0.35) {
  let output = '';
  for (let gx = x; gx <= x + w; gx += step) output += line(gx, y, gx, y + h, color, 1, { opacity });
  for (let gy = y; gy <= y + h; gy += step) output += line(x, gy, x + w, gy, color, 1, { opacity });
  return output;
}

function projectProxy(name, x, y, w, h, theme = 'india', opts = {}) {
  const border = opts.border || C.white;
  const labelColor = opts.labelColor || C.white;
  const radius = opts.radius || 0;
  let output = frame(x, y, w, h, C.carbon2, border, radius, opts.shadow ? { filter: 'url(#softShadow)' } : {});

  if (theme === 'india') {
    output += frame(x, y, w, h, '#17252a', 'none', radius);
    output += rect(x + w * 0.08, y + h * 0.1, w * 0.18, h * 0.8, C.coral);
    output += rect(x + w * 0.29, y + h * 0.1, w * 0.18, h * 0.8, C.yellow);
    output += rect(x + w * 0.50, y + h * 0.1, w * 0.18, h * 0.8, C.cobalt);
    output += rect(x + w * 0.71, y + h * 0.1, w * 0.18, h * 0.8, C.cyan);
    output += line(x + w * 0.08, y + h * 0.28, x + w * 0.89, y + h * 0.28, C.white, 2, { opacity: 0.75 });
    output += line(x + w * 0.08, y + h * 0.54, x + w * 0.89, y + h * 0.54, C.white, 2, { opacity: 0.75 });
    output += text(x + w * 0.08, y + h * 0.91, 'INDIA / IN TRANSITION', Math.max(16, w * 0.018), C.white, { weight: 600, tracking: 2 });
  } else if (theme === 'rotavirus') {
    output += frame(x, y, w, h, '#e1e9ef', 'none', radius);
    output += miniGrid(x + w * 0.1, y + h * 0.1, w * 0.8, h * 0.8, '#9eb3bf', Math.max(30, w * 0.06), 0.5);
    const r = Math.min(w, h) * 0.18;
    output += `<circle cx="${x + w * 0.36}" cy="${y + h * 0.47}" r="${r}" fill="${C.cobalt}" opacity="0.92"/>`;
    output += `<circle cx="${x + w * 0.60}" cy="${y + h * 0.43}" r="${r * 0.72}" fill="${C.coral}" opacity="0.9"/>`;
    output += `<circle cx="${x + w * 0.55}" cy="${y + h * 0.67}" r="${r * 0.46}" fill="${C.yellow}" opacity="0.95"/>`;
    output += line(x + w * 0.28, y + h * 0.28, x + w * 0.68, y + h * 0.64, C.ink, 3, { opacity: 0.45 });
    output += text(x + w * 0.1, y + h * 0.9, 'ROTAVIRUS / INFORMATION', Math.max(16, w * 0.017), C.ink, { weight: 600, tracking: 1.7 });
  } else if (theme === 'philips') {
    output += frame(x, y, w, h, '#d7e4ee', 'none', radius);
    output += rect(x + w * 0.1, y + h * 0.16, w * 0.8, h * 0.5, C.blue, { rx: Math.min(20, w * 0.02) });
    output += rect(x + w * 0.18, y + h * 0.24, w * 0.37, h * 0.34, '#f5f7f5', { rx: Math.min(12, w * 0.012) });
    output += rect(x + w * 0.60, y + h * 0.24, w * 0.22, h * 0.34, C.cyan, { rx: Math.min(12, w * 0.012) });
    output += line(x + w * 0.18, y + h * 0.72, x + w * 0.82, y + h * 0.72, C.blue, 4, { opacity: 0.7 });
    output += text(x + w * 0.1, y + h * 0.9, 'PHILIPS / SELECTED WORK', Math.max(16, w * 0.017), C.blue, { weight: 600, tracking: 1.7 });
  } else {
    output += frame(x, y, w, h, '#202933', 'none', radius);
    output += rect(x + w * 0.13, y + h * 0.14, w * 0.74, h * 0.72, C.lilac, { rx: Math.min(22, w * 0.025), opacity: 0.9 });
    output += rect(x + w * 0.20, y + h * 0.23, w * 0.56, h * 0.48, '#31414e', { rx: Math.min(18, w * 0.02) });
    output += line(x + w * 0.29, y + h * 0.35, x + w * 0.66, y + h * 0.35, C.white, 4, { opacity: 0.85 });
    output += line(x + w * 0.29, y + h * 0.47, x + w * 0.59, y + h * 0.47, C.white, 4, { opacity: 0.5 });
    output += `<circle cx="${x + w * 0.68}" cy="${y + h * 0.66}" r="${Math.min(42, w * 0.06)}" fill="${C.cobalt}"/>`;
    output += text(x + w * 0.13, y + h * 0.91, 'SIMULANIS UNO / SELECTED', Math.max(16, w * 0.016), labelColor, { weight: 600, tracking: 1.5 });
  }
  return output;
}

function board(x, y, w, h, rotation, theme, label, opacity = 1) {
  const transform = `rotate(${rotation} ${x + w / 2} ${y + h / 2})`;
  let output = `<g transform="${transform}" opacity="${opacity}" filter="url(#shadow)">`;
  output += frame(x, y, w, h, C.paper, 'none', 10);
  output += projectProxy(label, x + 34, y + 34, w - 68, h - 120, theme, { radius: 4 });
  output += text(x + 38, y + h - 42, label, 20, C.ink, { weight: 600, tracking: 1.2 });
  output += '</g>';
  return output;
}

function footerLine(y, label = 'Portfolio study / 2026') {
  return line(150, y, W - 150, y, C.rule, 2) + text(150, y + 42, label, 20, C.graphite, { tracking: 1.5 }) + text(W - 150, y + 42, 'Ashish Kumar Singh', 20, C.graphite, { anchor: 'end', tracking: 1.5 });
}

function mockupA() {
  let s = svgStart(C.paper);
  s += frame(0, 0, W, 1200, 'url(#heroGlow)');
  s += text(150, 106, 'ASHISH KUMAR SINGH', 22, C.white, { weight: 600, tracking: 2.7, family: 'Instrument Sans, Helvetica Neue, sans-serif' });
  s += text(2250, 106, 'WORK   THINKING   ABOUT   CONTACT', 21, C.white, { weight: 500, tracking: 2.1, anchor: 'end', opacity: 0.86 });
  s += line(150, 148, 2250, 148, '#364145', 2);
  s += smallLabel(150, 272, 'Selected visual work', '#9ba9aa');
  s += multiline(150, 470, ['Visual systems', 'for complex ideas.'], 136, C.white, 1.0, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif', tracking: -4 });
  s += text(154, 795, 'Presentation / information / visual communication', 30, '#c3cccc', { tracking: 0.2 });
  s += text(154, 930, 'A considered archive of selected design work.', 25, '#8d9a9b');
  s += line(154, 1020, 346, 1020, C.cobalt, 5);
  s += text(154, 1070, 'SCROLL TO ENTER THE WORK', 19, '#9ba9aa', { weight: 600, tracking: 2.3 });

  s += board(1330, 282, 548, 732, -8, 'india', 'India in Transition', 1);
  s += board(1518, 222, 548, 732, 7, 'rotavirus', 'Rotavirus', 0.72);
  s += board(1165, 350, 548, 732, 4, 'philips', 'Philips', 0.42);
  s += board(1680, 380, 468, 648, 12, 'uno', 'Simulanis Uno', 0.3);
  s += text(2130, 308, '04', 21, '#738184', { weight: 600, tracking: 2 });
  s += text(2130, 342, 'PROJECTS', 17, '#738184', { weight: 600, tracking: 2.6 });

  s += frame(0, 1200, W, 2400, C.paper);
  s += smallLabel(150, 1338, 'Selected work', C.graphite);
  s += text(2250, 1338, 'A / SPATIAL ARCHIVE', 18, C.graphite, { weight: 600, tracking: 2.3, anchor: 'end' });
  s += line(150, 1370, 2250, 1370, C.rule, 2);

  s += projectProxy('India in Transition', 150, 1500, 1280, 720, 'india', { radius: 2, shadow: true });
  s += smallLabel(1545, 1550, 'Featured project', C.cobalt);
  s += text(1545, 1655, 'India in', 88, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif', tracking: -2 });
  s += text(1545, 1750, 'Transition', 88, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif', tracking: -2 });
  s += pill(1548, 1868, 'WORK IN PROGRESS', C.ink, C.paper, 238);
  s += multiline(1545, 2045, ['A developing visual narrative shown', 'with the thinking beside the artifact.'], 29, C.graphite, 1.35, { family: 'Helvetica Neue, Arial, sans-serif' });
  s += line(1545, 2205, 2072, 2205, C.rule, 2);
  s += text(1545, 2260, 'VIEW CASE STUDY', 19, C.ink, { weight: 600, tracking: 2.2 });
  s += text(2115, 2260, '↗', 28, C.cobalt, { weight: 600, anchor: 'end' });

  s += smallLabel(150, 2470, 'The archive', C.graphite);
  s += text(2250, 2470, 'Three more projects / one clear index', 21, C.graphite, { anchor: 'end' });
  s += line(150, 2502, 2250, 2502, C.rule, 2);
  const rows = [
    ['Rotavirus', 'Information design / public-health communication', 'rotavirus', '01'],
    ['Philips', 'Selected visual and presentation work', 'philips', '02'],
    ['Simulanis Uno', 'Selected product or experience work', 'uno', '03'],
  ];
  rows.forEach((row, i) => {
    const y = 2528 + i * 245;
    s += line(150, y + 210, 2250, y + 210, C.rule, 2);
    s += text(150, y + 62, row[3], 18, C.cobalt, { weight: 600, tracking: 1.8 });
    s += text(240, y + 68, row[0], 45, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif', tracking: -1 });
    s += text(240, y + 116, row[1], 23, C.graphite, { tracking: 0.1 });
    s += text(240, y + 172, 'OPEN PROJECT  ↗', 17, C.ink, { weight: 600, tracking: 2.1 });
    s += projectProxy(row[0], 1810, y + 20, 370, 165, row[2], { radius: 0 });
  });

  s += smallLabel(150, 3370, 'How the work is shaped', C.graphite);
  s += line(150, 3402, 2250, 3402, C.rule, 2);
  s += text(150, 3482, 'Brief', 34, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif' });
  s += text(780, 3482, 'System', 34, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif' });
  s += text(1410, 3482, 'Evidence', 34, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif' });
  s += text(150, 3530, 'What needed to become clear.', 20, C.graphite);
  s += text(780, 3530, 'The design decisions that created order.', 20, C.graphite);
  s += text(1410, 3530, 'The artifacts that carry the idea.', 20, C.graphite);
  return s + svgEnd();
}

function mockupB() {
  let s = svgStart(C.paper);
  s += frame(0, 0, W, 1210, 'url(#heroGlow)');
  s += text(150, 112, 'ASHISH KUMAR SINGH', 22, C.white, { weight: 600, tracking: 2.7, family: 'Instrument Sans, Helvetica Neue, sans-serif' });
  s += text(2250, 112, 'SELECTED WORK     METHOD     PROFILE     CONTACT', 20, C.white, { weight: 500, tracking: 1.8, anchor: 'end', opacity: 0.84 });
  s += line(150, 152, 2250, 152, '#364145', 2);
  s += smallLabel(150, 302, 'The fold / typography first', '#9ba9aa');
  s += multiline(150, 510, ['I design the', 'structure', 'behind the story.'], 126, C.white, 0.93, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif', tracking: -4 });
  s += text(158, 1008, 'Presentation, information and visual systems', 28, '#c3cccc');
  s += text(158, 1050, 'for ideas that need to hold together.', 28, '#c3cccc');

  // A folded sheet with three planes.
  s += `<g filter="url(#shadow)">
    <polygon points="1500,255 2040,370 2010,955 1465,830" fill="#e8e9e2"/>
    <polygon points="1465,830 2010,955 1790,1080 1248,954" fill="#c4c9c3"/>
    <polygon points="1248,954 1465,830 1500,255 1270,405" fill="#f5f6f1"/>
  </g>`;
  s += projectProxy('India in Transition', 1300, 356, 610, 472, 'india', { radius: 2 });
  s += line(1500, 260, 1465, 830, '#ffffff', 2, { opacity: 0.7 });
  s += text(1255, 1014, 'OPENING SPREAD / 01', 18, '#9ba9aa', { weight: 600, tracking: 2.2 });
  s += text(2002, 1040, 'THE FOLD', 18, '#9ba9aa', { weight: 600, tracking: 2.2, anchor: 'end' });

  s += frame(0, 1210, W, 2390, C.paper);
  s += smallLabel(150, 1350, 'The first spread', C.graphite);
  s += text(2250, 1350, 'B / THE FOLD', 18, C.graphite, { weight: 600, tracking: 2.3, anchor: 'end' });
  s += line(150, 1382, 2250, 1382, C.rule, 2);

  s += smallLabel(150, 1480, 'India in Transition', C.cobalt);
  s += pill(150, 1540, 'WORK IN PROGRESS', C.ink, C.paper, 238);
  s += text(150, 1695, 'A visual narrative', 76, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif', tracking: -2 });
  s += text(150, 1775, 'still taking shape.', 76, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif', tracking: -2 });
  s += text(150, 1870, 'The image carries the weight. The caption names the decision.', 25, C.graphite);
  s += projectProxy('India in Transition', 1030, 1465, 1120, 600, 'india', { radius: 1, shadow: true });
  s += text(1032, 2105, 'ARTIFACT / VISUAL PROXY UNTIL PROJECT ASSETS ARE SUPPLIED', 16, C.graphite, { weight: 600, tracking: 1.8 });
  s += line(150, 2210, 2250, 2210, C.rule, 2);

  s += smallLabel(150, 2320, 'The following folds', C.graphite);
  s += text(2250, 2320, 'One system / different visual temperatures', 21, C.graphite, { anchor: 'end' });
  s += line(150, 2352, 2250, 2352, C.rule, 2);
  s += projectProxy('Rotavirus', 150, 2410, 820, 430, 'rotavirus', { radius: 0 });
  s += smallLabel(1060, 2480, 'Rotavirus', C.cobalt);
  s += text(1060, 2578, 'Make complexity', 57, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif', tracking: -1 });
  s += text(1060, 2642, 'readable.', 57, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif', tracking: -1 });
  s += text(1060, 2740, 'Information design / selected work', 24, C.graphite);
  s += line(1060, 2810, 1670, 2810, C.rule, 2);
  s += text(1060, 2860, 'OPEN PROJECT  ↗', 18, C.ink, { weight: 600, tracking: 2.1 });

  s += line(150, 2960, 2250, 2960, C.rule, 2);
  s += projectProxy('Philips', 150, 3040, 820, 360, 'philips', { radius: 0 });
  s += projectProxy('Simulanis Uno', 1060, 3040, 510, 360, 'uno', { radius: 0 });
  s += smallLabel(1630, 3110, 'Selected systems', C.cobalt);
  s += text(1630, 3200, 'Philips', 49, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif' });
  s += text(1630, 3270, 'Simulanis Uno', 49, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif' });
  s += text(1630, 3360, 'The page turns only when the work earns it.', 23, C.graphite);
  s += footerLine(3480, 'Portfolio study / The Fold / 2026');
  return s + svgEnd();
}

function mockupC() {
  let s = svgStart(C.paper);
  s += frame(0, 0, W, 1260, C.carbon);
  s += frame(0, 0, 430, 1260, C.carbon2);
  s += line(430, 0, 430, 1260, '#344043', 2);
  s += text(112, 112, 'AKS', 24, C.white, { weight: 700, tracking: 4, family: 'Instrument Sans, Helvetica Neue, sans-serif' });
  s += text(112, 175, 'VISUAL DESIGNER', 16, '#8f9c9e', { weight: 600, tracking: 2.2 });
  s += line(112, 230, 318, 230, '#465458', 2);
  s += smallLabel(112, 330, 'Work index', '#9ba9aa');
  const index = [
    ['India in Transition', '01'],
    ['Rotavirus', '02'],
    ['Philips', '03'],
    ['Simulanis Uno', '04'],
  ];
  index.forEach((item, i) => {
    const y = 470 + i * 112;
    s += text(112, y, item[1], 16, i === 0 ? C.cobalt : '#6f7d7e', { weight: 600, tracking: 2.2 });
    s += text(162, y, item[0], 25, i === 0 ? C.white : '#9ba9aa', { weight: i === 0 ? 600 : 400, family: 'Instrument Sans, Helvetica Neue, sans-serif' });
    if (i === 0) s += line(112, y + 28, 360, y + 28, C.cobalt, 4);
  });
  s += text(112, 1010, 'WORK / APPROACH / CONTACT', 16, '#738184', { weight: 600, tracking: 2.2 });
  s += text(112, 1165, 'THE SIGNAL RAIL', 16, '#738184', { weight: 600, tracking: 2.2 });

  s += text(590, 112, 'WORK', 18, '#aab6b7', { weight: 600, tracking: 2.7 });
  s += text(2250, 112, '01 / 04', 18, '#aab6b7', { weight: 600, tracking: 2.4, anchor: 'end' });
  s += line(590, 152, 2250, 152, '#344043', 2);
  s += smallLabel(590, 322, 'Active surface', '#9ba9aa');
  s += multiline(590, 520, ['Make the', 'signal visible.'], 128, C.white, 0.98, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif', tracking: -4 });
  s += text(592, 860, 'The work index stays fixed. The image changes focus.', 25, '#aebbbb');
  s += text(592, 960, 'Selected visual systems / presentation / information', 22, '#718082');
  s += line(592, 1032, 810, 1032, C.cobalt, 5);
  s += text(592, 1090, 'OPEN ACTIVE PROJECT  ↗', 17, '#c4cccc', { weight: 600, tracking: 2.2 });

  // Tilted active surface.
  s += `<g transform="rotate(5 1730 650)" filter="url(#shadow)">`;
  s += frame(1210, 248, 1000, 810, '#d7dad2', 'none', 4);
  s += frame(1250, 288, 920, 620, C.carbon, 'none', 2);
  s += projectProxy('India in Transition', 1292, 330, 836, 500, 'india', { radius: 2 });
  s += text(1292, 982, 'INDIA IN TRANSITION / WORK IN PROGRESS', 18, C.ink, { weight: 600, tracking: 1.8 });
  s += '</g>';
  s += text(2055, 1110, 'SLIGHT DEPTH / NO PERPETUAL SPIN', 16, '#718082', { weight: 600, tracking: 2, anchor: 'end' });

  s += frame(0, 1260, W, 2340, C.paper);
  s += frame(0, 1260, 430, 2340, '#e2e6e0');
  s += text(170, 3470, 'PROJECT', 18, C.graphite, { weight: 600, tracking: 2.8, transform: 'rotate(-90 170 3470)' });
  s += text(250, 3410, 'ROOMS', 46, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif', tracking: -1, transform: 'rotate(-90 250 3410)' });
  s += line(430, 1260, 430, 3600, C.rule, 2);

  s += smallLabel(590, 1412, 'India in Transition / active project', C.cobalt);
  s += text(590, 1535, 'A visual specimen', 72, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif', tracking: -2 });
  s += text(590, 1610, 'with the caption kept short.', 72, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif', tracking: -2 });
  s += text(590, 1690, 'Work in progress / narrative system / selected development', 23, C.graphite);
  s += projectProxy('India in Transition', 590, 1785, 1200, 760, 'india', { radius: 1, shadow: true });
  s += projectProxy('Rotavirus', 1870, 1785, 380, 330, 'rotavirus', { radius: 1 });
  s += projectProxy('Philips', 1870, 2215, 380, 330, 'philips', { radius: 1 });

  s += smallLabel(590, 2715, 'The rail stays stable', C.graphite);
  s += line(590, 2747, 2250, 2747, C.rule, 2);
  s += text(590, 2840, 'Clarify', 40, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif' });
  s += text(1180, 2840, 'Compose', 40, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif' });
  s += text(1810, 2840, 'Deliver', 40, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif' });
  s += text(590, 2900, 'Find the signal inside the complexity.', 20, C.graphite);
  s += text(1180, 2900, 'Build hierarchy, rhythm and visual order.', 20, C.graphite);
  s += text(1810, 2900, 'Make the idea work in the real world.', 20, C.graphite);

  s += line(590, 3045, 2250, 3045, C.rule, 2);
  s += smallLabel(590, 3135, 'Other rooms', C.graphite);
  s += text(590, 3230, 'Rotavirus', 42, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif' });
  s += text(1180, 3230, 'Philips', 42, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif' });
  s += text(1640, 3230, 'Simulanis Uno', 42, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif' });
  s += footerLine(3478, 'Portfolio study / The Signal Rail / 2026');
  return s + svgEnd();
}

function mockupD() {
  let s = svgStart(C.paper);
  s += frame(0, 0, W, 1300, '#0b0f11');
  s += text(150, 112, 'ASHISH KUMAR SINGH', 22, C.white, { weight: 600, tracking: 2.7, family: 'Instrument Sans, Helvetica Neue, sans-serif' });
  s += text(2250, 112, 'OPENING     EXHIBITS     THINKING     CONTACT', 20, C.white, { weight: 500, tracking: 2, anchor: 'end', opacity: 0.84 });
  s += line(150, 152, 2250, 152, '#364145', 2);
  s += smallLabel(150, 318, 'The exhibition / opening stage', '#9ba9aa');
  s += multiline(150, 540, ['Clear thinking,', 'given a visual form.'], 112, C.white, 1.03, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif', tracking: -3 });
  s += text(154, 868, 'A selected portfolio of presentation, information', 26, '#c3cccc');
  s += text(154, 912, 'and visual design.', 26, '#c3cccc');
  s += text(154, 1075, 'ENTER THE EXHIBITION  ↓', 18, '#c3cccc', { weight: 600, tracking: 2.2 });

  // Exhibition plinth and luminous project cover.
  s += `<g filter="url(#shadow)">
    <polygon points="1450,420 2070,420 2185,1030 1325,1030" fill="#1d2527"/>
    <polygon points="1325,1030 2185,1030 1970,1150 1120,1150" fill="#293336"/>
    <polygon points="1120,1150 1325,1030 1450,420 1260,520" fill="#3b4748"/>
  </g>`;
  s += frame(1390, 300, 510, 710, '#f2f3ef', 'none', 3, { filter: 'url(#softShadow)' });
  s += projectProxy('India in Transition', 1430, 340, 430, 570, 'india', { radius: 1 });
  s += text(1430, 963, 'INDIA IN TRANSITION', 18, C.ink, { weight: 600, tracking: 1.8 });
  s += text(2068, 1185, 'ONE LIGHTBOX / FOUR STORIES', 16, '#738184', { weight: 600, tracking: 2.1, anchor: 'end' });

  s += frame(0, 1300, W, 2300, C.paper);
  s += smallLabel(150, 1435, 'Exhibit one', C.graphite);
  s += text(2250, 1435, 'D / THE EXHIBITION', 18, C.graphite, { weight: 600, tracking: 2.3, anchor: 'end' });
  s += line(150, 1467, 2250, 1467, C.rule, 2);

  s += text(150, 1600, 'India in', 83, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif', tracking: -2 });
  s += text(150, 1692, 'Transition', 83, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif', tracking: -2 });
  s += pill(154, 1805, 'WORK IN PROGRESS', C.ink, C.paper, 238);
  s += multiline(150, 1980, ['The question, the visual decision,', 'the artifact still taking shape.'], 27, C.graphite, 1.35);
  s += projectProxy('India in Transition', 1010, 1530, 1120, 700, 'india', { radius: 1, shadow: true });
  s += text(1010, 2280, 'A supplied project image will replace this art-direction proxy.', 19, C.graphite, { tracking: 0.3 });

  s += line(150, 2415, 2250, 2415, C.rule, 2);
  s += smallLabel(150, 2505, 'Following rooms', C.graphite);
  s += text(2250, 2505, 'Each room changes the crop and visual temperature', 21, C.graphite, { anchor: 'end' });
  const rooms = [
    ['Rotavirus', 'Information made legible', 'rotavirus', 2655],
    ['Philips', 'A visual system in selected form', 'philips', 2880],
    ['Simulanis Uno', 'An experience shaped through design', 'uno', 3105],
  ];
  rooms.forEach((room) => {
    s += line(150, room[3] - 34, 2250, room[3] - 34, C.rule, 2);
    s += text(150, room[3] + 34, room[0], 41, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif' });
    s += text(150, room[3] + 76, room[1], 21, C.graphite);
    s += projectProxy(room[0], 1600, room[3] - 4, 510, 160, room[2], { radius: 0 });
    s += text(2250, room[3] + 44, 'OPEN ROOM  ↗', 17, C.ink, { weight: 600, tracking: 2.1, anchor: 'end' });
  });
  s += line(150, 3345, 2250, 3345, C.rule, 2);
  s += text(150, 3450, 'Good design gives an idea somewhere to stand.', 43, C.ink, { weight: 600, family: 'Instrument Sans, Helvetica Neue, sans-serif', tracking: -1 });
  s += footerLine(3530, 'Portfolio study / The Exhibition / 2026');
  return s + svgEnd();
}

const outputs = {
  'portfolio-a-spatial-archive.svg': mockupA(),
  'portfolio-b-the-fold.svg': mockupB(),
  'portfolio-c-signal-rail.svg': mockupC(),
  'portfolio-d-the-exhibition.svg': mockupD(),
};

for (const [filename, content] of Object.entries(outputs)) {
  fs.writeFileSync(path.join(OUT, filename), content, 'utf8');
}

console.log(`Wrote ${Object.keys(outputs).length} SVG mockups to ${OUT}`);
