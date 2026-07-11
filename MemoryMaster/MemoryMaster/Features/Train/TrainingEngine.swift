import Foundation

/// A standard 52-card deck item, rendered as text (e.g. "A♠").
struct PlayingCard: Hashable, Identifiable {
    let rank: String
    let suit: String

    var id: String { rank + suit }
    var display: String { rank + suit }
    var isRed: Bool { suit == "♥" || suit == "♦" }

    static func fullDeck() -> [PlayingCard] {
        let ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
        let suits = ["♠", "♥", "♦", "♣"]
        return suits.flatMap { suit in ranks.map { PlayingCard(rank: $0, suit: suit) } }
    }
}

/// One person to memorize in Names & Faces.
struct FaceItem: Hashable, Identifiable {
    let id = UUID()
    let name: String
    /// Emoji stand-in for a face (works fully offline).
    let face: String

    static let faces = ["🧔", "👩‍🦰", "👨‍🦱", "👩‍🦳", "👨🏾", "👩🏻", "👴", "👵",
                        "👨‍🦲", "👩‍🦱", "🧑🏽", "👱‍♀️", "🧓🏿", "👨🏻‍🦰", "👩🏾‍🦱", "🧑‍🦳"]
}

enum TrainingPhase {
    case setup, memorize, recall, results
}

/// Session state machine for all competition disciplines:
/// setup -> memorize (timed) -> recall (input) -> results (score).
@MainActor
final class TrainingSession: ObservableObject {
    let discipline: Discipline

    @Published var phase: TrainingPhase = .setup
    @Published var itemCount: Int
    @Published var memorizeSeconds: Int
    @Published var remainingSeconds: Int = 0

    // Generated targets
    @Published var digits: [Int] = []
    @Published var words: [String] = []
    @Published var cards: [PlayingCard] = []
    @Published var faces: [FaceItem] = []

    // Recall answers
    @Published var digitAnswer: String = ""
    @Published var wordAnswers: [String] = []
    @Published var cardAnswers: [PlayingCard?] = []
    @Published var faceAnswers: [String] = []

    @Published var correct = 0

    private var timer: Timer?

    init(discipline: Discipline) {
        self.discipline = discipline
        switch discipline {
        case .numbers: itemCount = 20; memorizeSeconds = 60
        case .binary: itemCount = 30; memorizeSeconds = 60
        case .words: itemCount = 10; memorizeSeconds = 60
        case .cards: itemCount = 10; memorizeSeconds = 60
        case .names: itemCount = 6; memorizeSeconds = 60
        }
    }

    var maxItems: Int {
        switch discipline {
        case .numbers: return 200
        case .binary: return 300
        case .words: return 50
        case .cards: return 52
        case .names: return 16
        }
    }

    func start() {
        generate()
        phase = .memorize
        remainingSeconds = memorizeSeconds
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            Task { @MainActor in
                guard let self else { return }
                self.remainingSeconds -= 1
                if self.remainingSeconds <= 0 { self.beginRecall() }
            }
        }
    }

    func beginRecall() {
        timer?.invalidate()
        timer = nil
        switch discipline {
        case .numbers, .binary:
            digitAnswer = ""
        case .words:
            wordAnswers = Array(repeating: "", count: words.count)
        case .cards:
            cardAnswers = Array(repeating: nil, count: cards.count)
        case .names:
            faceAnswers = Array(repeating: "", count: faces.count)
        }
        phase = .recall
    }

    func finish() -> TrainingResult {
        correct = score()
        phase = .results
        return TrainingResult(discipline: discipline,
                              itemCount: itemCount,
                              correct: correct,
                              memorizeSeconds: memorizeSeconds)
    }

    private func generate() {
        switch discipline {
        case .numbers:
            digits = (0..<itemCount).map { _ in Int.random(in: 0...9) }
        case .binary:
            digits = (0..<itemCount).map { _ in Int.random(in: 0...1) }
        case .words:
            words = Array(WordBank.words.shuffled().prefix(itemCount))
        case .cards:
            cards = Array(PlayingCard.fullDeck().shuffled().prefix(itemCount))
        case .names:
            let names = Array(Set(WordBank.firstNames).map { $0 }.shuffled())
            let lasts = WordBank.lastNames.shuffled()
            let emojis = FaceItem.faces.shuffled()
            faces = (0..<itemCount).map { i in
                FaceItem(name: "\(names[i % names.count]) \(lasts[i % lasts.count])",
                         face: emojis[i % emojis.count])
            }
        }
    }

    private func score() -> Int {
        switch discipline {
        case .numbers, .binary:
            let typed = digitAnswer.filter(\.isNumber).map { Int(String($0))! }
            return zip(digits, typed).filter { $0 == $1 }.count
        case .words:
            return zip(words, wordAnswers).filter {
                $0.lowercased() == $1.trimmingCharacters(in: .whitespaces).lowercased()
            }.count
        case .cards:
            return zip(cards, cardAnswers).filter { $0 == $1 }.count
        case .names:
            return zip(faces, faceAnswers).filter {
                $0.name.lowercased() == $1.trimmingCharacters(in: .whitespaces).lowercased()
            }.count
        }
    }
}
