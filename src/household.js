import {
  collection, query, where, limit, getDocs, addDoc, doc, onSnapshot, updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'

export async function findHouseholdByOwner(uid) {
  const q = query(collection(db, 'households'), where('ownerUid', '==', uid), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
}

export async function createHousehold(uid, name) {
  const data = {
    name: name.trim(),
    ownerUid: uid,
    telegramBotToken: '',
    telegramChatId: '',
    createdAt: new Date().toISOString(),
  }
  const ref = await addDoc(collection(db, 'households'), data)
  return { id: ref.id, ...data }
}

export function subscribeHousehold(householdId, callback) {
  return onSnapshot(doc(db, 'households', householdId), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  })
}

export async function updateHousehold(householdId, data) {
  await updateDoc(doc(db, 'households', householdId), data)
}

export function taskCollection(householdId) {
  return collection(db, 'households', householdId, 'tasks')
}

export function completionCollection(householdId) {
  return collection(db, 'households', householdId, 'completions')
}

export function staffLink(householdId) {
  return `${window.location.origin}${window.location.pathname}?h=${householdId}`
}
