import { useRef } from 'react'

interface Props {
  duration: number
  start: number
  end: number
  onChange(start: number, end: number): void
}

/** Two-handle trim bar: drag the green (start) or red (end) marker along a time ruler. */
export default function TrimBar({ duration, start, end, onChange }: Props) {
  const track = useRef<HTMLDivElement>(null)

  const beginDrag = (which: 'start' | 'end') => (e: React.PointerEvent) => {
    e.preventDefault()
    const el = track.current!
    const rect = el.getBoundingClientRect()
    const move = (ev: PointerEvent) => {
      const frac = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width))
      const t = +(frac * duration).toFixed(1)
      if (which === 'start') onChange(Math.min(t, end - 0.2), end)
      else onChange(start, Math.max(t, start + 0.2))
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const pct = (t: number) => `${(t / Math.max(0.001, duration)) * 100}%`
  const ticks = []
  const step = duration > 60 ? 20 : duration > 25 ? 10 : 5
  for (let t = 0; t <= duration; t += step) ticks.push(t)

  return (
    <div className="trimbar">
      <div className="trim-track" ref={track}>
        <div className="trim-shade" style={{ left: 0, width: pct(start) }} />
        <div className="trim-shade" style={{ left: pct(end), right: 0 }} />
        <div className="trim-range" style={{ left: pct(start), width: `calc(${pct(end)} - ${pct(start)})` }} />
        <div className="trim-handle start" style={{ left: pct(start) }} onPointerDown={beginDrag('start')} />
        <div className="trim-handle end" style={{ left: pct(end) }} onPointerDown={beginDrag('end')} />
        {ticks.map(t => (
          <span key={t} className="trim-tick" style={{ left: pct(t) }}>{t.toFixed(0)}s</span>
        ))}
      </div>
    </div>
  )
}
