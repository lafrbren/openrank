# OpenRank

A local studio for building "Top N" countdown shorts for TikTok, YouTube Shorts, and Reels.
Paste clip links, trim and crop them, set a title and rank numbers, and export a 1080×1920 MP4.

Everything runs on your own machine. No account, no credits, no uploading your footage anywhere.
**What you see in the preview is what renders** — the export is measured from the live DOM, not
approximated from it.

## Install

Requires **Node 18+**, **ffmpeg**, and **yt-dlp**:

```bash
brew install ffmpeg yt-dlp
```

On Debian/Ubuntu: `sudo apt install ffmpeg && pipx install yt-dlp`.

Then run it straight from GitHub — no clone, no global install:

```bash
npx github:lafrbren/openrank
```

Your browser opens on the studio. That's the whole setup.

<details>
<summary>Prefer a clone?</summary>

```bash
git clone https://github.com/lafrbren/openrank.git
cd openrank
npm install     # builds the frontend automatically
npm start
```

</details>

## Usage

```
openrank [options]

  -p, --port <n>    port to listen on (default 5175, steps up if taken)
  -d, --data <dir>  where clips and renders are kept (default ~/.openrank)
      --cookies <b> reuse a browser login: chrome | firefox | safari | edge | brave
      --no-open     don't open a browser window
  -h, --help        show this
  -v, --version     print the version
```

Downloaded clips and finished renders live in `~/.openrank`. Your project — title, clips,
settings — persists in the browser between sessions.

### Making a countdown

1. **Ranking title** — rich text. Select part of it to bold, colour, or highlight just those
   words. Font, size, alignment, and stroke apply to the whole title.
2. **Frame** — *video height %* shrinks the clip into the 9:16 frame, leaving coloured bars top
   and bottom. That's room for your title and clearance from the platform's own UI.
3. **Numbers & captions** — font, colour, size, and stroke for the rank numerals and the captions
   beside them.
4. **Running order** — counts down from the last rank to #1 by default. Switch to *Custom* to
   reorder by hand or shuffle.
5. **Clips** — paste a TikTok / YouTube / Instagram link, or drop in an MP4. Each clip gets trim
   handles, crop sliders for all four edges, a volume level, and a caption.
6. **Render the countdown** — a 1080×1920 H.264 MP4 with the title, the full rank column, and
   captions accumulating beside their numbers, all burned in.

### Importing from Instagram and other logged-in-only posts

Instagram serves nothing to a logged-out client, so a Reel link fails by default with
*"Instagram sent an empty media response."* TikTok and YouTube increasingly do the same for
some posts. Lend the importer your own browser session:

```bash
openrank --cookies firefox
```

**Firefox is the least fussy** — its cookie store isn't encrypted, so it just works. Two macOS
caveats for the others:

- **Chrome** encrypts cookies with a Keychain key. The first run pops a Keychain prompt; approve
  it. If you see `Extracted 0 cookies (N could not be decrypted)`, that prompt was never
  answered — run it from a normal terminal, not a background process.
- **Safari** needs your terminal to have Full Disk Access (System Settings → Privacy & Security).

Or export a `cookies.txt` with any "Get cookies.txt" browser extension, which sidesteps browser
permissions entirely:

```bash
YTDLP_COOKIES_FILE=~/cookies.txt openrank
```

Either way, the manual path always works: download the clip yourself and drop the MP4 on the card.

### If a link stops working

Sites break yt-dlp extractors constantly. Update it before filing a bug:

```bash
brew upgrade yt-dlp
```

## Install it as an app

The studio is a PWA. Open it in Chrome and use **Install app** for a standalone window and a
dock icon. To reach it from your phone on the same network, use your machine's LAN address —
`http://192.168.x.x:5175`. Note that service workers only register over HTTPS or on localhost,
so a phone on `http://` gets the installed shell without offline caching.

## Development

```bash
npm install
npm run dev        # UI on :5173 with hot reload, API on :5175
npm run typecheck
npm run build
```

- `server/` — Express. `/api/import` (yt-dlp), `/api/upload`, `/api/render` (ffmpeg filter graph:
  per-clip trim → crop insets → scale-to-cover → pad onto background → PNG overlays → concat).
  `config.js` owns the data directory and the paths to external binaries.
- `bin/openrank.js` — the CLI: dependency preflight, port selection, then boots the server.
- `src/` — Vite + React + TypeScript. The preview composites exactly like the export: a `<video>`
  at `height: X%` with `object-fit: cover` and `clip-path: inset(...)` inside a 9:16 stage, with
  the title, numerals, and captions as DOM overlays. On export those overlays are measured from
  the live DOM and rasterized to transparent 1080×1920 PNGs in-browser, so the burned-in text
  matches the preview glyph for glyph.

`DESIGN.md` and `PRODUCT.md` describe the interface's design system and who it's for. `CLAUDE.md`
lists the constraints that silently corrupt output if broken — read it before touching the preview
stage or the export path.

## A note on what you make with it

OpenRank downloads clips other people made and stacks them into a compilation. Whether you have
the right to republish any given clip is between you, the person who made it, and the platform's
terms. The tool doesn't check, and neither its authors nor its licence give you permission you
don't already have.

## License

MIT — see [LICENSE](LICENSE).

Built on [yt-dlp](https://github.com/yt-dlp/yt-dlp) and [ffmpeg](https://ffmpeg.org), which are
separate programs, invoked as subprocesses, under their own licences.
