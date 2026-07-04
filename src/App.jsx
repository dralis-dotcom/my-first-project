import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { findHouseholdByOwner } from './household'
import MaidView from './components/MaidView'
import AdminView from './components/AdminView'
import AuthScreen from './components/AuthScreen'
import OnboardingScreen from './components/OnboardingScreen'

const STAFF_KEY = 'staffHouseholdId'

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Loading...
    </div>
  )
}

export default function App() {
  // A "?h=<id>" link puts this device in staff mode; remember it so the
  // maid's phone stays on her task list even after the link is closed.
  const [staffHouseholdId, setStaffHouseholdId] = useState(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('h')
    if (fromUrl) {
      localStorage.setItem(STAFF_KEY, fromUrl)
      return fromUrl
    }
    return localStorage.getItem(STAFF_KEY)
  })

  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [household, setHousehold] = useState(null)
  const [householdReady, setHouseholdReady] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthReady(true)
    })
  }, [])

  useEffect(() => {
    if (!user) {
      setHousehold(null)
      setHouseholdReady(true)
      return
    }
    setHouseholdReady(false)
    let cancelled = false
    findHouseholdByOwner(user.uid).then((h) => {
      if (cancelled) return
      setHousehold(h)
      setHouseholdReady(true)
    })
    return () => { cancelled = true }
  }, [user])

  function exitStaffMode() {
    localStorage.removeItem(STAFF_KEY)
    window.history.replaceState(null, '', window.location.pathname)
    setStaffHouseholdId(null)
  }

  if (staffHouseholdId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MaidView householdId={staffHouseholdId} onExitStaffMode={exitStaffMode} />
      </div>
    )
  }

  if (!authReady || (user && !householdReady)) {
    return <div className="min-h-screen bg-gray-50"><Loading /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!user ? (
        <AuthScreen />
      ) : !household ? (
        <OnboardingScreen user={user} onCreated={setHousehold} />
      ) : (
        <AdminView household={household} onHouseholdChange={setHousehold} />
      )}
    </div>
  )
}
