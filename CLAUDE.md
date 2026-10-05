# Project: Galaxy Sort (classroom activity website)

**Read `PLANNING.md` first — living source of truth (decisions, next steps, session insights).
Keep it updated.** Visual rules live in `DESIGN.md`.

Quick facts:
- 18–20 min guest lecture activity for a high-school sophomore chemistry class: free sort →
  share → eyes-up (teacher explains) → guided sort (Elliptical/Spiral/Irregular) → feedback.
- Static vanilla HTML/CSS/JS (ES modules, no build). `npm run serve` → http://localhost:8000.
- Deploys to GitHub Pages (same setup as ../lenses-and-telescopes: branch `main`, root).
- Classroom settings (teacher name, unlock code, storage key) live in `js/config.js`.
- Galaxy data + student-facing clue text: `js/data/galaxies.js`; images in `images/galaxies/`.
- Cache-bust with `?v=N` on css/js imports when shipping changes.
