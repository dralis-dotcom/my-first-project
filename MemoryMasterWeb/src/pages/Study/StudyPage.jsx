import { useState } from 'react'
import { useAppStore } from '../../store/AppContext'
import { isDue } from '../../lib/sm2'
import ReviewSession from './ReviewSession'

export default function StudyPage() {
  const { decks, addDeck, deleteDeck, addCard, deleteCard } = useAppStore()
  const [activeDeck, setActiveDeck] = useState(null)
  const [reviewing, setReviewing] = useState(null)
  const [showNewDeck, setShowNewDeck] = useState(false)
  const [newDeckName, setNewDeckName] = useState('')
  const [showAddCard, setShowAddCard] = useState(false)
  const [newFront, setNewFront] = useState('')
  const [newBack, setNewBack] = useState('')
  const [newMnemonic, setNewMnemonic] = useState('')

  if (reviewing) {
    return <ReviewSession deckId={reviewing} onBack={() => setReviewing(null)} />
  }

  const deck = decks.find(d => d.id === activeDeck)

  if (activeDeck && deck) {
    const due = deck.cards.filter(c => isDue(c.srs))
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => { setActiveDeck(null); setShowAddCard(false) }} className="btn-ghost text-sm">← Back</button>
          <h2 className="text-xl font-bold flex-1">{deck.emoji} {deck.name}</h2>
          {due.length > 0 && (
            <button onClick={() => setReviewing(deck.id)} className="btn-primary !w-auto px-4 py-2 text-sm">
              Review {due.length}
            </button>
          )}
        </div>

        <div className="flex gap-2 text-sm">
          <span className="badge bg-blue-900/50 text-blue-300">{deck.cards.length} cards</span>
          <span className="badge bg-orange-900/50 text-orange-300">{due.length} due</span>
        </div>

        {/* Add card form */}
        {showAddCard ? (
          <div className="card p-4 space-y-3">
            <h3 className="font-semibold">Add card</h3>
            <input className="input" placeholder="Front (question / cue)" value={newFront} onChange={e => setNewFront(e.target.value)} autoFocus />
            <textarea className="input resize-none" rows={2} placeholder="Back (answer)" value={newBack} onChange={e => setNewBack(e.target.value)} />
            <input className="input text-sm" placeholder="Mnemonic (optional)" value={newMnemonic} onChange={e => setNewMnemonic(e.target.value)} />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!newFront.trim() || !newBack.trim()) return
                  addCard(deck.id, newFront.trim(), newBack.trim(), newMnemonic.trim())
                  setNewFront(''); setNewBack(''); setNewMnemonic('')
                }}
                className="btn-primary !w-auto px-4 py-2 text-sm"
              >Add</button>
              <button onClick={() => setShowAddCard(false)} className="btn-ghost text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAddCard(true)} className="card p-3 w-full text-sm text-gray-400 hover:text-white hover:border-blue-500/50 transition-all text-left">
            + Add a card
          </button>
        )}

        {/* Card list */}
        <div className="space-y-2">
          {deck.cards.map(card => (
            <div key={card.id} className="card p-3 group">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{card.front}</div>
                  <div className="text-gray-400 text-sm mt-0.5">{card.back}</div>
                  {card.mnemonic && <div className="text-xs text-gray-500 mt-1 italic">{card.mnemonic}</div>}
                  <div className="text-xs text-gray-600 mt-1">
                    {isDue(card.srs) ? (
                      <span className="text-orange-400">Due now</span>
                    ) : (
                      `Due ${new Date(card.srs.dueDate).toLocaleDateString()}`
                    )}
                    {' · '}Rep {card.srs.repetitions}
                  </div>
                </div>
                <button
                  onClick={() => deleteCard(deck.id, card.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 text-xs px-2 transition-all"
                >✕</button>
              </div>
            </div>
          ))}
          {deck.cards.length === 0 && (
            <div className="text-center text-gray-500 py-10">No cards yet. Add one above.</div>
          )}
        </div>
      </div>
    )
  }

  // Deck list
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Study</h1>
          <p className="text-gray-400 text-sm">Spaced repetition flashcard decks.</p>
        </div>
      </div>

      {showNewDeck ? (
        <div className="card p-4 space-y-3">
          <h3 className="font-semibold">New deck</h3>
          <input
            autoFocus
            className="input"
            placeholder="Deck name"
            value={newDeckName}
            onChange={e => setNewDeckName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && newDeckName.trim()) {
                addDeck(newDeckName.trim())
                setNewDeckName('')
                setShowNewDeck(false)
              }
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!newDeckName.trim()) return
                addDeck(newDeckName.trim())
                setNewDeckName(''); setShowNewDeck(false)
              }}
              className="btn-primary !w-auto px-4 py-2 text-sm"
            >Create</button>
            <button onClick={() => setShowNewDeck(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowNewDeck(true)} className="card p-4 w-full text-left text-gray-400 hover:text-white hover:border-blue-500/50 transition-all">
          + New deck
        </button>
      )}

      <div className="space-y-2">
        {decks.map(d => {
          const due = d.cards.filter(c => isDue(c.srs)).length
          return (
            <div key={d.id} className="card p-4 flex items-center gap-3 hover:border-gray-600 transition-colors group">
              <span className="text-2xl">{d.emoji}</span>
              <button className="flex-1 text-left" onClick={() => setActiveDeck(d.id)}>
                <div className="font-medium">{d.name}</div>
                <div className="text-xs text-gray-400">{d.cards.length} cards · {due} due</div>
              </button>
              {due > 0 && (
                <button
                  onClick={() => setReviewing(d.id)}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg font-medium hover:bg-blue-500 transition-colors"
                >
                  Review {due}
                </button>
              )}
              <button
                onClick={() => deleteDeck(d.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
              >✕</button>
            </div>
          )
        })}
        {decks.length === 0 && (
          <div className="text-center text-gray-500 py-16">
            <div className="text-4xl mb-3">🃏</div>
            <p>No decks yet. Create your first deck above.</p>
          </div>
        )}
      </div>
    </div>
  )
}
