import { useState } from 'react'
import { useAppStore } from '../../store/AppContext'
import MindMapEditor from './MindMapEditor'

export default function MindMapsPage() {
  const { mindMaps, addMindMap, deleteMindMap } = useAppStore()
  const [active, setActive] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  if (active) {
    const map = mindMaps.find(m => m.id === active)
    if (!map) { setActive(null); return null }
    return <MindMapEditor mapId={active} onBack={() => setActive(null)} />
  }

  function create() {
    if (!newTitle.trim()) return
    const id = addMindMap(newTitle.trim())
    setNewTitle('')
    setShowNew(false)
    setActive(id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mind Maps</h1>
        <p className="text-gray-400 text-sm">Tony Buzan-style radial maps for ideas and memory.</p>
      </div>

      {showNew ? (
        <div className="card p-4 space-y-3">
          <h3 className="font-semibold">New mind map</h3>
          <input
            autoFocus
            className="input"
            placeholder="Central topic"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && create()}
          />
          <div className="flex gap-2">
            <button onClick={create} className="btn-primary !w-auto px-4 py-2 text-sm">Create</button>
            <button onClick={() => setShowNew(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowNew(true)} className="card p-4 w-full text-left text-gray-400 hover:text-white hover:border-blue-500/50 transition-all">
          + New mind map
        </button>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {mindMaps.map(m => (
          <div key={m.id} className="card p-4 group hover:border-gray-600 transition-colors flex items-center gap-3">
            <button className="flex-1 text-left" onClick={() => setActive(m.id)}>
              <div className="font-medium">{m.root.text}</div>
              <div className="text-xs text-gray-400 mt-0.5">{countNodes(m.root) - 1} branches</div>
            </button>
            <button
              onClick={() => deleteMindMap(m.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all text-sm"
            >✕</button>
          </div>
        ))}
        {mindMaps.length === 0 && (
          <div className="col-span-2 text-center text-gray-500 py-16">
            <div className="text-4xl mb-3">🧠</div>
            <p>No mind maps yet. Create one above.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function countNodes(node) {
  return 1 + node.children.reduce((s, c) => s + countNodes(c), 0)
}
