import SwiftUI
import Charts

struct StatsView: View {
    @EnvironmentObject private var store: AppStore
    @State private var discipline: Discipline = .numbers

    private var filtered: [TrainingResult] {
        store.results.filter { $0.discipline == discipline }
    }

    var body: some View {
        List {
            Section("Discipline") {
                Picker("Discipline", selection: $discipline) {
                    ForEach(Discipline.allCases) { d in
                        Text(d.rawValue).tag(d)
                    }
                }
                .pickerStyle(.menu)
            }

            Section("Accuracy over time") {
                if filtered.isEmpty {
                    Text("No sessions yet — go train!")
                        .foregroundStyle(.secondary)
                } else {
                    Chart(filtered) { result in
                        LineMark(
                            x: .value("Date", result.date),
                            y: .value("Accuracy", result.accuracy * 100)
                        )
                        PointMark(
                            x: .value("Date", result.date),
                            y: .value("Accuracy", result.accuracy * 100)
                        )
                    }
                    .chartYScale(domain: 0...100)
                    .frame(height: 220)
                    .padding(.vertical, 8)
                }
            }

            Section("Totals") {
                LabeledContent("Sessions", value: "\(filtered.count)")
                LabeledContent("Items memorized",
                               value: "\(filtered.reduce(0) { $0 + $1.correct })")
                if let best = filtered.map(\.accuracy).max() {
                    LabeledContent("Best accuracy", value: "\(Int(best * 100))%")
                }
            }

            Section("Study") {
                LabeledContent("Decks", value: "\(store.decks.count)")
                LabeledContent("Cards due today",
                               value: "\(store.decks.reduce(0) { $0 + $1.dueCount })")
                LabeledContent("Dominic pairs due",
                               value: "\(store.dominicPairs.filter { $0.srs.isDue }.count)")
            }
        }
        .navigationTitle("Statistics")
    }
}
