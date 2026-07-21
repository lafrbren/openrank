import { useProject } from './store'
import TitleEditor from './components/TitleEditor'
import NumbersPanel from './components/NumbersPanel'
import PlaybackOrder from './components/PlaybackOrder'
import { AddClipCard, ClipEditorCard } from './components/ClipCard'
import Preview from './components/Preview'
import ExportPanel from './components/ExportPanel'
import NumberField from './components/NumberField'

export default function App() {
  const { clips, videoHeight, background, setVideoHeight, setBackground, reset } = useProject()

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img className="brand-mark" src="/icon.svg" alt="" width={32} height={32} />
          <div className="brand-text">
            <h1>Open<span className="brand-accent">Rank</span></h1>
            <span className="brand-tag">Countdown studio</span>
          </div>
        </div>
        <button
          className="tb danger"
          style={{ marginLeft: 'auto' }}
          onClick={() => { if (confirm('Clear this countdown and start over?')) reset() }}
        >
          New countdown
        </button>
      </header>

      <main className="layout">
        <div className="editor-col">
          <TitleEditor />

          <section className="panel">
            <div className="panel-head"><h3>Frame</h3></div>
            <div className="row" style={{ gap: 16 }}>
              <label className="inline">
                Video height
                <NumberField
                  value={videoHeight} min={10} max={100} step={5} width={54}
                  label="video height" onCommit={setVideoHeight}
                /> %
              </label>
              <label className="inline">
                Background
                <input type="color" value={background} onChange={e => setBackground(e.target.value)} />
                <code className="dim">{background}</code>
              </label>
            </div>
            <p className="dim" style={{ marginTop: 6 }}>
              Height is a cutoff — smaller % adds bigger bars top &amp; bottom for the title and platform UI.
            </p>
          </section>

          <NumbersPanel />

          <PlaybackOrder />

          {clips.map((clip, i) => (
            <ClipEditorCard key={clip.id} clip={clip} rank={i + 1} />
          ))}
          <AddClipCard rank={clips.length + 1} />
        </div>

        <div className="preview-col">
          <Preview />
          <ExportPanel />
        </div>
      </main>
    </div>
  )
}
