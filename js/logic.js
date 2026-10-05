// Pure activity logic (no DOM) — unit-tested by logic.test.js.

export const BIN_TYPES = ['elliptical', 'spiral', 'irregular'];
export const MAX_GROUPS = 8;

export function shuffle(arr, rnd = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function freshState(allIds, guidedIds, rnd = Math.random) {
  return {
    screen: 'welcome',
    free: {
      pool: shuffle(allIds, rnd),
      groups: [
        { id: 'g1', name: '', why: '', items: [] },
        { id: 'g2', name: '', why: '', items: [] },
      ],
      next: 3,
    },
    guided: {
      pool: shuffle(guidedIds, rnd),
      bins: Object.fromEntries(BIN_TYPES.map((t) => [t, []])),
    },
    unlocked: false,
  };
}

// Containers are addressed by zone strings: 'pool', 'g:<groupId>', 'b:<type>'.
function container(part, zone) {
  if (zone === 'pool') return part.pool;
  if (zone.startsWith('g:')) return part.groups?.find((g) => g.id === zone.slice(2))?.items;
  if (zone.startsWith('b:')) return part.bins?.[zone.slice(2)];
  return undefined;
}

function allContainers(part) {
  return [part.pool, ...(part.groups ? part.groups.map((g) => g.items) : []), ...Object.values(part.bins ?? {})];
}

/** Move galaxy `id` into `zone` within one sort (`state.free` or `state.guided`). Returns true if moved. */
export function moveItem(part, id, zone) {
  const target = container(part, zone);
  if (!target) return false;
  const from = allContainers(part).find((c) => c.includes(id));
  if (!from) return false;
  if (from === target) return false;
  from.splice(from.indexOf(id), 1);
  target.push(id);
  return true;
}

export function addGroup(free) {
  if (free.groups.length >= MAX_GROUPS) return null;
  const g = { id: `g${free.next++}`, name: '', why: '', items: [] };
  free.groups.push(g);
  return g;
}

export function deleteGroup(free, groupId) {
  const i = free.groups.findIndex((g) => g.id === groupId);
  if (i < 0) return;
  free.pool.push(...free.groups[i].items);
  free.groups.splice(i, 1);
}

export function dropEmptyGroups(free) {
  free.groups = free.groups.filter((g) => g.items.length > 0);
}

export function sortStatus(free) {
  const left = free.pool.length;
  const used = free.groups.filter((g) => g.items.length > 0).length;
  return { left, used, ok: left === 0 && used >= 2 };
}

export const nameOk = (g) => g.name.trim().length >= 1;
export const whyOk = (g) => g.why.trim().length >= 3;

// Names count as the same ignoring case and extra spaces: "Blobs" = " blobs " = "BLOBS".
export const nameKey = (name) => name.trim().toLowerCase().replace(/\s+/g, ' ');

/** Ids of groups whose (non-empty) name matches another group's name. */
export function duplicateNames(groups) {
  const seen = new Map();
  for (const g of groups) {
    const k = nameKey(g.name);
    if (k) seen.set(k, [...(seen.get(k) ?? []), g.id]);
  }
  return new Set([...seen.values()].filter((ids) => ids.length > 1).flat());
}

export function whyStatus(groups) {
  const missing = groups.filter((g) => !nameOk(g) || !whyOk(g)).length;
  const dupes = duplicateNames(groups);
  return { missing, dupes, ok: missing === 0 && dupes.size === 0 };
}

/** Compare guided bins with the answer key. typeOf(id) → correct type. */
export function scoreGuided(bins, typeOf) {
  const agree = [];
  const differ = [];
  for (const t of BIN_TYPES) {
    for (const id of bins[t]) {
      const correct = typeOf(id);
      (correct === t ? agree : differ).push({ id, chosen: t, correct });
    }
  }
  return { agree, differ, total: agree.length + differ.length };
}

export function tierMessage(n, total) {
  if (n === total) return 'You matched every one.';
  if (n >= total - 3) return 'Solid work. Here’s where you sorted differently, and what to look for.';
  if (n >= 5) return 'Good start. The ones below are where the clues are easy to miss.';
  return 'These are tricky. Here’s what to look for in each one.';
}

/**
 * Which of the student's own free-sort groups line up with an astronomer's type?
 * A group "matches" if ≥75% of its (classifiable) galaxies share one type and it has ≥2 of them.
 */
export function groupMatches(groups, typeOf) {
  const out = [];
  for (const g of groups) {
    const types = g.items.map(typeOf).filter((t) => BIN_TYPES.includes(t));
    if (types.length < 2) continue;
    const counts = {};
    for (const t of types) counts[t] = (counts[t] ?? 0) + 1;
    const [best, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (n / types.length >= 0.75) out.push({ group: g, type: best });
  }
  return out;
}
