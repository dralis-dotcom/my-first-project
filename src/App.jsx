import { useState } from 'react'
import MaidView from './components/MaidView'
import AdminView from './components/AdminView'
import PinModal from './components/PinModal'

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234'

export default function App() {
  const [view, setView] = useState('maid')
  const [showPinModal, setShowPinModal] = useState(false)

  function handlePinSubmit(pin) {
    if (pin === ADMIN_PIN) {
      setView('admin')
      setShowPinModal(false)
      return true
    }
    return false
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'maid' ? (
        <MaidView onAdminClick={() => setShowPinModal(true)} />
      ) : (
        <AdminView onBack={() => setView('maid')} />
      )}
      {showPinModal && (
        <PinModal onSubmit={handlePinSubmit} onClose={() => setShowPinModal(false)} />
      )}
    </div>
  )
}
