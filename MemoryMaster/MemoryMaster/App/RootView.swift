import SwiftUI

struct RootView: View {
    @AppStorage("hasCompletedOnboarding") private var hasCompletedOnboarding = false
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            TrainHomeView()
                .tabItem { Label("Train", systemImage: "bolt.fill") }
                .tag(0)
            StudyHomeView()
                .tabItem { Label("Study", systemImage: "rectangle.on.rectangle.angled") }
                .tag(1)
            MindMapListView()
                .tabItem { Label("Mind Maps", systemImage: "brain.head.profile") }
                .tag(2)
            DominicHomeView()
                .tabItem { Label("Dominic", systemImage: "person.crop.square.filled.and.at.rectangle") }
                .tag(3)
            MoreView()
                .tabItem { Label("Progress", systemImage: "chart.line.uptrend.xyaxis") }
                .tag(4)
        }
        .onOpenURL { url in
            if url.scheme == "memorymaster" && url.host == "train" {
                selectedTab = 0
            }
        }
        // Show onboarding as a full-screen cover on first launch
        .fullScreenCover(isPresented: Binding(
            get: { !hasCompletedOnboarding },
            set: { _ in }
        )) {
            OnboardingView()
        }
    }
}

// MARK: - More / Progress tab

struct MoreView: View {
    var body: some View {
        NavigationStack {
            List {
                NavigationLink(destination: StatsView()) {
                    Label("Statistics", systemImage: "chart.bar.fill")
                }
                NavigationLink(destination: SettingsView()) {
                    Label("Settings", systemImage: "gearshape.fill")
                }
            }
            .navigationTitle("Progress")
        }
    }
}
