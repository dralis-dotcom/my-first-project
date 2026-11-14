# MemoryMaster — Android & iPhone app

One app, one codebase, for both phones. Built with Expo (React Native) and TypeScript.

## What is inside

| Tab | What it does |
|---|---|
| **Home** | Your next lesson, your week, a 2-minute daily workout. |
| **Learn** | A 10-lesson course for people who have never trained their memory. Each lesson ends with a small practice. Also "My Memory Palaces". |
| **Train** | The ten World Memory Championships events, each with Starter, National, International and World levels. |
| **Medicine** | AI mnemonic maker: type a topic, get a mnemonic, a story set in one place, and a key to every image. Saved to a library with a "Test me" mode. |
| **Progress** | Streak, personal bests, recent rounds, settings. |

### The ten events

Names & Faces · Binary Numbers · Random Numbers · Abstract Images · Speed Numbers ·
Historic/Future Dates · Random Cards · Random Words · Spoken Numbers · Speed Cards

Every event runs as **memorise → recall → score → check your answers**, with championship
scoring rules (see `src/engine.ts`). Event formats and time limits are in
`src/data/disciplines.ts`.

## Try it on your phone (easiest)

1. Install **Expo Go** from Google Play (or the App Store).
2. On a computer: `cd MemoryMasterMobile && npm install && npx expo start`
3. Scan the QR code with Expo Go.

## Get an installable Android APK

Every push to this folder runs the **Build Android APK** workflow on GitHub.
Open the run in the repository's *Actions* tab and download the **memorymaster-apk**
artifact. Copy the `.apk` to an Android phone and open it to install.

## The AI mnemonic maker

It calls the Claude API (`src/ai.ts`) with the user's own Anthropic API key, entered in
*Progress → Settings*. The key is kept in the phone's encrypted storage and is sent only to
Anthropic. Before publishing the app to a store for other people, move this call behind your
own small server so that users do not need a key.

## Development

```bash
npm install
npx tsc --noEmit                 # type-check
npx expo start                   # run with Expo Go
npx expo export --platform web   # web preview build in dist/
```

All data (progress, scores, palaces, saved mnemonics) is stored on the device only.
This app is not affiliated with the World Memory Sports Council.
