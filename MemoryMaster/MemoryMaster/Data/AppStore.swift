import Foundation
import SwiftUI

/// Central observable store. All collections persist as JSON files in the
/// app's Application Support directory.
@MainActor
final class AppStore: ObservableObject {

    @Published var decks: [Deck] = [] { didSet { save(decks, to: "decks.json") } }
    @Published var dominicPairs: [DominicPair] = [] { didSet { save(dominicPairs, to: "dominic.json") } }
    @Published var journeys: [Journey] = [] { didSet { save(journeys, to: "journeys.json") } }
    @Published var mindMaps: [MindMap] = [] { didSet { save(mindMaps, to: "mindmaps.json") } }
    @Published var results: [TrainingResult] = [] { didSet { save(results, to: "results.json") } }

    private let fileManager = FileManager.default

    private var directory: URL {
        let url = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("MemoryMaster", isDirectory: true)
        if !fileManager.fileExists(atPath: url.path) {
            try? fileManager.createDirectory(at: url, withIntermediateDirectories: true)
        }
        return url
    }

    /// Directory for generated Dominic images.
    var imagesDirectory: URL {
        let url = directory.appendingPathComponent("images", isDirectory: true)
        if !fileManager.fileExists(atPath: url.path) {
            try? fileManager.createDirectory(at: url, withIntermediateDirectories: true)
        }
        return url
    }

    init() {
        decks = load("decks.json") ?? []
        dominicPairs = load("dominic.json") ?? []
        journeys = load("journeys.json") ?? []
        mindMaps = load("mindmaps.json") ?? []
        results = load("results.json") ?? []
        seedIfNeeded()
    }

    // MARK: - Persistence

    private func load<T: Decodable>(_ name: String) -> T? {
        let url = directory.appendingPathComponent(name)
        guard let data = try? Data(contentsOf: url) else { return nil }
        return try? JSONDecoder().decode(T.self, from: data)
    }

    private func save<T: Encodable>(_ value: T, to name: String) {
        let url = directory.appendingPathComponent(name)
        if let data = try? JSONEncoder().encode(value) {
            try? data.write(to: url, options: .atomic)
        }
    }

    // MARK: - Seeding

    private func seedIfNeeded() {
        if dominicPairs.isEmpty {
            dominicPairs = DominicDefaults.pairs
        }
        if decks.isEmpty {
            decks = [
                Deck(name: "Getting Started", emoji: "🚀", cards: [
                    Flashcard(front: "What does the Dominic System encode?",
                              back: "Two-digit numbers as a Person + Action (00–99)",
                              mnemonic: "Dominic O'Brien = 40 = DO!"),
                    Flashcard(front: "SM-2 first two intervals",
                              back: "1 day, then 6 days"),
                    Flashcard(front: "Buzan mind map rules",
                              back: "Central image, curved branches, one keyword per branch, colors and images"),
                ]),
            ]
        }
        if journeys.isEmpty {
            journeys = [
                Journey(name: "My Home", emoji: "🏠", loci: [
                    Locus(name: "Front door"), Locus(name: "Hallway"),
                    Locus(name: "Kitchen"), Locus(name: "Living room sofa"),
                    Locus(name: "TV"), Locus(name: "Balcony"),
                    Locus(name: "Bathroom mirror"), Locus(name: "Bedroom"),
                    Locus(name: "Wardrobe"), Locus(name: "Desk"),
                ]),
            ]
        }
        if mindMaps.isEmpty {
            let root = MindMapNode(text: "Memory", colorHex: "#1971C2", children: [
                MindMapNode(text: "Journeys", colorHex: "#E8590C", children: [
                    MindMapNode(text: "Loci", colorHex: "#E8590C"),
                    MindMapNode(text: "Routes", colorHex: "#E8590C"),
                ]),
                MindMapNode(text: "Dominic", colorHex: "#2F9E44", children: [
                    MindMapNode(text: "Person", colorHex: "#2F9E44"),
                    MindMapNode(text: "Action", colorHex: "#2F9E44"),
                ]),
                MindMapNode(text: "Review", colorHex: "#9C36B5", children: [
                    MindMapNode(text: "SM-2", colorHex: "#9C36B5"),
                ]),
            ])
            mindMaps = [MindMap(title: "How to Remember", root: root)]
        }
    }

    // MARK: - Helpers

    func addResult(_ result: TrainingResult) {
        results.append(result)
    }

    func updateDeck(_ deck: Deck) {
        if let i = decks.firstIndex(where: { $0.id == deck.id }) {
            decks[i] = deck
        }
    }

    func updatePair(_ pair: DominicPair) {
        if let i = dominicPairs.firstIndex(where: { $0.number == pair.number }) {
            dominicPairs[i] = pair
        }
    }

    func updateJourney(_ journey: Journey) {
        if let i = journeys.firstIndex(where: { $0.id == journey.id }) {
            journeys[i] = journey
        }
    }

    func updateMindMap(_ map: MindMap) {
        if let i = mindMaps.firstIndex(where: { $0.id == map.id }) {
            mindMaps[i] = map
        }
    }

    func imageURL(for pair: DominicPair) -> URL? {
        guard let name = pair.imageFileName else { return nil }
        let url = imagesDirectory.appendingPathComponent(name)
        return fileManager.fileExists(atPath: url.path) ? url : nil
    }

    func saveImage(_ data: Data, for pairNumber: String) -> String {
        let name = "dominic-\(pairNumber).png"
        try? data.write(to: imagesDirectory.appendingPathComponent(name), options: .atomic)
        return name
    }
}
