import { useRef, useState } from 'react'
import { nanoid } from 'nanoid'
import { useProject } from '../store'
import type { Clip } from '../types'
import TrimBar from './TrimBar'
import Icon from './Icon'
import NumberField from './NumberField'

export function AddClipCard({ rank }: { rank: number }) {
  const addClip = useProject(s => s.addClip)
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const finish = (data: any, sourceUrl?: string) => {
    const clip: Clip = {
      id: nanoid(8),
      file: data.file,
      sourceUrl,
      name: data.title || `Clip ${rank}`,
      duration: data.duration,
      width: data.width,
      height: data.height,
      trimStart: 0,
      trimEnd: +data.duration.toFixed(1),
      volume: 1,
      crop: { top: 0, right: 0, bottom: 0, left: 0 },
      label: '',
    }
    addClip(clip)
  }

  const importLink = async () => {
    if (!url.trim()) return
    setBusy('Downloading video…')
    setError(null)
    try {
      const r = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.detail || data.error || 'Import failed')
      finish(data, url.trim())
      setUrl('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(null)
    }
  }

  const uploadFile = async (f: File) => {
    setBusy('Uploading…')
    setError(null)
    try {
      const fd = new FormData()
      fd.append('video', f)
      const r = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Upload failed')
      finish(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="panel clip-card">
      <div className="clip-head">
        <span className="rank-medal ghost">{rank}</span>
        <div className="clip-head-main">
          <span className="kicker">New entry</span>
          <h3 className="clip-name">Add a clip</h3>
        </div>
      </div>
      <label className="field-label">Video link</label>
      <div className="row">
        <input
          className="grow"
          placeholder="TikTok, Instagram, or YouTube video link"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && importLink()}
          disabled={!!busy}
        />
        <button className="primary" onClick={importLink} disabled={!!busy || !url.trim()}>
          {busy ? '…' : 'Import'}
        </button>
      </div>
      <div className="or">OR</div>
      <div
        className="dropzone"
        onClick={() => fileInput.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) uploadFile(f) }}
      >
        {busy ?? 'Drop a clip here, or browse — MP4 up to 500MB'}
      </div>
      <input
        ref={fileInput} type="file" accept="video/mp4,video/quicktime,video/webm" hidden
        onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f) }}
      />
      {error && <div className="error">{error}</div>}
    </section>
  )
}

export function ClipEditorCard({ clip, rank }: { clip: Clip; rank: number }) {
  const { updateClip, removeClip, moveClip, clips } = useProject()
  const vid = useRef<HTMLVideoElement>(null)

  const setTrim = (trimStart: number, trimEnd: number) => {
    updateClip(clip.id, { trimStart, trimEnd })
    if (vid.current) vid.current.currentTime = trimStart
  }
  const setCrop = (edge: keyof Clip['crop'], v: number) =>
    updateClip(clip.id, { crop: { ...clip.crop, [edge]: v } })

  return (
    <section className="panel clip-card">
      <div className="clip-head">
        <span className="rank-medal">{rank}</span>
        <div className="clip-head-main">
          <span className="kicker">Rank</span>
          <h3 className="clip-name">{clip.name.slice(0, 42)}</h3>
        </div>
        <div className="btn-group">
          <button className="tb" title="Move up" disabled={rank === 1} onClick={() => moveClip(clip.id, -1)}><Icon name="arrow-up" /></button>
          <button className="tb" title="Move down" disabled={rank === clips.length} onClick={() => moveClip(clip.id, 1)}><Icon name="arrow-down" /></button>
          <button className="tb danger" title="Delete" onClick={() => removeClip(clip.id)}><Icon name="trash" /></button>
        </div>
      </div>

      <video
        ref={vid}
        className="clip-video"
        src={clip.file}
        controls
        preload="metadata"
        style={{
          clipPath: `inset(${clip.crop.top}% ${clip.crop.right}% ${clip.crop.bottom}% ${clip.crop.left}%)`,
        }}
      />

      <div className="row trim-chips">
        <span className="chip"><i className="dot green" /> Start at
          <NumberField
            value={clip.trimStart} min={0} max={clip.trimEnd - 0.2} step={0.1} width={46}
            label="trim start" onCommit={v => setTrim(v, clip.trimEnd)}
          />s
        </span>
        <span className="chip"><i className="dot red" /> End at
          <NumberField
            value={clip.trimEnd} min={clip.trimStart + 0.2} max={clip.duration} step={0.1} width={46}
            label="trim end" onCommit={v => setTrim(clip.trimStart, v)}
          />s
        </span>
        <label className="inline grow" title="Volume">
          <Icon name="volume" className="icon-muted" />
          <input
            type="range" min={0} max={1} step={0.05} value={clip.volume}
            onChange={e => updateClip(clip.id, { volume: +e.target.value })}
          />
        </label>
      </div>

      <TrimBar duration={clip.duration} start={clip.trimStart} end={clip.trimEnd} onChange={setTrim} />

      <details className="sub">
        <summary>Crop / cutoff</summary>
        <div className="crop-grid">
          {(['top', 'bottom', 'left', 'right'] as const).map(edge => (
            <label key={edge} className="inline">
              <span className="crop-label">{edge}</span>
              <input
                type="range" min={0} max={45} step={1}
                value={clip.crop[edge]}
                onChange={e => setCrop(edge, +e.target.value)}
              />
              <span className="dim">{clip.crop[edge]}%</span>
            </label>
          ))}
        </div>
      </details>

      <details className="sub">
        <summary>Caption</summary>
        <input
          className="grow"
          placeholder={`Text shown while Rank ${rank} plays (e.g. “Messi 2022”)`}
          value={clip.label}
          onChange={e => updateClip(clip.id, { label: e.target.value })}
        />
      </details>
    </section>
  )
}
