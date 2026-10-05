# Galaxy Sort — Planning Document

> Living document. Update the Decisions Log, Next Steps, and Session Insights as you work.

## 1. Context
Guest lecture (astronomy PhD student, "Mr. Gupta") in a 44-min high-school sophomore
chemistry class: underfunded school, little science background, likely rowdy (day after an
exam). 4 table groups of 5–6. Each student on their own device (mostly Chromebooks; also
tablets/phones). Whole activity ≈ 18–20 min.

## 2. Flow & time budget (~19 min)
| Phase | Screen | Time | Gate to next |
|---|---|---|---|
| 0 | Welcome | — | tap |
| 1 | Free sort, 12 galaxies, student-made groups | 5 | all placed, ≥2 groups |
| 1b | Name + "why" for each group | 1.5 | every group has name + why (≥3 chars) |
| 1c | Share view (think-pair-share at table) | 3 | "We're done sharing" button |
| 2 | Eyes up front (teacher explains 3 types) | 4 | passcode (`js/config.js`) |
| 3 | Guided sort, 11 galaxies → Elliptical/Spiral/Irregular | 3 | all placed |
| 4 | Results: "You and Mr. Gupta agreed on N of 11" + clues + callback to own groups + quasar bonus | 2 | — (Start over w/ confirm) |

Eyes-up has a Back button. No teacher/projector view (user's own slides).

## 3. Galaxy set
`js/data/galaxies.js` (images `images/galaxies/*.jpg`, 480² JPEG, ~600 KB total).
Elliptical: IC 2006, M59, NGC 1132. Spiral: M74 (face-on), NGC 1300 (barred), UGC 11537
(tilted), UGC 10043 (edge-on, tricky). Irregular: NGC 1427A, NGC 7292, NGC 4449,
Antennae (merger, tricky). Free-sort only: quasar 3C 273.
All from esahubble.org (ESA/Hubble CC BY 4.0; NASA/STScI Hubble Heritage public domain).

## 4. Technical plan
- Vanilla ES modules, no build; one `index.html` with screen sections; state machine in
  `js/main.js`; state persisted to localStorage (`CONFIG.storageKey`), wrapped in try/catch.
- Drag & drop via Pointer Events (one code path for mouse/touch/pen) + tap-to-place.
- Reset: confirm-guarded "Start over" on results; `?reset` URL param; bump storageKey to
  invalidate all devices.
- Fonts from Google Fonts with system-ui fallback (consider self-hosting for slow Wi-Fi).

## 5. Decisions Log
| Date | Decision | Source |
|---|---|---|
| 2026-10-05 | 12 free / 11 guided (quasar is free-sort only); merger = Irregular; edge-on spiral is the deliberate teachable miss | User |
| 2026-10-05 | Claude sources public ESA/Hubble images | User |
| 2026-10-05 | Phase 2→3 gate: spoken/board passcode | User |
| 2026-10-05 | No backend: results on device + projector view; live class dashboard = stretch goal | User |
| 2026-10-05 | No table/group names | User |
| 2026-10-05 | Reuse Night Observatory theme, sized for projection | User |
| 2026-10-05 | Require "why" text per group | User |
| 2026-10-05 | Galaxy names hidden during sorts | Claude (not objected to) |
| 2026-10-05 | Tone: no emoji / cheesy copy; matter-of-fact encouragement. Font → Inter, squarer UI | User (storyboard v0.2) |
| 2026-10-05 | "Eyes up" screen gets a Back button (students who skip ahead aren't stuck) | User |
| 2026-10-05 | Unlock code BUBBLE; no teacher/projector view (user makes own slides) | User |
| 2026-10-05 | Client-side word filter on group names + why text (mask with ***) | User |
| 2026-10-05 | Galaxy set approved for now; science wording to be checked by user later | User |
| 2026-10-05 | v0.4 aesthetic pass: near-black desaturated background, tiled stars.svg, near-opaque panels, numbered stepper | User asked |
| 2026-10-05 | v0.5: group names must be unique (case/space-insensitive) at the why gate; welcome strip uses dedicated tight crops (`images/welcome/`: M74, NGC 1132, NGC 1300, Antennae, NGC 1427A) | User |
| 2026-10-05 | Shared Chromebooks but separate accounts → no extra reset UX needed | User |

## 6. Next Steps
1. [x] Storyboard (`storyboard.html`) with real images, copy, and per-screen notes.
2. [x] Storyboard v0.2: tone/font revision, eyes-up Back, BUBBLE, word filter noted.
2b. [x] User approved storyboard v0.2 and said go.
3. [x] Built the app v0.3 (2026-10-05).
4. [x] Tested: 12 node unit tests; puppeteer e2e on desktop (mouse) + iPhone 13 + iPad (touch
       emulation) through every phase, zero console errors. Not yet on a real Chromebook/iPad.
5. [ ] git init + GitHub repo + Pages deploy (walk user through).
6. [ ] Stretch: live class dashboard (needs a realtime backend).

### Code map (v0.3)
- `index.html` — all screens as `<section data-screen>`; zoom + credits `<dialog>`s.
- `js/config.js` — teacher name, unlock code (BUBBLE), storageKey, version.
- `js/data/galaxies.js` — galaxy set, types, student-facing clues, credits.
- `js/logic.js` — pure state ops (move/add/delete groups, gates, scoring, tiers, group→type
  callback). `js/logic.test.js` — `npm test`.
- `js/filter.js` + `js/filter-words.js` — word filter (masks finished words while typing,
  everything on blur/submit and at display time).
- `js/ui/board.js` — drag-or-tap controller (Pointer Events; ghost, auto-scroll, keyboard).
- `js/main.js` — state + localStorage, screen flow/gates, rendering. Tiles are cached DOM nodes.
- `fonts/` — self-hosted Inter (latin, variable 400–700) + OFL license.
- `storyboard.html` (+ `css/storyboard.css`, `js/storyboard.js`) — design reference, not linked from the app.

## 7. Session Insights
- **2026-10-05:** No ImageMagick/Pillow on this machine; macOS `sips` handles crop/pad/resize/
  JPEG quality. esahubble.org rejects python urllib (403) — use curl. CDN pattern:
  `https://cdn.esahubble.org/archives/images/{thumb300y|screen|large}/<id>.jpg`. Headless
  Chrome lives at ~/.cache/puppeteer/chrome/… (used for screenshots).
- **2026-10-05 (build):** Touch gotcha: browsers' touch adjustment snaps a fingertip to any
  nearby *visible button*, so an always-visible zoom button in the tile corner stole most touch
  drags. Fix: zoom button only shows on a selected (tapped) tile or on mouse hover. Also: with a
  galaxy selected, tapping a galaxy in another group, or the group's name box, places it there
  (students tap groups wherever). Puppeteer-core lives in the session scratchpad (`e2e/run.mjs`),
  driven against the cached Chrome for Testing; `page.touchscreen` produces real touch pointer events.
- **2026-10-05 (aesthetics v0.4):** Translucent cards over the starfield let stars run behind text — panels are now ~92% opaque. Overlapping circular thumbnails turn to mush because many galaxies sit on black; keep them spaced with a hairline ring.
