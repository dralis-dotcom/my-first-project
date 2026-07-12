import Foundation

/// Tracks consecutive days of training practice.
/// Data lives in an App Group so the home-screen widget can read it
/// without launching the main app.
///
/// When iCloud sync is enabled (`ICloudSyncManager.shared.isEnabled`),
/// every write is also mirrored to `NSUbiquitousKeyValueStore`.
final class StreakManager {
    static let shared = StreakManager()

    private let suiteName = "group.com.example.MemoryMaster"
    private var defaults: UserDefaults {
        UserDefaults(suiteName: suiteName) ?? .standard
    }

    // Keys are intentionally `internal` so ICloudSyncManager can reference them.
    enum Key {
        static let current  = "streak.current"
        static let longest  = "streak.longest"
        static let lastDate = "streak.lastDate"
    }

    // MARK: - Accessors

    var currentStreak: Int {
        get { defaults.integer(forKey: Key.current) }
        set {
            defaults.set(newValue, forKey: Key.current)
            ICloudSyncManager.shared.set(newValue, forKey: Key.current)
        }
    }

    var longestStreak: Int {
        get { defaults.integer(forKey: Key.longest) }
        set {
            defaults.set(newValue, forKey: Key.longest)
            ICloudSyncManager.shared.set(newValue, forKey: Key.longest)
        }
    }

    // Exposed as `internal` so ICloudSyncManager can read/write it during merge.
    var lastPracticeDate: Date? {
        get { defaults.object(forKey: Key.lastDate) as? Date }
        set {
            defaults.set(newValue, forKey: Key.lastDate)
            ICloudSyncManager.shared.set(newValue, forKey: Key.lastDate)
        }
    }

    var practicedToday: Bool {
        guard let last = lastPracticeDate else { return false }
        return Calendar.current.isDateInToday(last)
    }

    // MARK: - Recording

    /// Call after any completed training session to update the streak.
    func recordSession() {
        let cal = Calendar.current
        let now = Date()

        if let last = lastPracticeDate {
            if cal.isDateInToday(last) {
                // Already practiced today — just update timestamp
            } else if let yesterday = cal.date(byAdding: .day, value: -1, to: cal.startOfDay(for: now)),
                      cal.isDate(last, inSameDayAs: yesterday) {
                // Practiced yesterday — extend streak
                currentStreak += 1
            } else {
                // Missed a day — reset
                currentStreak = 1
            }
        } else {
            // First ever session
            currentStreak = 1
        }

        if currentStreak > longestStreak {
            longestStreak = currentStreak
        }
        lastPracticeDate = now
    }
}
