// Word lists for filter.js. Kept in a separate file so nobody has to scroll past them.
// EXACT: whole-word matches (after lowercasing, leetspeak undo, and a trailing -s/-es strip).
// CONTAINS: fragments unambiguous enough to mask anywhere inside a word.
// Add words as needed; keep entries lowercase a–z only.

export const EXACT = new Set([
  'ass', 'arse', 'asses', 'bastard', 'bitch', 'bollock', 'boob', 'butthole', 'cock', 'coon', 'cum',
  'damnit', 'dick', 'douche', 'dyke', 'fag', 'gook', 'hoe', 'horny', 'kike', 'kys', 'milf', 'nazi',
  'nude', 'nudes', 'pedo', 'penis', 'piss', 'prick', 'rape', 'rapist', 'retard', 'sex', 'sexy',
  'spic', 'stfu', 'tit', 'tits', 'titty', 'titties', 'twat', 'vagina', 'wank', 'wanker', 'wetback',
  'wtf', 'beaner', 'chink', 'tranny', 'thot', 'hitler', 'testicle',
]);

export const CONTAINS = [
  'fuck', 'fuk', 'shit', 'cunt', 'nigg', 'nigga', 'bitch', 'fagg', 'whore', 'slut', 'pussy',
  'dildo', 'jizz', 'porn', 'asshol', 'dickhead', 'motherf', 'cocksuck', 'bullsh', 'retard',
  'penis', 'vagina', 'boner', 'blowjob', 'handjob', 'horny', 'semen', 'molest',
];
