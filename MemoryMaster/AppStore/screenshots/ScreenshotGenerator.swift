// ScreenshotGenerator.swift
// MemoryMaster
//
// SwiftUI PreviewProviders for each major App Store screenshot.
//
// HOW TO EXPORT:
// 1. Open this file in Xcode.
// 2. Enable Canvas: Editor ▸ Canvas (or ⌥⌘↩).
// 3. Set the preview device to "iPhone 16 Pro Max" (already set below).
// 4. Click the preview thumbnail to select it.
// 5. Right-click → "Save Preview As…" or use the "Export" button
//    in the top-right of the Canvas panel.
// 6. Repeat for each PreviewProvider below.
//
// Alternatively, run `fastlane screenshots` to auto-export all screens
// via the UITest snapshot() calls in MemoryMasterUITests.

import SwiftUI

// MARK: - 1. Onboarding Welcome Screen

/// Screenshot 1 – First thing a new user sees.
struct Screenshot01_OnboardingWelcome_Previews: PreviewProvider {
    static var previews: some View {
        OnboardingWelcomePage()
            .previewDevice(PreviewDevice(rawValue: "iPhone 16 Pro Max"))
            .previewDisplayName("01 – Onboarding Welcome")
    }
}

// MARK: - 2. Train Tab – All 7 Disciplines

/// Screenshot 2 – Grid of all competition disciplines.
struct Screenshot02_TrainHome_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            TrainHomeView()
                .environmentObject(AppStore.preview)
        }
        .previewDevice(PreviewDevice(rawValue: "iPhone 16 Pro Max"))
        .previewDisplayName("02 – Train: All Disciplines")
    }
}

// MARK: - 3. Active Numbers Training Session (mid-memorisation)

/// Screenshot 3 – Numbers training in progress; shows a digit sequence
/// and a ticking timer to convey real competition feel.
struct Screenshot03_NumbersTrainingActive_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            TrainingView(discipline: .numbers,
                         itemCount: 20)
                .environmentObject(AppStore.preview)
        }
        .previewDevice(PreviewDevice(rawValue: "iPhone 16 Pro Max"))
        .previewDisplayName("03 – Numbers Training (Active)")
    }
}

// MARK: - 4. Results Screen with Score

/// Screenshot 4 – Post-session results showing accuracy and score breakdown.
struct Screenshot04_Results_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            ResultsView(result: TrainingResult.previewSample)
                .environmentObject(AppStore.preview)
        }
        .previewDevice(PreviewDevice(rawValue: "iPhone 16 Pro Max"))
        .previewDisplayName("04 – Results Screen")
    }
}

// MARK: - 5. Statistics Tab with Charts

/// Screenshot 5 – Accuracy-over-time chart in the Stats tab.
struct Screenshot05_Stats_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            StatsView()
                .environmentObject(AppStore.previewWithResults)
        }
        .previewDevice(PreviewDevice(rawValue: "iPhone 16 Pro Max"))
        .previewDisplayName("05 – Statistics")
    }
}

// MARK: - 6. Settings Tab

/// Screenshot 6 – Settings: reminders, iCloud sync, session length defaults.
struct Screenshot06_Settings_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack {
            SettingsView()
        }
        .previewDevice(PreviewDevice(rawValue: "iPhone 16 Pro Max"))
        .previewDisplayName("06 – Settings")
    }
}

// MARK: - Preview helpers

extension AppStore {
    /// Minimal in-memory store with a few seeded disciplines for screenshots.
    static var preview: AppStore {
        let store = AppStore()
        return store
    }

    /// Store pre-populated with synthetic results so charts render in previews.
    static var previewWithResults: AppStore {
        let store = AppStore()
        let calendar = Calendar.current
        for dayOffset in 0..<14 {
            guard let date = calendar.date(byAdding: .day, value: -dayOffset, to: Date()) else { continue }
            let accuracy = Double.random(in: 0.6...1.0)
            store.results.append(
                TrainingResult(discipline: .numbers,
                               date: date,
                               itemCount: 20,
                               correctCount: Int(accuracy * 20),
                               durationSeconds: Int.random(in: 180...300))
            )
        }
        return store
    }
}

extension TrainingResult {
    /// A representative completed session for the Results preview.
    static var previewSample: TrainingResult {
        TrainingResult(discipline: .numbers,
                       date: Date(),
                       itemCount: 20,
                       correctCount: 17,
                       durationSeconds: 237)
    }
}
