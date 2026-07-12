import Foundation

// MARK: - Spaced repetition (SM-2)

struct SRSState: Codable, Hashable {
    var repetitions: Int = 0
    var intervalDays: Double = 0
    var easeFactor: Double = 2.5
    var dueDate: Date = .now

    var isDue: Bool { dueDate <= .now }
}

enum ReviewGrade: Int, CaseIterable, Identifiable {
    case again = 0
    case hard = 3
    case good = 4
    case easy = 5

    var id: Int { rawValue }

    var label: String {
        switch self {
        case .again: return "Again"
        case .hard: return "Hard"
        case .good: return "Good"
        case .easy: return "Easy"
        }
    }
}

// MARK: - Study decks

struct Flashcard: Identifiable, Codable, Hashable {
    var id = UUID()
    var front: String
    var back: String
    var mnemonic: String = ""
    var srs = SRSState()
}

struct Deck: Identifiable, Codable, Hashable {
    var id = UUID()
    var name: String
    var emoji: String = "📚"
    var cards: [Flashcard] = []

    var dueCount: Int { cards.filter { $0.srs.isDue }.count }
}

// MARK: - Dominic system

struct DominicPair: Identifiable, Codable, Hashable {
    /// Two-digit string "00"..."99"; also used as the stable identifier.
    var number: String
    var person: String
    var action: String
    var imageFileName: String?
    var srs = SRSState()

    var id: String { number }

    /// Dominic letter code, e.g. "15" -> "AE".
    var letters: String {
        String(number.map { DominicPair.letter(for: $0) })
    }

    static func letter(for digit: Character) -> Character {
        switch digit {
        case "1": return "A"
        case "2": return "B"
        case "3": return "C"
        case "4": return "D"
        case "5": return "E"
        case "6": return "S"
        case "7": return "G"
        case "8": return "H"
        case "9": return "N"
        default: return "O"
        }
    }
}

// MARK: - Journeys (method of loci)

struct Locus: Identifiable, Codable, Hashable {
    var id = UUID()
    var name: String
    var note: String = ""
}

struct Journey: Identifiable, Codable, Hashable {
    var id = UUID()
    var name: String
    var emoji: String = "🗺️"
    var loci: [Locus] = []
}

// MARK: - Mind maps (Tony Buzan style)

final class MindMapNode: Identifiable, Codable {
    var id: UUID
    var text: String
    var colorHex: String
    var children: [MindMapNode]

    init(id: UUID = UUID(), text: String, colorHex: String = "#E8590C", children: [MindMapNode] = []) {
        self.id = id
        self.text = text
        self.colorHex = colorHex
        self.children = children
    }
}

struct MindMap: Identifiable, Codable {
    var id = UUID()
    var title: String
    var root: MindMapNode

    init(id: UUID = UUID(), title: String, root: MindMapNode? = nil) {
        self.id = id
        self.title = title
        self.root = root ?? MindMapNode(text: title, colorHex: "#1971C2")
    }
}

// MARK: - Training results

enum Discipline: String, Codable, CaseIterable, Identifiable {
    case numbers = "Numbers"
    case cards = "Cards"
    case words = "Words"
    case binary = "Binary"
    case names = "Names & Faces"
    case images = "Images"

    var id: String { rawValue }

    var symbol: String {
        switch self {
        case .numbers: return "number.square.fill"
        case .cards: return "suit.spade.fill"
        case .words: return "text.book.closed.fill"
        case .binary: return "01.square.fill"
        case .names: return "person.2.fill"
        case .images: return "photo.on.rectangle.angled"
        }
    }
}

struct TrainingResult: Identifiable, Codable {
    var id = UUID()
    var date: Date = .now
    var discipline: Discipline
    var itemCount: Int
    var correct: Int
    var memorizeSeconds: Int

    var accuracy: Double {
        itemCount == 0 ? 0 : Double(correct) / Double(itemCount)
    }
}
