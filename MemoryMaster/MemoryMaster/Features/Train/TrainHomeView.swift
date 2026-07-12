import SwiftUI

struct TrainHomeView: View {
    @EnvironmentObject private var store: AppStore
    @State private var streak = StreakManager.shared.currentStreak
    @State private var practicedToday = StreakManager.shared.practicedToday

    private let columns = [GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // Daily streak banner
                    StreakBannerView(streak: streak, practicedToday: practicedToday)
                        .padding(.horizontal)

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
            .onAppear {
                streak = StreakManager.shared.currentStreak
                practicedToday = StreakManager.shared.practicedToday
            }
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

// MARK: - Streak banner

struct StreakBannerView: View {
    let streak: Int
    let practicedToday: Bool

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "flame.fill")
                .font(.title2)
                .foregroundStyle(streak > 0 ? .orange : .secondary)
            VStack(alignment: .leading, spacing: 2) {
                Text("\(streak) day streak")
                    .font(.headline)
                Text(practicedToday ? "You've trained today — keep it up!" : "Complete a session to extend your streak")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            if practicedToday {
                Image(systemName: "checkmark.seal.fill")
                    .foregroundStyle(.green)
                    .font(.title3)
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }
}
