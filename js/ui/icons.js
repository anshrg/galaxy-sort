// Simple inline SVG glyphs for the three galaxy types (shape + color, never color alone).
export const ICONS = {
  elliptical: `<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="24" rx="21" ry="14" fill="currentColor" opacity=".25"/><ellipse cx="24" cy="24" rx="13" ry="8.5" fill="currentColor" opacity=".5"/><ellipse cx="24" cy="24" rx="5" ry="3.5" fill="currentColor"/></svg>`,
  spiral: `<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M24 24c1-6 9-8 12-3s-1 13-10 14-16-6-15-15"/><path d="M24 24c-1 6-9 8-12 3s1-13 10-14 16 6 15 15"/></g><circle cx="24" cy="24" r="4" fill="currentColor"/></svg>`,
  irregular: `<svg viewBox="0 0 48 48" aria-hidden="true" fill="currentColor"><circle cx="17" cy="20" r="7" opacity=".55"/><circle cx="29" cy="15" r="4.5" opacity=".8"/><circle cx="31" cy="29" r="8" opacity=".4"/><circle cx="16" cy="33" r="4" opacity=".85"/><circle cx="37" cy="20" r="2.5"/><circle cx="24" cy="25" r="3"/><circle cx="9" cy="27" r="2"/></svg>`,
};

export const ZOOM_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M14 4h6v6M10 20H4v-6M20 4l-6 6M4 20l6-6"/></svg>`;
