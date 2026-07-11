import SwiftUI

/// Spaced-repetition review session for one deck (SM-2 scheduling).
struct ReviewView: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss

    let deckID: UUID

    @State private var queue: [UUID] = []
    @State private var currentID: UUID?
    @State private var showBack = false
    @State private var reviewed = 0

    private var deck: Deck? {
        store.decks.first(where: { $0.id == deckID })
    }

    private var currentCard: Flashcard? {
        guard let deck, let currentID else { return nil }
        return deck.cards.first(where: { $0.id == currentID })
    }

    var body: some View {
        NavigationStack {
            Group {
                if let card = currentCard {
                    cardView(card)
                } else {
                    doneView
                }
            }
            .navigationTitle(deck?.name ?? "Review")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
        }
        .onAppear(perform: buildQueue)
    }

    private func buildQueue() {
        guard let deck else { return }
        let due = deck.cards.filter { $0.srs.isDue }
        let pool = due.isEmpty ? deck.cards : due
        queue = pool.shuffled().map(\.id)
        advance()
    }

    private func advance() {
        showBack = false
        currentID = queue.isEmpty ? nil : queue.removeFirst()
    }

    private func grade(_ grade: ReviewGrade) {
        guard var deck, let card = currentCard,
              let index = deck.cards.firstIndex(where: { $0.id == card.id }) else { return }
        deck.cards[index].srs = SM2Scheduler.review(card.srs, grade: grade)
        store.updateDeck(deck)
        reviewed += 1
        if grade == .again {
            queue.append(card.id)
        }
        advance()
    }

    @ViewBuilder
    private func cardView(_ card: Flashcard) -> some View {
        VStack(spacing: 24) {
            Text("\(queue.count + 1) remaining")
                .font(.caption)
                .foregroundStyle(.secondary)

            VStack(spacing: 16) {
                Text(card.front)
                    .font(.title2.bold())
                    .multilineTextAlignment(.center)
                if showBack {
                    Divider()
                    Text(card.back)
                        .font(.title3)
                        .multilineTextAlignment(.center)
                    if !card.mnemonic.isEmpty {
                        Label(card.mnemonic, systemImage: "lightbulb.fill")
                            .font(.footnote)
                            .foregroundStyle(.orange)
                            .multilineTextAlignment(.center)
                    }
                }
            }
            .frame(maxWidth: .infinity)
            .padding(24)
            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 20))
            .padding(.horizontal)

            Spacer()

            if showBack {
                HStack(spacing: 10) {
                    gradeButton(.again, color: .red)
                    gradeButton(.hard, color: .orange)
                    gradeButton(.good, color: .green)
                    gradeButton(.easy, color: .blue)
                }
                .padding(.horizontal)
            } else {
                Button("Show answer") { showBack = true }
                    .buttonStyle(BigButtonStyle())
                    .padding(.horizontal)
            }
        }
        .padding(.vertical)
    }

    private func gradeButton(_ g: ReviewGrade, color: Color) -> some View {
        Button {
            grade(g)
        } label: {
            Text(g.label)
                .font(.subheadline.bold())
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(color.opacity(0.85), in: RoundedRectangle(cornerRadius: 12))
                .foregroundStyle(.white)
        }
    }

    private var doneView: some View {
        VStack(spacing: 16) {
            Text("🎉")
                .font(.system(size: 64))
            Text("Review complete")
                .font(.title.bold())
            Text("\(reviewed) cards reviewed. SM-2 has scheduled the next repetitions.")
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button("Done") { dismiss() }
                .buttonStyle(BigButtonStyle())
                .padding(.horizontal, 40)
        }
        .padding()
    }
}
