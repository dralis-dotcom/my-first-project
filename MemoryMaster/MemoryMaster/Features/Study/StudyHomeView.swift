import SwiftUI

struct StudyHomeView: View {
    @EnvironmentObject private var store: AppStore
    @State private var showingNewDeck = false
    @State private var newDeckName = ""

    var body: some View {
        NavigationStack {
            List {
                ForEach(store.decks) { deck in
                    NavigationLink(value: deck.id) {
                        HStack {
                            Text(deck.emoji).font(.title2)
                            VStack(alignment: .leading) {
                                Text(deck.name).font(.headline)
                                Text("\(deck.cards.count) cards")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            if deck.dueCount > 0 {
                                Text("\(deck.dueCount) due")
                                    .font(.caption.bold())
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(.orange.opacity(0.2), in: Capsule())
                                    .foregroundStyle(.orange)
                            }
                        }
                    }
                }
                .onDelete { store.decks.remove(atOffsets: $0) }
            }
            .navigationTitle("Study")
            .navigationDestination(for: UUID.self) { deckID in
                if let deck = store.decks.first(where: { $0.id == deckID }) {
                    DeckDetailView(deckID: deck.id)
                }
            }
            .toolbar {
                Button {
                    newDeckName = ""
                    showingNewDeck = true
                } label: {
                    Image(systemName: "plus")
                }
            }
            .alert("New deck", isPresented: $showingNewDeck) {
                TextField("Deck name", text: $newDeckName)
                Button("Create") {
                    let name = newDeckName.trimmingCharacters(in: .whitespaces)
                    guard !name.isEmpty else { return }
                    store.decks.append(Deck(name: name))
                }
                Button("Cancel", role: .cancel) {}
            }
        }
    }
}
