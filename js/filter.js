// Light word filter for student-typed text (group names, reasons). Masks a matching word
// with ***. Deliberately simple: it catches casual cases, not determined misspellers.
// Word lists live in filter-words.js.
import { EXACT, CONTAINS } from './filter-words.js?v=3';

const LEET = { '@': 'a', 4: 'a', 3: 'e', 1: 'i', '!': 'i', 0: 'o', $: 's', 5: 's', 7: 't' };

const strip = (tok) =>
  tok
    .toLowerCase()
    .replace(/[@4310!$57]/g, (c) => LEET[c])
    .replace(/[^a-z]/g, '');

function isBadForm(w) {
  if (!w) return false;
  if (EXACT.has(w) || EXACT.has(w.replace(/(es|s)$/, ''))) return true;
  return CONTAINS.some((s) => w.includes(s));
}

export function isBad(token) {
  const w = strip(token);
  // try as typed, with long letter runs squashed to two ("fuuuck"), and to one ("shiit")
  return isBadForm(w) || isBadForm(w.replace(/(.)\1{2,}/g, '$1$1')) || isBadForm(w.replace(/(.)\1+/g, '$1'));
}

/**
 * Mask bad words. With `partial`, the last word is left alone if the text ends mid-word,
 * so typing "assignment" doesn't flash "***ignment" on the way.
 */
export function cleanText(text, { partial = false } = {}) {
  return text.replace(/[A-Za-z0-9@$!]+/g, (tok, offset) => {
    if (partial && offset + tok.length === text.length) return tok;
    return isBad(tok) ? '***' : tok;
  });
}
