import { useState, useMemo } from 'react'
import { useAppStore } from '../../store/AppContext'
import { isDue } from '../../lib/sm2'

const GRADES = [
  { label: 'Again', value: 0, color: 'bg-red-600 hover:bg-red-500',    desc: '< 10 min' },
  { label: 'Hard',  value: 3, color: 'bg-orange-600 hover:bg-orange-500', desc: 'Harder interval' },
  { label: 'Good',  value: 4, color: 'bg-blue-600 hover:bg-blue-500',  desc: 'Normal interval' },
  { label: 'Easy',  value: 5, color: 'bg-green-600 hover:bg-green-500', desc: 'Longer interval' },
]

export default function ReviewSession({ deckId, onBack }) {
  const { decks, reviewCard } = useAppStore()
  const deck = decks.find(d => d.id === deckId)
  const queue = useMemo(() => deck?.cards.filter(c => isDue(c.srs)) ?? [], [deck])

  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(0)

  if (!deck) return null

  if (idx >= queue.length) {
    return (
      <div className="text-center space-y-6 py-10">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold">All done!</h2>
        <p className="text-gray-400">Reviewed {done} card{done !== 1 ? 's' : ''}.</p>
        <button onClick={onBack} className="btn-primary">Back to decks</button>
      </div>
    )
  }

  const card = queue[idx]

  function grade(value) {
    reviewCard(deckId, card.id, value)
    setDone(d => d + 1)
    setRevealed(false)
    setIdx(i => i + 1)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="btn-ghost text-sm">← Back</button>
        <h2 className="text-lg font-bold flex-1">{deck.emoji} {deck.name}</h2>
        <span className="text-sm text-gray-400">{idx + 1}/{queue.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(idx / queue.length) * 100}%` }} />
      </div>

      {/* Card */}
      <div className="card min-h-48 p-6 flex flex-col items-center justify-center text-center gap-4">
        <p className="text-lg font-medium">{card.front}</p>
        {revealed && (
          <>
            <div className="w-full border-t border-gray-700" />
            <p className="text-gray-200 text-lg">{card.back}</p>
            {card.mnemonic && <p className="text-sm text-gray-500 italic">{card.mnemonic}</p>}
          </>
        )}
      </div>

      {!revealed ? (
        <button onClick={() => setRevealed(true)} className="btn-primary">Show answer</button>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GRADES.map(g => (
            <button
              key={g.value}
              onClick={() => grade(g.value)}
              className={`${g.color} text-white font-semibold py-3 rounded-xl transition-colors`}
            >
              <div>{g.label}</div>
              <div className="text-xs opacity-75">{g.desc}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
