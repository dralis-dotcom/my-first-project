import { useState, useMemo } from 'react'
import { useAppStore } from '../../store/AppContext'
import { isDue } from '../../lib/sm2'
import { pairLetters } from '../../data/dominicDefaults'

const GRADES = [
  { label: 'Again', value: 0, color: 'bg-red-600 hover:bg-red-500',       desc: '< 10 min' },
  { label: 'Hard',  value: 3, color: 'bg-orange-600 hover:bg-orange-500',  desc: 'Harder' },
  { label: 'Good',  value: 4, color: 'bg-blue-600 hover:bg-blue-500',      desc: 'Normal' },
  { label: 'Easy',  value: 5, color: 'bg-green-600 hover:bg-green-500',    desc: 'Longer' },
]

export default function DominicDrill({ onBack }) {
  const { dominicPairs, reviewDominicPair } = useAppStore()
  const queue = useMemo(() => dominicPairs.filter(p => isDue(p.srs)), [])

  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(0)

  if (idx >= queue.length) {
    return (
      <div className="text-center space-y-6 py-10">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold">Drill complete!</h2>
        <p className="text-gray-400">Reviewed {done} pair{done !== 1 ? 's' : ''}.</p>
        <button onClick={onBack} className="btn-primary">Back to Dominic</button>
      </div>
    )
  }

  const pair = queue[idx]

  function grade(value) {
    reviewDominicPair(pair.number, value)
    setDone(d => d + 1)
    setRevealed(false)
    setIdx(i => i + 1)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="btn-ghost text-sm">← Back</button>
        <h2 className="text-lg font-bold flex-1">Dominic Drill</h2>
        <span className="text-sm text-gray-400">{idx + 1}/{queue.length}</span>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(idx / queue.length) * 100}%` }} />
      </div>

      {/* Card */}
      <div className="card min-h-48 p-8 flex flex-col items-center justify-center text-center gap-4">
        <div>
          <div className="text-5xl font-black font-mono">{pair.number}</div>
          <div className="text-gray-500 text-lg font-mono mt-1">{pairLetters(pair.number)}</div>
        </div>
        <p className="text-gray-400 text-sm">Who is {pair.number}? What are they doing?</p>

        {revealed && (
          <>
            <div className="w-full border-t border-gray-700" />
            <div>
              <p className="text-2xl font-bold">{pair.person}</p>
              <p className="text-gray-300 mt-1 italic">{pair.action}</p>
            </div>
          </>
        )}
      </div>

      {!revealed ? (
        <button onClick={() => setRevealed(true)} className="btn-primary">Reveal</button>
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
