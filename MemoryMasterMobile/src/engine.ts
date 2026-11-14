import { EVENT_DID, EVENT_WHO, FIRST_NAMES, LAST_NAMES, WORDS } from './data/banks';
import type { Kind } from './data/disciplines';

// ---------- random helpers ----------

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(arr: T[], rnd: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const randInt = (n: number) => Math.floor(Math.random() * n);

// ---------- session content ----------

export interface Person {
  seed: number;
  first: string;
  last: string;
}
export interface DatedEvent {
  year: string;
  text: string;
}
export interface Card {
  rank: string; // A 2..10 J Q K
  suit: 'S' | 'H' | 'D' | 'C';
  id: string; // e.g. "QH"
}

export const SUITS: Card['suit'][] = ['S', 'H', 'D', 'C'];
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const FULL_DECK: Card[] = SUITS.flatMap((suit) =>
  RANKS.map((rank) => ({ rank, suit, id: `${rank}${suit}` })),
);

export const IMAGES_PER_ROW = 5;

export interface SessionConfig {
  disciplineId: string;
  levelKey: string; // 'starter' | 'national' | ... | 'lesson'
  kind: Kind;
  title: string;
  amount: number;
  memSec: number;
  recallSec: number;
  speed?: boolean;
  lessonId?: string; // set when the session is a lesson's practice
  simple?: boolean; // lessons: count every correct item instead of the strict championship row rule
}

export type Content =
  | { kind: 'digits' | 'binary'; rows: string[]; rowLen: number }
  | { kind: 'spoken'; digits: string }
  | { kind: 'words'; words: string[] }
  | { kind: 'names'; people: Person[]; recallOrder: number[] }
  | { kind: 'dates'; events: DatedEvent[]; recallOrder: number[] }
  | { kind: 'images'; rows: number[][]; shuffled: number[][] }
  | { kind: 'cards'; decks: Card[][] };

export const ROW_LEN = { digits: 20, binary: 30 } as const;
export const WORD_COLUMN = 20;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function generate(config: SessionConfig): Content {
  const n = config.amount;
  switch (config.kind) {
    case 'digits':
    case 'binary': {
      const base = config.kind === 'binary' ? 2 : 10;
      const rowLen = ROW_LEN[config.kind];
      const all = Array.from({ length: n }, () => randInt(base)).join('');
      return { kind: config.kind, rows: chunk(all.split(''), rowLen).map((r) => r.join('')), rowLen };
    }
    case 'spoken':
      return { kind: 'spoken', digits: Array.from({ length: n }, () => randInt(10)).join('') };
    case 'words': {
      let pool = shuffle(WORDS);
      while (pool.length < n) pool = pool.concat(shuffle(WORDS));
      return { kind: 'words', words: pool.slice(0, n) };
    }
    case 'names': {
      const firsts = shuffle(FIRST_NAMES);
      const lasts = shuffle(LAST_NAMES);
      const people = Array.from({ length: n }, (_, i) => ({
        seed: randInt(2 ** 31),
        first: firsts[i % firsts.length],
        last: lasts[i % lasts.length],
      }));
      return { kind: 'names', people, recallOrder: shuffle(people.map((_, i) => i)) };
    }
    case 'dates': {
      const combos = shuffle(
        EVENT_WHO.flatMap((w, i) => EVENT_DID.map((d, j) => [i, j] as const)),
      ).slice(0, n);
      const usedYears = new Set<number>();
      const events = combos.map(([i, j]) => {
        let y = 1000 + randInt(1100);
        while (usedYears.has(y)) y = 1000 + randInt(1100);
        usedYears.add(y);
        return { year: `${y}`, text: `${EVENT_WHO[i]} ${EVENT_DID[j]}` };
      });
      return { kind: 'dates', events, recallOrder: shuffle(events.map((_, i) => i)) };
    }
    case 'images': {
      const rows = Array.from({ length: n }, () =>
        Array.from({ length: IMAGES_PER_ROW }, () => randInt(2 ** 31)),
      );
      const shuffled = rows.map((r) => {
        let s = shuffle(r);
        // never show a row in its original order
        while (s.every((v, i) => v === r[i])) s = shuffle(r);
        return s;
      });
      return { kind: 'images', rows, shuffled };
    }
    case 'cards': {
      const decks: Card[][] = [];
      let left = n;
      while (left > 0) {
        const take = Math.min(52, left);
        decks.push(shuffle(FULL_DECK).slice(0, take));
        left -= take;
      }
      return { kind: 'cards', decks };
    }
  }
}

// ---------- answers & scoring ----------

/** What the user typed / tapped during recall. Shape depends on the kind. */
export interface Answers {
  rows?: string[]; // digits / binary: one string per row
  text?: string; // spoken
  words?: string[]; // words (by position)
  names?: { first: string; last: string }[]; // by original person index
  years?: string[]; // by original event index
  imageOrder?: number[][]; // per row: seeds in the order the user tapped
  decks?: string[][]; // per deck: card ids in the order tapped
}

export interface Score {
  score: number;
  max: number;
  detail: string; // one friendly line
  perfect: boolean;
}

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Championship row rule: a fully correct row scores its length, one mistake
 * scores half, two or more score 0. For the last row the user attempted,
 * only the part they filled in is judged.
 */
export function scoreRowRule(expected: string[][], given: string[][]): number {
  let lastAttempted = -1;
  given.forEach((g, i) => {
    if (g.some((x) => x && x.trim() !== '')) lastAttempted = i;
  });
  let total = 0;
  for (let i = 0; i <= lastAttempted; i++) {
    const exp = expected[i];
    const got = given[i] ?? [];
    let len = exp.length;
    if (i === lastAttempted) {
      let lastFilled = -1;
      got.forEach((x, k) => {
        if (x && x.trim() !== '') lastFilled = k;
      });
      len = Math.min(exp.length, lastFilled + 1);
    }
    let errors = 0;
    for (let k = 0; k < len; k++) if (norm(got[k] ?? '') !== norm(exp[k])) errors++;
    if (errors === 0) total += len;
    else if (errors === 1) total += Math.min(Math.ceil(len / 2), len - 1);
  }
  return total;
}

/** Friendly scoring for lessons: one point for every item in the right place. */
function countMatches(expected: string[][], given: string[][]): number {
  let n = 0;
  expected.forEach((row, i) =>
    row.forEach((x, k) => {
      if (norm(given[i]?.[k] ?? '') === norm(x)) n++;
    }),
  );
  return n;
}

export function scoreSession(content: Content, a: Answers, speed?: boolean, simple?: boolean): Score {
  const rule = simple ? countMatches : scoreRowRule;
  switch (content.kind) {
    case 'digits':
    case 'binary': {
      const exp = content.rows.map((r) => r.split(''));
      const got = content.rows.map((_, i) => (a.rows?.[i] ?? '').split(''));
      const score = rule(exp, got);
      const max = content.rows.join('').length;
      return { score, max, detail: `${score} of ${max} digits ${simple ? 'correct' : 'scored'}`, perfect: score === max };
    }
    case 'spoken': {
      const typed = (a.text ?? '').replace(/\D/g, '');
      let n = 0;
      while (n < content.digits.length && typed[n] === content.digits[n]) n++;
      const max = content.digits.length;
      return { score: n, max, detail: `${n} digits correct before the first mistake`, perfect: n === max };
    }
    case 'words': {
      const cols = (arr: string[]) => {
        const out: string[][] = [];
        for (let i = 0; i < content.words.length; i += WORD_COLUMN)
          out.push(arr.slice(i, i + WORD_COLUMN));
        return out;
      };
      const given = content.words.map((_, i) => a.words?.[i] ?? '');
      const score = rule(cols(content.words), cols(given));
      const max = content.words.length;
      return { score, max, detail: `${score} of ${max} words ${simple ? 'correct' : 'scored'}`, perfect: score === max };
    }
    case 'names': {
      let score = 0;
      content.people.forEach((p, i) => {
        const g = a.names?.[i];
        if (g && norm(g.first) === norm(p.first)) score++;
        if (g && norm(g.last) === norm(p.last)) score++;
      });
      const max = content.people.length * 2;
      return { score, max, detail: `${score} of ${max} names correct`, perfect: score === max };
    }
    case 'dates': {
      let raw = 0;
      let right = 0;
      content.events.forEach((e, i) => {
        const g = (a.years?.[i] ?? '').trim();
        if (!g) return;
        if (g === e.year) {
          raw += 1;
          right += 1;
        } else raw -= 0.5;
      });
      const max = content.events.length;
      const score = Math.max(0, raw);
      return { score, max, detail: `${right} of ${max} years correct`, perfect: right === max };
    }
    case 'images': {
      let raw = 0;
      let right = 0;
      content.rows.forEach((row, i) => {
        const g = a.imageOrder?.[i] ?? [];
        if (g.length === 0) return;
        if (g.length === row.length && g.every((v, k) => v === row[k])) {
          raw += 5;
          right += 1;
        } else raw -= 1;
      });
      const max = content.rows.length * 5;
      const score = Math.max(0, raw);
      return {
        score,
        max,
        detail: `${right} of ${content.rows.length} rows in the right order`,
        perfect: right === content.rows.length,
      };
    }
    case 'cards': {
      const max = content.decks.reduce((s, d) => s + d.length, 0);
      if (speed) {
        const deck = content.decks[0];
        const g = a.decks?.[0] ?? [];
        let n = 0;
        while (n < deck.length && g[n] === deck[n].id) n++;
        return { score: n, max, detail: `${n} of ${max} cards correct from the start`, perfect: n === max };
      }
      const exp = content.decks.map((d) => d.map((c) => c.id));
      const got = content.decks.map((_, i) => a.decks?.[i] ?? []);
      const score = rule(exp, got);
      return { score, max, detail: `${score} of ${max} cards ${simple ? 'correct' : 'scored'}`, perfect: score === max };
    }
  }
}

/** Split a digit string into groups for easier reading: "123456" -> "12 34 56". */
export function grouped(s: string, size: number): string {
  const out: string[] = [];
  for (let i = 0; i < s.length; i += size) out.push(s.slice(i, i + size));
  return out.join(' ');
}
