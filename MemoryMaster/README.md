# Memory Master (iOS)

A native SwiftUI iPhone app for memory-competition training and studying, inspired by Memory Ladder — built around **Dominic O'Brien's Dominic System** and **Tony Buzan's mind mapping**.

## Features

### 🏆 Competition training (Train tab)
Timed memorize → recall → score sessions for the classic memory-sport disciplines:
- **Numbers** — random digits, chunk into Dominic pairs
- **Cards** — shuffled playing cards
- **Words** — random concrete nouns
- **Binary** — 0/1 sequences
- **Names & Faces** — match names to faces
- **Images** — memorize a sequence of procedurally generated abstract images, then tap them back into order (Memory League style)
- **Historic Dates** — memorize events with years, then recall the year for each
- **Spoken Numbers** — digits spoken aloud one per second (on-device speech synthesis), no looking back
Configurable item count and memorization time, with per-discipline technique tips and score history.

### 📚 Study tool (Study tab)
- Flashcard decks with **SM-2 spaced repetition** (Again / Hard / Good / Easy grading, real due-date scheduling)
- **AI mnemonic generation**: one tap asks Claude to invent a vivid mnemonic for any card — including Dominic-System encodings for numeric answers

### 🧠 Mind maps (Mind Maps tab)
Buzan-style radial mind maps: central topic, curved colored branches, one keyword per node. Tap to select, add/rename/recolor/delete nodes; pinch to zoom, drag to pan.

### 👤 Dominic System (Dominic tab)
- Complete, editable **00–99 person + action table** (letters O A B C D E S G H N) pre-filled with famous-people suggestions
- **AI suggestions**: Claude proposes a person + action for any pair
- **AI pictures**: generate a cartoon mnemonic image of each person performing their action (OpenAI gpt-image-1), stored on-device and shown during drills
- **Learn mode**: spaced-repetition drills (number → person, person → number, number → action)
- **Journeys** (method of loci): build routes of loci, then practice pegging random number pairs onto the stops and recalling them

### 📈 Progress tab
Accuracy-over-time charts per discipline (Swift Charts), totals, and due-card counts. Settings stores your API keys in the iOS Keychain.

## Building the app

You need a Mac with **Xcode 15+** (iOS 17 target).

### Option A — XcodeGen (recommended)

```bash
brew install xcodegen
cd MemoryMaster
xcodegen generate
open MemoryMaster.xcodeproj
```

Select your simulator or iPhone and press Run.

### Option B — manual Xcode project

1. Xcode → File → New → Project → iOS App, name it `MemoryMaster`, interface SwiftUI, language Swift.
2. Delete the generated `ContentView.swift` and `MemoryMasterApp.swift`.
3. Drag the `MemoryMaster/MemoryMaster` source folders (App, Models, Data, Services, Features, Shared) into the project navigator ("Copy items if needed" + add to the app target).
4. Run.

To install on your own iPhone, open the target's *Signing & Capabilities* tab and select your (free) Apple developer team.

## AI setup (optional but recommended)

In the app: **Progress → Settings**
- **Anthropic API key** (console.anthropic.com) → mnemonic generation + Dominic pair suggestions (model: `claude-opus-4-8`)
- **OpenAI API key** (platform.openai.com) → Dominic mnemonic pictures (`gpt-image-1`)

Keys are stored in the iOS Keychain and only ever sent to the respective API. Everything else in the app works fully offline.

## Project layout

```
MemoryMaster/
  project.yml                 # XcodeGen project definition
  MemoryMaster/
    App/                      # App entry + tab navigation
    Models/                   # Codable data models (SRS, decks, Dominic, journeys, mind maps, results)
    Data/                     # AppStore (JSON persistence), default Dominic table, word/name banks
    Services/                 # SM-2 scheduler, Claude/OpenAI clients, Keychain
    Features/
      Train/                  # Competition disciplines (engine + views)
      Study/                  # Decks, card editor, SRS review
      MindMap/                # Radial Buzan mind-map editor
      Dominic/                # Table, learn drills, journeys
      Stats/                  # Charts
      Settings/               # API keys, about
    Shared/                   # UI helpers
```
