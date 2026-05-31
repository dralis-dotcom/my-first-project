import { useState, useEffect } from 'react'
import {
  collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, writeBatch, query, where
} from 'firebase/firestore'
import { db } from '../firebase'

const DAY_OPTIONS = [
  { value: 'daily', label: 'Every day' },
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
]

const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

const EMPTY_FORM = { title: '', description: '', days: ['daily'] }

export default function AdminView({ onBack }) {
  const [tasks, setTasks] = useState([])
  const [completions, setCompletions] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const today = getTodayString()
  const todayDay = DAYS_OF_WEEK[new Date().getDay()]

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'tasks'), (snap) => {
      setTasks(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      )
    })
    return unsub
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'completions'), (snap) => {
      const map = {}
      snap.docs.forEach(d => {
        const data = d.data()
        if (data.date === today) map[data.taskId] = data
      })
      setCompletions(map)
    })
    return unsub
  }, [today])

  function openAdd() {
    setEditingTask(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(task) {
    setEditingTask(task)
    setForm({ title: task.title, description: task.description || '', days: task.days || ['daily'] })
    setShowForm(true)
  }

  async function saveTask() {
    if (!form.title.trim() || form.days.length === 0) return
    setSaving(true)
    const data = {
      title: form.title.trim(),
      description: form.description.trim(),
      days: form.days,
      order: editingTask?.order ?? tasks.length,
    }
    if (editingTask) {
      await updateDoc(doc(db, 'tasks', editingTask.id), data)
    } else {
      await addDoc(collection(db, 'tasks'), data)
    }
    setSaving(false)
    setShowForm(false)
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return
    await deleteDoc(doc(db, 'tasks', task.id))
  }

  async function resetToday() {
    if (!window.confirm('Reset all completions for today?')) return
    const batch = writeBatch(db)
    Object.keys(completions).forEach(taskId => {
      batch.delete(doc(db, 'completions', `${today}_${taskId}`))
    })
    await batch.commit()
  }

  function toggleDayInForm(day) {
    if (day === 'daily') {
      setForm(f => ({ ...f, days: ['daily'] }))
      return
    }
    setForm(f => {
      const current = f.days.filter(d => d !== 'daily')
      const next = current.includes(day) ? current.filter(d => d !== day) : [...current, day]
      return { ...f, days: next.length > 0 ? next : ['daily'] }
    })
  }

  const todayTasks = tasks.filter(
    t => t.days?.includes('daily') || t.days?.includes(todayDay)
  )
  const completedCount = Object.keys(completions).length

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Admin</h1>
      </div>

      {/* Today's progress summary */}
      <div className="bg-blue-50 rounded-2xl p-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-blue-800">Today's Progress</p>
            <p className="text-blue-500 text-sm">
              {completedCount} of {todayTasks.length} tasks completed
            </p>
          </div>
          {Object.keys(completions).length > 0 && (
            <button
              onClick={resetToday}
              className="text-xs text-red-400 hover:text-red-600 underline"
            >
              Reset
            </button>
          )}
        </div>
        {Object.values(completions).length > 0 && (
          <div className="mt-3 space-y-1">
            {Object.values(completions).map(c => (
              <p key={c.taskId} className="text-sm text-blue-600">
                ✓ {c.taskTitle}
                <span className="text-blue-400 ml-1 text-xs">
                  {new Date(c.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Tasks section */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-semibold text-gray-700">
          All Tasks ({tasks.length})
        </h2>
        <button
          onClick={openAdd}
          className="bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          + Add Task
        </button>
      </div>

      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{task.title}</p>
              {task.description && (
                <p className="text-sm text-gray-400 truncate">{task.description}</p>
              )}
              <p className="text-xs text-gray-300 mt-0.5">
                {task.days?.includes('daily') ? 'Every day' : task.days?.join(', ')}
              </p>
            </div>
            <button
              onClick={() => openEdit(task)}
              className="text-blue-400 hover:text-blue-600 text-sm px-2 py-1 flex-shrink-0"
            >
              Edit
            </button>
            <button
              onClick={() => deleteTask(task)}
              className="text-red-300 hover:text-red-500 text-sm px-2 py-1 flex-shrink-0"
            >
              Del
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-gray-300 py-10">
            <p className="text-4xl mb-2">📋</p>
            <p>No tasks yet — add your first one!</p>
          </div>
        )}
      </div>

      {/* Add / Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4 pb-8">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editingTask ? 'Edit Task' : 'New Task'}
            </h3>

            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Task title (e.g. Mop the floor)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mb-3 outline-none focus:border-blue-400 text-gray-800"
              autoFocus
            />

            <input
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Details (optional)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mb-4 outline-none focus:border-blue-400 text-gray-600"
            />

            <p className="text-sm font-medium text-gray-600 mb-2">Show this task on:</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {DAY_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => toggleDayInForm(value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-all ${
                    form.days.includes(value)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveTask}
                disabled={!form.title.trim() || form.days.length === 0 || saving}
                className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium disabled:opacity-40 transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
