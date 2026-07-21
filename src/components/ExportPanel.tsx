import { useRef, useState } from 'react'
import { useProject, rankOf } from '../store'
import { renderTitlePng, renderClipOverlayPng } from '../export/overlays'
import Icon from './Icon'

export default function ExportPanel() {
  const s = useProject()
  const [status, setStatus] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const polling = useRef<number>()

  const start = async () => {
    setError(null)
    setResult(null)
    setStatus('Building overlays…')
    try {
      const sequence = s.order
        .map(id => s.clips.find(c => c.id === id))
        .filter((c): c is NonNullable<typeof c> => !!c)
      if (!sequence.length) throw new Error('Add at least one video first')

      const titlePng = await renderTitlePng(s)
      const clips = []
      for (let i = 0; i < sequence.length; i++) {
        // captions accumulate: every clip shown so far keeps its caption
        const captionByRank: Record<number, string> = {}
        for (const c of sequence.slice(0, i + 1)) {
          if (c.label) captionByRank[rankOf(s, c.id)] = c.label
        }
        const overlayPng = await renderClipOverlayPng(s, s.clips.length, captionByRank)
        clips.push({
          file: sequence[i].file,
          trimStart: sequence[i].trimStart,
          trimEnd: sequence[i].trimEnd,
          volume: sequence[i].volume,
          crop: sequence[i].crop,
          overlayPng,
        })
      }

      setStatus('Encoding…')
      const r = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ background: s.background, videoHeight: s.videoHeight, titlePng, clips }),
      })
      const { jobId, error: err } = await r.json()
      if (!r.ok || !jobId) throw new Error(err || 'Render failed to start')

      polling.current = window.setInterval(async () => {
        const jr = await fetch(`/api/render/${jobId}`)
        const j = await jr.json()
        if (j.status === 'running') setProgress(j.progress ?? 0)
        else {
          clearInterval(polling.current)
          if (j.status === 'done') {
            setProgress(1)
            setStatus(null)
            setResult(j.file)
          } else {
            setStatus(null)
            setError(j.error || 'Render failed')
          }
        }
      }, 800)
    } catch (e: any) {
      setStatus(null)
      setError(e.message)
    }
  }

  return (
    <section className="panel export-panel">
      <button className="primary big" onClick={start} disabled={!!status || s.clips.length === 0}>
        {status ?? 'Render the countdown'}
      </button>
      {status === 'Encoding…' && (
        <div className="progress"><div style={{ width: `${Math.round(progress * 100)}%` }} /></div>
      )}
      {result && (() => {
        const base = result.split('/').pop()!
        const slug = (s.titleHtml.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&amp;/g, ' ')
          .trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'ranking')
        return (
          <div className="row" style={{ marginTop: 10 }}>
            <a className="primary btn-link" href={`/download/${base}?as=${slug}.mp4`} download={`${slug}.mp4`}>
              <Icon name="download" /> Download MP4
            </a>
            <video src={result} controls className="result-video" />
          </div>
        )
      })()}
      {error && <div className="error">{error}</div>}
    </section>
  )
}
