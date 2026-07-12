# MemoryMaster — iOS

A native SwiftUI app for memory-competition training, built around the
techniques of memory champions: **Dominic O'Brien's Dominic System** and
**Tony Buzan's Mind Mapping**.

---

## What the app does

MemoryMaster is a structured daily training gym for your brain. It combines
timed competition drills, a spaced-repetition flashcard engine, AI-powered
mnemonic generation, and Buzan-style mind maps — all in one offline-first
iPhone app.

**Train tab** — timed memorize → recall → score sessions for seven disciplines.
**Study tab** — flashcard decks with SM-2 spaced repetition and AI mnemonics.
**Mind Maps tab** — radial Buzan mind maps with branch coloring, zoom, and pan.
**Dominic tab** — editable 00–99 person + action table, AI pictures, drills,
and Method of Loci journeys.
**Stats tab** — accuracy-over-time charts (Swift Charts) and due-card counts.

---

## The 7 Training Disciplines

| # | Discipline       | What you memorise                                       |
|---|------------------|---------------------------------------------------------|
| 1 | **Numbers**      | Random digit strings encoded as Dominic pairs           |
| 2 | **Binary**       | 0/1 sequences (target: 100+ digits)                     |
| 3 | **Words**        | Random concrete nouns in sequence                       |
| 4 | **Cards**        | Shuffled playing cards at competition speed             |
| 5 | **Names & Faces**| Match first/last names to generated portrait images     |
| 6 | **Images**       | Procedurally generated abstract images recalled in order|
| 7 | **Historic Dates**| World events matched to their exact years              |

Session length, memorisation time, and recall time are all configurable per
discipline in Settings.

---

## How to Build

### Prerequisites

- macOS 14+ with **Xcode 15+**
- [XcodeGen](https://github.com/yonaskolb/XcodeGen) (`brew install xcodegen`)

### 1 — Generate the Xcode project

```bash
git clone https://github.com/dralis-dotcom/my-first-project.git
cd my-first-project/MemoryMaster
xcodegen generate
```

### 2 — Open and run in Xcode

```bash
open MemoryMaster.xcodeproj
```

Select an iPhone simulator (iOS 17+) and press **⌘R**.

### 3 — Build from the command line (CI / no Xcode GUI)

```bash
cd my-first-project/MemoryMaster
xcodegen generate

xcodebuild \
  -project MemoryMaster.xcodeproj \
  -scheme MemoryMaster \
  -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest' \
  -configuration Debug \
  build
```

### 4 — App icon

`MemoryMaster/Shared/AppIcon.swift` contains the full SwiftUI icon design.
To produce the required `1024.png`:

1. Open the file in Xcode and select the **#Preview canvas**.
2. Right-click the preview → **"Save Preview As…"** → save as
   `MemoryMaster/Assets.xcassets/AppIcon.appiconset/1024.png`.

---

## Running on Simulator via GitHub Actions

The repository ships a CI workflow at `.github/workflows/build.yml` that
builds and runs the app on a simulator on every push to `main` and every
pull request.

```yaml
# .github/workflows/build.yml  (example — create if not present)
name: Build & Test

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: macos-15
    steps:
      - uses: actions/checkout@v4

      - name: Install XcodeGen
        run: brew install xcodegen

      - name: Generate Xcode project
        working-directory: MemoryMaster
        run: xcodegen generate

      - name: Build for simulator
        working-directory: MemoryMaster
        run: |
          xcodebuild \
            -project MemoryMaster.xcodeproj \
            -scheme MemoryMaster \
            -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest' \
            -configuration Debug \
            build | xcpretty

      - name: Run tests (if present)
        working-directory: MemoryMaster
        run: |
          xcodebuild \
            -project MemoryMaster.xcodeproj \
            -scheme MemoryMaster \
            -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest' \
            test | xcpretty
```

> `macos-15` runners include Xcode 16 and iOS 18 simulators. Adjust
> `OS=latest` to pin a specific simulator runtime if needed.

---

## iCloud Sync

Streak data can optionally be synced across all iPhones signed into the same
Apple ID via **Settings → iCloud → "Sync streak with iCloud"**.

Implementation uses `NSUbiquitousKeyValueStore` (no CoreData required). To
enable it for your own Apple Developer account, set the Team ID in
`MemoryMaster/MemoryMaster.entitlements`:

```xml
<key>com.apple.developer.ubiquity-kvstore-identifier</key>
<string>YOUR_TEAM_ID.com.example.MemoryMaster</string>
```

---

## AI Features (optional)

Supply your own API keys in **Settings** to unlock:

| Feature                     | Key needed       | Where to get it              |
|-----------------------------|------------------|------------------------------|
| Mnemonic generation (Claude)| Anthropic        | console.anthropic.com        |
| Dominic pictures (DALL-E)   | OpenAI           | platform.openai.com          |

Keys are stored in the iOS Keychain and never leave the device except to the
respective API. All other features work fully offline.

---

## Project Layout

```
MemoryMaster/
  project.yml                  XcodeGen project definition
  AppStore/
    metadata.txt               App Store Connect metadata
  MemoryMaster/
    App/                       @main entry + tab navigation
    Models/                    Codable data models (SRS, decks, Dominic, etc.)
    Data/                      Persistence (AppStore.swift), StreakManager, word banks
    Services/                  SM-2, Claude/OpenAI clients, Keychain, iCloud sync
    Features/
      Train/                   7 competition disciplines (engine + views)
      Study/                   Decks, card editor, SM-2 review
      MindMap/                 Radial Buzan mind-map editor
      Dominic/                 00-99 table, drills, journeys
      Stats/                   Swift Charts progress views
      Settings/                API keys, reminders, iCloud toggle
      Onboarding/              First-launch flow
    Shared/                    UI helpers, AppIconView
    Assets.xcassets/           App icon asset catalog
```

---

## License

MIT — see [LICENSE](LICENSE).
