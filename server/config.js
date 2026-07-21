import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/**
 * Where OpenRank keeps its working files, and how it finds the tools it shells out to.
 *
 * Downloads and renders live under the user's home directory, never inside the
 * package: installed globally or run through `npx`, the install directory is
 * shared, may be read-only, and is wiped on upgrade.
 */
export const DATA_DIR =
  process.env.OPENRANK_DATA_DIR || path.join(os.homedir(), '.openrank')
export const MEDIA_DIR = path.join(DATA_DIR, 'media')
export const RENDER_DIR = path.join(DATA_DIR, 'renders')

export const ensureDirs = () => {
  fs.mkdirSync(MEDIA_DIR, { recursive: true })
  fs.mkdirSync(RENDER_DIR, { recursive: true })
}

/**
 * External binaries, resolved from PATH by default. The overrides exist for
 * anyone whose ffmpeg or yt-dlp is somewhere a login shell would find but a
 * launched process would not.
 */
export const BIN = {
  ffmpeg: process.env.FFMPEG_PATH || 'ffmpeg',
  ffprobe: process.env.FFPROBE_PATH || 'ffprobe',
  ytdlp: process.env.YTDLP_PATH || 'yt-dlp',
}

export const DEFAULT_PORT = Number(process.env.PORT) || 5175
