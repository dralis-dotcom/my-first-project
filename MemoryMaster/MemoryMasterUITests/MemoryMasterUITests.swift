// MemoryMasterUITests.swift
// MemoryMasterUITests
//
// Snapshot tests used by `fastlane screenshots`.
// Each `snapshot()` call saves a PNG to fastlane/screenshots/.
//
// Run via Xcode: Product ▸ Test (⌘U)
// Run via fastlane: fastlane screenshots

import XCTest

final class MemoryMasterUITests: XCTestCase {

    let app = XCUIApplication()

    override func setUpWithError() throws {
        continueAfterFailure = false

        // Tell the app it's running in screenshot mode so it can
        // pre-populate sample data and skip animations.
        app.launchArguments += ["-UITestScreenshots", "YES"]
        app.launchArguments += ["-hasCompletedOnboarding", "NO"] // show onboarding
        setupSnapshot(app)
        app.launch()
    }

    // MARK: - Screenshot 01: Onboarding Welcome

    func test01_OnboardingWelcome() throws {
        // App launches directly to onboarding when hasCompletedOnboarding = NO
        snapshot("01_onboarding")
    }

    // MARK: - Screenshot 02: Train Home (all disciplines)

    func test02_TrainHome() throws {
        // Dismiss onboarding by swiping through all pages
        let continueButton = app.buttons["Get Started"]
        if continueButton.waitForExistence(timeout: 3) {
            continueButton.tap()
        }
        // Navigate to Train tab
        app.tabBars.buttons["Train"].tap()
        snapshot("02_train_home")
    }

    // MARK: - Screenshot 03: Numbers Training Active

    func test03_NumbersActive() throws {
        app.tabBars.buttons["Train"].tap()
        app.buttons["Numbers"].tap()
        app.buttons["Start"].tap()
        // Let a couple of items appear so it looks mid-session
        sleep(2)
        snapshot("03_numbers_active")
    }

    // MARK: - Screenshot 04: Results Screen

    func test04_Results() throws {
        app.tabBars.buttons["Train"].tap()
        app.buttons["Numbers"].tap()
        app.buttons["Start"].tap()
        // Tap through quickly to reach results
        let nextButton = app.buttons["Next"]
        for _ in 0..<5 {
            if nextButton.waitForExistence(timeout: 2) { nextButton.tap() }
        }
        app.buttons["Finish"].tap()
        snapshot("04_results")
    }

    // MARK: - Screenshot 05: Statistics

    func test05_Stats() throws {
        app.tabBars.buttons["Stats"].tap()
        snapshot("05_stats")
    }

    // MARK: - Screenshot 06: Settings

    func test06_Settings() throws {
        app.tabBars.buttons["Settings"].tap()
        snapshot("06_settings")
    }
}
