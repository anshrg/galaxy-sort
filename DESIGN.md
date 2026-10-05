# Design Language — "Night Observatory" (classroom edition)

> Inherited from ../lenses-and-telescopes/DESIGN.md. Differences for this project are noted.

## Palette (tokens in `css/main.css :root`) — v0.4 "deep space"
| Role | Value | Notes |
|------|-------|-------|
| Background | `#05070c` + tiled `images/stars.svg` (two scales) + faint top glow | near-black, desaturated (user asked for darker, less purple) |
| Surface | `rgba(255,255,255,0.035)` + 1px `rgba(255,255,255,0.09)` border | cards, groups, bins; dialogs use opaque `#0d1019` |
| Text / dim / faint | `#e9edf5` / `#9aa2b4` / `#697084` | |
| Accent (amber) | `#f2b04a` | primary buttons, selection ring, drop-target highlight, current step |
| Elliptical / Spiral / Irregular | `#f0b453` / `#6aaeff` / `#f383b8` | echo old yellow stars, blue arms, pink star birth |
| Agree ✓ | `#5bd394` | |

Accents appear as thin 3px bars (bin tops, card left edges) and faint tints, not big fills.

Type is never color-only: each type has a shape icon (`js/ui/icons.js`) + label + clue.

## Typography
Inter for everything (switched from Baloo 2/Nunito in v0.2: audience wanted less "cute"). Base 18px desktop / 16px phone; share view and
teacher view sized to be read from 1.5 m / across a classroom.

## Voice
Short, plain, matter-of-fact; second person. No emoji, no cheerleading or exclamation-heavy copy — the audience is rowdy teens. Never "wrong/score/test" — results are "You and
Mr. Gupta agreed on N of 11" and differences are "You said X · Mr. Gupta said Y" + a visual
clue. Tricky galaxies get "Astronomers debate this one too."

## Interaction
Every move works two ways: pointer drag (mouse/touch/pen) **or** tap-to-select then tap a
destination. Targets ≥ 44 px. Galaxy names hidden until results.
