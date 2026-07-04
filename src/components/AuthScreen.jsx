import { useState } from 'react'
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from '../firebase'

const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'An account with this email already exists. Try signing in.',
  'auth/invalid-email': 'That email address doesn\'t look right.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/user-not-found': 'No account found with this email. Try signing up.',
  'auth/wrong-password': 'Wrong email or password.',
  'auth/too-many-requests': 'Too many attempts — please wait a minute and try again.',
}

export default function AuthScreen() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email.trim(), password)
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      }
    } catch (err) {
      setError(ERROR_MESSAGES[err.code] || 'Something went wrong. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-5xl mb-3">🏠</p>
          <h1 className="text-2xl font-bold text-gray-800">Household Tasks</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your household staff's daily tasks
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
            {['signin', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === m ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'
                }`}
              >
                {m === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mb-3 outline-none focus:border-blue-400 text-gray-800"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Password (min. 6 characters)' : 'Password'}
              required
              minLength={6}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mb-4 outline-none focus:border-blue-400 text-gray-800"
            />
            {error && (
              <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium disabled:opacity-40 transition-colors"
            >
              {busy ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
