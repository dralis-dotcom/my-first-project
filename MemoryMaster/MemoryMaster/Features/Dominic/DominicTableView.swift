import SwiftUI
import UIKit

/// The full 00–99 person/action table. Tap a row to edit it, get an AI
/// suggestion, or generate a mnemonic picture.
struct DominicTableView: View {
    @EnvironmentObject private var store: AppStore
    @State private var search = ""

    private var filtered: [DominicPair] {
        guard !search.isEmpty else { return store.dominicPairs }
        let s = search.lowercased()
        return store.dominicPairs.filter {
            $0.number.contains(s) || $0.person.lowercased().contains(s)
                || $0.action.lowercased().contains(s) || $0.letters.lowercased().contains(s)
        }
    }

    var body: some View {
        List(filtered) { pair in
            NavigationLink(value: pair.number) {
                HStack(spacing: 12) {
                    Text(pair.number)
                        .font(.headline.monospacedDigit())
                        .frame(width: 36)
                        .padding(.vertical, 6)
                        .background(.tint.opacity(0.15), in: RoundedRectangle(cornerRadius: 8))
                    VStack(alignment: .leading, spacing: 2) {
                        Text(pair.person).font(.subheadline.bold())
                        Text(pair.action).font(.caption).foregroundStyle(.secondary)
                    }
                    Spacer()
                    Text(pair.letters)
                        .font(.caption2.bold())
                        .foregroundStyle(.secondary)
                    if pair.imageFileName != nil {
                        Image(systemName: "photo.fill")
                            .font(.caption)
                            .foregroundStyle(.tint)
                    }
                }
            }
        }
        .listStyle(.plain)
        .searchable(text: $search, prompt: "Number, letters, or person")
        .navigationDestination(for: String.self) { number in
            if let pair = store.dominicPairs.first(where: { $0.number == number }) {
                DominicPairDetailView(number: pair.number)
            }
        }
    }
}

struct DominicPairDetailView: View {
    @EnvironmentObject private var store: AppStore
    let number: String

    @State private var person = ""
    @State private var action = ""
    @State private var busySuggesting = false
    @State private var busyGeneratingImage = false
    @State private var errorMessage: String?
    @State private var loadedImage: UIImage?

    private var pair: DominicPair? {
        store.dominicPairs.first(where: { $0.number == number })
    }

    var body: some View {
        Form {
            Section {
                HStack {
                    Spacer()
                    VStack(spacing: 4) {
                        Text(number)
                            .font(.system(size: 54, weight: .heavy, design: .rounded).monospacedDigit())
                        Text("Letters: \(pair?.letters ?? "")")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                }
            }

            Section("Person & action") {
                TextField("Person", text: $person)
                TextField("Action", text: $action)
                Button {
                    suggest()
                } label: {
                    if busySuggesting {
                        HStack { ProgressView(); Text("Asking Claude…") }
                    } else {
                        Label("Suggest with AI", systemImage: "sparkles")
                    }
                }
                .disabled(busySuggesting)
            }

            Section("Mnemonic picture") {
                if let loadedImage {
                    Image(uiImage: loadedImage)
                        .resizable()
                        .scaledToFit()
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                Button {
                    generateImage()
                } label: {
                    if busyGeneratingImage {
                        HStack { ProgressView(); Text("Generating image…") }
                    } else {
                        Label(loadedImage == nil ? "Generate AI picture" : "Regenerate picture",
                              systemImage: "photo.badge.plus")
                    }
                }
                .disabled(busyGeneratingImage || person.isEmpty || action.isEmpty)
                Text("Uses your OpenAI key (Settings) to draw \"\(person.isEmpty ? "person" : person) \(action.isEmpty ? "action" : action)\".")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            if let errorMessage {
                Section {
                    Text(errorMessage).font(.caption).foregroundStyle(.red)
                }
            }
        }
        .navigationTitle("Pair \(number)")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            Button("Save") { save() }
                .disabled(person.isEmpty || action.isEmpty)
        }
        .onAppear(perform: loadState)
    }

    private func loadState() {
        guard let pair else { return }
        person = pair.person
        action = pair.action
        if let url = store.imageURL(for: pair), let data = try? Data(contentsOf: url) {
            loadedImage = UIImage(data: data)
        }
    }

    private func save() {
        guard var pair else { return }
        pair.person = person
        pair.action = action
        store.updatePair(pair)
    }

    private func suggest() {
        guard let pair else { return }
        busySuggesting = true
        errorMessage = nil
        Task {
            do {
                let suggestion = try await AIService.suggestDominicPair(number: pair.number,
                                                                        letters: pair.letters)
                person = suggestion.person
                action = suggestion.action
            } catch {
                errorMessage = error.localizedDescription
            }
            busySuggesting = false
        }
    }

    private func generateImage() {
        guard var pair else { return }
        busyGeneratingImage = true
        errorMessage = nil
        Task {
            do {
                let data = try await AIService.generateDominicImage(person: person, action: action)
                pair.person = person
                pair.action = action
                pair.imageFileName = store.saveImage(data, for: pair.number)
                store.updatePair(pair)
                loadedImage = UIImage(data: data)
            } catch {
                errorMessage = error.localizedDescription
            }
            busyGeneratingImage = false
        }
    }
}
