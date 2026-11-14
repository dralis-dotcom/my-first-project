import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SessionResult {
  id: string;
  disciplineId: string;
  levelKey: string;
  score: number;
  max: number;
  memSeconds: number;
  date: string; // ISO
}

export interface MnemonicPart {
  cue: string; // the letter / word / image in the mnemonic
  meaning: string; // the fact it stands for
}

export interface SavedMnemonic {
  id: string;
  topic: string;
  title: string;
  mnemonic: string;
  parts: MnemonicPart[];
  location: string;
  story: string;
  imageKey: MnemonicPart[];
  tip: string;
  date: string;
}

export interface Palace {
  id: string;
  name: string;
  stations: string[];
}

export interface AppState {
  onboarded: boolean;
  lessonsDone: string[];
  results: SessionResult[];
  mnemonics: SavedMnemonic[];
  palaces: Palace[];
  activeDays: string[]; // yyyy-mm-dd, days the user trained or finished a lesson
  digitGroup: 2 | 3;
}

const initial: AppState = {
  onboarded: false,
  lessonsDone: [],
  results: [],
  mnemonics: [],
  palaces: [],
  activeDays: [],
  digitGroup: 2,
};

const KEY = 'memorymaster.state.v1';

export function dayKey(d = new Date()): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Number of days in a row (ending today or yesterday) with activity. */
export function currentStreak(activeDays: string[]): number {
  const set = new Set(activeDays);
  const d = new Date();
  if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(dayKey(d))) {
    n += 1;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

interface Ctx {
  ready: boolean;
  state: AppState;
  update: (patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => void;
  completeLesson: (id: string) => void;
  addResult: (r: Omit<SessionResult, 'id' | 'date'>) => void;
  saveMnemonic: (m: Omit<SavedMnemonic, 'id' | 'date'>) => SavedMnemonic;
  deleteMnemonic: (id: string) => void;
  reset: () => void;
}

const StoreContext = createContext<Ctx | null>(null);

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setState({ ...initial, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const update = useCallback<Ctx['update']>((patch) => {
    setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));
  }, []);

  const markToday = (s: AppState) =>
    s.activeDays.includes(dayKey()) ? s.activeDays : [...s.activeDays, dayKey()];

  const value = useMemo<Ctx>(
    () => ({
      ready,
      state,
      update,
      completeLesson: (id) =>
        update((s) => ({
          lessonsDone: s.lessonsDone.includes(id) ? s.lessonsDone : [...s.lessonsDone, id],
          activeDays: markToday(s),
        })),
      addResult: (r) =>
        update((s) => ({
          results: [{ ...r, id: uid(), date: new Date().toISOString() }, ...s.results].slice(0, 400),
          activeDays: markToday(s),
        })),
      saveMnemonic: (m) => {
        const saved = { ...m, id: uid(), date: new Date().toISOString() };
        update((s) => ({ mnemonics: [saved, ...s.mnemonics] }));
        return saved;
      },
      deleteMnemonic: (id) => update((s) => ({ mnemonics: s.mnemonics.filter((m) => m.id !== id) })),
      reset: () => setState({ ...initial, onboarded: true }),
    }),
    [ready, state, update],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
