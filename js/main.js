// App: state (saved per device), screen flow + gates, and rendering.
// Import specifiers carry ?v= so a bumped main.js also busts stale module caches.
import { CONFIG } from './config.js?v=3';
import { GALAXIES, TYPES, imageUrl } from './data/galaxies.js?v=3';
import { ICONS, ZOOM_ICON } from './ui/icons.js?v=3';
import { Board } from './ui/board.js?v=3';
import { cleanText } from './filter.js?v=3';
import {
  BIN_TYPES,
  MAX_GROUPS,
  freshState,
  moveItem,
  addGroup,
  deleteGroup,
  dropEmptyGroups,
  sortStatus,
  whyStatus,
  nameOk,
  whyOk,
  scoreGuided,
  tierMessage,
  groupMatches,
} from './logic.js?v=3';

const byId = Object.fromEntries(GALAXIES.map((g) => [g.id, g]));
const ALL_IDS = GALAXIES.map((g) => g.id);
const GUIDED_IDS = GALAXIES.filter((g) => g.guided).map((g) => g.id);
const typeOf = (id) => byId[id]?.type;
const $ = (sel) => document.querySelector(sel);
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};

// ---- persistence --------------------------------------------------------------

function valid(s) {
  try {
    const free = [...s.free.pool, ...s.free.groups.flatMap((g) => g.items)].sort();
    const guided = [...s.guided.pool, ...BIN_TYPES.flatMap((t) => s.guided.bins[t])].sort();
    return (
      typeof s.screen === 'string' &&
      free.join() === [...ALL_IDS].sort().join() &&
      guided.join() === [...GUIDED_IDS].sort().join()
    );
  } catch {
    return false;
  }
}

function load() {
  try {
    if (new URLSearchParams(location.search).has('reset')) {
      localStorage.removeItem(CONFIG.storageKey);
      history.replaceState(null, '', location.pathname);
    }
    const s = JSON.parse(localStorage.getItem(CONFIG.storageKey));
    if (s && valid(s)) return s;
  } catch {
    /* private mode / blocked storage: just run without saving */
  }
  return freshState(ALL_IDS, GUIDED_IDS);
}

function save() {
  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

let state = load();

// ---- shared bits ----------------------------------------------------------------

for (const n of document.querySelectorAll('[data-teacher]')) n.textContent = CONFIG.teacherName;
for (const n of document.querySelectorAll('[data-version]')) n.textContent = CONFIG.version;

const STEPS = ['Sort', 'Share', 'Learn', 'Sort again', 'Results'];
const STEP_OF = { sort: 0, why: 0, share: 1, eyes: 2, guided: 3, results: 4 };

function renderSteps(section, screen) {
  const ol = section.querySelector('.steps');
  if (!ol) return;
  const at = STEP_OF[screen];
  ol.replaceChildren(
    ...STEPS.map((label, i) => el('li', i === at ? 'on' : i < at ? 'done' : '', label))
  );
}

// Tiles are cached so moving one keeps its <img> (no reload/flicker) and its focus.
const tiles = new Map();
function tile(id) {
  if (!tiles.has(id)) {
    const t = el('div', 'tile');
    t.dataset.id = id;
    t.tabIndex = 0;
    t.setAttribute('role', 'button');
    t.setAttribute('aria-label', 'Galaxy (press Enter to pick up)');
    const img = el('img');
    img.src = imageUrl(byId[id]);
    img.alt = '';
    img.draggable = false;
    const z = el('button', 'zoom');
    z.type = 'button';
    z.setAttribute('aria-label', 'Look closer');
    z.innerHTML = ZOOM_ICON;
    z.addEventListener('click', (e) => {
      e.stopPropagation();
      openZoom(id);
    });
    t.append(img, z);
    tiles.set(id, t);
  }
  return tiles.get(id);
}

function thumb(id, size) {
  const img = el('img');
  img.src = imageUrl(byId[id]);
  img.alt = '';
  if (size) img.style.cssText = `width:${size}px;height:${size}px`;
  return img;
}

function openZoom(id) {
  $('#zoom-img').src = imageUrl(byId[id]);
  $('#zoom').showModal();
}
$('#zoom').addEventListener('click', () => $('#zoom').close());

$('#credits-list').replaceChildren(
  ...GALAXIES.map((g) => {
    const li = el('li');
    li.append(thumb(g.id, 44));
    const span = el('span');
    const a = el('a', null, g.name);
    a.href = g.source;
    a.target = '_blank';
    a.rel = 'noopener';
    span.append(a, document.createTextNode(` — ${g.credit}`));
    li.append(span);
    return li;
  })
);
for (const b of document.querySelectorAll('[data-credits]')) {
  b.addEventListener('click', () => $('#credits').showModal());
}

/** Keep an input's value filtered as the student types (finished words only), then fully on blur. */
function bindText(input, get, set) {
  input.value = get();
  input.addEventListener('input', () => {
    const clean = cleanText(input.value, { partial: true });
    if (clean !== input.value) input.value = clean;
    set(clean);
    save();
    refreshGates();
  });
  input.addEventListener('blur', () => {
    const clean = cleanText(input.value);
    if (clean !== input.value) input.value = clean;
    set(clean);
    save();
    refreshGates();
  });
}

// ---- navigation -------------------------------------------------------------------

function go(screen) {
  state.screen = screen;
  save();
  render();
  window.scrollTo(0, 0);
}

function render() {
  for (const s of document.querySelectorAll('[data-screen]')) {
    const on = s.dataset.screen === state.screen;
    s.hidden = !on;
    if (on) renderSteps(s, state.screen);
  }
  ({ welcome: renderWelcome, sort: renderSort, why: renderWhy, share: renderShare, eyes: renderEyes, guided: renderGuided, results: renderResults })[state.screen]?.();
}

function refreshGates() {
  if (state.screen === 'sort') {
    const st = sortStatus(state.free);
    $('#btn-sort-done').disabled = !st.ok;
    $('#sort-note').textContent = st.left
      ? `${st.left} galax${st.left === 1 ? 'y' : 'ies'} left to sort.`
      : st.ok
        ? ''
        : 'Use at least 2 groups.';
    $('#sort-pool-label').textContent = st.left ? `Galaxies to sort (${st.left} left)` : 'All sorted.';
  } else if (state.screen === 'why') {
    const st = whyStatus(state.free.groups);
    $('#btn-why-done').disabled = !st.ok;
    $('#why-note').textContent = st.ok
      ? ''
      : `${st.missing} group${st.missing === 1 ? ' needs' : 's need'} a name and a reason.`;
    for (const card of document.querySelectorAll('#why-groups .group')) {
      const g = state.free.groups.find((x) => x.id === card.dataset.group);
      card.querySelector('.group-name').classList.toggle('missing', !nameOk(g));
      card.querySelector('.why').classList.toggle('missing', !whyOk(g));
    }
  } else if (state.screen === 'guided') {
    const left = state.guided.pool.length;
    $('#btn-guided-done').disabled = left > 0;
    $('#guided-note').textContent = left ? `${left} left to sort` : '';
  }
}

// ---- 0 · welcome ------------------------------------------------------------------

$('#welcome-strip').replaceChildren(
  ...['m74', 'ic2006', 'ngc4449', 'ugc10043', 'antennae'].map((id) => thumb(id))
);
function renderWelcome() {}
$('#btn-start').addEventListener('click', () => go('sort'));

// ---- 1 · free sort -------------------------------------------------------------------

const sortBoard = new Board(document.querySelector('[data-screen="sort"]'), (id, zone) => {
  if (moveItem(state.free, id, zone)) {
    save();
    renderSort();
  }
});

function renderSort() {
  $('#sort-pool').replaceChildren(...state.free.pool.map(tile));
  const cards = state.free.groups.map((g) => {
    const card = el('div', 'group');
    card.dataset.zone = `g:${g.id}`;
    card.tabIndex = 0;
    card.setAttribute('aria-label', 'Group');
    const head = el('div', 'group-head');
    const name = el('input', 'group-name');
    name.placeholder = 'Name this group';
    name.maxLength = 28;
    name.setAttribute('aria-label', 'Group name');
    bindText(name, () => g.name, (v) => (g.name = v));
    const del = el('button', 'icon-btn', '✕');
    del.type = 'button';
    del.title = 'Delete group';
    del.setAttribute('aria-label', 'Delete group');
    del.addEventListener('click', () => {
      deleteGroup(state.free, g.id);
      save();
      renderSort();
    });
    head.append(name, del);
    const body = el('div', 'group-body');
    body.append(...g.items.map(tile));
    card.append(head, body);
    return card;
  });
  if (state.free.groups.length < MAX_GROUPS) {
    const add = el('button', 'add-group', '+ New group');
    add.type = 'button';
    add.addEventListener('click', () => {
      const g = addGroup(state.free);
      if (!g) return;
      // a galaxy picked up by tap goes straight into the new group
      if (sortBoard.selected) moveItem(state.free, sortBoard.selected, `g:${g.id}`);
      sortBoard.select(null);
      save();
      renderSort();
      document.querySelector(`[data-zone="g:${g.id}"] .group-name`)?.focus();
    });
    cards.push(add);
  }
  $('#sort-groups').replaceChildren(...cards);
  sortBoard.select(sortBoard.selected && state.free.pool.concat(...state.free.groups.map((g) => g.items)).includes(sortBoard.selected) ? sortBoard.selected : null);
  refreshGates();
}

$('#btn-sort-done').addEventListener('click', () => {
  if (!sortStatus(state.free).ok) return;
  sortBoard.select(null);
  dropEmptyGroups(state.free);
  go('why');
});

// ---- 1b · name + why -------------------------------------------------------------------

function renderWhy() {
  $('#why-groups').replaceChildren(
    ...state.free.groups.map((g) => {
      const card = el('div', 'group');
      card.dataset.group = g.id;
      const head = el('div', 'group-head');
      const name = el('input', 'group-name');
      name.placeholder = 'Name this group';
      name.maxLength = 28;
      name.setAttribute('aria-label', 'Group name');
      bindText(name, () => g.name, (v) => (g.name = v));
      head.append(name);
      const body = el('div', 'group-body thumbs');
      body.append(...g.items.map((id) => thumb(id, 72)));
      const why = el('textarea', 'why');
      why.rows = 2;
      why.maxLength = 120;
      why.placeholder = 'These belong together because…';
      why.setAttribute('aria-label', 'Why these belong together');
      bindText(why, () => g.why, (v) => (g.why = v));
      card.append(head, body, why);
      return card;
    })
  );
  refreshGates();
}

$('#btn-why-back').addEventListener('click', () => go('sort'));
$('#btn-why-done').addEventListener('click', () => {
  if (!whyStatus(state.free.groups).ok) return;
  for (const g of state.free.groups) {
    g.name = cleanText(g.name.trim());
    g.why = cleanText(g.why.trim());
  }
  go('share');
});

// ---- 1c · share --------------------------------------------------------------------------

function renderShare() {
  $('#share-cards').replaceChildren(
    ...state.free.groups.map((g) => {
      const card = el('div', 'share-card');
      card.append(el('h2', null, cleanText(g.name)), el('p', 'because', cleanText(g.why)));
      const th = el('div', 'thumbs');
      th.append(...g.items.map((id) => thumb(id)));
      card.append(th);
      return card;
    })
  );
}
$('#btn-share-edit').addEventListener('click', () => go('why'));
$('#btn-share-done').addEventListener('click', () => go('eyes'));

// ---- 2 · eyes up -------------------------------------------------------------------------

function renderEyes() {
  $('#code-input').value = '';
  $('#code-hint').textContent = '';
}
$('#btn-eyes-back').addEventListener('click', () => go('share'));
$('#code-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const typed = $('#code-input').value.trim().toUpperCase();
  if (!typed) return;
  if (typed === CONFIG.unlockCode.toUpperCase()) {
    state.unlocked = true;
    go('guided');
  } else {
    $('#code-hint').textContent = 'Not yet. You’ll get the code after the explanation.';
    $('#code-input').select();
  }
});

// ---- 3 · guided sort ---------------------------------------------------------------------

const guidedBoard = new Board(document.querySelector('[data-screen="guided"]'), (id, zone) => {
  if (moveItem(state.guided, id, zone)) {
    save();
    renderGuided();
  }
});

function renderGuided() {
  $('#guided-pool').replaceChildren(...state.guided.pool.map(tile));
  $('#guided-bins').replaceChildren(
    ...BIN_TYPES.map((t) => {
      const bin = el('div', 'bin');
      bin.dataset.type = t;
      bin.dataset.zone = `b:${t}`;
      bin.tabIndex = 0;
      bin.setAttribute('aria-label', TYPES[t].label);
      const head = el('div', 'bin-head');
      const icon = el('span');
      icon.innerHTML = ICONS[t];
      const txt = el('div');
      txt.append(el('h2', null, TYPES[t].label), el('p', null, TYPES[t].short));
      head.append(icon, txt);
      const body = el('div', 'bin-body');
      body.append(...state.guided.bins[t].map(tile));
      bin.append(head, body);
      return bin;
    })
  );
  guidedBoard.select(guidedBoard.selected);
  refreshGates();
}

$('#btn-guided-done').addEventListener('click', () => {
  if (state.guided.pool.length) return;
  guidedBoard.select(null);
  go('results');
});

// ---- 4 · results -------------------------------------------------------------------------

const typeLabel = (t) => {
  const b = el('b', `t-${t}`, TYPES[t].label);
  return b;
};

function renderResults() {
  const { agree, differ, total } = scoreGuided(state.guided.bins, typeOf);
  const head = $('#score-head');
  const n = el('span', 'hl', `${agree.length} of ${total}`);
  head.replaceChildren(`You and ${CONFIG.teacherName} agreed on `, n, '.');
  $('#score-sub').textContent = tierMessage(agree.length, total);

  const order = (a, b) => ALL_IDS.indexOf(a.id) - ALL_IDS.indexOf(b.id);
  $('#diff-list').replaceChildren(
    ...differ.sort(order).map((d) => {
      const g = byId[d.id];
      const card = el('div', 'diff');
      card.dataset.type = d.correct;
      const body = el('div');
      const calls = el('div', 'calls');
      calls.append('You said ', typeLabel(d.chosen), ` · ${CONFIG.teacherName} said `, typeLabel(d.correct));
      const p = el('p');
      p.append(el('b', null, `${g.name}. `), g.clue);
      body.append(calls, p);
      if (g.tricky) body.append(el('p', 'tricky', trickyNote(d)));
      card.append(thumb(d.id), body);
      return card;
    })
  );

  $('#agree-title').hidden = agree.length === 0;
  $('#agree-row').replaceChildren(
    ...agree.sort(order).map((a) => {
      const s = el('span', 'mini');
      s.title = `${byId[a.id].name}: ${TYPES[a.correct].label}`;
      s.append(thumb(a.id));
      return s;
    })
  );

  renderCallback();
  renderQuasar();
}

function trickyNote(d) {
  if (d.id === 'antennae') return 'Astronomers debate this one too. Seeing spirals in it is reasonable.';
  return 'This is one of the hardest ones to spot.';
}

function renderCallback() {
  const box = $('#callback');
  const matches = groupMatches(state.free.groups, typeOf);
  const title = el('b', null, 'Your groups vs. astronomers’ types. ');
  if (!matches.length) {
    box.replaceChildren(
      title,
      'You grouped by different features than the ones astronomers use. That’s fair: astronomers chose shape, but color and brightness tell us a lot about galaxies too.'
    );
    return;
  }
  const parts = [title];
  matches.forEach((m, i) => {
    const name = `“${cleanText(m.group.name)}”`;
    if (i === 0) parts.push(`Your ${name} group matches what astronomers call `, typeLabel(m.type));
    else parts.push(i === matches.length - 1 ? ', and ' : ', ', `${name} matches `, typeLabel(m.type));
  });
  parts.push(
    '. Astronomers came up with these types about 100 years ago the same way you did: by sorting pictures.'
  );
  box.replaceChildren(...parts);
}

function renderQuasar() {
  const q = byId['3c273'];
  const where = state.free.groups.find((g) => g.items.includes(q.id));
  const card = el('div', 'diff');
  card.dataset.type = 'quasar';
  const body = el('div');
  body.append(el('div', 'calls', 'The bright dot from the first sort'));
  const p = el('p', null, q.clue);
  if (where) p.append(` In your first sort, you put it in “${cleanText(where.name)}”.`);
  body.append(p);
  card.append(thumb(q.id), body);
  $('#quasar-card').replaceChildren(card);
}

$('#btn-reset').addEventListener('click', () => {
  if (!confirm('Start over? This erases everything on this device.')) return;
  state = freshState(ALL_IDS, GUIDED_IDS);
  sortBoard.select(null);
  guidedBoard.select(null);
  go('welcome');
});

// ---- go ------------------------------------------------------------------------------------

if (state.screen === 'guided' && !state.unlocked) state.screen = 'eyes';
render();
