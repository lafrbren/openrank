import { useProject } from '../store'
import { FONTS, fontStack } from '../fonts'
import Icon from './Icon'
import NumberField from './NumberField'

export default function NumbersPanel() {
  const { numberStyle, captionStyle, setNumberStyle, setCaptionStyle } = useProject()

  return (
    <section className="panel">
      <div className="panel-head"><h3>Numbers &amp; captions</h3></div>

      <div className="field-label">Rank numbers</div>
      <div className="row" style={{ gap: 12, marginBottom: 12 }}>
        <select
          value={numberStyle.font}
          onChange={e => setNumberStyle({ font: e.target.value })}
          style={{ fontFamily: fontStack(numberStyle.font), minWidth: 130 }}
          title="Number font"
        >
          {FONTS.map(f => (
            <option key={f} value={f} style={{ fontFamily: fontStack(f) }}>{f}</option>
          ))}
        </select>
        <label className="color-chip" title="Number color">
          <span style={{ color: numberStyle.color }}>1.</span>
          <input type="color" value={numberStyle.color} onChange={e => setNumberStyle({ color: e.target.value })} />
        </label>
        <label className="inline">
          Size
          <NumberField
            value={numberStyle.size} min={16} max={72} width={48}
            label="number size" onCommit={size => setNumberStyle({ size })}
          />
        </label>
        <label className="inline">
          Stroke
          <input
            type="range" min={0} max={10} step={0.5} value={numberStyle.stroke}
            onChange={e => setNumberStyle({ stroke: +e.target.value })}
          />
        </label>
        <label className="color-chip" title="Number stroke color">
          <Icon name="stroke" />
          <input type="color" value={numberStyle.strokeColor} onChange={e => setNumberStyle({ strokeColor: e.target.value })} />
        </label>
      </div>

      <div className="field-label">Captions</div>
      <div className="row" style={{ gap: 12 }}>
        <select
          value={captionStyle.font}
          onChange={e => setCaptionStyle({ font: e.target.value })}
          style={{ fontFamily: fontStack(captionStyle.font), minWidth: 130 }}
          title="Caption font"
        >
          {FONTS.map(f => (
            <option key={f} value={f} style={{ fontFamily: fontStack(f) }}>{f}</option>
          ))}
        </select>
        <label className="color-chip" title="Caption color">
          <span style={{ color: captionStyle.color }}>Aa</span>
          <input type="color" value={captionStyle.color} onChange={e => setCaptionStyle({ color: e.target.value })} />
        </label>
        <label className="inline">
          Size
          <NumberField
            value={captionStyle.size} min={10} max={40} width={48}
            label="caption size" onCommit={size => setCaptionStyle({ size })}
          />
        </label>
        <label className="inline">
          Stroke
          <input
            type="range" min={0} max={10} step={0.5} value={captionStyle.stroke}
            onChange={e => setCaptionStyle({ stroke: +e.target.value })}
          />
        </label>
        <label className="color-chip" title="Caption stroke color">
          <Icon name="stroke" />
          <input
            type="color" value={captionStyle.strokeColor}
            onChange={e => setCaptionStyle({ strokeColor: e.target.value })}
          />
        </label>
      </div>
    </section>
  )
}
