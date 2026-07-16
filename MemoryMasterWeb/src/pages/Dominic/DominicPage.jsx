import { useState, useMemo } from 'react'
import { useAppStore } from '../../store/AppContext'
import { pairLetters } from '../../data/dominicDefaults'
import { isDue } from '../../lib/sm2'
import DominicDrill from './DominicDrill'

const TENS = ['0','1','2','3','4','5','6','7','8','9']

export default function DominicPage() {
  const { dominicPairs, dueDominicPairs, updateDominicPair, resetDominicSRS } = useAppStore()
  const [section, setSection] = useState('table')
  const [editing, setEditing] = useState(null)
  const [editPerson, setEditPerson] = useState('')
  const [editAction, setEditAction] = useState('')
  const [filterRow, setFilterRow] = useState(null)
  const [drilling, setDrilling] = useState(false)

  if (drilling) return <DominicDrill onBack={() => setDrilling(false)} />

  const displayPairs = filterRow !== null
    ? dominicPairs.filter(p => p.number[0] === filterRow)
    : dominicPairs

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dominic System</h1>
        {dueDominicPairs.length > 0 && (
          <button onClick={() => setDrilling(true)} className="btn-primary !w-auto px-4 py-2 text-sm">
            Drill {dueDominicPairs.length} due
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 p-1 rounded-xl">
        {[['table','Table'],['learn','Learn']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              section === id ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >{label}</button>
        ))}
      </div>

      {section === 'table' && (
        <div className="space-y-3">
          {/* Row filter */}
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setFilterRow(null)}
              className={`px-3 py-1 text-xs rounded-lg font-mono font-medium transition-colors ${filterRow === null ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >All</button>
            {TENS.map(t => (
              <button
                key={t}
                onClick={() => setFilterRow(filterRow === t ? null : t)}
                className={`px-3 py-1 text-xs rounded-lg font-mono font-medium transition-colors ${filterRow === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
              >{t}0s</button>
            ))}
          </div>

          <div className="space-y-1.5">
            {displayPairs.map(pair => {
              const isEditing = editing === pair.number
              return (
                <div key={pair.number} className="card px-3 py-2.5 group">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-400 w-6 shrink-0">{pair.number}</span>
                        <span className="text-xs text-gray-500 font-mono">{pairLetters(pair.number)}</span>
                      </div>
                      <input
                        autoFocus
                        className="input text-sm"
                        placeholder="Person"
                        value={editPerson}
                        onChange={e => setEditPerson(e.target.value)}
                      />
                      <input
                        className="input text-sm"
                        placeholder="Action"
                        value={editAction}
                        onChange={e => setEditAction(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (editPerson.trim()) updateDominicPair(pair.number, { person: editPerson.trim(), action: editAction.trim() })
                            setEditing(null)
                          }}
                          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-500"
                        >Save</button>
                        <button onClick={() => setEditing(null)} className="text-xs text-gray-400 hover:text-white px-2">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm w-6 shrink-0 text-gray-400">{pair.number}</span>
                      <span className="text-xs text-gray-600 font-mono w-6 shrink-0">{pairLetters(pair.number)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{pair.person}</div>
                        <div className="text-xs text-gray-400 truncate">{pair.action}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isDue(pair.srs) && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" title="Due for review" />}
                        <button
                          onClick={() => { setEditing(pair.number); setEditPerson(pair.person); setEditAction(pair.action) }}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white text-xs transition-all px-2 py-1"
                        >Edit</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {section === 'learn' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">{dueDominicPairs.length} pairs due · {dominicPairs.length} total</p>
            <button onClick={resetDominicSRS} className="text-xs text-gray-500 hover:text-red-400 transition-colors">Reset all SRS</button>
          </div>

          {dueDominicPairs.length > 0 ? (
            <button onClick={() => setDrilling(true)} className="btn-primary">
              Start drill — {dueDominicPairs.length} due
            </button>
          ) : (
            <div className="card p-6 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-medium">All pairs reviewed!</p>
              <p className="text-sm text-gray-400 mt-1">Check back later for due cards.</p>
              <button onClick={resetDominicSRS} className="text-sm text-gray-500 hover:text-gray-300 mt-3 underline">Reset to drill all again</button>
            </div>
          )}

          <p className="text-xs text-gray-500">Pairs marked Again come back in 10 min. Good pairs return in days/weeks using SM-2 spacing.</p>
        </div>
      )}
    </div>
  )
}
