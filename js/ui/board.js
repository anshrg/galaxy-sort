// Drag-or-tap sorting for any element containing `.tile[data-id]` items and `[data-zone]` targets.
// One Pointer Events path covers mouse, touch, and pen. A press that moves < DRAG_PX is a tap:
// tap a tile to select it (gold ring), then tap a zone to move it there.

const DRAG_PX = 6;
const EDGE_PX = 70; // auto-scroll band at the top/bottom of the viewport while dragging

export class Board {
  /** @param {HTMLElement} root  @param {(id: string, zone: string) => void} onMove */
  constructor(root, onMove) {
    this.root = root;
    this.onMove = onMove;
    this.selected = null;
    this.drag = null;
    root.addEventListener('pointerdown', (e) => this._down(e));
    root.addEventListener('click', (e) => this._zoneClick(e));
    root.addEventListener('keydown', (e) => this._key(e));
    this.move = (e) => this._move(e);
    this.up = (e) => this._up(e, false);
    this.cancel = (e) => this._up(e, true);
  }

  select(id) {
    this.selected = id;
    for (const t of this.root.querySelectorAll('.tile')) {
      const on = t.dataset.id === id;
      t.classList.toggle('selected', on);
      t.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    this.root.classList.toggle('has-selection', !!id);
  }

  _down(e) {
    if (e.button > 0 || this.drag) return;
    const tile = e.target.closest('.tile');
    if (!tile || !this.root.contains(tile) || e.target.closest('.zoom')) return;
    e.preventDefault(); // no text selection / native image drag
    const r = tile.getBoundingClientRect();
    this.drag = {
      tile,
      id: tile.dataset.id,
      pid: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      x: e.clientX,
      y: e.clientY,
      ox: e.clientX - r.left,
      oy: e.clientY - r.top,
      started: false,
      ghost: null,
      over: null,
      raf: 0,
    };
    window.addEventListener('pointermove', this.move);
    window.addEventListener('pointerup', this.up);
    window.addEventListener('pointercancel', this.cancel);
  }

  _move(e) {
    const d = this.drag;
    if (!d || e.pointerId !== d.pid) return;
    d.x = e.clientX;
    d.y = e.clientY;
    if (!d.started) {
      if (Math.hypot(d.x - d.x0, d.y - d.y0) < DRAG_PX) return;
      d.started = true;
      d.ghost = d.tile.cloneNode(true);
      d.ghost.classList.add('ghost');
      d.ghost.classList.remove('selected');
      d.ghost.style.width = `${d.tile.offsetWidth}px`;
      d.ghost.style.height = `${d.tile.offsetHeight}px`;
      document.body.append(d.ghost);
      d.tile.classList.add('dragging');
      this.select(null);
      d.raf = requestAnimationFrame(() => this._tick());
    }
    this._place();
  }

  _place() {
    const d = this.drag;
    d.ghost.style.transform = `translate(${d.x - d.ox}px, ${d.y - d.oy}px) scale(1.06)`;
    const zone = document.elementFromPoint(d.x, d.y)?.closest('[data-zone]');
    const over = zone && this.root.contains(zone) ? zone : null;
    if (over !== d.over) {
      d.over?.classList.remove('over');
      over?.classList.add('over');
      d.over = over;
    }
  }

  // Auto-scroll so phones can drag from the galaxy strip down to groups below the fold.
  _tick() {
    const d = this.drag;
    if (!d?.started) return;
    const dy = d.y < EDGE_PX ? -14 : d.y > innerHeight - EDGE_PX ? 14 : 0;
    if (dy) {
      window.scrollBy(0, dy);
      this._place();
    }
    d.raf = requestAnimationFrame(() => this._tick());
  }

  _up(e, cancelled) {
    const d = this.drag;
    if (!d || e.pointerId !== d.pid) return;
    window.removeEventListener('pointermove', this.move);
    window.removeEventListener('pointerup', this.up);
    window.removeEventListener('pointercancel', this.cancel);
    this.drag = null;
    if (!d.started) {
      if (!cancelled) this._tapTile(d.tile);
      return;
    }
    cancelAnimationFrame(d.raf);
    d.ghost.remove();
    d.tile.classList.remove('dragging');
    d.over?.classList.remove('over');
    if (!cancelled && d.over) this.onMove(d.id, d.over.dataset.zone);
  }

  // With a galaxy picked up, tapping a galaxy that sits in a *different* group/bin means
  // "put it there" (students tap the group wherever they like, often on its galaxies).
  // Tapping one in the unsorted pool, or in the same group, just changes the selection.
  _tapTile(tile) {
    const id = tile.dataset.id;
    const zone = tile.closest('[data-zone]')?.dataset.zone;
    const sel = this.selected && this.root.querySelector(`.tile[data-id="${this.selected}"]`);
    const selZone = sel?.closest('[data-zone]')?.dataset.zone;
    if (sel && id !== this.selected && zone && zone !== 'pool' && zone !== selZone) {
      const moving = this.selected;
      this.select(null);
      this.onMove(moving, zone);
      return;
    }
    this.select(this.selected === id ? null : id);
  }

  _zoneClick(e) {
    if (!this.selected) return;
    // the name box counts as part of its group: tapping a group's title is a natural target
    if (e.target.closest('.tile, button')) return;
    const zone = e.target.closest('[data-zone]');
    if (!zone || !this.root.contains(zone)) return;
    const id = this.selected;
    this.select(null);
    this.onMove(id, zone.dataset.zone);
  }

  _key(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const tile = e.target.closest('.tile');
    if (tile && e.target === tile) {
      e.preventDefault();
      this._tapTile(tile);
    } else if (this.selected && e.target.matches('[data-zone]')) {
      e.preventDefault();
      const id = this.selected;
      this.select(null);
      this.onMove(id, e.target.dataset.zone);
    }
  }
}
