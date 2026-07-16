import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '../../store/AppContext'
import { WORDS, shuffle } from '../../data/wordBank'
import { HISTORIC_EVENTS } from '../../data/historicDates'

const FULL_DECK = (() => {
  const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']
  const suits = ['♠','♥','♦','♣']
  return suits.flatMap(s => ranks.map(r => ({ id: r + s, rank: r, suit: s, display: r + s, isRed: s === '♥' || s === '♦' })))
})()

const DISCIPLINE_TIPS = {
  numbers:       'Chunk digits into pairs, convert each to a Dominic person, combine pairs as Person+Action, then place on a journey.',
  binary:        'Group bits into 3s (000–111 = 0–7), pair the results, apply Dominic PA pairs, then journey.',
  words:         'Chain words into a vivid exaggerated story, or place one image per journey locus.',
  cards:         'Assign each card a person, combine pairs as PA scenes, place along a journey.',
  historicDates: 'Encode the year with Dominic/Major System numbers, then place the scene on a journey locus.',
}

const DEFAULTS = {
  numbers:       { itemCount: 20, memorizeSeconds: 60 },
  binary:        { itemCount: 20, memorizeSeconds: 60 },
  words:         { itemCount: 10, memorizeSeconds: 60 },
  cards:         { itemCount: 10, memorizeSeconds: 60 },
  historicDates: { itemCount: 10, memorizeSeconds: 90 },
}

const LIMITS = {
  numbers:       { min: 4,  max: 200, step: 10 },
  binary:        { min: 8,  max: 40,  step: 4  },
  words:         { min: 4,  max: 50,  step: 2  },
  cards:         { min: 5,  max: 20,  step: 2  },
  historicDates: { min: 4,  max: 48,  step: 2  },
}

const DISCIPLINE_LABELS = {
  numbers: 'Numbers', binary: 'Binary', words: 'Words',
  cards: 'Playing Cards', historicDates: 'Historic Dates',
}

export default function TrainingSession({ discipline, onBack }) {
  const { addResult } = useAppStore()
  const cfg = DEFAULTS[discipline]
  const lim = LIMITS[discipline]

  const [phase, setPhase] = useState('setup')
  const [itemCount, setItemCount] = useState(cfg.itemCount)
  const [memorizeSeconds, setMemorizeSeconds] = useState(cfg.memorizeSeconds)
  const [remaining, setRemaining] = useState(0)

  // Generated items
  const [items, setItems] = useState([])

  // Recall state (discipline-specific)
  const [digitAnswer, setDigitAnswer] = useState('')
  const [binaryTapped, setBinaryTapped] = useState([])
  const [wordAnswers, setWordAnswers] = useState([])
  const [cardGrid, setCardGrid] = useState([])
  const [cardOrder, setCardOrder] = useState([])
  const [dateAnswers, setDateAnswers] = useState([])

  const [correct, setCorrect] = useState(0)

  const timerRef = useRef(null)

  const generate = useCallback(() => {
    switch (discipline) {
      case 'numbers':
        return Array.from({ length: itemCount }, () => Math.floor(Math.random() * 10))
      case 'binary':
        return Array.from({ length: itemCount }, () => Math.floor(Math.random() * 2))
      case 'words':
        return shuffle(WORDS).slice(0, itemCount)
      case 'cards':
        return shuffle(FULL_DECK).slice(0, itemCount)
      case 'historicDates':
        return shuffle(HISTORIC_EVENTS).slice(0, itemCount)
      default:
        return []
    }
  }, [discipline, itemCount])

  const startTimer = useCallback((seconds) => {
    clearInterval(timerRef.current)
    setRemaining(seconds)
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  // Auto-advance to recall when timer hits 0
  useEffect(() => {
    if (phase === 'memorize' && remaining === 0) {
      beginRecall()
    }
  }, [remaining, phase])

  useEffect(() => () => clearInterval(timerRef.current), [])

  function start() {
    const generated = generate()
    setItems(generated)
    setPhase('memorize')
    startTimer(memorizeSeconds)
    // reset recall state
    setDigitAnswer('')
    setBinaryTapped([])
    setWordAnswers(Array(generated.length).fill(''))
    setCardGrid(shuffle(generated))
    setCardOrder([])
    setDateAnswers(Array(generated.length).fill(''))
  }

  function beginRecall() {
    clearInterval(timerRef.current)
    if (discipline === 'cards') setCardGrid(shuffle(items))
    setPhase('recall')
  }

  function finish() {
    const score = calcScore()
    setCorrect(score)
    addResult({ discipline, itemCount: items.length, correct: score, memorizeSeconds })
    setPhase('results')
  }

  function calcScore() {
    switch (discipline) {
      case 'numbers': {
        const typed = digitAnswer.replace(/\D/g, '').split('').map(Number)
        return items.reduce((acc, d, i) => acc + (typed[i] === d ? 1 : 0), 0)
      }
      case 'binary': {
        return items.reduce((acc, d, i) => acc + (binaryTapped[i] === d ? 1 : 0), 0)
      }
      case 'words': {
        return items.reduce((acc, w, i) => acc + (wordAnswers[i]?.trim().toLowerCase() === w ? 1 : 0), 0)
      }
      case 'cards': {
        return items.reduce((acc, c, i) => acc + (cardOrder[i]?.id === c.id ? 1 : 0), 0)
      }
      case 'historicDates': {
        return items.reduce((acc, e, i) => {
          const typed = parseInt(dateAnswers[i]?.trim(), 10)
          return acc + (!isNaN(typed) && Math.abs(typed - e.year) <= 5 ? 1 : 0)
        }, 0)
      }
      default: return 0
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (phase === 'setup') return <SetupPhase
    discipline={discipline} itemCount={itemCount} setItemCount={setItemCount}
    memorizeSeconds={memorizeSeconds} setMemorizeSeconds={setMemorizeSeconds}
    lim={lim} onStart={start} onBack={onBack}
  />

  if (phase === 'memorize') return <MemorizePhase
    discipline={discipline} items={items} remaining={remaining}
    onSkip={beginRecall}
  />

  if (phase === 'recall') return <RecallPhase
    discipline={discipline} items={items}
    digitAnswer={digitAnswer} setDigitAnswer={setDigitAnswer}
    binaryTapped={binaryTapped} setBinaryTapped={setBinaryTapped}
    wordAnswers={wordAnswers} setWordAnswers={setWordAnswers}
    cardGrid={cardGrid} cardOrder={cardOrder} setCardOrder={setCardOrder}
    dateAnswers={dateAnswers} setDateAnswers={setDateAnswers}
    onFinish={finish}
  />

  return <ResultsPhase
    discipline={discipline} correct={correct} total={items.length}
    memorizeSeconds={memorizeSeconds}
    items={items} dateAnswers={dateAnswers}
    onAgain={() => setPhase('setup')}
    onBack={onBack}
  />
}

// ── Setup ─────────────────────────────────────────────────────────────────

function SetupPhase({ discipline, itemCount, setItemCount, memorizeSeconds, setMemorizeSeconds, lim, onStart, onBack }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="btn-ghost text-sm">← Back</button>
        <h2 className="text-xl font-bold">{DISCIPLINE_LABELS[discipline]}</h2>
      </div>

      <div className="card p-5 space-y-5">
        <Stepper label="Items" value={itemCount} min={lim.min} max={lim.max} step={lim.step} onChange={setItemCount} />
        <Stepper label="Memorize time (s)" value={memorizeSeconds} min={10} max={600} step={10} onChange={setMemorizeSeconds} />
      </div>

      <div className="card p-4 text-sm text-gray-400">
        <span className="font-medium text-gray-300">Tip: </span>{DISCIPLINE_TIPS[discipline]}
      </div>

      <button onClick={onStart} className="btn-primary">Start memorizing</button>
    </div>
  )
}

function Stepper({ label, value, min, max, step, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}: <span className="font-bold font-mono">{value}</span></span>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(v => Math.max(min, v - step))}
          className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 font-bold transition-colors"
        >−</button>
        <button
          onClick={() => onChange(v => Math.min(max, v + step))}
          className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 font-bold transition-colors"
        >+</button>
      </div>
    </div>
  )
}

// ── Memorize ──────────────────────────────────────────────────────────────

function MemorizePhase({ discipline, items, remaining, onSkip }) {
  const isUrgent = remaining <= 10
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{DISCIPLINE_LABELS[discipline]}</h2>
        <span className={`font-mono text-4xl font-bold tabular-nums ${isUrgent ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          {remaining}s
        </span>
      </div>

      <div className="card p-4 max-h-[60vh] overflow-y-auto">
        {discipline === 'numbers' && (
          <div className="grid grid-cols-10 gap-2 font-mono font-bold text-xl text-center">
            {items.map((d, i) => <span key={i}>{d}</span>)}
          </div>
        )}

        {discipline === 'binary' && (
          <div className="space-y-2 font-mono">
            {chunk(items, 8).map((group, gi) => (
              <div key={gi} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-8 text-right">{gi * 8 + 1}.</span>
                {group.map((d, i) => (
                  <span key={i} className={`text-xl font-bold ${d === 1 ? 'text-blue-400' : 'text-gray-300'}`}>{d}</span>
                ))}
              </div>
            ))}
          </div>
        )}

        {discipline === 'words' && (
          <ol className="space-y-2">
            {items.map((w, i) => (
              <li key={i} className="text-lg capitalize">
                <span className="text-gray-500 text-sm mr-2">{i + 1}.</span>{w}
              </li>
            ))}
          </ol>
        )}

        {discipline === 'cards' && (
          <div className="grid grid-cols-5 gap-2">
            {items.map((c, i) => (
              <CardFace key={i} card={c} />
            ))}
          </div>
        )}

        {discipline === 'historicDates' && (
          <div className="space-y-2">
            {items.map((e, i) => (
              <div key={e.id} className="card p-3">
                <div className="text-xs text-gray-400 mb-0.5">{i + 1}. {e.description}</div>
                <div className="text-2xl font-bold font-mono text-blue-400">{e.year}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={onSkip} className="btn-primary">Done — recall now</button>
    </div>
  )
}

// ── Recall ────────────────────────────────────────────────────────────────

function RecallPhase({
  discipline, items,
  digitAnswer, setDigitAnswer,
  binaryTapped, setBinaryTapped,
  wordAnswers, setWordAnswers,
  cardGrid, cardOrder, setCardOrder,
  dateAnswers, setDateAnswers,
  onFinish,
}) {
  function toggleCard(card) {
    setCardOrder(prev => {
      const idx = prev.findIndex(c => c.id === card.id)
      if (idx >= 0) return prev.filter(c => c.id !== card.id)
      return [...prev, card]
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Recall — {DISCIPLINE_LABELS[discipline]}</h2>

      <div className="card p-4 max-h-[65vh] overflow-y-auto space-y-4">
        {discipline === 'numbers' && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Type the digits in order (numbers only)</p>
            <input
              autoFocus
              className="input font-mono text-xl tracking-widest"
              placeholder="3141592…"
              value={digitAnswer}
              onChange={e => setDigitAnswer(e.target.value.replace(/\D/g, ''))}
            />
            <p className="text-xs text-gray-500">Entered: {digitAnswer.length} / {items.length}</p>
          </div>
        )}

        {discipline === 'binary' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Tap 0 and 1 in order</p>
            <div className="font-mono text-sm min-h-12 card p-3">
              {chunk(binaryTapped, 8).map((group, gi) => (
                <div key={gi} className="flex gap-1.5">
                  <span className="text-gray-600 w-6 text-right text-xs">{gi * 8 + 1}.</span>
                  {group.map((d, i) => (
                    <span key={i} className={d === 1 ? 'text-blue-400 font-bold' : 'text-gray-300'}>{d}</span>
                  ))}
                </div>
              ))}
              {binaryTapped.length === 0 && <span className="text-gray-600">Tap 0 or 1 below…</span>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map(d => (
                <button
                  key={d}
                  onClick={() => { if (binaryTapped.length < items.length) setBinaryTapped(prev => [...prev, d]) }}
                  disabled={binaryTapped.length >= items.length}
                  className="card py-6 text-5xl font-bold font-mono hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-40"
                >{d}</button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{binaryTapped.length} / {items.length}</span>
              <button
                onClick={() => setBinaryTapped(prev => prev.slice(0, -1))}
                disabled={!binaryTapped.length}
                className="text-sm text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
              >⌫ Delete last</button>
            </div>
          </div>
        )}

        {discipline === 'words' && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Type each word in order</p>
            {wordAnswers.map((ans, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-gray-500 text-sm w-6 text-right">{i + 1}.</span>
                <input
                  className="input text-sm"
                  placeholder={`Word ${i + 1}`}
                  value={ans}
                  onChange={e => setWordAnswers(prev => {
                    const next = [...prev]; next[i] = e.target.value; return next
                  })}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
            ))}
          </div>
        )}

        {discipline === 'cards' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">Tap cards in the order you memorized them</p>
            <p className="text-xs text-gray-500">{cardOrder.length}/{items.length} placed — tap again to remove</p>
            <div className="grid grid-cols-5 gap-2">
              {cardGrid.map(card => {
                const orderIdx = cardOrder.findIndex(c => c.id === card.id)
                return (
                  <button
                    key={card.id}
                    onClick={() => toggleCard(card)}
                    className={`relative py-2 rounded-xl text-sm font-bold font-mono transition-all border ${
                      orderIdx >= 0
                        ? 'border-blue-500 bg-blue-600/20'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-500'
                    } ${card.isRed ? 'text-red-400' : 'text-gray-100'}`}
                  >
                    {card.display}
                    {orderIdx >= 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                        {orderIdx + 1}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {discipline === 'historicDates' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">What year did each event occur? (±5 years = correct)</p>
            {items.map((e, i) => (
              <div key={e.id} className="card p-3 space-y-2">
                <p className="text-sm">{i + 1}. {e.description}</p>
                <input
                  className="input font-mono w-28 text-center"
                  placeholder="Year"
                  value={dateAnswers[i] ?? ''}
                  onChange={ev => setDateAnswers(prev => {
                    const next = [...prev]; next[i] = ev.target.value; return next
                  })}
                  type="number"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={onFinish} className="btn-primary">Check answers</button>
    </div>
  )
}

// ── Results ───────────────────────────────────────────────────────────────

function ResultsPhase({ discipline, correct, total, memorizeSeconds, items, dateAnswers, onAgain, onBack }) {
  const pct = Math.round((correct / Math.max(total, 1)) * 100)
  const perfect = correct === total
  return (
    <div className="space-y-6 text-center">
      <div>
        <div className="text-4xl mb-2">{perfect ? '🏆' : pct >= 70 ? '✅' : '📈'}</div>
        <h2 className="text-2xl font-bold">{perfect ? 'Perfect!' : 'Session complete'}</h2>
      </div>

      <div>
        <div className="text-7xl font-black font-mono tabular-nums text-white">{correct}/{total}</div>
        <div className="text-gray-400 mt-1">{pct}% accuracy · {memorizeSeconds}s memorization</div>
      </div>

      {discipline === 'historicDates' && items.length > 0 && (
        <div className="card p-4 text-left space-y-2 max-h-64 overflow-y-auto">
          {items.map((e, i) => {
            const typed = parseInt(dateAnswers[i]?.trim(), 10)
            const diff = isNaN(typed) ? Infinity : Math.abs(typed - e.year)
            const icon = diff === 0 ? '✅' : diff <= 5 ? '🟡' : '❌'
            return (
              <div key={e.id} className="flex items-start gap-2 text-sm">
                <span>{icon}</span>
                <span className="flex-1 text-gray-300 truncate">{e.description}</span>
                <span className="font-mono text-gray-400 shrink-0">{isNaN(typed) ? '—' : typed}</span>
                <span className="font-mono font-bold shrink-0">({e.year})</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button onClick={onAgain} className="btn-primary">Train again</button>
        <button onClick={onBack} className="btn-ghost text-center">Back to disciplines</button>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────

function CardFace({ card }) {
  return (
    <div className={`py-2 text-center text-sm font-bold font-mono rounded-xl border border-gray-700 bg-gray-900 ${card.isRed ? 'text-red-400' : 'text-gray-100'}`}>
      {card.display}
    </div>
  )
}

function chunk(arr, size) {
  const result = []
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
  return result
}
