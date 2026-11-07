/* RaedClass - front-end. Reads everything from /data/*.json. No build step. */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const app = $('#app');
const S = { site: null, tax: null, res: [], pages: [], lang: 'ar' };

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const t = o => { if (!o) return ''; if (typeof o === 'string') return o; return o[S.lang] || o.fr || o.ar || ''; };
const ui = k => t(S.site.ui && S.site.ui[k]) || k;
const byId = (arr, id) => (arr || []).find(x => x.id === id);
const getJSON = async p => { const r = await fetch(p + '?v=' + Date.now()); if (!r.ok) throw new Error(p); return r.json(); };

async function init() {
  try {
    [S.site, S.tax, S.res, S.pages] = await Promise.all([
      getJSON('data/site.json'), getJSON('data/taxonomy.json'), getJSON('data/resources.json'), getJSON('data/pages.json')
    ]);
  } catch (e) {
    app.innerHTML = '<div class="error"><b>Could not load the content files.</b><br>' +
      'Open the site through a web server (not by double-clicking index.html). ' +
      'Double-click <code>serve.bat</code> (Windows) or run <code>./serve.sh</code> (Mac/Linux), ' +
      'then open <code>http://localhost:8000</code>.<br>Online hosting (Netlify, GitHub Pages, any host) works automatically.</div>';
    return;
  }
  S.lang = localStorage.getItem('rc-lang') || S.site.defaultLang || 'ar';
  $('#langBtn').addEventListener('click', () => { setLang(S.lang === 'ar' ? 'fr' : 'ar'); });
  $('#searchForm').addEventListener('submit', e => {
    e.preventDefault();
    location.hash = '#/browse?q=' + encodeURIComponent($('#searchInput').value.trim());
  });
  window.addEventListener('hashchange', route);
  chrome();
  route();
}

function setLang(l) {
  S.lang = l; localStorage.setItem('rc-lang', l); chrome(); route();
}

function chrome() {
  document.documentElement.lang = S.lang;
  document.documentElement.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
  const brand = $('#brand');
  brand.innerHTML = (S.site.logo ? `<img src="${esc(S.site.logo)}" alt="">` : '') + esc(S.site.name || 'RaedClass');
  $('#nav').innerHTML = (S.site.nav || []).map(n => `<a href="${esc(n.href)}">${esc(t(n.label))}</a>`).join('');
  $('#searchInput').placeholder = ui('search');
  $('#langBtn').textContent = S.lang === 'ar' ? 'Français' : 'العربية';
  $('#footer').innerHTML = esc(t(S.site.footer));
}

function markActive() {
  const cur = location.hash || '#/';
  document.querySelectorAll('#nav a').forEach(a => {
    const h = a.getAttribute('href');
    a.classList.toggle('active', h === cur || (h !== '#/' && cur.startsWith(h.split('?')[0]) && !h.includes('?')));
  });
}

function route() {
  const h = location.hash.replace(/^#\/?/, '');
  const [path, qs = ''] = h.split('?');
  const parts = path.split('/').filter(Boolean);
  const q = Object.fromEntries(new URLSearchParams(qs));
  if (!parts.length) home();
  else if (parts[0] === 'browse') browse(q);
  else if (parts[0] === 'resource') resource(decodeURIComponent(parts[1] || ''));
  else if (parts[0] === 'page') page(decodeURIComponent(parts[1] || ''));
  else notFound();
  markActive();
  window.scrollTo(0, 0);
}

/* ---------- helpers ---------- */
const liveRes = () => S.res.filter(r => r.lang === S.lang);
const sortNew = arr => [...arr].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
const nm = (list, id) => { const x = byId(list, id); return x ? t(x.name) : ''; };

function chipsFor(r) {
  const c = [];
  if (r.category) c.push(`<span class="chip">${esc(nm(S.tax.categories, r.category))}</span>`);
  if (r.grade) c.push(`<span class="chip alt">${esc(nm(S.tax.grades, r.grade))}</span>`);
  if (r.subject) c.push(`<span class="chip gray">${esc(nm(S.tax.subjects, r.subject))}</span>`);
  return c.join('');
}
const card = r => `<a class="card" href="#/resource/${encodeURIComponent(r.id)}" dir="${r.lang === 'ar' ? 'rtl' : 'ltr'}">
  ${r.image ? `<img src="${esc(r.image)}" alt="" loading="lazy">` : ''}
  <div class="card-body"><div class="chips">${chipsFor(r)}</div><h3>${esc(r.title)}</h3>${r.description ? `<p>${esc(r.description)}</p>` : ''}</div></a>`;
const grid = list => list.length ? `<div class="grid">${list.map(card).join('')}</div>` : `<p class="empty">${esc(ui('noResults'))}</p>`;

/* ---------- home ---------- */
function home() {
  const H = S.site.home || {};
  document.title = S.site.name;
  let html = `<section class="hero"><div><h1>${esc(t(H.heroTitle))}</h1><p>${esc(t(H.heroText))}</p>
    <a class="btn" href="#/browse">${esc(ui('browse'))}</a></div>${H.heroImage ? `<img src="${esc(H.heroImage)}" alt="">` : ''}</section>`;
  (H.sections || []).forEach(s => {
    const title = t(s.title) ? `<h2>${esc(t(s.title))}</h2>` : '';
    if (s.type === 'latest') {
      html += `<section class="section">${title}${grid(sortNew(liveRes()).slice(0, +s.count || 6))}</section>`;
    } else if (s.type === 'levels') {
      html += `<section class="section">${title}<div class="grid">` + (S.tax.levels || []).map(l => {
        const gs = (S.tax.grades || []).filter(g => g.level === l.id);
        return `<div class="tile"><h3>${esc(t(l.name))}</h3><div class="chips">` +
          gs.map(g => `<a href="#/browse?grade=${encodeURIComponent(g.id)}">${esc(t(g.name))}</a>`).join('') + `</div></div>`;
      }).join('') + `</div></section>`;
    } else if (s.type === 'subjects') {
      html += `<section class="section">${title}<div class="quick">` + (S.tax.subjects || []).map(x =>
        `<a href="#/browse?subject=${encodeURIComponent(x.id)}">${esc(t(x.name))}</a>`).join('') + `</div></section>`;
    } else if (s.type === 'categories') {
      html += `<section class="section">${title}<div class="quick">` + (S.tax.categories || []).map(x =>
        `<a href="#/browse?category=${encodeURIComponent(x.id)}">${esc(t(x.name))}</a>`).join('') + `</div></section>`;
    } else if (s.type === 'text') {
      html += `<section class="section">${title}<div class="content">${t(s.body)}</div></section>`;
    }
  });
  app.innerHTML = html;
}

/* ---------- browse ---------- */
function browse(q) {
  document.title = ui('browse') + ' - ' + S.site.name;
  const opt = (v, label, sel) => `<option value="${esc(v)}"${sel ? ' selected' : ''}>${esc(label)}</option>`;
  const gradeOpts = (S.tax.levels || []).map(l =>
    `<optgroup label="${esc(t(l.name))}">` +
    (S.tax.grades || []).filter(g => g.level === l.id).map(g => opt(g.id, t(g.name), q.grade === g.id)).join('') + '</optgroup>').join('');
  app.innerHTML = `<h1 class="title">${esc(ui('browse'))}</h1>
  <div class="filters">
    <input id="fq" type="search" placeholder="${esc(ui('search'))}" value="${esc(q.q || '')}">
    <select id="fg"><option value="">${esc(ui('allGrades'))}</option>${gradeOpts}</select>
    <select id="fs"><option value="">${esc(ui('allSubjects'))}</option>${(S.tax.subjects || []).map(x => opt(x.id, t(x.name), q.subject === x.id)).join('')}</select>
    <select id="fc"><option value="">${esc(ui('allCategories'))}</option>${(S.tax.categories || []).map(x => opt(x.id, t(x.name), q.category === x.id)).join('')}</select>
  </div><div id="results"></div>`;
  const draw = () => {
    const term = $('#fq').value.trim().toLowerCase(), g = $('#fg').value, s = $('#fs').value, c = $('#fc').value;
    const list = sortNew(liveRes()).filter(r =>
      (!g || r.grade === g) && (!s || r.subject === s) && (!c || r.category === c) &&
      (!term || (r.title + ' ' + (r.description || '')).toLowerCase().includes(term)));
    $('#results').innerHTML = grid(list);
  };
  ['fq', 'fg', 'fs', 'fc'].forEach(id => $('#' + id).addEventListener(id === 'fq' ? 'input' : 'change', draw));
  draw();
}

/* ---------- resource ---------- */
function resource(id) {
  const r = byId(S.res, id);
  if (!r) return notFound();
  document.title = r.title + ' - ' + S.site.name;
  const files = (r.files || []).filter(f => f.path).map(f => {
    const ext = (f.path.split('.').pop() || '').toLowerCase();
    return `<div class="file"><span class="ext ${esc(ext)}">${esc(ext.toUpperCase())}</span><span class="name">${esc(f.label || f.path.split('/').pop())}</span>
      <a href="${esc(f.path)}" target="_blank" rel="noopener">${esc(ui('view'))}</a>
      <a class="dl" href="${esc(f.path)}" download>${esc(ui('download'))}</a></div>`;
  }).join('');
  const related = sortNew(S.res.filter(x => x.id !== r.id && x.lang === r.lang && x.grade === r.grade && x.subject === r.subject)).slice(0, 3);
  app.innerHTML = `<a href="javascript:history.back()">${S.lang === 'ar' ? '→' : '←'} ${esc(ui('back'))}</a>
  <article class="article" dir="${r.lang === 'ar' ? 'rtl' : 'ltr'}" lang="${esc(r.lang)}" style="margin-top:12px">
    <div class="chips">${chipsFor(r)}</div>
    <h1>${esc(r.title)}</h1>
    ${r.description ? `<p class="lead">${esc(r.description)}</p>` : ''}
    ${r.image ? `<img class="cover" src="${esc(r.image)}" alt="">` : ''}
    <div class="content">${r.body || ''}</div>
    ${files ? `<div class="files">${files}</div>` : ''}
  </article>
  ${related.length ? `<section class="section"><h2>${esc(ui('related'))}</h2>${grid(related)}</section>` : ''}`;
}

/* ---------- custom page ---------- */
function page(slug) {
  const p = (S.pages || []).find(x => x.slug === slug);
  if (!p) return notFound();
  document.title = t(p.title) + ' - ' + S.site.name;
  app.innerHTML = `<article class="article"><h1>${esc(t(p.title))}</h1><div class="content">${t(p.body)}</div></article>`;
}

function notFound() {
  app.innerHTML = `<p class="empty">${esc(ui('notFound'))}<br><a href="#/">${esc(ui('home'))}</a></p>`;
}

init();
})();
