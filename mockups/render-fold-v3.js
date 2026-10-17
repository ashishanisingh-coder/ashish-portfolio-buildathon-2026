const fs = require('fs');
const path = require('path');

const W = 2400;
const H = 6900;
const OUT = __dirname;
const ASSET_ROOT = path.join(__dirname, '..', 'assets', 'actual');

const C = {
  night: '#071013',
  night2: '#142225',
  paper: '#f6f5ef',
  paper2: '#e9eeea',
  ink: '#111719',
  muted: '#687575',
  rule: '#c5cfca',
  white: '#fbfcf7',
  cobalt: '#4057d6',
  cobalt2: '#2639a8',
  gold: '#b47b21',
  orange: '#f08b28',
  teal: '#0b9caf',
  blue: '#174fd0',
  lilac: '#aeb7ee',
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
  return text(x, y, value.toUpperCase(), 18, fill, { family: UTILITY, weight: 650, tracking: 2.4, ...extra });
}

function ruleLabel(y, left, right) {
  return label(150, y, left) + text(2250, y, right, 18, C.muted, { family: UTILITY, weight: 650, tracking: 2.1, anchor: 'end' }) + line(150, y + 32, 2250, y + 32, C.rule, 2);
}

function pill(x, y, value, width = 245, fill = C.ink, textFill = C.paper) {
  return rect(x, y - 25, width, 40, fill, { rx: 20 }) + text(x + width / 2, y + 2, value, 16, textFill, { family: UTILITY, weight: 700, tracking: 1.25, anchor: 'middle' });
}

function dataUri(relativePath) {
  const absolutePath = path.join(ASSET_ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`Missing actual asset: ${absolutePath}`);
  const ext = path.extname(absolutePath).toLowerCase().replace('.', '');
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
  return `data:${mime};base64,${fs.readFileSync(absolutePath).toString('base64')}`;
}

const IMG = {
  philips: dataUri('philips/case-study.jpg'),
  indiaCover: dataUri('india/cover-hero.jpg'),
  indiaBig: dataUri('india/big-picture.jpg'),
  indiaWorkWide: dataUri('india/work-system-wide.png'),
  indiaMap: dataUri('india/geography-map.jpg'),
  indiaSynthesis: dataUri('india/synthesis-montage.jpg'),
  rotavirus: dataUri('rotavirus/cover.jpg'),
  rotavirusDetail: dataUri('rotavirus/takeaways.png'),
  rotavirusArchive: dataUri('rotavirus/slide-archive.jpg'),
  uno: dataUri('uno/case-study.jpg'),
};

let clipIndex = 0;
function image(x, y, w, h, source, options = {}) {
  const {
    rx = 0,
    preserve = 'xMidYMid slice',
    opacity = 1,
    transform,
    filter,
    stroke = 'none',
    strokeWidth = 0,
  } = options;
  const clipId = `asset-clip-${clipIndex++}`;
  const transformAttr = transform ? ` transform="${esc(transform)}"` : '';
  return `<defs><clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/></clipPath></defs><image href="${IMG[source]}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${preserve}" opacity="${opacity}" clip-path="url(#${clipId})"${filter ? ` filter="${filter}"` : ''}${transformAttr} stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
}

function imageFrame(x, y, w, h, source, options = {}) {
  const { rx = 0, shadow = true, fill = C.white, preserve = 'xMidYMid slice', transform } = options;
  let out = rect(x, y, w, h, fill, { rx, filter: shadow ? 'url(#softShadow)' : undefined });
  out += image(x + 18, y + 18, w - 36, h - 36, source, { rx: Math.max(0, rx - 3), preserve, transform });
  return out;
}

function svgStart() {
  clipIndex = 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="nightGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1c3033"/>
      <stop offset="0.48" stop-color="#071013"/>
      <stop offset="1" stop-color="#040708"/>
    </linearGradient>
    <linearGradient id="paperFace" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fffefa"/>
      <stop offset="0.72" stop-color="#e7ebe5"/>
      <stop offset="1" stop-color="#bec9c2"/>
    </linearGradient>
    <linearGradient id="paperEdge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f8f8f2"/>
      <stop offset="1" stop-color="#9aa8a2"/>
    </linearGradient>
    <filter id="deepShadow" x="-40%" y="-40%" width="190%" height="200%">
      <feDropShadow dx="0" dy="34" stdDeviation="32" flood-color="#000000" flood-opacity="0.38"/>
    </filter>
    <filter id="softShadow" x="-30%" y="-30%" width="170%" height="190%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
    <filter id="ambientBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="34"/>
    </filter>
  </defs>
  ${rect(0, 0, W, H, C.paper)}`;
}

function svgEnd() {
  return '</svg>';
}

function heroObject() {
  let out = '';
  out += `<ellipse cx="1665" cy="1080" rx="590" ry="74" fill="#000000" opacity="0.34" filter="url(#ambientBlur)"/>`;
  out += `<g filter="url(#deepShadow)">`;
  // A calmer open folio: separate leaves, visible paper edges, centre crease and a restrained stack.
  out += polygon('1182,280 2028,390 1942,1100 1110,974', 'url(#paperFace)');
  out += polygon('1110,974 1942,1100 1888,1148 1058,1018', 'url(#paperEdge)');
  out += polygon('1058,1018 1110,974 1182,280 1128,336', '#aebbb4');
  out += polygon('1051,1000 1888,1128 1880,1148 1044,1020', '#879891', { opacity: 0.56 });
  out += line(1456, 352, 1390, 1030, '#9aa8a2', 3, { opacity: 0.72 });

  // Right leaf: Philips is the lead object, rotated only enough to read as a physical page.
  out += polygon('1456,340 2010,414 1940,1008 1392,926', '#f4f6f1');
  out += `<g transform="rotate(7 1705 704)">`;
  out += rect(1515, 472, 430, 470, '#0f1a1d', { rx: 12 });
  out += image(1531, 488, 398, 438, 'philips', { rx: 7, preserve: 'xMidYMid slice' });
  out += `</g>`;
  out += text(1514, 1004, 'PHILIPS TV & AUDIO / CASE STUDY', 14, C.ink, { family: UTILITY, weight: 600, tracking: 1.45, transform: 'rotate(7 1514 1004)' });

  // Left leaf: India is a quiet counterweight with one image and one line of annotation.
  out += polygon('1128,320 1456,364 1390,942 1066,894', '#fbfaf3');
  out += `<g transform="rotate(-6 1250 626)">`;
  out += rect(1136, 446, 286, 278, '#f0eee5', { rx: 8 });
  out += image(1148, 458, 262, 254, 'indiaCover', { rx: 4, preserve: 'xMidYMid slice' });
  out += `</g>`;
  out += text(1144, 782, 'INDIA IN TRANSITION', 13, C.ink, { family: UTILITY, weight: 600, tracking: 1.35, transform: 'rotate(-6 1144 782)' });
  out += line(1148, 820, 1358, 854, C.orange, 4, { transform: 'rotate(-6 1148 820)' });
  out += text(1144, 884, 'DEVELOPING / WIP', 12, C.muted, { family: UTILITY, weight: 600, tracking: 1.2, transform: 'rotate(-6 1144 884)' });

  // Page corners and a fine registration mark make the object feel printed rather than diagrammatic.
  out += line(1040, 298, 1080, 304, '#ffffff', 2, { opacity: 0.9 });
  out += line(1040, 298, 1034, 340, '#ffffff', 2, { opacity: 0.9 });
  out += line(2010, 372, 2050, 378, '#ffffff', 2, { opacity: 0.85 });
  out += line(2050, 378, 2044, 420, '#ffffff', 2, { opacity: 0.85 });
  out += `</g>`;
  out += line(1028, 248, 1072, 248, '#a9b8b4', 1, { opacity: 0.64 });
  out += line(1028, 248, 1028, 292, '#a9b8b4', 1, { opacity: 0.64 });
  out += line(2028, 1184, 2072, 1184, '#a9b8b4', 1, { opacity: 0.64 });
  out += line(2072, 1184, 2072, 1140, '#a9b8b4', 1, { opacity: 0.64 });
  return out;
}

function leadSection() {
  let out = '';
  out += rect(0, 1300, W, 1450, C.paper);
  out += ruleLabel(1420, 'Selected work / lead spread', 'PHILIPS TV & AUDIO — 01');
  out += label(150, 1612, 'Philips TV & Audio', C.gold, { tracking: 2.0 });
  out += text(150, 1740, 'A visual system', 74, C.ink, { family: DISPLAY, weight: 650, tracking: -2.8 });
  out += text(150, 1818, 'that travels.', 74, C.ink, { family: DISPLAY, weight: 650, tracking: -2.8 });
  out += pill(154, 1916, 'ARCHIVAL CASE STUDY', 248, C.gold, C.paper);
  out += multi(150, 2070, [
    'Campaign language shaped',
    'across screen, shelf, strip',
    'and the point of purchase.',
  ], 24, C.muted, 1.34, { family: UTILITY, weight: 450 });
  out += line(150, 2300, 620, 2300, C.rule, 2);
  out += text(150, 2358, 'VIEW CASE STUDY  ↗', 17, C.ink, { family: UTILITY, weight: 700, tracking: 2.1 });
  out += label(150, 2502, 'Selected visual communication', C.muted, { tracking: 1.65 });

  out += rect(930, 1530, 1240, 830, '#f0f3f1', { rx: 6, filter: 'url(#softShadow)' });
  out += image(960, 1560, 1180, 770, 'philips', { rx: 3, preserve: 'xMidYMid slice' });
  out += rect(960, 1560, 1180, 770, 'none', { stroke: '#ffffff', 'stroke-width': 2, opacity: 0.7 });
  out += text(960, 2408, 'SUPPLIED ASSET / PHILIPS TV & AUDIO CAMPAIGN CASE STUDY', 14, C.muted, { family: UTILITY, weight: 700, tracking: 1.55 });
  out += line(930, 2470, 2170, 2470, C.rule, 2);
  out += label(930, 2538, 'A brighter, offer-led visual language', C.muted, { tracking: 1.35 });
  return out;
}

function projectIndex() {
  let out = '';
  out += rect(0, 2750, W, 520, C.paper);
  out += ruleLabel(2860, 'Project index / actual material', 'FOUR CASE STUDIES');
  const rows = [
    { x: 150, color: C.gold, number: '01', title: 'PHILIPS TV & AUDIO', detail: 'Campaign system / archival case study', status: 'SELECTED LEAD' },
    { x: 680, color: C.orange, number: '02', title: 'INDIA IN TRANSITION', detail: 'Editorial system / developing work', status: 'WIP / DEVELOPING' },
    { x: 1210, color: C.cobalt, number: '03', title: 'ROTAVIRUS', detail: 'Information design / public-health story', status: 'SELECTED WORK' },
    { x: 1740, color: C.teal, number: '04', title: 'SIMULANIS UNO', detail: 'Experience design / 17-slide case study', status: 'SELECTED WORK' },
  ];
  rows.forEach((row) => {
    out += rect(row.x, 2970, 7, 170, row.color, { rx: 3 });
    out += text(row.x + 30, 3006, row.number, 16, row.color, { family: UTILITY, weight: 650, tracking: 1.5 });
    out += text(row.x + 30, 3054, row.title, 23, C.ink, { family: DISPLAY, weight: 540, tracking: -0.4 });
    out += text(row.x + 30, 3096, row.detail, 15, C.muted, { family: UTILITY, weight: 450, tracking: 0.2 });
    out += text(row.x + 30, 3132, row.status, 12, C.muted, { family: UTILITY, weight: 650, tracking: 1.25 });
  });
  out += line(150, 3218, 2250, 3218, C.rule, 2);
  out += text(150, 3250, 'Supplied source frames are used throughout; this index replaces the thumbnail strip with a calmer reading path.', 14, C.muted, { family: UTILITY, weight: 450, tracking: 0.25 });
  return out;
}

function archiveSection() {
  let out = '';
  out += rect(0, 3270, W, H - 3270, C.paper2);
  out += ruleLabel(3380, 'Other work / selected frames', 'THREE PROJECTS / THREE TEMPERATURES');

  // India remains a wide editorial counterweight, with more breathing room around the title.
  out += label(150, 3605, 'India in Transition', C.cobalt, { tracking: 1.8 });
  out += text(150, 3702, 'A country through', 47, C.ink, { family: DISPLAY, weight: 540, tracking: -1.3 });
  out += text(150, 3758, 'everyday life.', 47, C.ink, { family: DISPLAY, weight: 540, tracking: -1.3 });
  out += pill(154, 3840, 'DEVELOPING / WIP', 218, C.ink, C.paper);
  out += multi(150, 3954, [
    'A large editorial system',
    'for six ways of seeing',
    'India in transition.',
  ], 21, C.muted, 1.34, { family: UTILITY, weight: 450 });
  out += imageFrame(970, 3515, 1210, 590, 'indiaBig', { rx: 5, shadow: true, preserve: 'xMidYMid slice' });
  out += text(970, 4180, 'EXTRACTED FROM INDIA IN TRANSITION / SUPPLIED SOURCE FRAME', 14, C.muted, { family: UTILITY, weight: 650, tracking: 1.45 });
  out += line(150, 4240, 2250, 4240, C.rule, 2);

  // Rotavirus gets a complete editorial spread rather than a thumbnail-sized data crop.
  out += label(150, 4355, 'Rotavirus', C.cobalt, { tracking: 1.8 });
  out += text(150, 4450, 'Make complexity', 54, C.ink, { family: DISPLAY, weight: 540, tracking: -1.7 });
  out += text(150, 4512, 'readable.', 54, C.ink, { family: DISPLAY, weight: 540, tracking: -1.7 });
  out += text(2250, 4500, 'Information design / public-health story', 17, C.muted, { family: UTILITY, weight: 500, tracking: 0.4, anchor: 'end' });
  out += imageFrame(150, 4590, 1030, 660, 'rotavirus', { rx: 8, shadow: true, preserve: 'xMidYMid slice' });
  out += imageFrame(1260, 4590, 990, 660, 'rotavirusArchive', { rx: 8, shadow: true, preserve: 'xMidYMin slice' });
  out += text(150, 5302, '01 / CAMPAIGN STORY', 13, C.cobalt, { family: UTILITY, weight: 650, tracking: 1.35 });
  out += text(1260, 5302, '02 / VISUAL SYSTEM ARCHIVE', 13, C.cobalt, { family: UTILITY, weight: 650, tracking: 1.35 });
  out += line(150, 5360, 2250, 5360, C.rule, 2);

  // Uno gets a dark, generous landing page with the supplied vertical case study as a real object.
  out += rect(0, 5430, W, 1110, C.night);
  out += label(150, 5580, 'Simulanis Uno', C.orange, { tracking: 1.8 });
  out += text(150, 5698, 'One unified platform', 64, C.white, { family: DISPLAY, weight: 520, tracking: -2.0 });
  out += multi(150, 5846, [
    'Industrial training for a safer,',
    'smarter tomorrow.',
  ], 27, '#c8d2cf', 1.35, { family: EDITORIAL, italic: true, weight: 400 });
  out += line(150, 6038, 670, 6038, '#536664', 2);
  out += text(150, 6100, 'EXPERIENCE DESIGN  ·  17-SLIDE CASE STUDY  ↗', 15, '#d8e2de', { family: UTILITY, weight: 600, tracking: 1.45 });
  out += text(150, 6194, 'The interface is the story: a system for learning, operating and moving through complex training.', 17, '#93a5a0', { family: UTILITY, weight: 450, tracking: 0.15 });
  out += rect(1560, 5545, 500, 930, '#dfe6e0', { rx: 10, filter: 'url(#deepShadow)' });
  out += image(1584, 5569, 452, 882, 'uno', { rx: 5, preserve: 'xMidYMin slice' });
  out += line(1540, 5520, 1540, 6470, C.orange, 5, { opacity: 0.9 });
  out += text(1560, 6510, 'SUPPLIED 17-SLIDE CASE STUDY STRIP', 13, '#93a5a0', { family: UTILITY, weight: 650, tracking: 1.3 });

  out += line(150, 6660, 2250, 6660, C.rule, 2);
  out += label(150, 6740, 'The method', C.muted, { tracking: 1.65 });
  out += text(2250, 6740, 'Good design gives an idea somewhere to stand.', 21, C.ink, { family: EDITORIAL, italic: true, anchor: 'end' });
  return out;
}

function mockupV3() {
  let s = svgStart();
  s += rect(0, 0, W, 1300, 'url(#nightGradient)');
  s += circle(1750, 480, 470, '#2c5b61', { opacity: 0.16, filter: 'url(#ambientBlur)' });
  s += text(150, 112, 'ASHISH KUMAR SINGH', 22, C.white, { family: DISPLAY, weight: 650, tracking: 2.7 });
  s += text(2250, 112, 'SELECTED WORK     APPROACH     PROFILE     CONTACT', 18, C.white, { family: UTILITY, weight: 650, tracking: 2.0, anchor: 'end', opacity: 0.84 });
  s += line(150, 152, 2250, 152, '#334448', 2);
  s += multi(150, 452, ['I build the visual', 'structure behind', 'complex ideas.'], 96, C.white, 1.02, { family: DISPLAY, weight: 520, tracking: -2.5 });
  s += text(156, 820, 'Presentation, information and visual systems', 25, '#cbd5d2', { family: UTILITY, weight: 450 });
  s += text(156, 864, 'for ideas that need to hold together.', 25, '#cbd5d2', { family: UTILITY, weight: 450 });
  s += line(156, 1040, 384, 1040, C.orange, 5);
  s += text(156, 1100, 'OPEN THE FOLD  ↓', 16, '#dce4df', { family: UTILITY, weight: 600, tracking: 2.2 });
  s += heroObject();
  s += label(1998, 1210, '01 / 04    LEAD PROJECT: PHILIPS', '#9aa8a6', { anchor: 'end', tracking: 1.65 });
  s += leadSection();
  s += projectIndex();
  s += archiveSection();
  return s + svgEnd();
}

const svg = mockupV3();
fs.writeFileSync(path.join(OUT, 'portfolio-b-the-fold-v3.svg'), svg, 'utf8');
console.log('Wrote portfolio-b-the-fold-v3.svg');
