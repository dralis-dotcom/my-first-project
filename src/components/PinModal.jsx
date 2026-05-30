import { useState } from 'react'

export default function PinModal({ onSubmit, onClose }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const success = onSubmit(pin)
    if (!success) {
      setError(true)
      setPin('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-1">Admin Access</h2>
        <p className="text-sm text-gray-400 text-center mb-5">Enter your PIN to manage tasks</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(false) }}
            placeholder="••••"
            className={`w-full border-2 rounded-xl p-3 text-center text-3xl tracking-widest mb-3 outline-none transition-colors ${
              error ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'
            }`}
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-sm text-center mb-3">Wrong PIN, try again</p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium"
            >
              Enter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
