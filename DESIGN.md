# Design Language — "Night Observatory" (classroom edition)

> Inherited from ../lenses-and-telescopes/DESIGN.md. Differences for this project are noted.

## Palette (tokens in `css/main.css :root`)
| Role | Hex | Notes |
|------|-----|-------|
| Sky | `#0b1026` → `#1c2450` | CSS gradient + a few CSS star dots (no canvas — keep it light) |
| Surface | `rgba(20,27,56,0.88)` | cards, groups, bins |
| Text / dim | `#f2f5ff` / `#b4bee2` | dim raised slightly vs. telescope site for projectors |
| Accent (amber) | `#f2b04a` | primary buttons, selection ring, drop-target highlight |
| Elliptical | `#f2b04a` | echoes old yellow stars |
| Spiral | `#61a8ff` | echoes blue arms |
| Irregular | `#ff7eb6` | echoes pink star-forming gas |
| Agree ✓ | `#53e08c` | |

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
