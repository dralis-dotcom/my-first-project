import type { Kind } from './disciplines';
import type { IconName } from '../ui';

export interface LessonPage {
  heading: string;
  body: string;
  example?: string; // shown in a highlighted box
  table?: [string, string][]; // small two-column table
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  minutes: number;
  icon: IconName;
  pages: LessonPage[];
  practice?: {
    label: string;
    intro: string;
    disciplineId: string;
    kind: Kind;
    amount: number;
    memSec: number;
    recallSec: number;
  };
}

/**
 * A step-by-step course for people who have never trained their memory.
 * Every lesson is a few short pages, then one small practice round.
 */
export const LESSONS: Lesson[] = [
  {
    id: 'l1',
    title: 'Your memory is not broken',
    subtitle: 'Why pictures stick and plain facts slip away',
    minutes: 3,
    icon: 'sparkles',
    pages: [
      {
        heading: 'Nobody has a "bad memory"',
        body: 'Memory champions are not born special. Tests show they have normal brains. They simply use a different method: they change boring information into something the brain loves.\n\nYour brain is weak at remembering numbers, lists and names. But it is extremely strong at remembering three things: pictures, places and stories.',
      },
      {
        heading: 'Proof from your own life',
        body: 'You forget a phone number in ten seconds. But you can still walk, in your mind, through the home you lived in as a child. You remember the story of a film you saw years ago.\n\nThat is the whole secret. We will turn everything you want to remember into pictures, put the pictures in places, and tie them together with a story.',
      },
      {
        heading: 'The three rules of a sticky picture',
        body: 'A picture stays in your head when it is:',
        table: [
          ['Big', 'Make it huge. A giant apple, as big as a car.'],
          ['Moving', 'Make it do something. The apple rolls and crushes things.'],
          ['Strange', 'Make it funny, rude or impossible. The apple is screaming.'],
        ],
      },
      {
        heading: 'Your first try',
        body: 'Next you will see 5 words for 30 seconds. Do not repeat them in your head. Instead, see each one as a big, moving, strange picture. Then type them back in order.\n\nDo not worry about your score. This is only the starting line.',
      },
    ],
    practice: {
      label: 'Try 5 words',
      intro: 'See each word as a big, moving, strange picture.',
      disciplineId: 'words',
      kind: 'words',
      amount: 5,
      memSec: 30,
      recallSec: 90,
    },
  },
  {
    id: 'l2',
    title: 'The Link Method',
    subtitle: 'Chain a list together with a silly story',
    minutes: 4,
    icon: 'link',
    pages: [
      {
        heading: 'One picture pulls the next',
        body: 'To remember a list in order, link each item to the next one with a small crazy scene. Item 1 does something to item 2. Item 2 does something to item 3. Like a chain: when you pull one link, the next one comes out.',
      },
      {
        heading: 'Example',
        body: 'The list is: candle, shark, piano, lemon.',
        example:
          'A giant CANDLE is melting hot wax onto a SHARK. The angry shark jumps out of the water and bites a PIANO in half. Out of the broken piano pour thousands of sour LEMONS.',
      },
      {
        heading: 'Why it works',
        body: 'You only ever need to remember the first item. Each picture reminds you of the next. Feel the story: the heat of the wax, the noise of the piano breaking, the sour taste. The more senses you use, the stronger the link.',
      },
      {
        heading: 'Where it is useful',
        body: 'Shopping lists, steps of a task, points of a speech, and short lists in study — for example the order of the layers of the skin.\n\nNow try it with 8 words.',
      },
    ],
    practice: {
      label: 'Link 8 words',
      intro: 'Make each word do something crazy to the next word.',
      disciplineId: 'words',
      kind: 'words',
      amount: 8,
      memSec: 75,
      recallSec: 120,
    },
  },
  {
    id: 'l3',
    title: 'The Memory Palace',
    subtitle: 'The most powerful memory tool ever invented',
    minutes: 5,
    icon: 'business',
    pages: [
      {
        heading: 'A 2,500-year-old trick',
        body: 'The memory palace (also called the journey method or method of loci) was used by Greek and Roman speakers. Today every memory champion uses it.\n\nThe idea: you take a place you know very well, like your home, and you walk through it in your mind. At each stop you leave one picture.',
      },
      {
        heading: 'Build your first palace',
        body: 'Choose 10 stops in your home, in the order you would walk past them. Always the same order.',
        table: [
          ['1', 'Front door'],
          ['2', 'Shoe rack'],
          ['3', 'Sofa'],
          ['4', 'Television'],
          ['5', 'Kitchen sink'],
          ['6', 'Fridge'],
          ['7', 'Dining table'],
          ['8', 'Bathroom mirror'],
          ['9', 'Your bed'],
          ['10', 'Bedroom window'],
        ],
      },
      {
        heading: 'Place the pictures',
        body: 'To remember "rocket, honey, penguin": a ROCKET crashes through your front door. Your shoe rack is dripping with sticky HONEY. A PENGUIN is sitting on your sofa watching TV.\n\nTo recall, simply walk the route again and look at what is waiting at each stop.',
      },
      {
        heading: 'Palace or link?',
        body: 'The link method is quick for short lists. The palace is stronger for long lists, because if you forget one item you do not lose the rest — you just walk to the next stop.\n\nYou can save your palaces in this app (Learn tab → My Memory Palaces). Now place 10 words in your home.',
      },
    ],
    practice: {
      label: 'Place 10 words',
      intro: 'Walk through your home. One word at each stop.',
      disciplineId: 'words',
      kind: 'words',
      amount: 10,
      memSec: 120,
      recallSec: 150,
    },
  },
  {
    id: 'l4',
    title: 'Numbers become pictures',
    subtitle: 'The number-shape system for digits 0 to 9',
    minutes: 4,
    icon: 'shapes',
    pages: [
      {
        heading: 'Numbers have no picture — so we give them one',
        body: 'A number like 7 is hard to remember because you cannot see it. So we give each digit a fixed picture that looks like the shape of the digit.',
      },
      {
        heading: 'The ten number shapes',
        body: 'Read them slowly and see each one.',
        table: [
          ['0', 'Egg / ball'],
          ['1', 'Candle'],
          ['2', 'Swan'],
          ['3', 'Handcuffs'],
          ['4', 'Sailboat'],
          ['5', 'Hook'],
          ['6', 'Elephant trunk'],
          ['7', 'Axe'],
          ['8', 'Snowman'],
          ['9', 'Balloon on a string'],
        ],
      },
      {
        heading: 'Use it',
        body: 'To remember the PIN 2 7 1 9, link the pictures:',
        example:
          'A SWAN (2) picks up an AXE (7) and chops a giant CANDLE (1) in half. From inside the candle a BALLOON (9) floats up.',
      },
      {
        heading: 'Your turn',
        body: 'You will see 10 digits. Turn each digit into its shape and link the shapes, or place them in your palace.',
      },
    ],
    practice: {
      label: 'Memorise 10 digits',
      intro: 'Each digit is a shape. Link the shapes together.',
      disciplineId: 'speedNumbers',
      kind: 'digits',
      amount: 10,
      memSec: 90,
      recallSec: 120,
    },
  },
  {
    id: 'l5',
    title: 'Two digits, one picture',
    subtitle: 'The system champions use for long numbers',
    minutes: 5,
    icon: 'keypad',
    pages: [
      {
        heading: 'Why pairs?',
        body: 'With number shapes, 20 digits need 20 pictures. Champions make one picture for every pair of digits (00 to 99). Now 20 digits need only 10 pictures. That is twice as fast.',
      },
      {
        heading: 'The Major System: digits become sounds',
        body: 'Each digit gets a consonant sound. Vowels are free, you add them to make a word.',
        table: [
          ['0', 's, z'],
          ['1', 't, d'],
          ['2', 'n'],
          ['3', 'm'],
          ['4', 'r'],
          ['5', 'l'],
          ['6', 'j, sh, ch'],
          ['7', 'k, hard g'],
          ['8', 'f, v'],
          ['9', 'p, b'],
        ],
      },
      {
        heading: 'Make words',
        body: 'Join two sounds and add vowels:',
        table: [
          ['32', 'm + n = MooN'],
          ['14', 't + r = TiRe'],
          ['95', 'b + l = BaLL'],
          ['71', 'k + t = CaT'],
          ['50', 'l + s = LaSSo'],
        ],
      },
      {
        heading: 'Another way: people',
        body: 'The Dominic System turns each pair into a famous person using letters (1=A, 2=B, 3=C, 4=D, 5=E, 6=S, 7=G, 8=H, 9=N, 0=O). So 15 = A.E. = Albert Einstein.\n\nChoose the system you enjoy. You do not need all 100 pictures today — learn 10 a week.',
      },
      {
        heading: 'Practice',
        body: 'Try 20 digits. Use any system you like, even number shapes. Group the digits in pairs and place one picture at each stop of your palace.',
      },
    ],
    practice: {
      label: 'Memorise 20 digits',
      intro: 'Pair the digits. One picture per pair, one stop per picture.',
      disciplineId: 'speedNumbers',
      kind: 'digits',
      amount: 20,
      memSec: 150,
      recallSec: 150,
    },
  },
  {
    id: 'l6',
    title: 'Names and faces',
    subtitle: 'Never say "sorry, I forgot your name" again',
    minutes: 4,
    icon: 'happy',
    pages: [
      {
        heading: 'Why names disappear',
        body: 'A name is just a sound with no meaning, so the brain throws it away. A face is a picture, so the brain keeps it. That is why you say "I know your face but not your name".\n\nThe fix: turn the name into a picture and stick it on the face.',
      },
      {
        heading: 'Three steps',
        body: 'Do these in two seconds when you meet someone:',
        table: [
          ['1. Feature', 'Pick one thing on the face: big eyebrows, curly hair, glasses.'],
          ['2. Picture', 'Turn the name into a picture. Rose = a rose. Mark = a marker pen. Omar = a lobster ("homard").'],
          ['3. Glue', 'Put the picture on the feature, big and silly.'],
        ],
      },
      {
        heading: 'Example',
        body: 'You meet Felix, who has thick glasses.',
        example: 'Felix sounds like "feel licks". Imagine a cat LICKING his thick glasses until they are wet. Next time you see the glasses, the cat comes back, and so does "Felix".',
      },
      {
        heading: 'Practice',
        body: 'You will see 4 faces with names. Use the three steps. Later the faces return in a new order.',
      },
    ],
    practice: {
      label: 'Learn 4 people',
      intro: 'Feature → picture → glue.',
      disciplineId: 'names',
      kind: 'names',
      amount: 4,
      memSec: 90,
      recallSec: 150,
    },
  },
  {
    id: 'l7',
    title: 'Dates and facts',
    subtitle: 'Glue a number to an event',
    minutes: 3,
    icon: 'calendar',
    pages: [
      {
        heading: 'A date is a number plus a story',
        body: 'To remember when something happened, turn the year into pictures and put them inside the scene of the event.',
      },
      {
        heading: 'Example',
        body: 'Event: "A dragon opens a bakery — 1532".',
        example:
          '15 = TaiL, 32 = MooN. See the dragon in its bakery, using its TAIL to pull a hot MOON-shaped bread out of the oven.',
      },
      {
        heading: 'A useful shortcut',
        body: 'In the Dates event, years run from 1000 to 2099. Many competitors only make a picture for the last three digits, because the first digit is nearly always 1.\n\nThe same method works for real history, birthdays and appointments.',
      },
    ],
    practice: {
      label: 'Learn 5 dates',
      intro: 'Put the number pictures inside the event.',
      disciplineId: 'dates',
      kind: 'dates',
      amount: 5,
      memSec: 90,
      recallSec: 120,
    },
  },
  {
    id: 'l8',
    title: 'Playing cards',
    subtitle: 'How a shuffled deck becomes a story',
    minutes: 4,
    icon: 'albums',
    pages: [
      {
        heading: 'Every card is a character',
        body: 'Cards look alike, so we give each of the 52 cards its own picture. Then a deck is just 52 pictures walking through your palace.',
      },
      {
        heading: 'A simple way to start',
        body: 'Use the suit for a theme and the number for the picture:',
        table: [
          ['♥ Hearts', 'People you love: family and friends'],
          ['♠ Spades', 'Workers and tools: a gardener, a builder'],
          ['♦ Diamonds', 'Rich and famous people'],
          ['♣ Clubs', 'Strong or sporty people'],
        ],
      },
      {
        heading: 'Place them',
        body: 'Put two cards at each stop of your palace: the first card does something to the second. A deck needs 26 stops.\n\nStart small. In this practice you get only 8 cards.',
      },
    ],
    practice: {
      label: 'Memorise 8 cards',
      intro: 'Each card is a character. Two characters per stop.',
      disciplineId: 'cards',
      kind: 'cards',
      amount: 8,
      memSec: 120,
      recallSec: 150,
    },
  },
  {
    id: 'l9',
    title: 'Binary, images and spoken numbers',
    subtitle: 'The last three championship skills',
    minutes: 4,
    icon: 'code-working',
    pages: [
      {
        heading: 'Binary: shrink it first',
        body: 'Binary digits are only 0 and 1. The trick is to read three at a time and change them into one normal digit. Then you memorise the normal digits like always.',
        table: [
          ['000', '0'],
          ['001', '1'],
          ['010', '2'],
          ['011', '3'],
          ['100', '4'],
          ['101', '5'],
          ['110', '6'],
          ['111', '7'],
        ],
      },
      {
        heading: 'Abstract images',
        body: 'You see rows of five strange shapes and must remember their order. Do not try to remember the shape itself. Ask "what does it look like?" — a boot, a ghost, a slice of pizza — and link the five things with a quick story.',
      },
      {
        heading: 'Spoken numbers',
        body: 'A voice says one digit each second and you hear it only once. This trains focus. Stay relaxed, make one picture for every two digits, and never look back at a digit you missed.',
      },
      {
        heading: 'Practice',
        body: 'Try one row of 30 binary digits. Read them in groups of three and turn each group into a digit: you only have 10 digits to remember.',
      },
    ],
    practice: {
      label: 'One binary row',
      intro: 'Three binary digits = one normal digit.',
      disciplineId: 'binary',
      kind: 'binary',
      amount: 30,
      memSec: 120,
      recallSec: 150,
    },
  },
  {
    id: 'l10',
    title: 'Make it a habit',
    subtitle: 'How to train, review and use your new memory',
    minutes: 3,
    icon: 'trophy',
    pages: [
      {
        heading: 'Ten minutes a day beats two hours on Sunday',
        body: 'Memory training is like the gym. Short and regular wins. Do one or two events each day in the Train tab. Start on Starter level and move up only when it feels easy.',
      },
      {
        heading: 'Review before you forget',
        body: 'To keep something for years, look at it again just before it fades:',
        table: [
          ['1st review', 'After 10 minutes'],
          ['2nd review', 'After 1 day'],
          ['3rd review', 'After 1 week'],
          ['4th review', 'After 1 month'],
        ],
      },
      {
        heading: 'Use it in real life',
        body: 'Shopping list → link method. Speech → memory palace. New colleagues → names and faces. PIN → number shapes.\n\nIf you study medicine or another heavy subject, open the Medicine tab: type any topic and the app builds a mnemonic and a story for it.',
      },
      {
        heading: 'You finished the course',
        body: 'You now know every technique used at the World Memory Championships. The rest is practice. All ten official events are waiting in the Train tab.',
      },
    ],
  },
];
