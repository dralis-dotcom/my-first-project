import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { DEFAULT_PAIRS } from '../data/dominicDefaults'
import { makeSRS, sm2Review, isDue } from '../lib/sm2'

const AppContext = createContext(null)

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export function AppProvider({ children }) {
  const [dominicPairs, setDominicPairs] = useState(() => load('mm_dominicPairs', DEFAULT_PAIRS))
  const [decks, setDecks] = useState(() => load('mm_decks', []))
  const [mindMaps, setMindMaps] = useState(() => load('mm_mindMaps', []))
  const [results, setResults] = useState(() => load('mm_results', []))

  useEffect(() => save('mm_dominicPairs', dominicPairs), [dominicPairs])
  useEffect(() => save('mm_decks', decks), [decks])
  useEffect(() => save('mm_mindMaps', mindMaps), [mindMaps])
  useEffect(() => save('mm_results', results), [results])

  // ── Dominic ──────────────────────────────────────────────────────────────
  const updateDominicPair = useCallback((number, fields) => {
    setDominicPairs(prev => prev.map(p => p.number === number ? { ...p, ...fields } : p))
  }, [])

  const reviewDominicPair = useCallback((number, grade) => {
    setDominicPairs(prev => prev.map(p => {
      if (p.number !== number) return p
      return { ...p, srs: sm2Review(p.srs, grade) }
    }))
  }, [])

  const resetDominicSRS = useCallback(() => {
    setDominicPairs(prev => prev.map(p => ({ ...p, srs: makeSRS() })))
  }, [])

  const dueDominicPairs = dominicPairs.filter(p => isDue(p.srs))

  // ── Decks / Flashcards ───────────────────────────────────────────────────
  const addDeck = useCallback((name, emoji = '📚') => {
    const deck = { id: crypto.randomUUID(), name, emoji, cards: [] }
    setDecks(prev => [...prev, deck])
    return deck.id
  }, [])

  const deleteDeck = useCallback((id) => {
    setDecks(prev => prev.filter(d => d.id !== id))
  }, [])

  const addCard = useCallback((deckId, front, back, mnemonic = '') => {
    setDecks(prev => prev.map(d => {
      if (d.id !== deckId) return d
      return { ...d, cards: [...d.cards, { id: crypto.randomUUID(), front, back, mnemonic, srs: makeSRS() }] }
    }))
  }, [])

  const deleteCard = useCallback((deckId, cardId) => {
    setDecks(prev => prev.map(d => {
      if (d.id !== deckId) return d
      return { ...d, cards: d.cards.filter(c => c.id !== cardId) }
    }))
  }, [])

  const reviewCard = useCallback((deckId, cardId, grade) => {
    setDecks(prev => prev.map(d => {
      if (d.id !== deckId) return d
      return {
        ...d,
        cards: d.cards.map(c => c.id !== cardId ? c : { ...c, srs: sm2Review(c.srs, grade) }),
      }
    }))
  }, [])

  // ── Mind Maps ────────────────────────────────────────────────────────────
  const addMindMap = useCallback((title) => {
    const id = crypto.randomUUID()
    const map = {
      id,
      title,
      root: { id: crypto.randomUUID(), text: title, colorHex: '#1971C2', children: [] },
    }
    setMindMaps(prev => [...prev, map])
    return id
  }, [])

  const deleteMindMap = useCallback((id) => {
    setMindMaps(prev => prev.filter(m => m.id !== id))
  }, [])

  const updateMindMap = useCallback((updated) => {
    setMindMaps(prev => prev.map(m => m.id === updated.id ? updated : m))
  }, [])

  // ── Training Results ─────────────────────────────────────────────────────
  const addResult = useCallback((result) => {
    setResults(prev => [...prev, { id: crypto.randomUUID(), date: new Date().toISOString(), ...result }])
  }, [])

  const value = {
    dominicPairs, dueDominicPairs,
    updateDominicPair, reviewDominicPair, resetDominicSRS,
    decks, addDeck, deleteDeck, addCard, deleteCard, reviewCard,
    mindMaps, addMindMap, deleteMindMap, updateMindMap,
    results, addResult,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppStore() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore must be used within AppProvider')
  return ctx
}
