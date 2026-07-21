# OpenRank

A local studio for building "Top N" countdown shorts (TikTok / YouTube Shorts / Reels). Vite + React PWA on `:5173`, Express API on `:5175`, `yt-dlp` for clip retrieval and `ffmpeg` for the render. Single operator, runs entirely on this machine.

## Design Context

Read these before changing any UI. They are the source of truth; don't restate their contents here.

- **[PRODUCT.md](PRODUCT.md)** — who it's for and why. Register: **product**. Platform: **web**.
- **[DESIGN.md](DESIGN.md)** — the visual system (tokens, type, components, do's and don'ts). North star: **"The Edit Bay."**
- `.impeccable/design.json` — sidecar: tonal ramps, shadow/motion tokens, component snippets.

Positioning, in one line: **what you see is what renders.** The preview is not an approximation of the export; it is the export.

The tool stays quiet so the video can shout. Two accents only — gold means rank, rose means commit.

## Load-bearing constraints

These are not style preferences. Breaking them silently corrupts output:

- **Never give `.stage` a `border`, `padding`, or `transform`.** `src/export/overlays.ts` maps 1080×1920 export coordinates from that element's bounding box and reads the live geometry of `.stage-title`, `.stage-numbers`, `.stage-number`, and `.stage-number-caption` to rasterize overlays. A 1px border shifts every burned-in overlay by 3px. Frame the preview from outside with `box-shadow` only.
- **The preview must stay mounted and visible during export.** Title rasterization measures the real rendered DOM; it cannot run against a hidden or unmounted stage.
- **Don't rasterize overlays through SVG `foreignObject`.** Chrome taints the canvas and `toDataURL` throws. The DOM-measured canvas path in `overlays.ts` exists specifically to avoid this.
- **Keep status strings in sync with their comparisons** in `src/components/ExportPanel.tsx` (the progress bar keys off the exact `'Encoding…'` string).

## Working on this project

`npm run dev` runs both servers. `/impeccable <command>` is set up for design work — `quieter`, `audit`, and `critique` are the current open threads (the built chrome is punchier than the calm/precise personality PRODUCT.md commits to).
