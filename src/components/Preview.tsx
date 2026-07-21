import { useEffect, useMemo, useRef, useState } from 'react'
import { useProject, rankOf } from '../store'
import { fontStack } from '../fonts'
import { sanitizeTitleHtml } from '../sanitizeTitle'
import Icon from './Icon'

/** Live 9:16 preview compositing background, video (height% + crop), title, rank numbers, caption. */
export default function Preview() {
  const s = useProject()
  const { clips, order, videoHeight, background, titleHtml, titleStyle, numberStyle, captionStyle } = s
  const vid = useRef<HTMLVideoElement>(null)
  const [seqIndex, setSeqIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)

  const sequence = useMemo(
    () => order.map(id => clips.find(c => c.id === id)).filter(Boolean) as typeof clips,
    [order, clips],
  )
  const current = sequence[seqIndex] ?? sequence[0]
  // clips whose caption has been revealed so far (this one + everything before it)
  const revealedIds = useMemo(
    () => new Set(sequence.slice(0, seqIndex + 1).map(c => c.id)),
    [sequence, seqIndex],
  )

  useEffect(() => { if (seqIndex >= sequence.length) setSeqIndex(0) }, [sequence.length, seqIndex])

  // enforce trim window + advance through the sequence
  useEffect(() => {
    const v = vid.current
    if (!v || !current) return
    const onTime = () => {
      if (v.currentTime >= current.trimEnd - 0.05) {
        if (seqIndex < sequence.length - 1) setSeqIndex(i => i + 1)
        else { setPlaying(false); v.pause() }
      }
    }
    const onLoaded = () => {
      v.currentTime = current.trimStart
      if (playing) v.play().catch(() => setPlaying(false))
    }
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('loadedmetadata', onLoaded)
    if (v.readyState >= 1) onLoaded()
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('loadedmetadata', onLoaded)
    }
  }, [current?.id, seqIndex, sequence.length, playing]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const v = vid.current
    if (!v) return
    v.volume = current?.volume ?? 1
  }, [current?.volume, current?.id])

  const togglePlay = () => {
    const v = vid.current
    if (!v || !current) return
    if (playing) { v.pause(); setPlaying(false) }
    else {
      if (v.currentTime < current.trimStart || v.currentTime >= current.trimEnd - 0.05) v.currentTime = current.trimStart
      v.play().then(() => setPlaying(true)).catch(() => {})
    }
  }
  const restart = () => { setSeqIndex(0); setPlaying(true); const v = vid.current; if (v && sequence[0] && current === sequence[0]) { v.currentTime = sequence[0].trimStart; v.play().catch(() => {}) } }

  const safeTitleHtml = useMemo(() => sanitizeTitleHtml(titleHtml), [titleHtml])
  const barPct = (100 - videoHeight) / 2
  const strokeCss = titleStyle.stroke > 0
    ? { WebkitTextStroke: `${titleStyle.stroke / 2}px ${titleStyle.strokeColor}`, paintOrder: 'stroke fill' as const }
    : {}

  return (
    <div className="preview-wrap">
      <div className="preview-head">
        <h3 className="preview-heading">Preview</h3>
        <span className="preview-spec">1080 × 1920 · 9:16</span>
      </div>
      <div className="stage" style={{ background }}>
        {current ? (
          <video
            key={current.id}
            ref={vid}
            className="stage-video"
            src={current.file}
            muted={muted}
            playsInline
            style={{
              height: `${videoHeight}%`,
              clipPath: `inset(${current.crop.top}% ${current.crop.right}% ${current.crop.bottom}% ${current.crop.left}%)`,
            }}
          />
        ) : (
          <div className="stage-empty">Add a clip to start the countdown</div>
        )}

        {/* title in the top bar */}
        <div
          className="stage-title"
          style={{
            height: `${Math.max(barPct, 12)}%`,
            fontFamily: fontStack(titleStyle.font),
            fontSize: titleStyle.size,
            textAlign: titleStyle.align,
            ...strokeCss,
          }}
          dangerouslySetInnerHTML={{ __html: safeTitleHtml }}
        />

        {/* full rank column 1..N; caption appears beside the rank that's playing */}
        {current && (
          <div className="stage-numbers" style={{ top: `${Math.max(barPct, 12) + 2}%` }}>
            {clips.map((c, i) => (
              <div key={c.id} className="stage-number-row">
                <span
                  className="stage-number"
                  style={{
                    fontFamily: fontStack(numberStyle.font),
                    fontSize: numberStyle.size,
                    color: numberStyle.color,
                    // Whole value, not half: overlays.ts strokes these at `stroke * scale`,
                    // so halving it here made the preview show half the outline that renders.
                    WebkitTextStroke: `${numberStyle.stroke}px ${numberStyle.strokeColor}`,
                    paintOrder: 'stroke fill',
                  }}
                >
                  {i + 1}.
                </span>
                {revealedIds.has(c.id) && c.label && (
                  <span
                    className="stage-number-caption"
                    style={{
                      fontFamily: fontStack(captionStyle.font),
                      color: captionStyle.color,
                      fontSize: captionStyle.size,
                      WebkitTextStroke: `${captionStyle.stroke}px ${captionStyle.strokeColor}`,
                      paintOrder: 'stroke fill',
                    }}
                  >
                    {c.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* controls */}
        <div className="stage-controls">
          <button onClick={togglePlay} title={playing ? 'Pause' : 'Play'}>
            <Icon name={playing ? 'pause' : 'play'} size={13} />
          </button>
          <button onClick={restart} title="Restart sequence"><Icon name="restart" size={13} /></button>
          <button onClick={() => setMuted(m => !m)} title={muted ? 'Unmute' : 'Mute'}>
            <Icon name={muted ? 'volume-off' : 'volume'} size={13} />
          </button>
          {current && (
            <span className="dim">
              {seqIndex + 1}/{sequence.length} · Rank #{rankOf(s, current.id)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
