import { useEffect, useRef } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.core.css'
import { useProject } from '../store'
import { FONTS, fontStack } from '../fonts'
import Icon from './Icon'

export default function TitleEditor() {
  const holder = useRef<HTMLDivElement>(null)
  const quillRef = useRef<Quill | null>(null)
  const { titleHtml, titleStyle, setTitle, setTitleStyle } = useProject()

  useEffect(() => {
    if (!holder.current || quillRef.current) return
    const q = new Quill(holder.current, {
      placeholder: 'Enter ranking title…',
      formats: ['bold', 'italic', 'color', 'background'],
      modules: { toolbar: false },
    })
    if (titleHtml) q.clipboard.dangerouslyPasteHTML(titleHtml)
    q.on('text-change', () => {
      setTitle(q.getSemanticHTML(), q.getContents().ops)
    })
    quillRef.current = q
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = (name: string, value: unknown) => {
    const q = quillRef.current
    if (!q) return
    const sel = q.getSelection(true)
    if (sel && sel.length > 0) q.formatText(sel.index, sel.length, name, value, 'user')
    else q.format(name, value, 'user')
    setTitle(q.getSemanticHTML(), q.getContents().ops)
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Ranking title</h3>
      </div>
      <div className="toolbar">
        <select
          value={titleStyle.font}
          onChange={e => setTitleStyle({ font: e.target.value })}
          style={{ fontFamily: fontStack(titleStyle.font), minWidth: 130 }}
          title="Font"
        >
          {FONTS.map(f => (
            <option key={f} value={f} style={{ fontFamily: fontStack(f) }}>{f}</option>
          ))}
        </select>
        <select value={titleStyle.size} onChange={e => setTitleStyle({ size: +e.target.value })} title="Size">
          {[16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 44, 48].map(s => (
            <option key={s} value={s}>{s}px</option>
          ))}
        </select>
        <div className="btn-group">
          <button className="tb" onClick={() => fmt('bold', true)} title="Bold (selection)"><b>B</b></button>
          <button className="tb" onClick={() => fmt('italic', true)} title="Italic (selection)"><i>I</i></button>
          <button className="tb" onClick={() => { fmt('bold', false); fmt('italic', false) }} title="Clear bold/italic"><Icon name="clear-format" /></button>
        </div>
        <div className="btn-group">
          {(['left', 'center', 'right'] as const).map(a => (
            <button
              key={a}
              className={`tb ${titleStyle.align === a ? 'active' : ''}`}
              onClick={() => setTitleStyle({ align: a })}
              title={`Align ${a}`}
            >
              <Icon name={`align-${a}`} />
            </button>
          ))}
        </div>
        <label className="color-chip" title="Text color (selection or whole title)">
          A
          <input type="color" onChange={e => fmt('color', e.target.value)} />
        </label>
        <label className="color-chip" title="Highlight color (selection)">
          <span style={{ background: '#ffe066', padding: '0 3px', borderRadius: 2 }}>T</span>
          <input type="color" onChange={e => fmt('background', e.target.value)} />
        </label>
        <button className="tb" onClick={() => { fmt('color', false); fmt('background', false) }} title="Clear colors"><Icon name="erase" /></button>
      </div>

      <div
        className="title-input"
        style={{ fontFamily: fontStack(titleStyle.font), fontSize: titleStyle.size, textAlign: titleStyle.align }}
      >
        <div ref={holder} />
      </div>

      <div className="row" style={{ marginTop: 10, gap: 12 }}>
        <label className="inline">
          Title stroke
          <input
            type="range" min={0} max={10} step={0.5}
            value={titleStyle.stroke}
            onChange={e => setTitleStyle({ stroke: +e.target.value })}
          />
        </label>
        <label className="color-chip" title="Stroke color">
          <Icon name="stroke" />
          <input type="color" value={titleStyle.strokeColor} onChange={e => setTitleStyle({ strokeColor: e.target.value })} />
        </label>
      </div>
    </section>
  )
}
