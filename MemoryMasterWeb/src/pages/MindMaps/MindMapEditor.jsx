import { useState, useRef, useCallback, useEffect } from 'react'
import { useAppStore } from '../../store/AppContext'

const BRANCH_COLORS = ['#E8590C','#2F9E44','#1971C2','#9C36B5','#E64980','#F08C00','#0CA678','#6741D9']
const RING_SPACING = 180

function branchColor(idx) { return BRANCH_COLORS[idx % BRANCH_COLORS.length] }

// ── Layout algorithm (port of MindMapLayout.swift) ────────────────────────

function leafCount(node) {
  return node.children.length === 0 ? 1 : node.children.reduce((s, c) => s + leafCount(c), 0)
}

function layout(node) {
  const placed = []
  const edges = []
  placed.push({ node, x: 0, y: 0, depth: 0 })
  layoutChildren(node, 0, 0, 1, -Math.PI / 2, 1.5 * Math.PI, placed, edges)
  return { placed, edges }
}

function layoutChildren(node, px, py, depth, startAngle, endAngle, placed, edges) {
  if (!node.children.length) return
  const total = node.children.reduce((s, c) => s + leafCount(c), 0)
  let angle = startAngle
  node.children.forEach(child => {
    const slice = (endAngle - startAngle) * leafCount(child) / total
    const childAngle = angle + slice / 2
    const r = depth * RING_SPACING
    const cx = Math.cos(childAngle) * r
    const cy = Math.sin(childAngle) * r
    placed.push({ node: child, x: cx, y: cy, depth })
    edges.push({ x1: px, y1: py, x2: cx, y2: cy, color: child.colorHex, depth })
    layoutChildren(child, cx, cy, depth + 1, angle, angle + slice, placed, edges)
    angle += slice
  })
}

// ── Deep clone helpers ────────────────────────────────────────────────────

function cloneNode(n) {
  return { ...n, children: n.children.map(cloneNode) }
}

function findInTree(root, id) {
  if (root.id === id) return root
  for (const c of root.children) {
    const found = findInTree(c, id)
    if (found) return found
  }
  return null
}

function removeFromTree(root, id) {
  root.children = root.children.filter(c => c.id !== id)
  root.children.forEach(c => removeFromTree(c, id))
}

// ── Editor component ──────────────────────────────────────────────────────

export default function MindMapEditor({ mapId, onBack }) {
  const { mindMaps, updateMindMap } = useAppStore()
  const map = mindMaps.find(m => m.id === mapId)

  const [selectedId, setSelectedId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [showRename, setShowRename] = useState(false)

  // Pan + zoom
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const isPanning = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const containerRef = useRef(null)

  if (!map) return null

  const { placed, edges } = layout(map.root)

  // ── Mutations ─────────────────────────────────────────────────────────────

  function withRoot(fn) {
    const root = cloneNode(map.root)
    fn(root)
    updateMindMap({ ...map, root })
  }

  function addChild() {
    if (!selectedId) return
    withRoot(root => {
      const parent = findInTree(root, selectedId)
      if (!parent) return
      const colorIdx = parent.id === root.id ? root.children.length : BRANCH_COLORS.indexOf(parent.colorHex)
      const color = parent.id === root.id ? branchColor(root.children.length) : parent.colorHex
      parent.children.push({ id: crypto.randomUUID(), text: 'New idea', colorHex: color, children: [] })
    })
  }

  function renameSelected() {
    const text = editingText.trim()
    if (!text || !selectedId) return
    withRoot(root => {
      const node = findInTree(root, selectedId)
      if (node) node.text = text
    })
    setShowRename(false)
  }

  function deleteSelected() {
    if (!selectedId || selectedId === map.root.id) return
    withRoot(root => removeFromTree(root, selectedId))
    setSelectedId(null)
  }

  // ── Pan/zoom events ───────────────────────────────────────────────────────

  function onMouseDown(e) {
    if (e.target === containerRef.current || e.target.tagName === 'svg' || e.target.tagName === 'path') {
      isPanning.current = true
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }
  }

  function onMouseMove(e) {
    if (!isPanning.current) return
    setPan(p => ({ x: p.x + e.clientX - lastMouse.current.x, y: p.y + e.clientY - lastMouse.current.y }))
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }

  function onMouseUp() { isPanning.current = false }

  function onWheel(e) {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.08 : 0.93
    setZoom(z => Math.max(0.3, Math.min(3, z * factor)))
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // ── Quadratic Bezier control point ────────────────────────────────────────
  function qControl(x1, y1, x2, y2) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
    const dx = x2 - x1, dy = y2 - y1
    return { cx: mx - dy * 0.2, cy: my + dx * 0.2 }
  }

  // Compute SVG viewBox large enough for all nodes at current zoom
  const maxR = (placed.reduce((m, p) => Math.max(m, Math.hypot(p.x, p.y)), 0) * zoom + 200)
  const vbSize = maxR * 2 + 400

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 112px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <button onClick={onBack} className="btn-ghost text-sm shrink-0">← Back</button>
        <h2 className="font-bold text-lg truncate">{map.root.text}</h2>
        <div className="ml-auto flex gap-1.5">
          <button onClick={addChild} disabled={!selectedId} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-sm transition-colors" title="Add child">＋</button>
          <button onClick={() => { if (selectedId) { const n = findInTree(map.root, selectedId); setEditingText(n?.text ?? ''); setShowRename(true) } }} disabled={!selectedId} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-sm transition-colors" title="Rename">✏️</button>
          <button onClick={deleteSelected} disabled={!selectedId || selectedId === map.root.id} className="p-2 rounded-lg bg-gray-800 hover:bg-red-900/50 disabled:opacity-30 text-sm transition-colors" title="Delete">🗑️</button>
          <button onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1) }} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs transition-colors" title="Reset view">⊙</button>
        </div>
      </div>

      {/* Canvas — uses a single transform wrapper so 0,0 is always the visual center */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900/50 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={() => setSelectedId(null)}
      >
        {/* Single wrapper: translate to center + apply pan, then scale */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* SVG edges — large fixed canvas centered at root (0,0) */}
          <svg
            width="4000"
            height="4000"
            viewBox="-2000 -2000 4000 4000"
            style={{ position: 'absolute', left: -2000, top: -2000, pointerEvents: 'none', overflow: 'visible' }}
          >
            {edges.map((e, i) => {
              const { cx: qx, cy: qy } = qControl(e.x1, e.y1, e.x2, e.y2)
              const lw = Math.max(1.5, 5 - e.depth)
              return (
                <path
                  key={i}
                  d={`M ${e.x1} ${e.y1} Q ${qx} ${qy} ${e.x2} ${e.y2}`}
                  stroke={e.color}
                  strokeWidth={lw}
                  strokeLinecap="round"
                  fill="none"
                />
              )
            })}
          </svg>

          {/* Nodes — absolutely positioned relative to 0,0 = center */}
          {placed.map(({ node, x, y, depth }) => {
            const isRoot = depth === 0
            const isSelected = node.id === selectedId
            return (
              <button
                key={node.id}
                onClick={e => { e.stopPropagation(); setSelectedId(id => id === node.id ? null : node.id) }}
                onMouseDown={e => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: isRoot ? node.colorHex : `${node.colorHex}30`,
                  color: isRoot ? '#fff' : node.colorHex,
                  border: `2px solid ${isSelected ? '#fff' : isRoot ? node.colorHex : `${node.colorHex}80`}`,
                }}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all text-sm ${isRoot ? 'text-base font-bold shadow-lg' : ''}`}
              >
                {node.text}
              </button>
            )
          })}
        </div>
      </div>

      {/* Rename modal */}
      {showRename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowRename(false)}>
          <div className="card p-5 w-80 space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold">Rename node</h3>
            <input
              autoFocus
              className="input"
              value={editingText}
              onChange={e => setEditingText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && renameSelected()}
            />
            <div className="flex gap-2">
              <button onClick={renameSelected} className="btn-primary !w-auto px-4 py-2 text-sm">Save</button>
              <button onClick={() => setShowRename(false)} className="btn-ghost text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-600 mt-2 text-center">Drag to pan · Scroll to zoom · Tap a node to select</p>
    </div>
  )
}
