/* PenTools - script.js
   Isi: 1 Konfigurasi | 2 Ikon | 3 Tema | 4 Tool Registry | 5 Helper | 6 TOOLS | 7 Tampilan | 8 Pengaturan | 9 Init

   CARA MENAMBAH TOOL BARU (bagian 6):
   registerTool({ id:'unik-id', name:'Nama', desc:'Deskripsi', category:'text', icon:'type', popular:false,
                  render: el => { el.innerHTML = '...UI...'; (pasang event dan logika di sini) } });
   Untuk tool "input -> proses -> output" cukup pakai ioTool({actions:[{label, fn: teks => hasil}]}).
   CARA MENAMBAH KATEGORI: tambahkan satu baris di CATEGORIES (bagian 4), lalu daftarkan tool dengan category tersebut.
   CARA MENAMBAH IKON: tambahkan path SVG (gaya Lucide, 24x24) di ICONS (bagian 2). */
'use strict';

/* 1. KONFIGURASI */
const VERSION = '1.0.0', KEY = 'pentools:v1';
const DEFAULTS = { primary: '#89E900', secondary: '#222222', reduce: false };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* 2. IKON (inline SVG) */
const ICONS = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  type: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
  align: '<path d="M17 10H3M21 6H3M21 14H3M17 18H3"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8"/>',
  braces: '<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  arrow: '<path d="m12 19-7-7 7-7M19 12H5"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>'
};
const icon = n => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;
const LOGO = '<svg class="logo" viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M8 4h10a8 8 0 010 16h-4v8H8zM17 8.5a3.5 3.5 0 100 7 3.5 3.5 0 100-7z"/></svg>';

/* 3. TEMA (warna global + LocalStorage) */
const hexOk = h => /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h);
const norm = h => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map(c => c + c).join(''); return '#' + h.toLowerCase(); };
const rgb = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
const mix = (a, b, t) => '#' + rgb(a).map((v, i) => Math.round(v + (rgb(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
const lum = h => { const [r, g, b] = rgb(h); return (.299 * r + .587 * g + .114 * b) / 255; };
function load() { try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) }; } catch { return { ...DEFAULTS }; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* storage diblokir */ } }
let settings = load();
function applyTheme() {
  const s = document.documentElement.style, p = settings.primary, b = settings.secondary;
  const light = lum(b) > .55, fg = light ? '#111111' : '#ffffff'; // teks menyesuaikan background
  s.setProperty('--primary', p); s.setProperty('--bg', b); s.setProperty('--text', fg);
  s.setProperty('--muted', light ? '#555555' : '#A0A0A0');
  s.setProperty('--surface', mix(b, fg, .06)); s.setProperty('--border', mix(b, fg, .14));
  s.setProperty('--on-primary', lum(p) > .5 ? '#111111' : '#ffffff');
  document.documentElement.classList.toggle('reduce', settings.reduce);
}

/* 4. TOOL REGISTRY */
const CATEGORIES = {
  text: { name: 'Text Tools', icon: 'type' },
  dev: { name: 'Developer Tools', icon: 'braces' }
  // tambah kategori baru di sini, contoh: image: { name: 'Image Tools', icon: 'grid' }
};
const TOOLS = [];
function registerTool(t) {
  if (!t.id || !t.render || !CATEGORIES[t.category] || TOOLS.some(x => x.id === t.id)) return console.warn('Tool tidak valid/duplikat:', t.id);
  TOOLS.push(t);
}

/* 5. HELPER */
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 1600); }
async function copy(txt) { try { await navigator.clipboard.writeText(txt); toast('Tersalin'); } catch { toast('Gagal menyalin'); } }
function download(txt, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 500); }
const words = s => s.replace(/([a-z\d])([A-Z])/g, '$1 $2').match(/[\p{L}\p{N}]+/gu) || [];
const cap = w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

/* Pabrik UI: tool "input -> aksi -> output". fn(teks) mengembalikan string, atau {out, msg, ok}. Error yang di-throw tampil sebagai pesan. */
function ioTool({ placeholder = 'Tempel atau ketik di sini...', actions, file = 'hasil.txt' }) {
  return el => {
    el.innerHTML = `<textarea class="ta" id="i" placeholder="${placeholder}" spellcheck="false"></textarea>
      <div class="row" id="acts"></div><div class="msg" id="msg" hidden></div>
      <textarea class="ta" id="o" readonly placeholder="Hasil akan muncul di sini"></textarea>
      <div class="row"><button class="btn" id="cp">${icon('copy')}Salin</button><button class="btn ghost" id="dl">${icon('download')}Unduh</button><button class="btn ghost" id="use">Jadikan input</button><button class="btn ghost" id="clr">${icon('trash')}Bersihkan</button></div>`;
    const i = $('#i', el), o = $('#o', el), m = $('#msg', el);
    const say = (t, ok) => { m.hidden = !t; m.textContent = t || ''; m.className = 'msg ' + (ok ? 'ok' : 'err'); };
    actions.forEach((a, k) => {
      const b = document.createElement('button'); b.className = 'btn' + (k ? ' ghost' : ''); b.textContent = a.label;
      b.onclick = () => {
        if (!i.value.trim()) return say('Masukkan teks terlebih dahulu.');
        try { const r = a.fn(i.value); if (typeof r === 'string') { o.value = r; say(''); } else { o.value = r.out || ''; say(r.msg, r.ok); } }
        catch (e) { o.value = ''; say(e.message); }
      };
      $('#acts', el).append(b);
    });
    $('#cp', el).onclick = () => o.value ? copy(o.value) : toast('Belum ada hasil');
    $('#dl', el).onclick = () => o.value ? download(o.value, file) : toast('Belum ada hasil');
    $('#use', el).onclick = () => { if (o.value) { i.value = o.value; o.value = ''; } };
    $('#clr', el).onclick = () => { i.value = o.value = ''; say(''); };
  };
}
/* Pabrik UI: statistik teks langsung. stats = [[label, teks => angka/string], ...] */
function statsTool(stats) {
  return el => {
    el.innerHTML = `<textarea class="ta" placeholder="Tempel atau ketik teks..."></textarea><div class="stats">${stats.map(s => `<div class="stat"><b>0</b><span>${s[0]}</span></div>`).join('')}</div>`;
    const ta = $('textarea', el), vals = $$('b', el);
    ta.oninput = () => stats.forEach((s, i) => { const v = s[1](ta.value); vals[i].textContent = typeof v === 'number' ? v.toLocaleString('id-ID') : v; });
  };
}

/* 6. TOOLS: daftarkan semua tool di sini */
// ---- Text Tools ----
const nWords = t => (t.trim().match(/\S+/g) || []).length;
registerTool({ id: 'word-counter', name: 'Word Counter', desc: 'Hitung kata, kalimat, paragraf, dan waktu baca.', category: 'text', icon: 'hash', popular: true,
  render: statsTool([['Kata', nWords], ['Karakter', t => [...t].length], ['Kalimat', t => (t.match(/[^.!?]+[.!?]+/g) || []).length],
    ['Paragraf', t => t.split(/\n\s*\n/).filter(p => p.trim()).length], ['Waktu baca', t => Math.ceil(nWords(t) / 200) + ' mnt']]) });
registerTool({ id: 'character-counter', name: 'Character Counter', desc: 'Hitung karakter, huruf, angka, spasi, dan ukuran byte.', category: 'text', icon: 'hash',
  render: statsTool([['Karakter', t => [...t].length], ['Tanpa spasi', t => [...t.replace(/\s/g, '')].length], ['Huruf', t => (t.match(/\p{L}/gu) || []).length],
    ['Angka', t => (t.match(/\d/g) || []).length], ['Spasi', t => (t.match(/ /g) || []).length], ['Baris', t => t ? t.split('\n').length : 0], ['Byte (UTF-8)', t => new TextEncoder().encode(t).length]]) });
registerTool({ id: 'case-converter', name: 'Case Converter', desc: 'Ubah huruf besar/kecil, camelCase, snake_case, dan lainnya.', category: 'text', icon: 'type', popular: true,
  render: ioTool({ file: 'case.txt', actions: [
    { label: 'UPPERCASE', fn: s => s.toUpperCase() }, { label: 'lowercase', fn: s => s.toLowerCase() },
    { label: 'Title Case', fn: s => s.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase()) },
    { label: 'Sentence case', fn: s => s.toLowerCase().replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (m, a, c) => a + c.toUpperCase()) },
    { label: 'camelCase', fn: s => words(s).map((w, i) => i ? cap(w) : w.toLowerCase()).join('') },
    { label: 'PascalCase', fn: s => words(s).map(cap).join('') },
    { label: 'snake_case', fn: s => words(s).map(w => w.toLowerCase()).join('_') },
    { label: 'kebab-case', fn: s => words(s).map(w => w.toLowerCase()).join('-') },
    { label: 'CONSTANT_CASE', fn: s => words(s).map(w => w.toUpperCase()).join('_') }] }) });
registerTool({ id: 'text-formatter', name: 'Text Formatter', desc: 'Rapikan spasi, hapus baris kosong/duplikat, urutkan teks.', category: 'text', icon: 'align',
  render: ioTool({ file: 'teks.txt', actions: [
    { label: 'Rapikan spasi', fn: s => s.split('\n').map(l => l.trim().replace(/[ \t]+/g, ' ')).join('\n') },
    { label: 'Hapus baris kosong', fn: s => s.split('\n').filter(l => l.trim()).join('\n') },
    { label: 'Gabung baris', fn: s => s.replace(/\s*\n\s*/g, ' ').trim() },
    { label: 'Urutkan A-Z', fn: s => s.split('\n').sort((a, b) => a.localeCompare(b)).join('\n') },
    { label: 'Hapus duplikat', fn: s => [...new Set(s.split('\n'))].join('\n') },
    { label: 'Balik teks', fn: s => [...s].reverse().join('') }] }) });

const LW = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur'.split(' ');
const rnd = n => Math.floor(Math.random() * n);
const sentence = () => { const w = Array.from({ length: 6 + rnd(9) }, () => LW[rnd(LW.length)]).join(' '); return w[0].toUpperCase() + w.slice(1) + '.'; };
function lorem(n, unit, start) {
  if (unit === 'words') return Array.from({ length: n }, (_, i) => start && i < LW.length ? LW[i] : LW[rnd(LW.length)]).join(' ');
  let out = unit === 'sentences' ? Array.from({ length: n }, sentence).join(' ')
    : Array.from({ length: n }, () => Array.from({ length: 3 + rnd(3) }, sentence).join(' ')).join('\n\n');
  return start ? out.replace(/^[^.]*/, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit') : out;
}
registerTool({ id: 'lorem-ipsum', name: 'Lorem Ipsum Generator', desc: 'Buat teks dummy: paragraf, kalimat, atau kata.', category: 'text', icon: 'file',
  render(el) {
    el.innerHTML = `<div class="row"><label class="fld">Jumlah<input class="in" id="n" type="number" min="1" max="50" value="3"></label>
      <label class="fld">Satuan<select class="in" id="u"><option value="paragraphs">Paragraf</option><option value="sentences">Kalimat</option><option value="words">Kata</option></select></label></div>
      <label class="check"><input type="checkbox" id="s" checked> Mulai dengan "Lorem ipsum"</label>
      <div class="row"><button class="btn" id="g">Buat ulang</button><button class="btn ghost" id="cp">${icon('copy')}Salin</button></div><textarea class="ta" id="o" readonly></textarea>`;
    const o = $('#o', el), gen = () => { const n = Math.min(50, Math.max(1, parseInt($('#n', el).value) || 1)); o.value = lorem(n, $('#u', el).value, $('#s', el).checked); };
    ['#n', '#u', '#s'].forEach(s => $(s, el).oninput = gen); $('#g', el).onclick = gen; $('#cp', el).onclick = () => copy(o.value); gen();
  } });

// ---- Developer Tools ----
const jsonErr = (s, e) => { const m = /position (\d+)/.exec(e.message); if (!m || /line \d+/.test(e.message)) return e.message; const b = s.slice(0, +m[1]).split('\n'); return `${e.message} (baris ${b.length}, kolom ${b[b.length - 1].length + 1})`; };
const parseJSON = s => { try { return JSON.parse(s); } catch (e) { throw new Error('JSON tidak valid: ' + jsonErr(s, e)); } };
registerTool({ id: 'json-formatter', name: 'JSON Formatter', desc: 'Rapikan atau minify JSON dengan cepat.', category: 'dev', icon: 'braces', popular: true,
  render: ioTool({ file: 'data.json', placeholder: '{"nama":"PenTools"}', actions: [
    { label: 'Format (2 spasi)', fn: s => JSON.stringify(parseJSON(s), null, 2) },
    { label: 'Format (4 spasi)', fn: s => JSON.stringify(parseJSON(s), null, 4) },
    { label: 'Minify', fn: s => JSON.stringify(parseJSON(s)) }] }) });
registerTool({ id: 'json-validator', name: 'JSON Validator', desc: 'Periksa JSON dan temukan lokasi kesalahannya.', category: 'dev', icon: 'check',
  render: ioTool({ placeholder: '{"nama":"PenTools"}', actions: [{ label: 'Validasi', fn: s => {
    const v = parseJSON(s), t = Array.isArray(v) ? `array, ${v.length} item` : v && typeof v === 'object' ? `objek, ${Object.keys(v).length} kunci` : typeof v;
    return { out: '', msg: `JSON valid (${t})`, ok: true }; } }] }) });
const b64enc = s => btoa(Array.from(new TextEncoder().encode(s), b => String.fromCharCode(b)).join(''));
const b64dec = s => { try { return new TextDecoder().decode(Uint8Array.from(atob(s.trim()), c => c.charCodeAt(0))); } catch { throw new Error('Input bukan Base64 yang valid.'); } };
registerTool({ id: 'base64', name: 'Base64 Encoder/Decoder', desc: 'Encode dan decode teks Base64 (mendukung Unicode).', category: 'dev', icon: 'code', popular: true,
  render: ioTool({ file: 'base64.txt', actions: [{ label: 'Encode', fn: b64enc }, { label: 'Decode', fn: b64dec }] }) });
function fmtHTML(src) {
  const VOID = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i; let lvl = 0; const out = [];
  (src.match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) || []).forEach(t => {
    t = t.trim(); if (!t) return;
    if (t.startsWith('</')) lvl = Math.max(0, lvl - 1);
    out.push('  '.repeat(lvl) + t);
    const m = t.match(/^<([a-z][\w-]*)/i);
    if (m && !t.endsWith('/>') && !VOID.test(m[1]) && !new RegExp('</' + m[1] + '>$', 'i').test(t)) lvl++;
  });
  return out.join('\n');
}
registerTool({ id: 'html-formatter', name: 'HTML Formatter', desc: 'Rapikan indentasi HTML atau minify.', category: 'dev', icon: 'code',
  render: ioTool({ file: 'index.html', actions: [{ label: 'Format', fn: fmtHTML },
    { label: 'Minify', fn: s => s.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim() }] }) });
function fmtCSS(src) {
  let out = '', lvl = 0, q = null, par = 0; const ind = () => '  '.repeat(lvl);
  const s = src.replace(/\s+/g, ' ');
  for (let k = 0; k < s.length; k++) {
    const c = s[k];
    if (q) { out += c; if (c === q && s[k - 1] !== '\\') q = null; continue; }
    if (c === '"' || c === "'") { q = c; out += c; continue; }
    if (c === '(') par++; if (c === ')') par--;
    if (c === '{') { out = out.trimEnd() + ' {\n'; lvl++; out += ind(); }
    else if (c === '}') { out = out.trimEnd(); if (!/[;{}]$/.test(out)) out += ';'; lvl = Math.max(0, lvl - 1); out += '\n' + ind() + '}\n' + ind(); }
    else if (c === ';' && !par) out += ';\n' + ind();
    else out += c;
  }
  return out.split('\n').filter(l => l.trim()).map(l => /;\s*$/.test(l) ? l.replace(/^(\s*[\w-]+)\s*:\s*/, '$1: ') : l.trimEnd()).join('\n');
}
registerTool({ id: 'css-formatter', name: 'CSS Formatter', desc: 'Rapikan atau minify kode CSS.', category: 'dev', icon: 'code',
  render: ioTool({ file: 'style.css', actions: [{ label: 'Format', fn: fmtCSS },
    { label: 'Minify', fn: s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,>])\s*/g, '$1').replace(/;}/g, '}').trim() }] }) });
const urlTry = f => s => { try { return f(s); } catch { throw new Error('Teks tidak dapat didecode (format % tidak valid).'); } };
registerTool({ id: 'url-encoder', name: 'URL Encoder/Decoder', desc: 'Encode dan decode URL atau komponen URL.', category: 'dev', icon: 'link',
  render: ioTool({ file: 'url.txt', actions: [{ label: 'Encode komponen', fn: encodeURIComponent }, { label: 'Decode komponen', fn: urlTry(decodeURIComponent) },
    { label: 'Encode URL penuh', fn: encodeURI }, { label: 'Decode URL penuh', fn: urlTry(decodeURI) }] }) });

/* 7. TAMPILAN (home & halaman tool) */
const app = $('#app'), filter = { q: '', cat: '' };
const card = t => `<a class="card" href="#/tool/${t.id}"><span class="card-ic">${icon(t.icon)}</span><b>${t.name}</b><span class="muted">${t.desc}</span></a>`;
function paint() {
  const q = filter.q.trim().toLowerCase();
  const list = TOOLS.filter(t => (!filter.cat || t.category === filter.cat) && (!q || (t.name + ' ' + t.desc + ' ' + CATEGORIES[t.category].name).toLowerCase().includes(q)));
  $('#ga').innerHTML = list.map(card).join('') || '<p class="muted">Tidak ada tools yang cocok.</p>';
  const cats = Object.entries(CATEGORIES).filter(([k]) => TOOLS.some(t => t.category === k));
  $('#cats').innerHTML = [['', 'Semua', 'grid'], ...cats.map(([k, c]) => [k, c.name, c.icon])]
    .map(([k, n, i]) => `<button class="chip${filter.cat === k ? ' on' : ''}" data-cat="${k}">${icon(i)}${n}</button>`).join('');
}
function homeView() {
  document.title = 'PenTools - Tools for Everything.';
  const pop = TOOLS.filter(t => t.popular);
  app.innerHTML = `<section class="hero page"><h1>Tools for <span class="accent">Everything.</span></h1>
    <p class="muted">Simple tools. Smarter workflow. Semua berjalan di browser Anda, gratis dan tanpa login.</p>
    <label class="search">${icon('search')}<input id="q" type="search" placeholder="Cari tools..." autocomplete="off"></label>
    <div class="chips">${pop.map(t => `<a class="chip" href="#/tool/${t.id}">${icon(t.icon)}${t.name}</a>`).join('')}</div></section>
    <section class="sec page"><h2>Kategori</h2><div class="chips" id="cats"></div></section>
    <section class="sec page"><h2>Populer</h2><div class="grid">${pop.map(card).join('')}</div></section>
    <section class="sec page"><h2>Semua Tools</h2><div class="grid" id="ga"></div></section>`;
  const q = $('#q'); q.value = filter.q; q.oninput = () => { filter.q = q.value; paint(); };
  $('#cats').onclick = e => { const b = e.target.closest('[data-cat]'); if (b) { filter.cat = b.dataset.cat; paint(); } };
  paint();
}
function toolView(t) {
  document.title = t.name + ' - PenTools';
  app.innerHTML = `<section class="page tool"><a class="back" href="#/">${icon('arrow')} Semua tools</a>
    <div class="tool-h"><span class="card-ic">${icon(t.icon)}</span><div><h1>${t.name}</h1><p class="muted">${t.desc}</p></div></div><div class="tool-body" id="tb"></div></section>`;
  t.render($('#tb'));
}
function route() {
  const m = location.hash.match(/^#\/tool\/([\w-]+)/), t = m && TOOLS.find(x => x.id === m[1]);
  t ? toolView(t) : homeView();
  scrollTo(0, 0);
  const b = $('#bar'); b.classList.remove('go'); void b.offsetWidth; b.classList.add('go'); // indikator loading
}

/* 8. PENGATURAN */
function initSettings() {
  const modal = $('#modal'), open = v => { modal.classList.toggle('open', v); modal.setAttribute('aria-hidden', !v); };
  const put = (el, v) => { if (document.activeElement !== el) el.value = v; }; // jangan menimpa HEX yang sedang diketik
  const sync = () => { put($('#pPick'), settings.primary); put($('#pHex'), settings.primary); put($('#sPick'), settings.secondary); put($('#sHex'), settings.secondary); $('#reduce').checked = settings.reduce; };
  const set = (k, v) => { settings[k] = v; applyTheme(); save(); sync(); };
  [['p', 'primary'], ['s', 'secondary']].forEach(([p, k]) => {
    $('#' + p + 'Pick').oninput = e => set(k, e.target.value);
    $('#' + p + 'Hex').oninput = e => { if (hexOk(e.target.value)) set(k, norm(e.target.value)); };
    $('#' + p + 'Hex').onblur = sync;
  });
  $('#reduce').onchange = e => set('reduce', e.target.checked);
  $('#reset').onclick = () => { settings = { ...DEFAULTS }; applyTheme(); save(); sync(); toast('Warna direset'); };
  $('#btnSettings').onclick = () => { sync(); open(true); };
  $$('[data-close]').forEach(b => b.onclick = () => open(false));
  modal.onclick = e => { if (e.target === modal) open(false); };
  addEventListener('keydown', e => { if (e.key === 'Escape') open(false); });
  $('#btnSearch').onclick = () => { if (location.hash && location.hash !== '#/') location.hash = '#/'; setTimeout(() => { const q = $('#q'); q && q.focus(); }, 60); };
}

/* 9. INIT */
$$('[data-icon]').forEach(e => e.innerHTML = icon(e.dataset.icon));
$$('[data-logo]').forEach(e => e.innerHTML = LOGO);
$$('.ver').forEach(e => e.textContent = VERSION);
applyTheme(); initSettings();
addEventListener('hashchange', route); route();
