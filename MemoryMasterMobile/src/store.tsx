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
  reviewStage?: number; // 0 = review after 1 day, 1 = after 1 week, 2 = after 1 month, 3 = learned
  nextReview?: string | null; // ISO date of the next review, null when learned
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

/** Review a new item after 1 day, then 1 week, then 1 month. */
export const REVIEW_DAYS = [1, 7, 30];

const daysFromNow = (days: number) => new Date(Date.now() + days * 86400000).toISOString();

export function nextReviewOf(m: SavedMnemonic): string | null {
  if (m.nextReview !== undefined) return m.nextReview;
  // items saved before reviews existed: due one day after they were made
  return new Date(new Date(m.date).getTime() + 86400000).toISOString();
}

export function isDue(m: SavedMnemonic): boolean {
  const next = nextReviewOf(m);
  return !!next && new Date(next).getTime() <= Date.now();
}

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
  reviewMnemonic: (id: string, remembered: boolean) => void;
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
        const saved = {
          ...m,
          id: uid(),
          date: new Date().toISOString(),
          reviewStage: 0,
          nextReview: daysFromNow(REVIEW_DAYS[0]),
        };
        update((s) => ({ mnemonics: [saved, ...s.mnemonics] }));
        return saved;
      },
      reviewMnemonic: (id, remembered) =>
        update((s) => ({
          mnemonics: s.mnemonics.map((m) => {
            if (m.id !== id) return m;
            // forgot: start again tomorrow; remembered: move to the next, longer gap
            const stage = remembered ? (m.reviewStage ?? 0) + 1 : 0;
            const gap = REVIEW_DAYS[stage];
            return { ...m, reviewStage: stage, nextReview: gap ? daysFromNow(gap) : null };
          }),
          activeDays: markToday(s),
        })),
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
