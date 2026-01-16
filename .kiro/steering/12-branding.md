---
inclusion: fileMatch
fileMatchPattern: ['**/*.css', '**/components/UI/**/*.tsx', '**/index.html']
---

# Branding & Visual Identity

## Visual Theme

**"Midnight Arctic Glitch"** - Y2K tech meets frozen digital prison.

## Color Palette

| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Primary | `#0F172A` | `slate-900` | Background, Overcast sky |
| Accent Ice | `#7DD3FC` | `sky-300` | UI highlights, Matrix code |
| Snow White | `#F8FAFC` | `slate-50` | Snow, text, primary UI |
| Glacier Blue | `#1E40AF` | `blue-800` | Shadows, deep ice |
| Frost Highlight | `#60A5FA` | `blue-400` | Active states, ability glows |
| Warning Red | `#EF4444` | `red-500` | Low warmth, danger |
| Hot Cocoa | `#8B4513` | (custom) | Collectibles, warmth |
| Matrix Green | `#10B981` | `emerald-500` | Glitch effects |

## Typography

```css
/* Headings / UI Titles */
font-family: 'Orbitron', sans-serif;
font-weight: 400 | 700;

/* Body / Flip Phone / HUD */
font-family: 'VT323', monospace;

/* Accents / Fun */
font-family: 'Luckiest Guy', cursive;
```

Load fonts in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=VT323&family=Luckiest+Guy&display=swap" rel="stylesheet">
```

## UI Aesthetic

### Frosted Glass

```css
.frosted-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(125, 211, 252, 0.3);
  border-radius: 0.5rem;
}
```

### Y2K Tech Elements

- Flip phone UI for messages
- Chunky digital camera aesthetic
- Pixelated icons where appropriate
- CRT scanline effects (subtle)

### Motion Design

- Screen shake on impact
- Slow-mo on kills (bullet time)
- Heavy snow particles
- Digital "code rain" shards

## Component Styling

### Buttons

```tsx
<button className="
  bg-sky-300/20
  hover:bg-sky-300/30
  border border-sky-300/50
  text-slate-50
  font-['Orbitron']
  px-6 py-3
  rounded-lg
  backdrop-blur-sm
  transition-colors
">
  Start Game
</button>
```

### HUD Elements

```tsx
<div className="
  fixed top-4 left-4
  font-['VT323']
  text-2xl
  text-slate-50
  drop-shadow-[0_0_8px_rgba(125,211,252,0.5)]
">
  Score: {score}
</div>
```

### Warning States

```tsx
{warmth < 30 && (
  <div className="
    text-red-500
    animate-pulse
    font-['Orbitron']
  ">
    LOW WARMTH
  </div>
)}
```

## Logo Guidelines

- Text: "Overcast: Glaciers!" in Orbitron
- Color: White with cyan glow shadow
- Icon: Kung-fu kitten silhouette (mid-kick) on glacier peak

## Accessibility

- Maintain WCAG AA contrast ratios
- Don't rely on color alone for information
- Provide text alternatives for icons
- Respect reduced motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none;
  }
}
```
