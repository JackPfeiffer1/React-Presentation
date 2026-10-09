# React in five minutes

An interactive slide deck for a five-minute lightning talk on React's three core ideas: **components, props and state**. It is built with React, so every demo on screen is real React code running live.


Live site: <https://jackpfeiffer1.github.io/React-Presentation/>

## Controls

| Key | Does |
| --- | --- |
| `→` `↓` `Space` `Enter` `PageDown` | Next step (clicker "next") |
| `←` `↑` `Backspace` `PageUp` | Previous step (clicker "back") |
| Next key during an animation | Finishes the animation instantly |
| `R` | Reset the current slide's demo |
| `G` | Jump menu (arrows or type a number, then `Enter`) |
| `Home` / `End` | First / last slide |
| `F` | Fullscreen |
| `M` | Sound on/off |
| `P` | Progress bar on/off |
| `H` | Click the like button (state slide) or the heart (last slide) |
| `?` | Show all shortcuts |
| `Esc` | Close a menu, or leave a text field |

Going back, jumping and reloading never replay animations; they show the finished state of that step. The address bar keeps your place (`#/6/4` means slide 6, step 4), so a reload or a crash lands you back where you were. Clicker "black screen" keys (`.` and `B`) and `F5` are ignored.

**Props slide audience card:** on the last step of slide 6 the name field is focused. Type the audience's suggestion, `Tab` to the job, `Enter` to make the card. Arrow keys type normally there, so use the clicker (`PageDown`/`PageUp`) or `Esc` to get out.

## Talk-day checklist

1. Open the live site in Chrome on the presenting laptop and press `F` for fullscreen.
2. Press `End`, then `Home`, so every image and font is cached.
3. Check the clicker: one press of "next" should move one step.
4. Decide on sound (`M`). The deck works fine silent.
5. If something goes wrong mid-demo, press `R` to restart that slide, or `G` to jump.
6. No internet? Run it locally: `npm ci && npm run build && npm run preview`, then open the printed URL.

## Running it locally

```bash
npm ci
npm run dev       # http://localhost:5173/React-Presentation/
npm run build     # production build into dist/
npm run lint
npm test          # Playwright tests at three projector sizes
```

`npm test` needs Chromium once: `npx playwright install chromium`.

## Editing

- **Slide order and step counts:** `src/slides/index.ts`. Each slide declares `lastStep`, which is how many presses it takes.
- **A slide's words and timing:** `src/slides/S01Hook.tsx` … `S11Close.tsx`. Each slide renders from its `step` number, so `step >= 2 && …` means "appears on the second press".
- **Demo code shown on screen:** `src/demo/*.jsx`. The code typed out on the slides is read straight from these files (the part between `// #show` and `// #endshow`), so the code you see is the code that runs.
- **People on the cards:** `src/demo/people.ts`. Their photos live in `public/`.
- **Look and feel:** `DESIGN.md` explains the design system; colors and sizes live in `src/styles/tokens.css`.
- **Credits:** `CREDITS.md`, and the small credit lines on each slide via `src/assets/images.ts`.

## Deploying

Every push to `main` builds and publishes the site with GitHub Actions (`.github/workflows/deploy.yml`). One-time setup: in the repository go to **Settings → Pages** and set **Source** to **GitHub Actions**.
