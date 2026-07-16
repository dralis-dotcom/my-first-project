import { useState } from 'react'
import TrainPage from './pages/Train/TrainPage'
import StudyPage from './pages/Study/StudyPage'
import MindMapsPage from './pages/MindMaps/MindMapsPage'
import DominicPage from './pages/Dominic/DominicPage'

const TABS = [
  { id: 'train',    label: 'Train',     icon: '⚡' },
  { id: 'study',    label: 'Study',     icon: '🃏' },
  { id: 'mindmaps', label: 'Mind Maps', icon: '🧠' },
  { id: 'dominic',  label: 'Dominic',   icon: '👤' },
]

export default function App() {
  const [tab, setTab] = useState('train')

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top header */}
      <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
          <span className="font-bold text-lg tracking-tight">Memory Master</span>
          <nav className="hidden sm:flex gap-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {tab === 'train'    && <TrainPage />}
        {tab === 'study'    && <StudyPage />}
        {tab === 'mindmaps' && <MindMapsPage />}
        {tab === 'dominic'  && <DominicPage />}
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="sm:hidden sticky bottom-0 z-40 bg-gray-950/90 backdrop-blur-md border-t border-gray-800 flex">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
              tab === t.id ? 'text-blue-400' : 'text-gray-500'
            }`}
          >
            <span className="text-xl">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
