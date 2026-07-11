import SwiftUI

struct TrainHomeView: View {
    @EnvironmentObject private var store: AppStore

    private let columns = [GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Competition disciplines")
                        .font(.headline)
                        .padding(.horizontal)

                    LazyVGrid(columns: columns, spacing: 12) {
                        ForEach(Discipline.allCases) { discipline in
                            NavigationLink(value: discipline) {
                                DisciplineCard(discipline: discipline,
                                               best: bestAccuracy(discipline))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal)

                    if !store.results.isEmpty {
                        Text("Recent sessions")
                            .font(.headline)
                            .padding(.horizontal)
                        ForEach(store.results.suffix(5).reversed()) { result in
                            RecentResultRow(result: result)
                                .padding(.horizontal)
                        }
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Train")
            .navigationDestination(for: Discipline.self) { discipline in
                TrainingView(discipline: discipline)
            }
        }
    }

    private func bestAccuracy(_ discipline: Discipline) -> Double? {
        store.results.filter { $0.discipline == discipline }.map(\.accuracy).max()
    }
}

struct DisciplineCard: View {
    let discipline: Discipline
    let best: Double?

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: discipline.symbol)
                .font(.title)
                .foregroundStyle(.tint)
            Text(discipline.rawValue)
                .font(.headline)
                .foregroundStyle(.primary)
            Text(best.map { "Best: \(Int($0 * 100))%" } ?? "Not attempted")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14))
    }
}

struct RecentResultRow: View {
    let result: TrainingResult

    var body: some View {
        HStack {
            Image(systemName: result.discipline.symbol)
                .foregroundStyle(.tint)
            VStack(alignment: .leading) {
                Text(result.discipline.rawValue).font(.subheadline.bold())
                Text(result.date, style: .date)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Text("\(result.correct)/\(result.itemCount)")
                .font(.headline.monospacedDigit())
        }
        .padding(10)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 10))
    }
}
