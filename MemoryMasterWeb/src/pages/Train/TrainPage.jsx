import { useState } from 'react'
import { useAppStore } from '../../store/AppContext'
import TrainingSession from './TrainingSession'

const DISCIPLINES = [
  { id: 'numbers',       label: 'Numbers',       icon: '🔢', tip: 'Chunk into pairs → Dominic people → journey.' },
  { id: 'binary',        label: 'Binary',         icon: '⬛', tip: 'Groups of 3 bits → digit → Dominic pairs.' },
  { id: 'words',         label: 'Words',          icon: '📖', tip: 'Chain into an exaggerated story or journey.' },
  { id: 'cards',         label: 'Playing Cards',  icon: '♠️', tip: 'Assign each card a person; pairs = PA scenes.' },
  { id: 'historicDates', label: 'Historic Dates', icon: '📅', tip: 'Encode year with Dominic/Major; place on journey.' },
]

export default function TrainPage() {
  const { results } = useAppStore()
  const [active, setActive] = useState(null)

  if (active) {
    return <TrainingSession discipline={active} onBack={() => setActive(null)} />
  }

  function bestAccuracy(id) {
    const matching = results.filter(r => r.discipline === id)
    if (!matching.length) return null
    return Math.max(...matching.map(r => r.correct / Math.max(r.itemCount, 1)))
  }

  const recent = [...results].reverse().slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Train</h1>
        <p className="text-gray-400 text-sm">Pick a competition discipline to start a session.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {DISCIPLINES.map(d => {
          const best = bestAccuracy(d.id)
          return (
            <button
              key={d.id}
              onClick={() => setActive(d.id)}
              className="card p-4 text-left hover:border-blue-500/50 hover:bg-gray-800/80 transition-all group"
            >
              <div className="text-3xl mb-2">{d.icon}</div>
              <div className="font-semibold text-sm">{d.label}</div>
              <div className="text-xs text-gray-400 mt-1">
                {best !== null ? `Best: ${Math.round(best * 100)}%` : 'Not attempted'}
              </div>
            </button>
          )
        })}
      </div>

      {recent.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Recent Sessions</h2>
          <div className="space-y-2">
            {recent.map(r => {
              const d = DISCIPLINES.find(d => d.id === r.discipline)
              return (
                <div key={r.id} className="card px-4 py-3 flex items-center gap-3">
                  <span className="text-xl">{d?.icon ?? '🎯'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{d?.label ?? r.discipline}</div>
                    <div className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString()}</div>
                  </div>
                  <div className="font-mono font-bold text-sm">
                    {r.correct}/{r.itemCount}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
