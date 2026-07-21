#!/usr/bin/env node
import { execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// server/config.js reads the environment once, at module scope. `import` is
// hoisted, so importing it here would freeze the paths before --data and
// --cookies could be applied; it is loaded on demand inside main() instead.

const execFileP = promisify(execFile)
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))

const HELP = `
  openrank ${pkg.version} — a local studio for "Top N" countdown shorts

  Usage
    openrank [options]

  Options
    -p, --port <n>    port to listen on (default 5175, steps up if taken)
    -d, --data <dir>  where clips and renders are kept (default ~/.openrank)
        --cookies <b> reuse a browser's login for private posts:
                      chrome | firefox | safari | edge | brave
        --no-open     don't open a browser window
    -h, --help        show this
    -v, --version     print the version

  Requires ffmpeg and yt-dlp on PATH:
    brew install ffmpeg yt-dlp
`

const parseArgs = argv => {
  const opts = { open: true }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = () => argv[++i]
    if (a === '-h' || a === '--help') opts.help = true
    else if (a === '-v' || a === '--version') opts.version = true
    else if (a === '--no-open') opts.open = false
    else if (a === '-p' || a === '--port') opts.port = Number(next())
    else if (a === '-d' || a === '--data') opts.data = next()
    else if (a === '--cookies') opts.cookies = next()
    else return { error: `Unknown option: ${a}` }
  }
  if (opts.port !== undefined && !Number.isInteger(opts.port)) return { error: '--port needs a number' }
  return opts
}

/** Both tools are hard requirements; say so once, with the command that fixes it. */
const preflight = async BIN => {
  const checks = [
    ['ffmpeg', BIN.ffmpeg, ['-version']],
    ['ffprobe', BIN.ffprobe, ['-version']],
    ['yt-dlp', BIN.ytdlp, ['--version']],
  ]
  const missing = []
  for (const [name, cmd, args] of checks) {
    try { await execFileP(cmd, args) } catch { missing.push(name) }
  }
  if (!missing.length) return true

  const brew = missing.includes('ffmpeg') || missing.includes('ffprobe') ? ['ffmpeg'] : []
  if (missing.includes('yt-dlp')) brew.push('yt-dlp')
  console.error(`\n  OpenRank needs ${missing.join(' and ')}, which ${missing.length > 1 ? 'are' : 'is'} not on your PATH.\n`)
  console.error(`    macOS     brew install ${brew.join(' ')}`)
  console.error(`    Linux     sudo apt install ffmpeg  &&  pipx install yt-dlp`)
  console.error(`\n  Already installed somewhere unusual? Point at it directly:`)
  console.error(`    FFMPEG_PATH=/path/to/ffmpeg YTDLP_PATH=/path/to/yt-dlp openrank\n`)
  return false
}

const openBrowser = url => {
  const cmd = process.platform === 'darwin' ? 'open'
    : process.platform === 'win32' ? 'start'
    : 'xdg-open'
  // Best effort: a headless box or a locked-down desktop just prints the URL.
  spawn(cmd, [url], { stdio: 'ignore', detached: true, shell: process.platform === 'win32' })
    .on('error', () => {})
    .unref()
}

const main = async () => {
  const opts = parseArgs(process.argv.slice(2))
  if (opts.error) { console.error(`\n  ${opts.error}\n${HELP}`); process.exit(1) }
  if (opts.help) { console.log(HELP); return }
  if (opts.version) { console.log(pkg.version); return }

  // Flags become environment before config.js is first evaluated — that module
  // resolves its paths once, at import time.
  if (opts.data) process.env.OPENRANK_DATA_DIR = path.resolve(opts.data)
  if (opts.cookies) process.env.YTDLP_COOKIES_FROM_BROWSER = opts.cookies

  const { BIN, DATA_DIR, DEFAULT_PORT, ensureDirs } = await import('../server/config.js')

  if (!(await preflight(BIN))) process.exit(1)

  if (!fs.existsSync(path.join(ROOT, 'dist', 'index.html'))) {
    console.error('\n  The frontend has not been built. Run `npm run build` first.\n')
    process.exit(1)
  }

  ensureDirs()
  const { start } = await import('../server/index.js')
  const { port } = await start({ port: opts.port ?? DEFAULT_PORT })
  const url = `http://localhost:${port}`

  console.log(`\n  OpenRank is running`)
  console.log(`    ${url}`)
  console.log(`    files  ${DATA_DIR}`)
  if (opts.cookies) console.log(`    login  reusing ${opts.cookies} cookies for private posts`)
  console.log(`\n  Ctrl+C to stop.\n`)

  if (opts.open) openBrowser(url)
}

main().catch(err => {
  console.error(`\n  ${err?.message || err}\n`)
  process.exit(1)
})
