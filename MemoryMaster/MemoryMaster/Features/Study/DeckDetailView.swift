import SwiftUI

struct DeckDetailView: View {
    @EnvironmentObject private var store: AppStore
    let deckID: UUID

    @State private var editingCard: Flashcard?
    @State private var showingNewCard = false
    @State private var showingReview = false

    private var deck: Deck {
        store.decks.first(where: { $0.id == deckID }) ?? Deck(name: "Missing")
    }

    var body: some View {
        List {
            Section {
                Button {
                    showingReview = true
                } label: {
                    Label(deck.dueCount > 0 ? "Review \(deck.dueCount) due cards" : "Review all cards",
                          systemImage: "play.circle.fill")
                        .font(.headline)
                }
                .disabled(deck.cards.isEmpty)
            }

            Section("Cards") {
                ForEach(deck.cards) { card in
                    Button {
                        editingCard = card
                    } label: {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(card.front).font(.subheadline.bold())
                                .foregroundStyle(.primary)
                            Text(card.back).font(.caption)
                                .foregroundStyle(.secondary)
                                .lineLimit(2)
                            if !card.mnemonic.isEmpty {
                                Label(card.mnemonic, systemImage: "lightbulb.fill")
                                    .font(.caption2)
                                    .foregroundStyle(.orange)
                                    .lineLimit(2)
                            }
                        }
                    }
                }
                .onDelete { offsets in
                    var d = deck
                    d.cards.remove(atOffsets: offsets)
                    store.updateDeck(d)
                }
            }
        }
        .navigationTitle(deck.name)
        .toolbar {
            Button { showingNewCard = true } label: { Image(systemName: "plus") }
        }
        .sheet(isPresented: $showingNewCard) {
            CardEditorView(deckID: deckID, card: nil)
        }
        .sheet(item: $editingCard) { card in
            CardEditorView(deckID: deckID, card: card)
        }
        .fullScreenCover(isPresented: $showingReview) {
            ReviewView(deckID: deckID)
        }
    }
}

/// Add/edit a flashcard, with AI mnemonic generation.
struct CardEditorView: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss

    let deckID: UUID
    let card: Flashcard?

    @State private var front = ""
    @State private var back = ""
    @State private var mnemonic = ""
    @State private var generating = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Front (question)") {
                    TextField("What do you want to remember?", text: $front, axis: .vertical)
                }
                Section("Back (answer)") {
                    TextField("The answer", text: $back, axis: .vertical)
                }
                Section("Mnemonic") {
                    TextField("Optional memory aid", text: $mnemonic, axis: .vertical)
                    Button {
                        generateMnemonic()
                    } label: {
                        if generating {
                            HStack { ProgressView(); Text("Asking Claude…") }
                        } else {
                            Label("Generate mnemonic with AI", systemImage: "sparkles")
                        }
                    }
                    .disabled(generating || front.isEmpty || back.isEmpty)
                    if let errorMessage {
                        Text(errorMessage).font(.caption).foregroundStyle(.red)
                    }
                }
            }
            .navigationTitle(card == nil ? "New card" : "Edit card")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                        .disabled(front.isEmpty || back.isEmpty)
                }
            }
            .onAppear {
                if let card {
                    front = card.front
                    back = card.back
                    mnemonic = card.mnemonic
                }
            }
        }
    }

    private func save() {
        guard var deck = store.decks.first(where: { $0.id == deckID }) else { return }
        if let card, let index = deck.cards.firstIndex(where: { $0.id == card.id }) {
            deck.cards[index].front = front
            deck.cards[index].back = back
            deck.cards[index].mnemonic = mnemonic
        } else {
            deck.cards.append(Flashcard(front: front, back: back, mnemonic: mnemonic))
        }
        store.updateDeck(deck)
        dismiss()
    }

    private func generateMnemonic() {
        generating = true
        errorMessage = nil
        Task {
            do {
                mnemonic = try await AIService.generateMnemonic(front: front, back: back)
            } catch {
                errorMessage = error.localizedDescription
            }
            generating = false
        }
    }
}
