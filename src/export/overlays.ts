import type { ProjectState } from '../types'
import { fontStack } from '../fonts'

// Export frame is 1080x1920. Overlays are scaled from the live preview stage so
// the render is a faithful copy of what the user designed on screen.
const W = 1080
const H = 1920

/** Scale factor from the on-screen preview stage width up to the 1080px export. */
function getScale(): number {
  const el = document.querySelector('.stage') as HTMLElement | null
  const w = el?.clientWidth || 360
  return W / w
}

async function ensureFonts(state: ProjectState) {
  const t = fontStack(state.titleStyle.font)
  const n = fontStack(state.numberStyle.font)
  const c = fontStack(state.captionStyle.font)
  await Promise.allSettled([
    document.fonts.load(`900 80px ${t}`),
    document.fonts.load(`700 80px ${t}`),
    document.fonts.load(`italic 400 80px ${t}`),
    document.fonts.load(`400 80px ${t}`),
    document.fonts.load(`700 80px ${n}`),
    document.fonts.load(`700 80px ${c}`),
  ])
  await document.fonts.ready
}

const OPAQUE = (c: string) => !!c && c !== 'transparent' && c !== 'rgba(0, 0, 0, 0)'

/** Non-space word tokens with their character offsets within a text node. */
function words(text: string): { start: number; end: number }[] {
  const out: { start: number; end: number }[] = []
  const re = /\S+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) out.push({ start: m.index, end: m.index + m[0].length })
  return out
}

/**
 * Transparent 1080x1920 PNG of the ranking title. It reads the ACTUAL rendered
 * geometry of the live preview title (per-word bounding boxes, so wrapping, line
 * breaks and alignment come straight from the browser's layout) and repaints each
 * word onto canvas with its real font / color / highlight / stroke. The result
 * matches the on-screen design 1:1 and, being pure canvas, is exportable
 * (drawing an SVG foreignObject to canvas would taint it and block toDataURL).
 */
export async function renderTitlePng(state: ProjectState): Promise<string | null> {
  const titleEl = document.querySelector('.stage-title') as HTMLElement | null
  const stageEl = document.querySelector('.stage') as HTMLElement | null
  if (!titleEl || !stageEl || !titleEl.innerText.trim()) return null

  await ensureFonts(state)
  const stageRect = stageEl.getBoundingClientRect()
  const scale = W / stageRect.width
  const { stroke, strokeColor } = state.titleStyle

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'

  const walker = document.createTreeWalker(titleEl, NodeFilter.SHOW_TEXT)
  let node: Node | null
  while ((node = walker.nextNode())) {
    const text = node.nodeValue ?? ''
    if (!text.trim()) continue
    const parent = (node.parentElement as HTMLElement) || titleEl
    const cs = getComputedStyle(parent)
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${parseFloat(cs.fontSize) * scale}px ${cs.fontFamily}`
    const color = cs.color
    const bg = cs.backgroundColor

    for (const w of words(text)) {
      const range = document.createRange()
      range.setStart(node, w.start)
      range.setEnd(node, w.end)
      const rect = range.getBoundingClientRect()
      if (!rect.width) continue
      const x = (rect.left - stageRect.left) * scale
      const yMid = (rect.top + rect.height / 2 - stageRect.top) * scale
      const str = text.slice(w.start, w.end)

      if (OPAQUE(bg)) {
        ctx.fillStyle = bg
        ctx.fillRect(x, (rect.top - stageRect.top) * scale, rect.width * scale, rect.height * scale)
      }
      if (stroke > 0) {
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = (stroke / 2) * scale
        ctx.strokeText(str, x, yMid)
      }
      ctx.fillStyle = color
      ctx.fillText(str, x, yMid)
    }
  }
  return canvas.toDataURL('image/png')
}

/**
 * Per-segment overlay: the full rank column 1..N is always visible. Captions
 * accumulate — every clip already shown (this segment included) keeps its caption
 * beside its rank number, so by the final clip all captions are lined up.
 */
export async function renderClipOverlayPng(
  state: ProjectState,
  totalRanks: number,
  captionByRank: Record<number, string>,
): Promise<string | null> {
  if (!totalRanks) return null
  await ensureFonts(state)

  const scale = getScale()
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const ns = state.numberStyle
  const px = ns.size * scale
  const barPct = Math.max((100 - state.videoHeight) / 2, 12)

  ctx.textBaseline = 'alphabetic'
  ctx.lineJoin = 'round'

  const x = 12 * scale
  let y = ((barPct + 2) / 100) * H + px
  const rowGap = px * 1.45

  for (let r = 1; r <= totalRanks; r++) {
    const num = `${r}.`
    ctx.font = `700 ${px}px ${fontStack(ns.font)}`
    if (ns.stroke > 0) {
      ctx.strokeStyle = ns.strokeColor
      ctx.lineWidth = ns.stroke * scale
      ctx.strokeText(num, x, y)
    }
    ctx.fillStyle = ns.color
    ctx.fillText(num, x, y)

    const cap = captionByRank[r]
    if (cap) {
      const cap$ = state.captionStyle
      const numW = ctx.measureText(num).width
      const cpx = cap$.size * scale
      ctx.font = `700 ${cpx}px ${fontStack(cap$.font)}`
      const cx = x + numW + 12 * scale
      const cy = y - px * 0.08
      if (cap$.stroke > 0) {
        ctx.strokeStyle = cap$.strokeColor
        // Matches the preview's `-webkit-text-stroke: Npx` with `paint-order: stroke fill`:
        // both centre the stroke on the outline and then cover the inner half with the fill.
        ctx.lineWidth = cap$.stroke * scale
        ctx.strokeText(cap, cx, cy)
      }
      ctx.fillStyle = cap$.color
      ctx.fillText(cap, cx, cy)
    }
    y += rowGap
  }
  return canvas.toDataURL('image/png')
}
