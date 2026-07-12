import SwiftUI
import UIKit

/// Drills the Dominic table with spaced repetition: shows a number (or a
/// person), you recall the match, then self-grade. SM-2 schedules each pair.
struct DominicLearnView: View {
    @EnvironmentObject private var store: AppStore

    enum Direction: String, CaseIterable, Identifiable {
        case numberToPerson = "Number → Person"
        case personToNumber = "Person → Number"
        case numberToAction = "Number → Action"
        var id: String { rawValue }
    }

    @State private var direction: Direction = .numberToPerson
    @State private var queue: [String] = []
    @State private var currentNumber: String?
    @State private var revealed = false
    @State private var reviewed = 0

    private var duePairs: [DominicPair] {
        store.dominicPairs.filter { $0.srs.isDue }
    }

    private var currentPair: DominicPair? {
        guard let currentNumber else { return nil }
        return store.dominicPairs.first(where: { $0.number == currentNumber })
    }

    var body: some View {
        VStack(spacing: 16) {
            Picker("Direction", selection: $direction) {
                ForEach(Direction.allCases) { d in
                    Text(d.rawValue).tag(d)
                }
            }
            .pickerStyle(.menu)

            if let pair = currentPair {
                drillCard(pair)
            } else {
                startView
            }
        }
        .padding()
        .frame(maxHeight: .infinity, alignment: .top)
    }

    private var startView: some View {
        VStack(spacing: 12) {
            Text("🧠")
                .font(.system(size: 56))
            Text("\(duePairs.count) pairs due for review")
                .font(.headline)
            if reviewed > 0 {
                Text("Reviewed this session: \(reviewed)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Button("Start drill") { startSession() }
                .buttonStyle(BigButtonStyle())
            Text("Drills a batch of 20 (due pairs first). Grade yourself honestly — SM-2 spaces the repetitions.")
                .font(.caption)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 40)
    }

    @ViewBuilder
    private func drillCard(_ pair: DominicPair) -> some View {
        VStack(spacing: 20) {
            Text("\(queue.count + 1) left in batch")
                .font(.caption)
                .foregroundStyle(.secondary)

            VStack(spacing: 12) {
                Text(prompt(for: pair))
                    .font(.system(size: 40, weight: .heavy, design: .rounded))
                    .multilineTextAlignment(.center)
                if revealed {
                    Divider()
                    Text(answer(for: pair))
                        .font(.title2.bold())
                        .multilineTextAlignment(.center)
                    Text(detail(for: pair))
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                    if let url = store.imageURL(for: pair),
                       let data = try? Data(contentsOf: url),
                       let image = UIImage(data: data) {
                        Image(uiImage: image)
                            .resizable()
                            .scaledToFit()
                            .frame(maxHeight: 180)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                }
            }
            .frame(maxWidth: .infinity)
            .padding(24)
            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 20))

            Spacer()

            if revealed {
                HStack(spacing: 10) {
                    gradeButton(.again, "Again", .red)
                    gradeButton(.hard, "Hard", .orange)
                    gradeButton(.good, "Good", .green)
                    gradeButton(.easy, "Easy", .blue)
                }
            } else {
                Button("Reveal") { revealed = true }
                    .buttonStyle(BigButtonStyle())
            }
        }
    }

    private func prompt(for pair: DominicPair) -> String {
        switch direction {
        case .numberToPerson, .numberToAction: return pair.number
        case .personToNumber: return pair.person
        }
    }

    private func answer(for pair: DominicPair) -> String {
        switch direction {
        case .numberToPerson: return pair.person
        case .personToNumber: return pair.number
        case .numberToAction: return pair.action
        }
    }

    private func detail(for pair: DominicPair) -> String {
        "\(pair.letters) · \(pair.person) — \(pair.action)"
    }

    private func startSession() {
        let due = duePairs.map(\.number)
        let rest = store.dominicPairs.map(\.number).filter { !due.contains($0) }
        queue = Array((due.shuffled() + rest.shuffled()).prefix(20))
        advance()
    }

    private func advance() {
        revealed = false
        currentNumber = queue.isEmpty ? nil : queue.removeFirst()
    }

    private func grade(_ g: ReviewGrade) {
        guard var pair = currentPair else { return }
        pair.srs = SM2Scheduler.review(pair.srs, grade: g)
        store.updatePair(pair)
        reviewed += 1
        if g == .again {
            queue.append(pair.number)
        }
        advance()
    }

    private func gradeButton(_ g: ReviewGrade, _ label: String, _ color: Color) -> some View {
        Button {
            grade(g)
        } label: {
            Text(label)
                .font(.subheadline.bold())
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(color.opacity(0.85), in: RoundedRectangle(cornerRadius: 12))
                .foregroundStyle(.white)
        }
    }
}
