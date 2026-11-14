# MemoryMaster — iPhone app and web app

One codebase that runs as an iPhone app and as a web app in any browser.
Built with Expo (React Native) and TypeScript.

## What is inside

| Tab | What it does |
|---|---|
| **Home** | Your next lesson, your week, a 2-minute daily workout. |
| **Learn** | A 10-lesson course for people who have never trained their memory. Each lesson ends with a small practice. Also "My Memory Palaces". |
| **Train** | The ten World Memory Championships events, each with Starter, National, International, World and Custom levels. |
| **Medicine** | AI mnemonic maker: type a topic, get a mnemonic, a story set in one place, and a key to every image. Saved to a library with a "Test me" mode. |
| **Progress** | Streak, personal bests, recent rounds, settings. |

### The ten events

Names & Faces · Binary Numbers · Random Numbers · Abstract Images · Speed Numbers ·
Historic/Future Dates · Random Cards · Random Words · Spoken Numbers · Speed Cards

Every event runs as **memorise → recall → score → check your answers**, with championship
scoring rules (see `src/engine.ts`). Event formats and time limits are in
`src/data/disciplines.ts`.

## Use it as a web app

```bash
npm install
npm run build:web      # writes the finished site to dist/
npx serve dist -s      # open the printed address in a browser
```

`dist/` is a plain static site, so any web host works.

**Put it online with Vercel (about two minutes):**

1. Go to vercel.com → **Add New… → Project** and pick the `my-first-project` repository.
2. Set **Root Directory** to `MemoryMasterMobile`. Leave everything else as it is
   (`vercel.json` in this folder already tells Vercel how to build).
3. Press **Deploy**. Vercel gives you a web address and rebuilds on every push.
 On an iPhone, open the site in Safari → Share → **Add to Home Screen** and
it opens full-screen like an app and keeps working offline after the first visit
(`public/manifest.json`, `public/sw.js`).

## Use it as an iPhone app

- **To try it:** install **Expo Go** from the App Store, run `npx expo start` on a computer,
  and scan the QR code with the iPhone camera.
- **For the App Store / TestFlight:** this needs a paid Apple Developer account and a free
  Expo account. No Mac is required; Expo builds it in the cloud. `eas.json` is already set up.

  ```bash
  npx eas-cli login                               # sign in to Expo
  npx eas-cli build --platform ios --profile production   # asks you to sign in to Apple
  npx eas-cli submit --platform ios               # sends the build to TestFlight / App Store
  ```

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
npm run build:web                # web app build in dist/
```

All data (progress, scores, palaces, saved mnemonics) is stored on the device only.
This app is not affiliated with the World Memory Sports Council.
