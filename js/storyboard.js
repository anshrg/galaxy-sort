// Storyboard helpers: fill mock frames with real galaxy images/icons and scale them to fit.
import { GALAXIES, TYPES, imageUrl } from './data/galaxies.js?v=2';
import { ICONS, ZOOM_ICON } from './ui/icons.js?v=2';

const byId = Object.fromEntries(GALAXIES.map((g) => [g.id, g]));
const ids = (el, attr) => el.getAttribute(attr).split(',').map((s) => byId[s.trim()]);
const img = (g, size) =>
  `<img src="${imageUrl(g)}" alt="" loading="lazy"${size ? ` style="width:${size}px;height:${size}px"` : ''} />`;

for (const el of document.querySelectorAll('[data-tiles]')) {
  const size = el.dataset.size;
  const sel = el.dataset.sel;
  el.innerHTML = ids(el, 'data-tiles')
    .map(
      (g) =>
        `<div class="tile${g.id === sel ? ' selected' : ''}"${size ? ` style="--tile:${size}px"` : ''}>${img(g)}${size ? '' : `<span class="zoom">${ZOOM_ICON}</span>`}</div>`
    )
    .join('');
}
for (const el of document.querySelectorAll('[data-thumbs], [data-strip]')) {
  el.innerHTML = ids(el, el.hasAttribute('data-thumbs') ? 'data-thumbs' : 'data-strip')
    .map((g) => img(g))
    .join('');
}
for (const el of document.querySelectorAll('[data-mini]')) {
  el.innerHTML = ids(el, 'data-mini')
    .map((g) => `<span class="mini">${img(g)}</span>`)
    .join('');
}
for (const el of document.querySelectorAll('[data-img]')) el.src = imageUrl(byId[el.dataset.img]);
for (const el of document.querySelectorAll('[data-clue]')) el.textContent = byId[el.dataset.clue].clue;
for (const el of document.querySelectorAll('[data-icon]')) el.innerHTML = ICONS[el.dataset.icon];

const typeColor = { elliptical: 'var(--ell)', spiral: 'var(--spi)', irregular: 'var(--irr)', quasar: '#c9a7ff' };
document.querySelector('#gtable tbody').innerHTML = GALAXIES.map(
  (g) => `<tr>
    <td>${img(g)}</td>
    <td><b>${g.name}</b>${g.tricky ? '<br><span class="sb-tag">tricky</span>' : ''}${g.guided ? '' : '<br><span class="sb-tag">free sort only</span>'}</td>
    <td class="type" style="color:${typeColor[g.type]}">${TYPES[g.type]?.label ?? 'Quasar (bonus)'}</td>
    <td>${g.clue}</td>
    <td class="credit">${g.credit}<br><a href="${g.source}" target="_blank" rel="noopener">source</a></td>
  </tr>`
).join('');

function fit() {
  for (const f of document.querySelectorAll('.frame')) {
    const w = parseFloat(getComputedStyle(f).getPropertyValue('--w'));
    f.querySelector('.vp').style.setProperty('--s', f.clientWidth / w);
  }
}
new ResizeObserver(fit).observe(document.body);
fit();
