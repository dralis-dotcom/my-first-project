import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { createHousehold } from '../household'

export default function OnboardingScreen({ user, onCreated }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    setError('')
    try {
      const household = await createHousehold(user.uid, name)
      onCreated(household)
    } catch {
      setError('Could not create your household. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-5xl mb-3">👋</p>
          <h1 className="text-2xl font-bold text-gray-800">Welcome!</h1>
          <p className="text-gray-400 text-sm mt-1">
            Give your household a name to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. The Ali Family Home"
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mb-4 outline-none focus:border-blue-400 text-gray-800"
          />
          {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
          <button
            type="submit"
            disabled={!name.trim() || busy}
            className="w-full py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium disabled:opacity-40 transition-colors"
          >
            {busy ? 'Creating...' : 'Create household'}
          </button>
        </form>

        <button
          onClick={() => signOut(auth)}
          className="block mx-auto mt-4 text-sm text-gray-400 hover:text-gray-600 underline"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
