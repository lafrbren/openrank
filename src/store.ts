import { create } from 'zustand'
import type { Clip, ProjectState, TitleStyle, NumberStyle, CaptionStyle } from './types'

const STORAGE_KEY = 'openrank-project-v1'
/** Pre-rename key; read once so an in-progress countdown survives the rename. */
const LEGACY_STORAGE_KEY = 'rankforge-project-v1'

interface Actions {
  setTitle(html: string, delta: unknown): void
  setTitleStyle(patch: Partial<TitleStyle>): void
  setNumberStyle(patch: Partial<NumberStyle>): void
  setCaptionStyle(patch: Partial<CaptionStyle>): void
  setVideoHeight(v: number): void
  setBackground(v: string): void
  addClip(clip: Clip): void
  removeClip(id: string): void
  moveClip(id: string, dir: -1 | 1): void
  updateClip(id: string, patch: Partial<Clip>): void
  setCustomOrder(on: boolean): void
  shuffleOrder(): void
  resetOrder(): void
  moveOrder(index: number, dir: -1 | 1): void
  reset(): void
}

const defaults = (): ProjectState => ({
  titleHtml: '',
  titleDelta: null,
  titleStyle: { font: 'Archivo Black', size: 28, align: 'center', stroke: 0, strokeColor: '#000000' },
  numberStyle: { font: 'Archivo Black', size: 34, color: '#FF7A00', stroke: 3, strokeColor: '#1a1a1a' },
  captionStyle: { font: 'Inter', size: 15, color: '#ffffff', stroke: 3, strokeColor: '#000000' },
  videoHeight: 80,
  background: '#141414',
  customOrder: false,
  order: [],
  clips: [],
})

// Default ranking order: last place first, counting down to Rank #1.
const rankedOrder = (clips: Clip[]) => [...clips].reverse().map(c => c.id)

const load = (): ProjectState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
    if (raw) {
      const d = defaults()
      const saved = JSON.parse(raw) as Partial<ProjectState>
      // The style objects gain fields over time; merge them one level deeper so a
      // project saved before a field existed picks up its default instead of a hole.
      return {
        ...d,
        ...saved,
        titleStyle: { ...d.titleStyle, ...saved.titleStyle },
        numberStyle: { ...d.numberStyle, ...saved.numberStyle },
        captionStyle: { ...d.captionStyle, ...saved.captionStyle },
      }
    }
  } catch { /* corrupted state falls back to defaults */ }
  return defaults()
}

export const useProject = create<ProjectState & Actions>((set, get) => {
  const persist = () => {
    // the replacer drops the action functions, leaving just the ProjectState fields
    localStorage.setItem(STORAGE_KEY, JSON.stringify(get(), (_k, v) => (typeof v === 'function' ? undefined : v)))
  }
  const wrap = <A extends unknown[]>(fn: (...a: A) => void) => (...a: A) => { fn(...a); persist() }

  return {
    ...load(),

    setTitle: wrap((html, delta) => set({ titleHtml: html, titleDelta: delta })),
    setTitleStyle: wrap(patch => set(s => ({ titleStyle: { ...s.titleStyle, ...patch } }))),
    setNumberStyle: wrap(patch => set(s => ({ numberStyle: { ...s.numberStyle, ...patch } }))),
    setCaptionStyle: wrap(patch => set(s => ({ captionStyle: { ...s.captionStyle, ...patch } }))),
    setVideoHeight: wrap(v => set({ videoHeight: Math.min(100, Math.max(10, v)) })),
    setBackground: wrap(v => set({ background: v })),

    addClip: wrap(clip => set(s => {
      const clips = [...s.clips, clip]
      return { clips, order: s.customOrder ? [...s.order, clip.id] : rankedOrder(clips) }
    })),

    removeClip: wrap(id => set(s => {
      const clips = s.clips.filter(c => c.id !== id)
      return { clips, order: s.customOrder ? s.order.filter(o => o !== id) : rankedOrder(clips) }
    })),

    moveClip: wrap((id, dir) => set(s => {
      const i = s.clips.findIndex(c => c.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= s.clips.length) return {}
      const clips = [...s.clips]
      ;[clips[i], clips[j]] = [clips[j], clips[i]]
      return { clips, order: s.customOrder ? s.order : rankedOrder(clips) }
    })),

    updateClip: wrap((id, patch) => set(s => ({
      clips: s.clips.map(c => (c.id === id ? { ...c, ...patch } : c)),
    }))),

    setCustomOrder: wrap(on => set(s => ({ customOrder: on, order: rankedOrder(s.clips) }))),

    shuffleOrder: wrap(() => set(s => {
      const order = [...s.order]
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[order[i], order[j]] = [order[j], order[i]]
      }
      return { order }
    })),

    resetOrder: wrap(() => set(s => ({ order: rankedOrder(s.clips) }))),

    moveOrder: wrap((index, dir) => set(s => {
      const j = index + dir
      if (j < 0 || j >= s.order.length) return {}
      const order = [...s.order]
      ;[order[index], order[j]] = [order[j], order[index]]
      return { order }
    })),

    reset: wrap(() => set(defaults())),
  }
})

export const rankOf = (s: ProjectState, clipId: string) => s.clips.findIndex(c => c.id === clipId) + 1
