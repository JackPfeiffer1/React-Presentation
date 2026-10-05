# Design system: "Ink and Paper"

This document is the single source of truth for how the presentation looks and moves.
Every slide is checked against it before it ships.

## Sources

| Area | Source | What we take from it |
| --- | --- | --- |
| Grid and type | Josef Müller-Brockmann, *Grid Systems in Graphic Design* (International Typographic Style) | Strict column grid, flush-left ragged-right text, hierarchy through scale contrast, asymmetric layouts, no ornament |
| Hierarchy | Adam Wathan and Steve Schoger, *Refactoring UI* | Emphasize by de-emphasizing, hierarchy through weight and color before size, fewer borders, more space |
| Motion | Material Design 3 motion tokens | Named easing curves and duration steps, pushed faster for a talk |
| Contrast | WCAG 2.2 | AAA (7:1) for meaningful text, because projectors wash contrast out |

## Concept

Cinematic near-black **ink** slides carry the emotional beats (hook, React reveal, industry stats, close).
Warm off-white **paper** slides carry the teaching beats, because dark-on-light reads best in a lit classroom.
Switching between ink and paper is always a full-bleed wipe, so the switch itself becomes rhythm.

One idea per screen. If a slide needs a paragraph, the slide is wrong.

## Color

Exactly one accent hue. Everything else is neutral.

| Token | Value | Use |
| --- | --- | --- |
| `--ink-0` | `#0A0A0A` | Ink background |
| `--ink-1` | `#141414` | Code panel, raised surfaces on ink |
| `--ink-2` | `#222222` | Hover / secondary surface on ink |
| `--ink-line` | `#2E2E2E` | Hairlines on ink |
| `--paper-0` | `#F4F2EE` | Paper background |
| `--paper-1` | `#EAE7E1` | Recessed surfaces on paper |
| `--paper-line` | `#D6D2CA` | Hairlines on paper |
| `--text-on-ink` | `#F4F2EE` | Primary text on ink |
| `--muted-on-ink` | `#9A9893` | Secondary text on ink |
| `--text-on-paper` | `#0F0F0F` | Primary text on paper |
| `--muted-on-paper` | `#5E5B55` | Secondary text on paper |
| `--accent` | `#58C4DC` | The accent: fills, strokes, cursor, highlights, accent text on ink |
| `--accent-ink` | `#087EA4` | Same hue, darkened: the only accent allowed as text on paper |

Banned: gradients, radial glows, glassmorphism, purple/indigo/violet, colored shadows, neon.
Allowed shadow (cards and the chat notification only): `0 1px 2px rgba(0,0,0,.08), 0 12px 32px rgba(0,0,0,.10)`.

## Typography

| Role | Family | Size (stage px) | Weight | Tracking |
| --- | --- | --- | --- | --- |
| Display | Instrument Serif | 240 (up to 320 for numbers) | 400 | -0.02em |
| H1 | Inter Tight | 120 | 600 | -0.035em |
| H2 | Inter Tight | 72 | 600 | -0.03em |
| Body | Inter Tight | 40 | 450 | -0.01em |
| Code | JetBrains Mono | 34, line-height 1.55 | 500 | 0 |
| Caption | Inter Tight | 24 | 500 | 0 |
| Credit | Inter Tight | 14 | 450 | 0.01em |

- Display serif is reserved for single emotional words or numbers: "React.", "One.", "44.7%", "Thanks."
- No weight below 400; thin strokes disappear on projectors.
- No ligatures in code, so `=>` stays readable for beginners.
- Lines of on-screen text stay under 12 words. Headlines under 7.
- Flush left. Centered text only for the single-word cinematic moments.

## Grid and spacing

- Stage: 1920 x 1080. Scaled to fit; letterbox uses the current slide's background color.
- 12 columns, 120px outer margin, 24px gutter. Column width = (1920 - 240 - 11 * 24) / 12 = 118px.
- 8px baseline. All spacing is a multiple of 8. Major blocks are separated by at least 96px.
- Asymmetric splits only: 7/5, 5/7, 8/4. Never three equal columns of feature cards.
- No cards inside cards. A code panel and a preview sit side by side on the slide surface.

## Code panel

- Background `--ink-1`, radius 20px, no border, padding 56px 64px.
- One label: the filename in muted mono, top-left.
- Syntax theme (four colors, all from the palette):
  - Tags and components: `--accent`
  - Strings: `--text-on-ink` at 78%
  - Keywords (`function`, `return`, `const`): `--text-on-ink`, weight 700
  - Punctuation, brackets, operators: `--muted-on-ink`
  - `props` and its properties: `--accent`, italic
  - Plain identifiers and text: `--text-on-ink`
- Line focus: active lines at 100% with a 4px accent bar in the gutter; other lines drop to 28%.
- Freshly typed characters appear in `--accent` and settle to their syntax color over 600ms.

## Motion

| Token | Value | Use |
| --- | --- | --- |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances |
| `--ease-emphasized` | `cubic-bezier(0.2, 0, 0, 1)` | Wipes, camera moves |
| `--ease-in-quart` | `cubic-bezier(0.5, 0, 0.75, 0)` | Exits |
| `pop` spring | stiffness 520, damping 28 | Things appearing |
| `stamp` spring | stiffness 700, damping 22 | Cards being stamped |
| `drift` spring | stiffness 120, damping 20 | Slow settles |
| micro | 160ms | Hover, small state |
| standard | 420ms | Most entrances |
| hero | 720ms | Big headlines, wipes |
| reveal | 1400ms | The React reveal, counters |
| stagger | 45ms small, 90ms large | Lists |

Rules:

1. Things enter from below (24-40px) while fading in. Headlines rise inside a mask.
2. Nothing loops forever except the closing heart pulse and the code cursor blink.
3. The presenter controls time. Nothing starts without a key press; a press during an animation finishes it.
4. Going backwards never animates. It snaps to the finished state.
5. `prefers-reduced-motion` turns movement into fades.

## Imagery

- Photographs only (Wikimedia Commons, or AI-generated photography when nothing suitable exists).
- No vector illustrations, no abstract tech art, no 3D blobs.
- Logos are monochrome, drawn in the text color of the slide.
- Every external image is credited at 14px, muted, bottom-left: "Photo: Author, License, via Wikimedia Commons".

## Icons

Almost none: the heart (state and close slides) and the QR code. Never sparkles, wands or stars.

## Do / don't

Do:

- Leave one-third of every slide empty.
- Let one thing be big. Everything else is small and quiet.
- Align everything to the grid's left edges.
- Use real content (real people, real code that actually runs).

Don't:

- Add badges or pills above headlines.
- Add borders to separate things that space can separate.
- Use icons as bullets.
- Put a shadow on anything except cards and the notification.
- Use more than one accent color, ever.
