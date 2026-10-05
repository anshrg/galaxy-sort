// Run with `npm test` (plain node, no deps).
import assert from 'node:assert/strict';
import { GALAXIES } from './data/galaxies.js';
import { cleanText, isBad } from './filter.js';
import {
  freshState,
  moveItem,
  addGroup,
  deleteGroup,
  dropEmptyGroups,
  sortStatus,
  whyStatus,
  duplicateNames,
  scoreGuided,
  tierMessage,
  groupMatches,
  MAX_GROUPS,
} from './logic.js';

let passed = 0;
const test = (name, fn) => {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
};

const ALL = GALAXIES.map((g) => g.id);
const GUIDED = GALAXIES.filter((g) => g.guided).map((g) => g.id);
const typeOf = (id) => GALAXIES.find((g) => g.id === id)?.type;
const seeded = () => {
  let x = 42;
  return () => ((x = (x * 16807) % 2147483647) / 2147483647);
};

test('data: 12 galaxies, 11 guided, every guided one has a bin type and a clue', () => {
  assert.equal(ALL.length, 12);
  assert.equal(GUIDED.length, 11);
  for (const g of GALAXIES) {
    assert.ok(g.clue && g.credit && g.source, g.id);
    if (g.guided) assert.ok(['elliptical', 'spiral', 'irregular'].includes(g.type), g.id);
  }
});

test('freshState: shuffled pools hold every galaxy once, two empty groups', () => {
  const s = freshState(ALL, GUIDED, seeded());
  assert.deepEqual([...s.free.pool].sort(), [...ALL].sort());
  assert.deepEqual([...s.guided.pool].sort(), [...GUIDED].sort());
  assert.notDeepEqual(s.free.pool, ALL);
  assert.equal(s.free.groups.length, 2);
  assert.equal(s.screen, 'welcome');
});

test('moveItem: pool → group → other group → pool; bad zones ignored', () => {
  const s = freshState(ALL, GUIDED);
  assert.ok(moveItem(s.free, 'm74', 'g:g1'));
  assert.deepEqual(s.free.groups[0].items, ['m74']);
  assert.ok(!s.free.pool.includes('m74'));
  assert.ok(moveItem(s.free, 'm74', 'g:g2'));
  assert.deepEqual(s.free.groups[0].items, []);
  assert.deepEqual(s.free.groups[1].items, ['m74']);
  assert.ok(!moveItem(s.free, 'm74', 'g:g2'), 'same container is a no-op');
  assert.ok(!moveItem(s.free, 'm74', 'g:nope'));
  assert.ok(!moveItem(s.free, 'm74', 'b:spiral'), 'free sort has no bins');
  assert.ok(moveItem(s.free, 'm74', 'pool'));
  assert.equal(s.free.pool.length, 12);
});

test('moveItem: guided bins', () => {
  const s = freshState(ALL, GUIDED);
  assert.ok(moveItem(s.guided, 'm74', 'b:spiral'));
  assert.ok(moveItem(s.guided, 'm74', 'b:elliptical'));
  assert.deepEqual(s.guided.bins.spiral, []);
  assert.deepEqual(s.guided.bins.elliptical, ['m74']);
  assert.ok(!moveItem(s.guided, '3c273', 'b:spiral'), 'quasar is not in the guided set');
});

test('groups: add (capped), delete returns galaxies to the pool, drop empties', () => {
  const s = freshState(ALL, GUIDED);
  while (addGroup(s.free));
  assert.equal(s.free.groups.length, MAX_GROUPS);
  moveItem(s.free, 'm74', 'g:g3');
  deleteGroup(s.free, 'g3');
  assert.ok(s.free.pool.includes('m74'));
  moveItem(s.free, 'm74', 'g:g1');
  dropEmptyGroups(s.free);
  assert.deepEqual(s.free.groups.map((g) => g.id), ['g1']);
});

test('sortStatus: needs everything placed and ≥2 non-empty groups', () => {
  const s = freshState(ALL, GUIDED);
  assert.equal(sortStatus(s.free).ok, false);
  for (const id of ALL) moveItem(s.free, id, 'g:g1');
  assert.deepEqual(sortStatus(s.free), { left: 0, used: 1, ok: false });
  moveItem(s.free, 'm74', 'g:g2');
  assert.equal(sortStatus(s.free).ok, true);
});

test('whyStatus: name ≥1 char and reason ≥3 chars (trimmed)', () => {
  const groups = [
    { name: 'Blobs', why: 'smooth', items: [] },
    { name: ' ', why: 'abc', items: [] },
    { name: 'X', why: ' ab ', items: [] },
  ];
  assert.equal(whyStatus(groups).missing, 2);
  assert.equal(whyStatus(groups).ok, false);
  groups[1].name = 'Y';
  groups[2].why = 'abc';
  assert.equal(whyStatus(groups).ok, true);
});

test('whyStatus: group names must differ (case/spacing-insensitive)', () => {
  const groups = [
    { id: 'g1', name: 'Blobs', why: 'smooth', items: [] },
    { id: 'g2', name: '  blobs ', why: 'round', items: [] },
    { id: 'g3', name: 'Swirly  Ones', why: 'arms', items: [] },
    { id: 'g4', name: 'swirly ones', why: 'arms', items: [] },
    { id: 'g5', name: 'Messy', why: 'lumpy', items: [] },
  ];
  assert.deepEqual([...duplicateNames(groups)].sort(), ['g1', 'g2', 'g3', 'g4']);
  assert.equal(whyStatus(groups).ok, false);
  groups[1].name = 'Round blobs';
  groups[3].name = 'Swirly twos';
  assert.equal(duplicateNames(groups).size, 0);
  assert.equal(whyStatus(groups).ok, true);
  assert.equal(duplicateNames([{ id: 'a', name: '' }, { id: 'b', name: ' ' }]).size, 0, 'blank names are "missing", not duplicates');
});

test('scoreGuided + tiers', () => {
  const bins = { elliptical: ['ic2006', 'ugc10043'], spiral: ['m74', 'antennae'], irregular: ['ngc4449'] };
  const r = scoreGuided(bins, typeOf);
  assert.equal(r.total, 5);
  assert.deepEqual(r.agree.map((a) => a.id).sort(), ['ic2006', 'm74', 'ngc4449']);
  assert.deepEqual(r.differ.find((d) => d.id === 'ugc10043'), { id: 'ugc10043', chosen: 'elliptical', correct: 'spiral' });
  assert.equal(tierMessage(11, 11), 'You matched every one.');
  assert.match(tierMessage(9, 11), /^Solid work/);
  assert.match(tierMessage(8, 11), /^Solid work/);
  assert.match(tierMessage(6, 11), /^Good start/);
  assert.match(tierMessage(2, 11), /^These are tricky/);
});

test('groupMatches: ≥75% one type with ≥2 classifiable galaxies; quasar ignored', () => {
  const groups = [
    { name: 'Blobs', items: ['m59', 'ic2006', 'ngc1132', '3c273'] }, // 3/3 elliptical
    { name: 'Swirly', items: ['m74', 'ngc1300', 'ugc11537', 'ngc4449'] }, // 3/4 spiral
    { name: 'Mixed', items: ['ngc1427a', 'ugc10043', 'antennae', 'ngc7292', 'm74'] }, // 3/5
    { name: 'Lonely', items: ['ngc7292'] },
  ];
  const m = groupMatches(groups, typeOf);
  assert.deepEqual(m.map((x) => [x.group.name, x.type]), [['Blobs', 'elliptical'], ['Swirly', 'spiral']]);
});

test('filter: masks bad words, including common disguises', () => {
  assert.equal(cleanText('they look like shit'), 'they look like ***');
  assert.ok(isBad('fuuuuck'));
  assert.ok(isBad('sh1t'));
  assert.ok(isBad('$hit'));
  assert.ok(isBad('Dicks'));
  assert.equal(cleanText('the ASS group'), 'the *** group');
});

test('filter: leaves innocent galaxy talk alone', () => {
  for (const ok of [
    'smooth and glowy, no shape',
    'they look like balls',
    'class assignment',
    'glass marbles',
    'they pass by each other',
    'Messy',
    'spiral arms that spin around',
    'cocoon shape',
    'bright nucleus',
    'Swirly ones',
    'Sextant',
  ]) {
    assert.equal(cleanText(ok), ok, ok);
  }
});

test('filter (partial): the word still being typed is left alone', () => {
  assert.equal(cleanText('they are ass', { partial: true }), 'they are ass');
  assert.equal(cleanText('they are ass ', { partial: true }), 'they are *** ');
  assert.equal(cleanText('assignment', { partial: true }), 'assignment');
});

console.log(`\n${passed} tests passed`);
