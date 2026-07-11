import SwiftUI

struct RootView: View {
    var body: some View {
        TabView {
            TrainHomeView()
                .tabItem { Label("Train", systemImage: "bolt.fill") }
            StudyHomeView()
                .tabItem { Label("Study", systemImage: "rectangle.on.rectangle.angled") }
            MindMapListView()
                .tabItem { Label("Mind Maps", systemImage: "brain.head.profile") }
            DominicHomeView()
                .tabItem { Label("Dominic", systemImage: "person.crop.square.filled.and.at.rectangle") }
            MoreView()
                .tabItem { Label("Progress", systemImage: "chart.line.uptrend.xyaxis") }
        }
    }
}

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
