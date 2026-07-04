import { useState, useEffect } from 'react'
import { onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { subscribeHousehold, taskCollection, completionCollection } from '../household'
import { sendTelegramNotification } from '../telegram'

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

export default function MaidView({ householdId, onExitStaffMode }) {
  const [household, setHousehold] = useState(undefined)
  const [tasks, setTasks] = useState([])
  const [completions, setCompletions] = useState({})
  const [loading, setLoading] = useState(true)
  const today = getTodayString()
  const todayDay = DAYS[new Date().getDay()]

  useEffect(() => {
    return subscribeHousehold(householdId, setHousehold)
  }, [householdId])

  useEffect(() => {
    const unsub = onSnapshot(taskCollection(householdId), (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const todayTasks = all
        .filter(t => t.days?.includes('daily') || t.days?.includes(todayDay))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setTasks(todayTasks)
      setLoading(false)
    })
    return unsub
  }, [householdId, todayDay])

  useEffect(() => {
    const unsub = onSnapshot(completionCollection(householdId), (snap) => {
      const map = {}
      snap.docs.forEach(d => {
        const data = d.data()
        if (data.date === today) map[data.taskId] = true
      })
      setCompletions(map)
    })
    return unsub
  }, [householdId, today])

  async function toggleTask(task) {
    const docId = `${today}_${task.id}`
    const ref = doc(db, 'households', householdId, 'completions', docId)
    if (completions[task.id]) {
      await deleteDoc(ref)
    } else {
      await setDoc(ref, {
        taskId: task.id,
        taskTitle: task.title,
        date: today,
        completedAt: new Date().toISOString(),
      })
      await sendTelegramNotification(household, task.title)
    }
  }

  if (household === null) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-3">🔗</p>
        <p className="text-gray-500 font-medium">This link is no longer valid.</p>
        <p className="text-gray-400 text-sm mt-1">Ask the household owner for a new one.</p>
        <button
          onClick={onExitStaffMode}
          className="mt-6 text-sm text-blue-400 hover:text-blue-600 underline"
        >
          Owner sign in
        </button>
      </div>
    )
  }

  const completedCount = tasks.filter(t => completions[t.id]).length
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0
  const allDone = tasks.length > 0 && completedCount === tasks.length

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {household?.name || 'Daily Tasks'}
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Progress card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-5">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span className="font-medium">Progress</span>
          <span>{completedCount} / {tasks.length} done</span>
        </div>
        <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background: allDone ? '#22c55e' : '#60a5fa',
            }}
          />
        </div>
        {allDone && (
          <p className="text-center text-green-500 font-semibold text-sm mt-2">
            🎉 All done for today!
          </p>
        )}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center text-gray-300 py-12">
          <p className="text-4xl mb-3">📋</p>
          <p>No tasks for today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => {
            const done = !!completions[task.id]
            return (
              <button
                key={task.id}
                onClick={() => toggleTask(task)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl shadow-sm text-left transition-all active:scale-98 ${
                  done
                    ? 'bg-green-50 border-2 border-green-100'
                    : 'bg-white border-2 border-transparent hover:border-blue-100'
                }`}
              >
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  done ? 'bg-green-400 border-green-400' : 'border-gray-300'
                }`}>
                  {done && (
                    <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium leading-snug ${done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-gray-400 mt-0.5">{task.description}</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      <button
        onClick={onExitStaffMode}
        className="block mx-auto mt-10 text-xs text-gray-300 hover:text-gray-500 underline"
      >
        Owner sign in
      </button>
    </div>
  )
}
