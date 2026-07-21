import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

/**
 * A numeric field that lets you finish typing before it judges the value.
 *
 * A plain controlled `<input type="number">` clamps on every keystroke, which
 * makes an intermediate value unreachable: typing "80" into a 10–100 field goes
 * "8" -> clamped to 10 -> "100" -> clamped to 100, so only the two bounds are
 * ever settable. Here the keystrokes go into a local draft string that is passed
 * through untouched; clamping happens once, on blur or Enter. An empty or
 * unparseable draft reverts to the last committed value rather than becoming 0.
 *
 * The −/+ buttons commit immediately, and are the primary way to use this on a
 * phone, where number inputs have no spinners and the keyboard covers the field.
 */
export default function NumberField({
  value,
  min,
  max,
  step = 1,
  width,
  label,
  onCommit,
}: {
  value: number
  min: number
  max: number
  step?: number
  width?: number
  label?: string
  onCommit: (v: number) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)
  // Taps land faster than React re-renders, so `value` can still be a render
  // behind when the next one arrives. Each step builds on what the last one
  // asked for; this clears once the prop catches up.
  const pending = useRef<number | null>(null)
  useEffect(() => { pending.current = null }, [value])

  // Steps of 0.1 accumulate float noise (0.1 + 0.2 = 0.30000000000000004), so
  // round to the precision the step itself implies.
  const decimals = (String(step).split('.')[1] ?? '').length
  const round = (n: number) => +n.toFixed(decimals)
  const clamp = (n: number) => round(Math.min(max, Math.max(min, n)))

  const commit = () => {
    const n = parseFloat(draft ?? '')
    setDraft(null)
    if (draft !== null && Number.isFinite(n) && clamp(n) !== value) onCommit(clamp(n))
  }

  const nudge = (dir: -1 | 1) => {
    setDraft(null)
    const next = clamp((pending.current ?? value) + dir * step)
    pending.current = next
    if (next !== value) onCommit(next)
  }

  return (
    <span className="numfield">
      <button
        type="button"
        className="numfield-step"
        onClick={() => nudge(-1)}
        disabled={value <= min}
        aria-label={label ? `Decrease ${label}` : 'Decrease'}
      >
        <Icon name="minus" size={12} />
      </button>
      <input
        ref={input}
        type="number"
        inputMode={decimals > 0 ? 'decimal' : 'numeric'}
        min={min}
        max={max}
        step={step}
        aria-label={label}
        style={width ? { width } : undefined}
        value={draft ?? value}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') { commit(); input.current?.blur() }
          if (e.key === 'Escape') { setDraft(null); input.current?.blur() }
        }}
      />
      <button
        type="button"
        className="numfield-step"
        onClick={() => nudge(1)}
        disabled={value >= max}
        aria-label={label ? `Increase ${label}` : 'Increase'}
      >
        <Icon name="plus" size={12} />
      </button>
    </span>
  )
}
