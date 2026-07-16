// SM-2 spaced repetition algorithm (direct port of SM2Scheduler.swift)
// grade: 0=Again, 3=Hard, 4=Good, 5=Easy

export function sm2Review(state, grade, now = new Date()) {
  const s = { ...state }
  const quality = grade

  if (quality < 3) {
    s.repetitions = 0
    s.intervalDays = 0
    s.dueDate = new Date(now.getTime() + 10 * 60 * 1000).toISOString()
    return s
  }

  if (s.repetitions === 0) {
    s.intervalDays = 1
  } else if (s.repetitions === 1) {
    s.intervalDays = 6
  } else {
    s.intervalDays = Math.round(s.intervalDays * s.easeFactor)
  }
  s.repetitions += 1

  const q = quality
  s.easeFactor = Math.max(1.3, s.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
  s.dueDate = new Date(now.getTime() + s.intervalDays * 86400 * 1000).toISOString()
  return s
}

export function isDue(srs, now = new Date()) {
  return new Date(srs.dueDate) <= now
}

export function makeSRS() {
  return { repetitions: 0, intervalDays: 0, easeFactor: 2.5, dueDate: new Date().toISOString() }
}
