import type { IconName } from '../ui';

export type Kind = 'digits' | 'binary' | 'names' | 'images' | 'dates' | 'cards' | 'words' | 'spoken';

export type LevelKey = 'starter' | 'national' | 'international' | 'world';

export interface Level {
  key: LevelKey;
  label: string;
  memSec: number; // memorisation time
  recallSec: number; // recall time
  amount: number; // how many items are put in front of you
}

export interface Discipline {
  id: string;
  name: string;
  kind: Kind;
  icon: IconName;
  unit: string; // what `amount` counts
  tagline: string;
  how: string; // what you do, in plain words
  scoring: string;
  tip: string;
  speed?: boolean; // Speed Cards: your memorisation time is part of the result
  levels: Level[];
}

const min = (m: number) => m * 60;

const L = (
  starter: [number, number, number],
  national: [number, number, number],
  international: [number, number, number],
  world: [number, number, number],
): Level[] => [
  { key: 'starter', label: 'Starter', memSec: starter[0], recallSec: starter[1], amount: starter[2] },
  { key: 'national', label: 'National', memSec: national[0], recallSec: national[1], amount: national[2] },
  {
    key: 'international',
    label: 'International',
    memSec: international[0],
    recallSec: international[1],
    amount: international[2],
  },
  { key: 'world', label: 'World', memSec: world[0], recallSec: world[1], amount: world[2] },
];

/**
 * The ten disciplines of the World Memory Championships (WMSC format).
 * "Starter" is our own gentle level for people who are new to memory training;
 * the other three follow the national / international / world time limits.
 */
export const DISCIPLINES: Discipline[] = [
  {
    id: 'names',
    name: 'Names & Faces',
    kind: 'names',
    icon: 'people',
    unit: 'faces',
    tagline: 'Put the right name on every face.',
    how: 'You see faces, each with a first name and a family name. Later the same faces come back in a different order and you type the names.',
    scoring: '1 point for every correct first name and 1 point for every correct family name.',
    tip: 'Pick one feature of the face (hair, glasses, smile) and glue a funny picture of the name onto it.',
    levels: L([60, 120, 6], [min(5), min(15), 40], [min(15), min(30), 110], [min(15), min(30), 110]),
  },
  {
    id: 'binary',
    name: 'Binary Numbers',
    kind: 'binary',
    icon: 'code-working',
    unit: 'digits',
    tagline: 'Long rows of only 0 and 1.',
    how: 'You see rows of 30 binary digits (0 and 1). You memorise them in order and then type each row back.',
    scoring: 'A fully correct row scores 30. One mistake in a row scores 15. Two or more mistakes score 0 for that row.',
    tip: 'Turn every 3 binary digits into one normal digit (000=0, 001=1 … 111=7). Now it is just a number.',
    levels: L([60, 180, 30], [min(5), min(15), 600], [min(30), min(60), 2400], [min(30), min(60), 3000]),
  },
  {
    id: 'numbers',
    name: 'Random Numbers',
    kind: 'digits',
    icon: 'infinite',
    unit: 'digits',
    tagline: 'The marathon: as many digits as you can.',
    how: 'You see rows of random digits. You memorise them in order and then type each row back. At world level this lasts one full hour.',
    scoring: 'A fully correct row scores its full length. One mistake scores half. Two or more mistakes score 0 for that row.',
    tip: 'Turn pairs of digits into people or objects and place them along a memory palace.',
    levels: L([120, 240, 40], [min(15), min(30), 480], [min(30), min(60), 960], [min(60), min(120), 2000]),
  },
  {
    id: 'images',
    name: 'Abstract Images',
    kind: 'images',
    icon: 'color-filter',
    unit: 'rows',
    tagline: 'Remember the order of strange shapes.',
    how: 'You see rows of 5 abstract shapes. Later each row is shuffled and you tap the shapes in their original order.',
    scoring: '5 points for a correct row. Minus 1 point for a row with a mistake. Rows you leave empty score 0.',
    tip: 'Ask "what does this blob look like?" — a boot, a cloud, a duck — then link the five things into a tiny story.',
    levels: L([60, 120, 3], [min(15), min(30), 30], [min(15), min(30), 40], [min(15), min(30), 50]),
  },
  {
    id: 'speedNumbers',
    name: 'Speed Numbers',
    kind: 'digits',
    icon: 'flash',
    unit: 'digits',
    tagline: 'Five minutes. Maximum digits.',
    how: 'The same as Random Numbers, but you only get 5 minutes to memorise. It is a sprint.',
    scoring: 'A fully correct row scores its full length. One mistake scores half. Two or more mistakes score 0 for that row.',
    tip: 'Only memorise as much as you can review once. A row with two mistakes is worth nothing.',
    levels: L([60, 120, 20], [min(5), min(15), 440], [min(5), min(15), 440], [min(5), min(15), 520]),
  },
  {
    id: 'dates',
    name: 'Historic / Future Dates',
    kind: 'dates',
    icon: 'hourglass',
    unit: 'dates',
    tagline: 'Made-up events, real years.',
    how: 'You see invented events, each with a year between 1000 and 2099. Later the events come back shuffled and you type the year.',
    scoring: '1 point for each correct year. Minus half a point for each wrong year. Empty answers score 0.',
    tip: 'Turn the year into two pictures (17 | 84) and drop them into the scene of the event.',
    levels: L([60, 120, 6], [min(5), min(15), 80], [min(5), min(15), 120], [min(5), min(15), 142]),
  },
  {
    id: 'cards',
    name: 'Random Cards',
    kind: 'cards',
    icon: 'albums',
    unit: 'cards',
    tagline: 'Deck after deck of shuffled cards.',
    how: 'You see shuffled decks of 52 playing cards. You memorise the order, then rebuild each deck by tapping the cards in order.',
    scoring: 'A fully correct deck scores 52. One mistake scores 26. Two or more mistakes score 0 for that deck.',
    tip: 'Give every card a person or object. Put two or three cards on each station of your memory palace.',
    levels: L([120, 240, 13], [min(10), min(30), 156], [min(30), min(60), 520], [min(60), min(120), 1040]),
  },
  {
    id: 'words',
    name: 'Random Words',
    kind: 'words',
    icon: 'text',
    unit: 'words',
    tagline: 'A long list of unrelated words.',
    how: 'You see numbered columns of 20 words. You memorise them in order and then type every word in its place.',
    scoring: 'A fully correct column scores 20. One mistake scores 10. Two or more mistakes score 0 for that column.',
    tip: 'Walk through your memory palace and put two words on each station, doing something silly together.',
    levels: L([60, 180, 10], [min(5), min(15), 100], [min(15), min(30), 300], [min(15), min(30), 400]),
  },
  {
    id: 'spoken',
    name: 'Spoken Numbers',
    kind: 'spoken',
    icon: 'volume-high',
    unit: 'digits',
    tagline: 'One digit per second. Heard only once.',
    how: 'A voice reads digits, one every second. You cannot see them and you cannot go back. Then you type them from the start.',
    scoring: 'You score the number of digits you got right from the beginning until your first mistake.',
    tip: 'Stay calm and keep the rhythm: hear two digits, make one picture, place it, repeat.',
    levels: L([10, 120, 10], [100, min(5), 100], [300, min(15), 300], [550, min(25), 550]),
  },
  {
    id: 'speedCards',
    name: 'Speed Cards',
    kind: 'cards',
    icon: 'timer',
    unit: 'cards',
    tagline: 'One deck. As fast as you dare.',
    how: 'You memorise a single shuffled deck as fast as you can, with a 5 minute limit. Tap Done the moment you finish — your time is your score.',
    scoring: 'If the whole deck is correct, your result is your memorisation time. Otherwise you score the cards you got right before the first mistake.',
    tip: 'Speed comes from knowing your card pictures instantly. Drill the pictures before you drill the deck.',
    speed: true,
    levels: L([min(5), min(5), 26], [min(5), min(5), 52], [min(5), min(5), 52], [min(5), min(5), 52]),
  },
];

export const disciplineById = (id: string) => DISCIPLINES.find((d) => d.id === id);

export function formatTime(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${`${r}`.padStart(2, '0')}`;
}

export function humanTime(sec: number): string {
  if (sec < 60) return `${sec} sec`;
  const m = Math.round(sec / 60);
  return m >= 60 && m % 60 === 0 ? `${m / 60} h` : `${m} min`;
}
