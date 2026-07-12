import SwiftUI

@main
struct MemoryMasterApp: App {
    @StateObject private var store = AppStore()

    init() {
        // Start listening for iCloud KV changes from other devices
        ICloudSyncManager.shared.startObservingRemoteChanges()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
        }
    }
}
