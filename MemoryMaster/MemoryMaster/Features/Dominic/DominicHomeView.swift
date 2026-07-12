import SwiftUI

struct DominicHomeView: View {
    @State private var section = 0

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Picker("Section", selection: $section) {
                    Text("Table").tag(0)
                    Text("Learn").tag(1)
                    Text("Journeys").tag(2)
                }
                .pickerStyle(.segmented)
                .padding()

                switch section {
                case 0: DominicTableView()
                case 1: DominicLearnView()
                default: JourneysView()
                }
            }
            .navigationTitle("Dominic System")
        }
    }
}
