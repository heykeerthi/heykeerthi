// slidekit.js — collage engine for Brand Kit Studio
// Rebuilt to the interface the studio component expects.

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- themes ----------
export const THEMES = {
  ember: { label: 'Ember', primary: '#C2521F', deep: '#96401A', accent: '#EFC5A6', soft: '#F6E0CE' },
  gold:  { label: 'Gold',  primary: '#A9812F', deep: '#836322', accent: '#E6D3A4', soft: '#F1E6C8' },
  smoke: { label: 'Smoke', primary: '#4F5A66', deep: '#3B444E', accent: '#C4CDD5', soft: '#DDE3E8' },
};
export const THEME_ORDER = ['ember', 'gold', 'smoke'];

// ---------- colourways ----------
const CREAM = '#F4EDE0', OFFWHITE = '#FBF8F1', CHARCOAL = '#221713', CHARINK = '#F3E6D8';
export const COLOURWAY_ORDER = ['charcoalField', 'creamField', 'parchment', 'emberPanel'];
export function resolveCW(key, themeKey) {
  const T = THEMES[themeKey] || THEMES.ember;
  switch (key) {
    case 'charcoalField':
      return { key, label: 'Charcoal Field', bg: CHARCOAL, panel: null, ink: CHARINK, sub: 'rgba(243,230,216,0.78)', line: 'rgba(243,230,216,0.5)', gMain: T.primary, gSoft: 'rgba(243,230,216,0.28)', photoFrame: CHARINK, theme: T };
    case 'parchment':
      return { key, label: 'Parchment', bg: OFFWHITE, panel: null, ink: T.primary, sub: T.deep, line: T.accent, gMain: T.primary, gSoft: T.accent, photoFrame: '#FFFFFF', theme: T };
    case 'emberPanel':
      return { key, label: 'Ember Panel', bg: T.accent, panel: CREAM, ink: T.primary, sub: T.deep, line: T.primary, gMain: T.primary, gSoft: T.soft, photoFrame: '#FFFFFF', theme: T };
    case 'creamField':
    default:
      return { key, label: 'Cream Field', bg: CREAM, panel: null, ink: T.primary, sub: T.deep, line: T.accent, gMain: T.primary, gSoft: T.accent, photoFrame: '#FFFFFF', theme: T };
  }
}

// ---------- text helpers ----------
function wrap(str, maxChars) {
  const words = String(str || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (cur && (cur + ' ' + w).length > maxChars) { lines.push(cur); cur = w; }
    else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}
function tspans(lines, x, y, lh) {
  return lines.map((l, i) => `<tspan x="${x}" y="${y + i * lh}">${esc(l)}</tspan>`).join('');
}
const F = {
  serif: "'Playfair Display', Georgia, serif",
  script: "'Pinyon Script', cursive",
  sans: "'Archivo', sans-serif",
};

// ---------- graphics ----------
// Every render fn returns inner SVG for a 480x480 box, colored from C.
function gStarburst(C, o) {
  o = o || {};
  const points = o.points || 16, inner = (o.inner != null ? o.inner : 0.6);
  const cx = 240, cy = 240, R = 190, r = R * Math.min(0.92, Math.max(0.15, inner));
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI * i) / points - Math.PI / 2;
    const rad = i % 2 === 0 ? R : r;
    d += (i ? 'L' : 'M') + (cx + rad * Math.cos(a)).toFixed(1) + ' ' + (cy + rad * Math.sin(a)).toFixed(1);
  }
  return `<path d="${d}Z" fill="${C.gMain}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.42}" fill="${C.gSoft}"/>`;
}
function gOrbit(C, o) {
  o = o || {};
  const rings = o.rings || 3, dots = (o.dots != null ? o.dots : 4);
  const cx = 240, cy = 240;
  let s = `<circle cx="${cx}" cy="${cy}" r="26" fill="${C.gMain}"/>`;
  for (let i = 1; i <= rings; i++) {
    const r = 60 + (150 / rings) * i;
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.gMain}" stroke-width="3"/>`;
  }
  for (let j = 0; j < dots; j++) {
    const ring = 60 + (150 / rings) * (1 + (j % rings));
    const a = (Math.PI * 2 * j) / Math.max(1, dots) - Math.PI / 3;
    s += `<circle cx="${(cx + ring * Math.cos(a)).toFixed(1)}" cy="${(cy + ring * Math.sin(a)).toFixed(1)}" r="13" fill="${C.gMain}"/>`;
  }
  return s;
}
function gArcedBadge(C, o) {
  o = o || {};
  const text = (o.text || o.badgeText || 'CINDER · SUPPER · CLUB') + ' · ';
  const rep = (text.length < 26 ? text + text : text);
  return `<circle cx="240" cy="240" r="150" fill="none" stroke="${C.gMain}" stroke-width="2.5"/>
  <defs><path id="bkArc" d="M 240 100 A 140 140 0 1 1 239.9 100"/></defs>
  <g fill="${C.gMain}" font-family=${JSON.stringify(F.sans)} font-weight="800" font-size="30" letter-spacing="5">
    <text><textPath href="#bkArc">${esc(rep)}</textPath></text></g>
  <path d="M240 195 l12 30 30 4 -22 21 6 31 -26 -15 -26 15 6 -31 -22 -21 30 -4 z" fill="${C.gMain}"/>`;
}
function gWavyBlob(C, o) {
  o = o || {};
  const wobble = (o.wobble != null ? o.wobble : 0.5), n = 10;
  const cx = 240, cy = 240, base = 175;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n;
    const rad = base * (1 + wobble * 0.28 * Math.sin(i * 2.7 + 1));
    pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]);
  }
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p1 = pts[i], p2 = pts[(i + 1) % n];
    const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
    d += ` Q ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  return `<path d="${d} Z" fill="${C.gSoft}" stroke="${C.gMain}" stroke-width="3"/>`;
}
function gFlame(C) {
  return `<path d="M240 96 c14 58 66 76 66 138 a66 66 0 0 1 -132 0 c0 -34 18 -50 30 -76 8 20 22 28 22 48 a22 22 0 0 0 14 -110 z" transform="translate(0 60) scale(1.15) translate(-33 -30)" fill="${C.gMain}"/>
    <path d="M240 240 c8 26 30 34 30 62 a30 30 0 0 1 -60 0 c0 -20 12 -26 18 -40 4 10 12 14 12 22 z" fill="${C.gSoft}"/>`;
}
function gCloche(C) {
  return `<g>
    <path d="M120 300 a120 96 0 0 1 240 0 z" fill="${C.gSoft}" stroke="${C.gMain}" stroke-width="5"/>
    <circle cx="240" cy="196" r="12" fill="${C.gMain}"/>
    <line x1="96" y1="300" x2="384" y2="300" stroke="${C.gMain}" stroke-width="8" stroke-linecap="round"/>
    <path d="M150 330 h180" stroke="${C.gMain}" stroke-width="5" stroke-linecap="round" opacity="0.5"/>
  </g>`;
}
function gMenuCard(C) {
  return `<g transform="rotate(-5 240 240)">
    <rect x="160" y="120" width="160" height="240" fill="#FFFFFF" stroke="${C.gMain}" stroke-width="4"/>
    <text x="240" y="168" text-anchor="middle" font-family=${JSON.stringify(F.serif)} font-weight="800" font-size="30" fill="${C.gMain}">MENU</text>
    <line x1="190" y1="196" x2="290" y2="196" stroke="${C.gMain}" stroke-width="3"/>
    <line x1="190" y1="228" x2="290" y2="228" stroke="${C.gSoft}" stroke-width="6"/>
    <line x1="190" y1="256" x2="272" y2="256" stroke="${C.gSoft}" stroke-width="6"/>
    <line x1="190" y1="284" x2="290" y2="284" stroke="${C.gSoft}" stroke-width="6"/>
    <line x1="190" y1="312" x2="258" y2="312" stroke="${C.gSoft}" stroke-width="6"/>
    <path d="M226 336 c6 -10 22 -10 28 0" fill="none" stroke="${C.gMain}" stroke-width="3"/>
  </g>`;
}
function gMatchstick(C) {
  return `<g transform="rotate(24 240 240)">
    <rect x="228" y="150" width="24" height="220" rx="6" fill="#D8B98A"/>
    <path d="M240 96 c12 26 30 34 30 58 a30 30 0 0 1 -60 0 c0 -24 18 -32 30 -58 z" fill="${C.gMain}"/>
    <ellipse cx="240" cy="152" rx="18" ry="14" fill="${C.gSoft}"/>
  </g>`;
}
function gCastIron(C) {
  return `<g>
    <circle cx="220" cy="250" r="98" fill="${C.gMain}"/>
    <circle cx="220" cy="250" r="72" fill="${C.gSoft}"/>
    <rect x="312" y="238" width="86" height="24" rx="12" fill="${C.gMain}"/>
    <path d="M180 214 q10 -14 24 -8 M236 206 q14 -4 22 8" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.6"/>
  </g>`;
}
function gWinePair(C) {
  return `<g>
    <g transform="rotate(-8 200 240)"><path d="M168 140 h64 v40 a32 44 0 0 1 -64 0 z" fill="${C.gSoft}" stroke="${C.gMain}" stroke-width="4"/><line x1="200" y1="224" x2="200" y2="310" stroke="${C.gMain}" stroke-width="6"/><line x1="172" y1="316" x2="228" y2="316" stroke="${C.gMain}" stroke-width="6" stroke-linecap="round"/></g>
    <g transform="rotate(8 290 250)"><path d="M258 150 h64 v40 a32 44 0 0 1 -64 0 z" fill="${C.gMain}" opacity="0.85" stroke="${C.gMain}" stroke-width="4"/><line x1="290" y1="234" x2="290" y2="320" stroke="${C.gMain}" stroke-width="6"/><line x1="262" y1="326" x2="318" y2="326" stroke="${C.gMain}" stroke-width="6" stroke-linecap="round"/></g>
  </g>`;
}
function gTapeStrip(C) {
  return `<g transform="rotate(-12 240 240)">
    <rect x="110" y="205" width="260" height="70" fill="${C.gSoft}" opacity="0.9"/>
    <path d="M110 205 l-16 17 16 18 -16 17 16 18 M370 205 l16 17 -16 18 16 17 -16 18"
      fill="none" stroke="${C.gMain}" stroke-width="0" />
    <rect x="110" y="205" width="260" height="70" fill="none" stroke="${C.gMain}" stroke-width="3" stroke-dasharray="2 6"/>
  </g>`;
}
function gStickerDot(C) {
  return `<circle cx="240" cy="240" r="150" fill="${C.gMain}"/>
    <circle cx="240" cy="240" r="150" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-dasharray="4 14"/>
    <path d="M205 240 l24 24 48 -52" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function gAsterisk(C) {
  let s = '';
  for (let i = 0; i < 6; i++) {
    s += `<rect x="228" y="90" width="24" height="140" rx="12" fill="${C.gMain}" transform="rotate(${i * 30} 240 240)"/>`;
  }
  return s + `<circle cx="240" cy="240" r="34" fill="${C.gSoft}"/>`;
}
function gTicket(C) {
  return `<g transform="rotate(-6 240 240)">
    <path d="M120 190 h240 a0 0 0 0 1 0 0 v40 a22 22 0 0 0 0 44 v40 h-240 v-40 a22 22 0 0 0 0 -44 z" fill="${C.gSoft}" stroke="${C.gMain}" stroke-width="4"/>
    <line x1="290" y1="192" x2="290" y2="312" stroke="${C.gMain}" stroke-width="3" stroke-dasharray="6 8"/>
    <text x="200" y="262" text-anchor="middle" font-family=${JSON.stringify(F.sans)} font-weight="800" font-size="26" letter-spacing="3" fill="${C.gMain}">ADMIT ONE</text>
  </g>`;
}
function gPolaroidPair(C) {
  return `<g>
    <g transform="rotate(-8 210 240)"><rect x="130" y="140" width="160" height="190" fill="#FFFFFF" stroke="${C.gMain}" stroke-width="3"/><rect x="142" y="152" width="136" height="130" fill="${C.gSoft}"/><path d="M150 268 l38 -42 26 26 30 -36 34 52 z" fill="${C.gMain}" opacity="0.7"/><circle cx="196" cy="190" r="12" fill="#FFFFFF"/></g>
    <g transform="rotate(7 300 280)"><rect x="220" y="190" width="160" height="190" fill="#FFFFFF" stroke="${C.gMain}" stroke-width="3"/><rect x="232" y="202" width="136" height="130" fill="${C.gSoft}"/><path d="M240 318 l38 -42 26 26 30 -36 34 52 z" fill="${C.gMain}" opacity="0.7"/></g>
  </g>`;
}
function gStampFrame(C) {
  return `<g>
    <rect x="130" y="130" width="220" height="220" fill="#FFFFFF" stroke="${C.gMain}" stroke-width="4" stroke-dasharray="1 12" stroke-linecap="round"/>
    <rect x="150" y="150" width="180" height="180" fill="${C.gSoft}"/>
    <path d="M165 315 l52 -60 36 36 42 -50 46 74 z" fill="${C.gMain}" opacity="0.75"/>
    <circle cx="210" cy="200" r="16" fill="#FFFFFF"/>
  </g>`;
}

export const GRAPHICS = {
  starburst:    { label: 'Starburst',    cat: 'shape',  render: gStarburst },
  orbit:        { label: 'Orbit',        cat: 'shape',  render: gOrbit },
  arcedBadge:   { label: 'Arced Badge',  cat: 'shape',  render: gArcedBadge },
  wavyBlob:     { label: 'Wavy Blob',    cat: 'shape',  render: gWavyBlob },
  flame:        { label: 'Flame',        cat: 'object', render: gFlame },
  cloche:       { label: 'Cloche',       cat: 'object', render: gCloche },
  menuCard:     { label: 'Menu Card',    cat: 'object', render: gMenuCard },
  matchstick:   { label: 'Matchstick',   cat: 'object', render: gMatchstick },
  castIron:     { label: 'Cast Iron',    cat: 'object', render: gCastIron },
  winePair:     { label: 'Wine Glasses', cat: 'object', render: gWinePair },
  tapeStrip:    { label: 'Tape Strip',   cat: 'object', render: gTapeStrip },
  stickerDot:   { label: 'Sticker Dot',  cat: 'object', render: gStickerDot },
  asterisk:     { label: 'Asterisk',     cat: 'shape',  render: gAsterisk },
  ticket:       { label: 'Ticket',       cat: 'object', render: gTicket },
};
export const GRAPHIC_ORDER = ['starburst', 'orbit', 'arcedBadge', 'wavyBlob', 'flame', 'cloche', 'menuCard', 'matchstick', 'castIron', 'winePair', 'tapeStrip', 'stickerDot', 'asterisk', 'ticket'];

// ---------- shape generator ----------
export const SHAPE_LABELS = { starburst: 'Starburst', orbit: 'Orbit', arcedBadge: 'Arced Badge', wavyBlob: 'Wavy Blob' };
export const SHAPE_PARAMS = {
  starburst: [
    { key: 'points', label: 'Points', min: 5, max: 32, step: 1, def: 16 },
    { key: 'inner',  label: 'Inset',  min: 0.2, max: 0.9, step: 0.05, def: 0.6 },
  ],
  orbit: [
    { key: 'rings', label: 'Rings', min: 1, max: 5, step: 1, def: 3 },
    { key: 'dots',  label: 'Dots',  min: 0, max: 10, step: 1, def: 4 },
  ],
  arcedBadge: [
    { key: 'text', label: 'Badge text', type: 'text', def: 'CINDER · SUPPER · CLUB' },
  ],
  wavyBlob: [
    { key: 'wobble', label: 'Wobble', min: 0, max: 1, step: 0.05, def: 0.5 },
  ],
};
export function makeShape(type, opts) {
  const base = { starburst: gStarburst, orbit: gOrbit, arcedBadge: gArcedBadge, wavyBlob: gWavyBlob }[type] || gStarburst;
  const bound = Object.assign({}, opts);
  return (C) => base(C, bound);
}

// ---------- layouts ----------
export const LAYOUT_ORDER = ['cover', 'feature', 'photoContent', 'photoCollage', 'diagram', 'photoHero', 'closing'];
export const LAYOUTS = {
  cover:        { label: 'Cover',          defaultGraphic: 'cloche',      sample: { eyebrow: 'The Supper Club', headline: 'Dinner By Firelight', script: 'tonight' } },
  feature:      { label: 'Feature / Quote',defaultGraphic: 'wavyBlob',    sample: { headline: 'Eat With Your Hands', body: 'Five courses off the fire, one long table, no clocks. Dinner the old way.' } },
  photoContent: { label: 'Photo Content',  defaultGraphic: 'stampFramePhoto', sample: { eyebrow: 'On The Menu', headline: 'Charred Leeks & Ash', body: 'Cooked in the coals, finished with smoked butter and last summer\u2019s vinegar.' } },
  photoCollage: { label: 'Photo Collage',  defaultGraphic: 'polaroids',   sample: { eyebrow: 'Last Night', headline: 'Service, In Pictures', body: 'Forty chairs, one fire, and everything that came off it.' } },
  diagram:      { label: 'Diagram',        defaultGraphic: 'orbit',       sample: { eyebrow: 'The Courses', headline: 'Five Small Fires', body: 'Ember to plate in five acts \u2014 each one built on the last.' } },
  photoHero:    { label: 'Photo Hero',     defaultGraphic: 'stampFramePhoto', sample: { eyebrow: 'From The Pass', headline: 'The Ember Table' } },
  closing:      { label: 'Closing',        defaultGraphic: 'flame',       sample: { headline: 'Book A Chair', script: 'see you by the fire', body: 'Thursday through Sunday. One seating. Reserve early.' } },
};

export const FIELDS = {
  cover: ['eyebrow', 'headline', 'script'],
  feature: ['headline', 'body'],
  photoContent: ['eyebrow', 'headline', 'body'],
  photoCollage: ['eyebrow', 'headline', 'body'],
  diagram: ['eyebrow', 'headline', 'body'],
  photoHero: ['eyebrow', 'headline'],
  closing: ['headline', 'script', 'body'],
};
export const FIELD_META = {
  eyebrow:  { label: 'Eyebrow', ml: false, ph: 'The Supper Club' },
  headline: { label: 'Headline (serif)', ml: true, ph: 'Dinner By Firelight' },
  script:   { label: 'Script word', ml: false, ph: 'tonight' },
  body:     { label: 'Body', ml: true, ph: 'A couple of supporting sentences…' },
  badgeText:{ label: 'Badge text', ml: false, ph: 'CINDER · SUPPER · CLUB' },
};

export function photoSlots(layoutKey) {
  if (layoutKey === 'photoCollage') return 2;
  if (layoutKey === 'photoContent' || layoutKey === 'photoHero') return 1;
  return 0;
}

// ---------- slide building ----------
const W = 1080, H = 1350;
let uid = 0;

function bgLayer(C) {
  let s = `<rect width="${W}" height="${H}" fill="${C.bg}"/>`;
  if (C.panel) {
    s += `<rect x="54" y="54" width="${W - 108}" height="${H - 108}" fill="${C.panel}"/>`;
    s += `<rect x="54" y="54" width="${W - 108}" height="${H - 108}" fill="none" stroke="${C.ink}" stroke-width="2" opacity="0.35"/>`;
  }
  return s;
}
function eyebrowEl(text, C, y, x, anchor) {
  if (!text) return '';
  return `<text x="${x != null ? x : W / 2}" y="${y}" text-anchor="${anchor || 'middle'}" font-family=${JSON.stringify(F.sans)} font-weight="800" font-size="30" letter-spacing="7" fill="${C.sub}">${esc(String(text).toUpperCase())}</text>`;
}
function hashtagEl(text, C, y) {
  if (!text) return '';
  return `<text x="${W / 2}" y="${y || H - 84}" text-anchor="middle" font-family=${JSON.stringify(F.sans)} font-weight="800" font-size="27" letter-spacing="5" fill="${C.sub}">${esc(String(text).toUpperCase())}</text>`;
}
function headlineEl(text, C, y, size, maxChars, x, anchor) {
  const lines = wrap(text, maxChars);
  return { svg: `<text text-anchor="${anchor || 'middle'}" font-family=${JSON.stringify(F.serif)} font-weight="800" font-size="${size}" fill="${C.ink}">${tspans(lines, x != null ? x : W / 2, y, size * 1.12)}</text>`, lines: lines.length, lastY: y + (lines.length - 1) * size * 1.12 };
}
function bodyEl(text, C, y, x, anchor, maxChars, size) {
  if (!text) return { svg: '', lastY: y };
  size = size || 33;
  const lines = wrap(text, maxChars || 44).slice(0, 4);
  return { svg: `<text text-anchor="${anchor || 'middle'}" font-family=${JSON.stringify(F.sans)} font-weight="500" font-size="${size}" fill="${C.sub}">${tspans(lines, x != null ? x : W / 2, y, size * 1.5)}</text>`, lastY: y + (lines.length - 1) * size * 1.5 };
}
function scriptEl(text, C, y, size) {
  if (!text) return '';
  return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-family=${JSON.stringify(F.script)} font-size="${size || 120}" fill="${C.ink}">${esc(text)}</text>`;
}
function graphicGroup(graphicKey, C, cx, cy, scale, transform, opts) {
  const G = GRAPHICS[graphicKey];
  if (!G) return '';
  const t = transform || { s: 1, dx: 0, dy: 0 };
  const k = scale * (t.s != null ? t.s : 1);
  return `<g transform="translate(${cx + (t.dx || 0)} ${cy + (t.dy || 0)}) scale(${k}) translate(-240 -240)">${G.render(C, opts)}</g>`;
}
function photoEl(url, C, x, y, w, h, transform, frame) {
  const t = transform || { s: 1, dx: 0, dy: 0 };
  const id = 'ph' + (++uid);
  const cx = x + w / 2 + (t.dx || 0), cy = y + h / 2 + (t.dy || 0);
  const s = t.s != null ? t.s : 1;
  let inner;
  if (url) {
    inner = `<image href="${url}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`;
  } else {
    inner = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.gSoft}"/>
      <path d="M${x + w * 0.14} ${y + h * 0.82} l${w * 0.24} ${-h * 0.3} ${w * 0.16} ${h * 0.16} ${w * 0.18} ${-h * 0.22} ${w * 0.22} ${h * 0.36} z" fill="${C.gMain}" opacity="0.7"/>
      <circle cx="${x + w * 0.3}" cy="${y + h * 0.28}" r="${w * 0.07}" fill="#FFFFFF"/>`;
  }
  const frameSvg = frame === 'stamp'
    ? `<rect x="${x - 22}" y="${y - 22}" width="${w + 44}" height="${h + 44}" fill="${C.photoFrame}"/>
       <rect x="${x - 22}" y="${y - 22}" width="${w + 44}" height="${h + 44}" fill="none" stroke="${C.gMain}" stroke-width="5" stroke-dasharray="1 16" stroke-linecap="round"/>`
    : frame === 'polaroid'
      ? `<rect x="${x - 18}" y="${y - 18}" width="${w + 36}" height="${h + 88}" fill="${C.photoFrame}" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>`
      : '';
  return `<g transform="translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})">${frameSvg}<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${id})">${inner}</g></g>`;
}
function clipTop(C, cx, y) {
  return `<g transform="translate(${cx - 240} ${y - 240}) scale(0.42) ">${gMatchstick(C)}</g>`;
}

export function buildSlide(opts) {
  const { layoutKey, colourwayKey, graphicKey, theme, content = {}, images = [], transform = null, transforms = null, textDy = 0, sizeAttr = '' } = opts || {};
  const L = LAYOUTS[layoutKey] || LAYOUTS.cover;
  const C = resolveCW(colourwayKey || 'creamField', theme || 'blue');
  const sample = L.sample || {};
  const v = k2 => (content[k2] != null && content[k2] !== '' ? content[k2] : sample[k2] || '');
  const g = graphicKey || L.defaultGraphic;
  const gOpts = { badgeText: v('badgeText') || undefined, text: v('badgeText') || undefined };
  const hashtag = content.hashtag || '#DINNERBYFIRELIGHT';
  let text = '', art = '';

  if (layoutKey === 'feature') {
    art += graphicGroup(GRAPHICS[g] ? g : 'wavyBlob', C, W / 2, H / 2 - 40, 2.2, transform, gOpts);
    const h = headlineEl(v('headline'), C, H / 2 - 130, 84, 16);
    text += h.svg;
    text += bodyEl(v('body'), C, h.lastY + 100, W / 2, 'middle', 38, 30).svg;
    text += hashtagEl(hashtag, C);
  } else if (layoutKey === 'photoContent') {
    text += eyebrowEl(v('eyebrow'), C, 200);
    const h = headlineEl(v('headline'), C, 300, 88, 20);
    text += h.svg;
    text += bodyEl(v('body'), C, h.lastY + 80, W / 2, 'middle', 48).svg;
    const py = 560;
    art += photoEl(images[0], C, W / 2 - 270, py, 540, 540, transform, 'stamp');
    art += clipTop(C, W / 2, py - 20);
    text += hashtagEl(hashtag, C);
  } else if (layoutKey === 'photoCollage') {
    text += eyebrowEl(v('eyebrow'), C, 260, 120, 'start');
    const h = headlineEl(v('headline'), C, 360, 84, 13, 120, 'start');
    text += h.svg;
    text += bodyEl(v('body'), C, h.lastY + 76, 120, 'start', 26, 31).svg;
    const t0 = (transforms && transforms[0]) || null, t1 = (transforms && transforms[1]) || null;
    art += `<g transform="rotate(-7 400 950)">${photoEl(images[0], C, 170, 700, 380, 440, t0, 'polaroid')}</g>`;
    art += `<g transform="rotate(6 760 1010)">${photoEl(images[1], C, 560, 760, 380, 440, t1, 'polaroid')}</g>`;
    text += hashtagEl(hashtag, C);
  } else if (layoutKey === 'diagram') {
    text += eyebrowEl(v('eyebrow'), C, 190);
    art += graphicGroup(GRAPHICS[g] ? g : 'orbit', C, W / 2, 560, 1.5, transform, gOpts);
    const h = headlineEl(v('headline'), C, 990, 90, 18);
    text += h.svg;
    text += bodyEl(v('body'), C, h.lastY + 78, W / 2, 'middle', 46).svg;
    text += hashtagEl(hashtag, C);
  } else if (layoutKey === 'photoHero') {
    text += eyebrowEl(v('eyebrow'), C, 210);
    const h = headlineEl(v('headline'), C, 315, 92, 18);
    text += h.svg;
    art += photoEl(images[0], C, W / 2 - 310, 470, 620, 680, transform, 'stamp');
    art += clipTop(C, W / 2, 450);
    text += hashtagEl(hashtag, C);
  } else if (layoutKey === 'closing') {
    art += graphicGroup(GRAPHICS[g] ? g : 'flame', C, W / 2, 400, 0.9, transform, gOpts);
    const h = headlineEl(v('headline'), C, 660, 104, 15);
    text += h.svg;
    text += scriptEl(v('script'), C, h.lastY + 170, 110);
    text += bodyEl(v('body'), C, h.lastY + 290, W / 2, 'middle', 42).svg;
    text += hashtagEl(hashtag, C);
  } else { // cover
    text += eyebrowEl(v('eyebrow'), C, 300);
    const h = headlineEl(v('headline'), C, 430, 118, 13);
    text += h.svg;
    text += scriptEl(v('script'), C, h.lastY + 170, 130);
    art += graphicGroup(GRAPHICS[g] ? g : 'cloche', C, W / 2, 960, 1.05, transform, gOpts);
    text += hashtagEl(hashtag, C);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" ${sizeAttr || ''} preserveAspectRatio="xMidYMid meet">${bgLayer(C)}${art}<g transform="translate(0 ${textDy || 0})">${text}</g></svg>`;
}

export function buildElementSVG(graphicKey, C, opts) {
  opts = opts || {};
  const box = 480;
  const bg = opts.transparent ? '' : `<rect width="${box}" height="${box}" fill="${C.bg}"/>`;
  let inner;
  if (opts.graphicOpts && SHAPE_LABELS[graphicKey]) {
    inner = makeShape(graphicKey, opts.graphicOpts)(C);
  } else if (GRAPHICS[graphicKey]) {
    inner = GRAPHICS[graphicKey].render(C, opts.graphicOpts);
  } else {
    inner = gStarburst(C, opts.graphicOpts);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box} ${box}" ${opts.sizeAttr || ''} preserveAspectRatio="xMidYMid meet">${bg}${inner}</svg>`;
}

export function buildGraphicTile(graphicKey, C) {
  const box = 480;
  const G = GRAPHICS[graphicKey];
  const tileBg = C.key === 'solidField' ? C.bg : '#FBFAF4';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box} ${box}" preserveAspectRatio="xMidYMid meet"><rect width="${box}" height="${box}" fill="${tileBg}"/><g transform="translate(240 240) scale(0.78) translate(-240 -240)">${G ? G.render(C) : ''}</g></svg>`;
}

export function analyze({ layoutKey, content = {} }) {
  const L = LAYOUTS[layoutKey] || LAYOUTS.cover;
  const sample = L.sample || {};
  const headline = (content.headline != null && content.headline !== '') ? content.headline : (sample.headline || '');
  const maxChars = layoutKey === 'cover' ? 13 : layoutKey === 'photoCollage' ? 13 : 16;
  const lines = wrap(headline, maxChars);
  const maxLines = layoutKey === 'photoHero' || layoutKey === 'photoContent' ? 2 : 3;
  if (lines.length > maxLines) return { overflow: true, reason: 'Headline is long — it may overflow its frame. Consider trimming.' };
  if (lines.some(l => l.length > maxChars + 8)) return { overflow: true, reason: 'A single word is too long for the frame.' };
  return { overflow: false };
}
