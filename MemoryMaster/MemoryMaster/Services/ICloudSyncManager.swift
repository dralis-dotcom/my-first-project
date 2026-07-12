import Foundation

/// Thin wrapper around NSUbiquitousKeyValueStore.
///
/// Keys mirror those used in StreakManager so values stay in sync across devices.
/// iCloud KV sync is opt-in: the `isEnabled` flag is stored in UserDefaults (not iCloud),
/// so a user who disables sync on one device doesn't affect other devices.
final class ICloudSyncManager {
    static let shared = ICloudSyncManager()
    private init() {}

    // UserDefaults key that records whether the user opted in.
    static let enabledKey = "iCloudSyncEnabled"

    var isEnabled: Bool {
        get { UserDefaults.standard.bool(forKey: Self.enabledKey) }
        set { UserDefaults.standard.set(newValue, forKey: Self.enabledKey) }
    }

    private var kvStore: NSUbiquitousKeyValueStore { .default }

    // MARK: - Read / Write

    func integer(forKey key: String) -> Int {
        guard isEnabled else { return 0 }
        return Int(kvStore.longLong(forKey: key))
    }

    func set(_ value: Int, forKey key: String) {
        guard isEnabled else { return }
        kvStore.set(Int64(value), forKey: key)
        kvStore.synchronize()
    }

    func date(forKey key: String) -> Date? {
        guard isEnabled else { return nil }
        return kvStore.object(forKey: key) as? Date
    }

    func set(_ value: Date?, forKey key: String) {
        guard isEnabled else { return }
        if let value {
            kvStore.set(value, forKey: key)
        } else {
            kvStore.removeObject(forKey: key)
        }
        kvStore.synchronize()
    }

    // MARK: - Push all local streak values to iCloud

    /// Call once after the user enables sync to seed iCloud with existing local data.
    func pushLocalStreak() {
        let sm = StreakManager.shared
        set(sm.currentStreak, forKey: StreakManager.Key.current)
        set(sm.longestStreak, forKey: StreakManager.Key.longest)
        set(sm.lastPracticeDate, forKey: StreakManager.Key.lastDate)
    }

    // MARK: - Pull iCloud values into local storage (on first launch / device switch)

    /// Merges iCloud values into local UserDefaults, keeping the higher streak.
    func pullToLocal() {
        guard isEnabled else { return }
        let sm = StreakManager.shared
        let cloudCurrent = integer(forKey: StreakManager.Key.current)
        let cloudLongest = integer(forKey: StreakManager.Key.longest)
        let cloudDate    = date(forKey: StreakManager.Key.lastDate)

        if cloudCurrent > sm.currentStreak { sm.currentStreak = cloudCurrent }
        if cloudLongest > sm.longestStreak { sm.longestStreak = cloudLongest }
        // Keep the more recent practice date
        if let cd = cloudDate, let ld = sm.lastPracticeDate {
            if cd > ld { sm.lastPracticeDate = cd }
        } else if let cd = cloudDate {
            sm.lastPracticeDate = cd
        }
    }

    // MARK: - Observe remote changes

    /// Call once from App init to react when iCloud pushes changes from another device.
    func startObservingRemoteChanges() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleRemoteChange(_:)),
            name: NSUbiquitousKeyValueStore.didChangeExternallyNotification,
            object: kvStore
        )
        kvStore.synchronize()
    }

    @objc private func handleRemoteChange(_ note: Notification) {
        guard isEnabled else { return }
        pullToLocal()
        NotificationCenter.default.post(name: .iCloudStreakDidChange, object: nil)
    }
}

extension Notification.Name {
    /// Posted after iCloud pushes a streak update from another device.
    static let iCloudStreakDidChange = Notification.Name("iCloudStreakDidChange")
}
