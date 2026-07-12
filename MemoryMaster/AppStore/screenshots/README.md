# App Store Screenshots – MemoryMaster

This folder contains `ScreenshotGenerator.swift`, which defines SwiftUI
`PreviewProvider`s for every required App Store screenshot.

## Required sizes (Apple as of 2024)
| Device | Resolution |
|---|---|
| iPhone 16 Pro Max | 1320 × 2868 px (6.9") |
| iPhone 8 Plus *(required for 5.5" slot)* | 1242 × 2208 px |
| iPad Pro 13" *(if supporting iPad)* | 2064 × 2752 px |

All previews below are already set to `"iPhone 16 Pro Max"`.

---

## Option A – Manual export via Xcode Canvas (quick)

1. Open `MemoryMaster.xcodeproj` in Xcode 16+.
2. Open `ScreenshotGenerator.swift`.
3. Show Canvas: **Editor ▸ Canvas** (or **⌥⌘↩**).
4. In the Canvas panel, click the preview you want to export.
5. Click the **Export** button (share icon, top-right of Canvas), or
   right-click the preview thumbnail → **Save Preview As…**
6. Save as PNG to this folder, named `01_onboarding.png`, `02_train.png`, etc.
7. Repeat for all 6 previews.

> Tip: Set Canvas zoom to 100 % before exporting to get pixel-perfect output.

---

## Option B – Automated via Fastlane snapshot (recommended for CI)

```bash
# Install fastlane if needed
brew install fastlane

# From the repo root
cd MemoryMaster
fastlane screenshots
```

This runs the `MemoryMasterUITests` snapshot tests (see `project.yml` for the
target) and saves all screenshots to `fastlane/screenshots/`.

The `Snapfile` already targets iPhone 16 Pro Max.

---

## Screenshots included

| # | File | Screen |
|---|---|---|
| 01 | `01_onboarding.png` | Welcome / onboarding first page |
| 02 | `02_train_home.png` | Train tab – all 7 disciplines |
| 03 | `03_numbers_active.png` | Numbers training – mid-session |
| 04 | `04_results.png` | Results screen with score |
| 05 | `05_stats.png` | Statistics tab with accuracy chart |
| 06 | `06_settings.png` | Settings tab |

---

## Upload to App Store Connect

1. Log in to [appstoreconnect.apple.com](https://appstoreconnect.apple.com).
2. Select **MemoryMaster** → **iOS App** → version draft.
3. Under **App Previews and Screenshots**, drag the PNGs into the
   iPhone 6.9" slot (and 5.5" slot if you have those sizes).
4. Drag to reorder so screenshot 01 appears first.
5. Click **Save**.
