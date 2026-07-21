import { useProject, rankOf } from '../store'
import Icon from './Icon'

export default function PlaybackOrder() {
  const s = useProject()
  const { customOrder, order, clips, setCustomOrder, shuffleOrder, resetOrder, moveOrder } = s
  if (clips.length < 2) return null

  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Running order</h3>
        <label className="switch">
          <input type="checkbox" checked={customOrder} onChange={e => setCustomOrder(e.target.checked)} />
          <span>Custom</span>
        </label>
      </div>
      {!customOrder && (
        <p className="dim">
          Default: counts down from Rank #{clips.length} to Rank #1 (winner last).
        </p>
      )}
      {customOrder && (
        <>
          <div className="row" style={{ gap: 8 }}>
            <button className="tb" onClick={resetOrder}>Manual (reset)</button>
            <button className="tb with-icon" onClick={shuffleOrder}><Icon name="shuffle" />Shuffle</button>
          </div>
          <ol className="order-list">
            {order.map((id, i) => (
              <li key={id}>
                <span className="order-pos">{i + 1}</span>
                <span className="grow">Rank #{rankOf(s, id)}</span>
                <span className="btn-group">
                  <button className="tb" title="Move earlier" disabled={i === 0} onClick={() => moveOrder(i, -1)}><Icon name="arrow-up" /></button>
                  <button className="tb" title="Move later" disabled={i === order.length - 1} onClick={() => moveOrder(i, 1)}><Icon name="arrow-down" /></button>
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}
