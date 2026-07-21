import express from 'express'
import multer from 'multer'
import { spawn, execFile } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { nanoid } from 'nanoid'
import { BIN, DEFAULT_PORT, MEDIA_DIR, RENDER_DIR, ensureDirs } from './config.js'

const execFileP = promisify(execFile)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
ensureDirs()

const app = express()
app.use(express.json({ limit: '80mb' }))

const upload = multer({
  storage: multer.diskStorage({
    destination: MEDIA_DIR,
    filename: (_req, file, cb) => cb(null, `${nanoid(10)}${path.extname(file.originalname) || '.mp4'}`)
  }),
  limits: { fileSize: 500 * 1024 * 1024 }
})

app.use('/media', express.static(MEDIA_DIR, { acceptRanges: true }))
app.use('/renders', express.static(RENDER_DIR, { acceptRanges: true }))

async function probe(file) {
  const { stdout } = await execFileP(BIN.ffprobe, [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height:format=duration',
    '-of', 'json', file
  ])
  const info = JSON.parse(stdout)
  return {
    width: info.streams?.[0]?.width ?? 1080,
    height: info.streams?.[0]?.height ?? 1920,
    duration: parseFloat(info.format?.duration ?? '0')
  }
}

// ---- Force a proper filename + attachment download for a finished render ----
app.get('/download/:name', (req, res) => {
  const file = path.join(RENDER_DIR, path.basename(req.params.name))
  if (!fs.existsSync(file)) return res.status(404).end()
  const as = typeof req.query.as === 'string' && req.query.as ? req.query.as : path.basename(file)
  const safe = as.replace(/[^a-zA-Z0-9._-]/g, '_')
  res.download(file, safe.endsWith('.mp4') ? safe : `${safe}.mp4`)
})

// Instagram (and increasingly TikTok and YouTube) serve nothing to an anonymous
// client. yt-dlp needs a logged-in session, supplied either from a browser
// profile or from an exported cookies.txt. Opt in per machine:
//   YTDLP_COOKIES_FROM_BROWSER=chrome|firefox|safari|edge|brave
//   YTDLP_COOKIES_FILE=/path/to/cookies.txt   (takes precedence)
const cookieArgs = () => {
  const file = process.env.YTDLP_COOKIES_FILE
  if (file) return ['--cookies', file]
  const browser = process.env.YTDLP_COOKIES_FROM_BROWSER
  if (browser) return ['--cookies-from-browser', browser]
  return []
}

// yt-dlp's own errors are paragraphs aimed at people filing bug reports. Turn the
// ones an operator can actually act on into a sentence, and keep the rest verbatim.
const explainFailure = (stderr, url) => {
  let host = 'That site'
  try { host = new URL(url).hostname.replace(/^www\./, '') } catch { /* keep the default */ }
  const usingCookies = cookieArgs().length > 0

  // Ordered most specific first. Match only on what the *site* said: yt-dlp's own
  // cookie-extraction chatter lands in stderr too, so the word "cookies" appearing
  // there means nothing about why the download failed.
  if (/max-filesize|File is larger than/i.test(stderr)) {
    return 'That video is over the 500MB import limit. Trim it first, or drop the file in directly.'
  }
  if (/empty media response|login required|rate-limit|requested content is not available|Sign in to confirm|age-restricted/i.test(stderr)) {
    return usingCookies
      ? `${host} rejected the session cookies. They may have expired — sign in to ${host} in that browser again, or re-export cookies.txt. Some posts are also region- or age-restricted.`
      : `${host} won't serve this post to a logged-out visitor, which is how the importer runs by default. Restart the server with YTDLP_COOKIES_FROM_BROWSER=chrome (or firefox / safari / edge / brave) to reuse your own session, or download the clip yourself and drop the file in instead.`
  }
  if (/unavailable|Private video|has been removed|404|does not exist|account is private/i.test(stderr)) {
    return `${host} says this post is private, removed, or the link is wrong. Check that it opens in a browser.`
  }
  const lines = stderr.split('\n').filter(l => l.includes('ERROR'))
  return (lines.join('\n') || stderr).slice(0, 500)
}

// ---- Import a TikTok / YouTube / Instagram link via yt-dlp ----
app.post('/api/import', async (req, res) => {
  const { url } = req.body || {}
  if (!url || !/^https?:\/\//i.test(url)) return res.status(400).json({ error: 'Invalid URL' })
  const id = nanoid(10)
  const outTpl = path.join(MEDIA_DIR, `${id}.%(ext)s`)
  const args = [
    '-f', 'bv*[ext=mp4][height<=1920]+ba[ext=m4a]/b[ext=mp4]/b',
    '--merge-output-format', 'mp4',
    '--no-playlist',
    '--max-filesize', '500M',
    ...cookieArgs(),
    '-o', outTpl,
    '--print', 'after_move:filepath',
    '--print', 'title',
    url
  ]
  const child = spawn(BIN.ytdlp, args)
  let out = '', err = ''
  child.stdout.on('data', d => (out += d))
  child.stderr.on('data', d => (err += d))
  // Without this, a missing binary emits an unhandled 'error' event and takes the
  // whole server down instead of failing this one import.
  child.on('error', e => {
    console.error('yt-dlp could not be started:', e)
    res.status(500).json({
      error: 'Download failed',
      detail: e.code === 'ENOENT'
        ? 'yt-dlp is not installed or not on PATH. Install it with: brew install yt-dlp'
        : String(e),
    })
  })
  child.on('close', async code => {
    if (code !== 0) {
      console.error('yt-dlp failed:', err.slice(-2000))
      return res.status(422).json({ error: 'Download failed', detail: explainFailure(err, url) })
    }
    try {
      const lines = out.trim().split('\n')
      const filepath = lines.find(l => l.startsWith(MEDIA_DIR)) || lines[lines.length - 1]
      const title = lines.find(l => !l.startsWith('/')) || ''
      const meta = await probe(filepath)
      res.json({ id, file: `/media/${path.basename(filepath)}`, title, ...meta })
    } catch (e) {
      res.status(500).json({ error: String(e) })
    }
  })
})

// ---- Direct file upload ----
app.post('/api/upload', upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' })
  try {
    const meta = await probe(req.file.path)
    res.json({ id: path.parse(req.file.filename).name, file: `/media/${req.file.filename}`, title: req.file.originalname, ...meta })
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

// ---- Render final 1080x1920 mp4 with ffmpeg ----
// body: { background, videoHeight, clips: [{ file, trimStart, trimEnd, volume, crop:{top,right,bottom,left}, overlayPng }], titlePng }
// overlayPng / titlePng are 1080x1920 transparent PNG data URLs rasterized client-side.
const jobs = new Map()

app.post('/api/render', async (req, res) => {
  const { background = '#000000', videoHeight = 80, clips = [], titlePng } = req.body || {}
  if (!clips.length) return res.status(400).json({ error: 'No clips' })
  const jobId = nanoid(8)
  jobs.set(jobId, { status: 'running', progress: 0 })
  res.json({ jobId })

  const tmpPngs = []
  const savePng = dataUrl => {
    const p = path.join(RENDER_DIR, `${jobId}-${tmpPngs.length}.png`)
    fs.writeFileSync(p, Buffer.from(dataUrl.split(',')[1], 'base64'))
    tmpPngs.push(p)
    return p
  }

  try {
    const W = 1080, H = 1920
    const vh = Math.round((H * Math.min(100, Math.max(10, videoHeight))) / 100)
    const yOff = Math.round((H - vh) / 2)
    const bg = background.replace('#', '0x')

    const inputs = []
    const filters = []
    const concatRefs = []
    let inputCount = 0
    const addInput = file => { inputs.push('-i', file); return inputCount++ }

    // clip video files first: input indices 0..n-1; overlay/title PNGs appended after
    const clipIdx = clips.map(c => addInput(path.join(MEDIA_DIR, path.basename(c.file))))
    const overlayIdx = clips.map(c => (c.overlayPng ? addInput(savePng(c.overlayPng)) : null))
    const titleIdx = titlePng ? addInput(savePng(titlePng)) : null

    clips.forEach((c, i) => {
      const vi = clipIdx[i], t = c.crop?.top ?? 0, r = c.crop?.right ?? 0, b = c.crop?.bottom ?? 0, l = c.crop?.left ?? 0
      const start = Math.max(0, c.trimStart ?? 0)
      const end = Math.max(start + 0.1, c.trimEnd ?? 0)
      const vol = c.volume ?? 1
      // crop insets (fractions of source), then scale to cover W x vh, center-crop, pad onto bg, overlay clip PNG
      filters.push(
        `[${vi}:v]trim=${start}:${end},setpts=PTS-STARTPTS,` +
        `crop=iw*${(1 - (l + r) / 100).toFixed(4)}:ih*${(1 - (t + b) / 100).toFixed(4)}:iw*${(l / 100).toFixed(4)}:ih*${(t / 100).toFixed(4)},` +
        `scale=${W}:${vh}:force_original_aspect_ratio=increase,crop=${W}:${vh},` +
        `pad=${W}:${H}:0:${yOff}:color=${bg},setsar=1,fps=30,format=yuv420p[v${i}base]`
      )
      let vLabel = `v${i}base`
      if (overlayIdx[i] !== null) {
        filters.push(`[${vLabel}][${overlayIdx[i]}:v]overlay=0:0[v${i}o]`)
        vLabel = `v${i}o`
      }
      filters.push(`[${vi}:a]atrim=${start}:${end},asetpts=PTS-STARTPTS,volume=${vol},aresample=44100,pan=stereo|c0=c0|c1=c1[a${i}]`)
      concatRefs.push(`[${vLabel}][a${i}]`)
    })

    filters.push(`${concatRefs.join('')}concat=n=${clips.length}:v=1:a=1[vcat][acat]`)
    let finalV = 'vcat'
    if (titleIdx !== null) {
      filters.push(`[vcat][${titleIdx}:v]overlay=0:0[vfinal]`)
      finalV = 'vfinal'
    }

    const outFile = path.join(RENDER_DIR, `ranking-${jobId}.mp4`)
    const args = [
      ...inputs,
      '-filter_complex', filters.join(';'),
      '-map', `[${finalV}]`, '-map', '[acat]',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '19',
      '-c:a', 'aac', '-b:a', '192k',
      '-movflags', '+faststart',
      '-y', outFile
    ]
    console.log('ffmpeg', args.join(' ').slice(0, 500))
    const ff = spawn(BIN.ffmpeg, args)
    let ffErr = ''
    const totalDur = clips.reduce((s, c) => s + Math.max(0.1, (c.trimEnd ?? 0) - (c.trimStart ?? 0)), 0)
    ff.stderr.on('data', d => {
      ffErr += d
      const m = /time=(\d+):(\d+):([\d.]+)/.exec(String(d))
      if (m) {
        const t = +m[1] * 3600 + +m[2] * 60 + +m[3]
        jobs.set(jobId, { status: 'running', progress: Math.min(0.99, t / totalDur) })
      }
    })
    ff.on('close', code => {
      for (const p of tmpPngs) fs.rmSync(p, { force: true })
      if (code === 0) jobs.set(jobId, { status: 'done', progress: 1, file: `/renders/${path.basename(outFile)}` })
      else {
        console.error(ffErr.slice(-3000))
        jobs.set(jobId, { status: 'error', error: ffErr.split('\n').slice(-8).join('\n') })
      }
    })
  } catch (e) {
    jobs.set(jobId, { status: 'error', error: String(e) })
  }
})

app.get('/api/render/:jobId', (req, res) => {
  res.json(jobs.get(req.params.jobId) || { status: 'unknown' })
})

// production: serve built frontend
const dist = path.join(ROOT, 'dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get(/^\/(?!api|media|renders).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

/**
 * Listen on `port`, stepping forward if it is taken. A studio left running in
 * another tab shouldn't stop this one from starting; the CLI prints whichever
 * port actually won.
 */
export function start({ port = DEFAULT_PORT, host = '0.0.0.0', maxAttempts = 10 } = {}) {
  return new Promise((resolve, reject) => {
    const attempt = (p, triesLeft) => {
      const server = app.listen(p, host)
      server.once('listening', () => resolve({ server, port: p }))
      server.once('error', err => {
        if (err.code === 'EADDRINUSE' && triesLeft > 0) return attempt(p + 1, triesLeft - 1)
        reject(err)
      })
    }
    attempt(port, maxAttempts)
  })
}

// `node server/index.js` still works on its own, for development.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  start().then(({ port }) => console.log(`OpenRank server on http://localhost:${port}`))
}

export default app
