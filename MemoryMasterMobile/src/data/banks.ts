// Raw material for the generators: concrete words, names and invented events.

export const WORDS = `apple anchor arrow balloon banana basket bridge bucket butterfly cactus camera candle carpet castle cherry chimney cloud coconut compass cookie crown curtain diamond dolphin donkey dragon drum eagle elephant engine envelope feather fence flag flute forest fountain garlic giraffe glove guitar hammer harbor helmet honey island jacket jungle kettle kitten ladder lantern lemon lizard lobster magnet mango mirror monkey mountain mushroom napkin necklace needle nest ocean onion orange ostrich paddle palace panda parrot peanut pencil penguin piano pillow pirate planet pocket potato pumpkin pyramid rabbit rainbow ribbon river robot rocket saddle sailor sandwich scarf scissors shark shovel skeleton snowman spider spoon statue suitcase sunflower swing sword table teapot telescope tiger tomato tornado tractor trumpet tunnel turtle umbrella unicorn violin volcano wagon waiter wallet walrus whistle window wizard zebra zipper acorn antler apron badge bagel barrel beetle blanket boot bottle brick broom button cabin camel canoe carrot chalk cheese circus clock coffin comet coral cradle crayon cricket dagger daisy desert dice doctor domino doorbell duck dumpling eel emerald falcon farmer ferry fiddle fireplace flamingo fossil fridge frog garden ghost goblet gorilla grapes hamster harp hedgehog hippo hook igloo iron jellyfish jewel judge kangaroo kayak key kite knight lighthouse lion lipstick lollipop mailbox mammoth mattress meadow medal microscope moose mop moth mummy noodle nurse oar octopus olive otter owl oyster painter pancake peach pearl pebble pelican pepper pigeon pizza plumber popcorn puppet puzzle quilt raccoon radio raft referee rhino ring rooster rope sausage scarecrow seal sheriff shield skate sled slipper snail soap sock sponge squirrel stamp stove submarine surfer swan taxi tent throne toaster torch towel trophy tulip vampire vase waffle walnut wasp whale wheel windmill wolf yacht yogurt`
  .split(/\s+/)
  .filter(Boolean);

export const FEMALE_NAMES = `Amara Sofia Yuki Elena Priya Fatima Chloe Ingrid Aisha Mei Nora Zara Leila Hana Sana Lucia Greta Tessa Clara Maya Nadia Imani Rosa Selma Anika Dalia Farah Hira Jade Lena Nina Paloma Rania Talia Uma Vera Ximena Zoe Adele Carmen Esme Gloria Iris Kira Mona Olive Ruth Thea Violet Yara Alma Bianca Chiara Daria Elif Freya Giulia Helga Ines Jana Katya Lina Mira Noor Oksana Petra`
  .split(/\s+/)
  .filter(Boolean);

export const MALE_NAMES = `Liam Noah Omar Mateo Lucas Ethan Ravi Diego Hugo Tariq Felix Jonas Oscar Marco Viktor Kofi Samir Arjun Idris Pavel Luca Erik Kenji Tomas Bruno Emil Gustav Ivan Karim Milan Otto Quentin Stefan Wesley Yusuf Basil Dmitri Finn Hassan Jorge Leo Nikolai Pedro Soren Umar Walter Zane Anders Boris Cyrus Dario Enzo Farid Goran Henrik Ismail Jakub Kemal Lars Malik Nils Oleg Rafael`
  .split(/\s+/)
  .filter(Boolean);

export const LAST_NAMES = `Okafor Lindqvist Moreau Tanaka Haddad Kowalski Fernandes Petrov Nakamura Olsen Rahman Castillo Dubois Achebe Novak Bergstrom Silva Yamada Khalil Romano Jensen Mbeki Vasquez Schmitt Ivanova Park Abadi Fontaine Kruger Osei Lombardi Sorensen Malik Herrera Baumann Takeda Nasser Wiśniewski Costa Eriksson Chaudhry Delgado Lefevre Adeyemi Horvat Nilsson Santos Ishikawa Farouk Ricci Hansen Dlamini Morales Weber Sokolov Kim Mansour Girard Botha Mensah Bianchi Larsen Qureshi Navarro Keller Mori Saleh Zielinski Pereira Lund Siddiqui Ortega Roux Balogun Kovac Holm Ramos Fujita Aziz Conti Dahl Nkosi Fuentes Vogel Orlov Choi Hamdan Marchand Steyn Boateng Greco Berg Anwar Pena Frank Ueda Karimi Rossi Aguilar Winter`
  .split(/\s+/)
  .filter(Boolean);

const WHO = [
  'A sleepy dragon', 'The last lighthouse keeper', 'A choir of frogs', 'The queen of a tiny island',
  'A robot gardener', 'A lost astronaut', 'A talking walrus', 'The village baker',
  'An invisible painter', 'A clumsy wizard', 'The oldest tortoise', 'A team of penguins',
  'A shy giant', 'The moon inspector', 'A pirate grandmother', 'A juggling acrobat',
  'A nervous ghost', 'The royal beekeeper', 'A singing mountain', 'A circus of ants',
  'The first cloud farmer', 'A barefoot emperor', 'A family of otters', 'The silent drummer',
  'A purple camel', 'The night mayor', 'A snowman explorer', 'A library of owls',
  'The shortest knight', 'A flying fisherman',
];

const DID = [
  'opens a bakery on the moon', 'wins a race against the wind', 'invents square soup',
  'builds a bridge out of spaghetti', 'discovers a river of honey', 'paints the desert blue',
  'teaches fish to whistle', 'loses a crown in a volcano', 'plants a forest of umbrellas',
  'sails across a sea of milk', 'bans Mondays forever', 'finds a door in a waterfall',
  'trades a castle for a sandwich', 'launches the first paper rocket', 'sleeps for forty days',
  'marries a thunderstorm', 'hides the sun in a suitcase', 'opens a school for clouds',
  'counts every star twice', 'crosses the ocean on a piano', 'turns a mountain into cheese',
  'writes a law for snowflakes', 'catches lightning in a teapot', 'throws a party for the tides',
  'digs a tunnel to yesterday', 'tames a comet with a ribbon', 'builds a tower of pancakes',
  'forgets the colour green', 'melts the last iceberg by singing', 'signs peace with the pigeons',
];

export const EVENT_WHO = WHO;
export const EVENT_DID = DID;
