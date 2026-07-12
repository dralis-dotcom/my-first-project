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
}

/// Deterministic generator so an abstract image can be rebuilt from its seed.
struct SeededGenerator: RandomNumberGenerator {
    private var state: UInt64

    init(seed: UInt64) { state = seed &+ 0x9E37_79B9_7F4A_7C15 }

    mutating func next() -> UInt64 {
        state &+= 0x9E37_79B9_7F4A_7C15
        var z = state
        z = (z ^ (z >> 30)) &* 0xBF58_476D_1CE4_E5B9
        z = (z ^ (z >> 27)) &* 0x94D0_49BB_1331_11EB
        return z ^ (z >> 31)
    }
}

/// One procedurally generated abstract image (Memory League "Images" style).
struct AbstractImage: Hashable, Identifiable {
    let seed: UInt64
    var id: UInt64 { seed }

    static func random() -> AbstractImage {
        AbstractImage(seed: UInt64.random(in: UInt64.min...UInt64.max))
    }
}

enum TrainingPhase {
    case setup, memorize, recall, results
}

/// Session state machine for all competition disciplines.
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
    @Published var abstractImages: [AbstractImage] = []
    @Published var historicEvents: [HistoricEvent] = []

    // Recall answers — Numbers
    @Published var digitAnswer: String = ""
    // Recall answers — Binary (tap grid)
    @Published var binaryTappedDigits: [Int] = []
    // Recall answers — Words
    @Published var wordAnswers: [String] = []
    // Recall answers — Cards (tap grid)
    @Published var shuffledCardsGrid: [PlayingCard] = []
    @Published var cardTapOrder: [PlayingCard] = []
    // Recall answers — Names
    @Published var shuffledFaces: [FaceItem] = []
    @Published var faceAnswers: [String] = []
    // Recall answers — Images
    @Published var shuffledImages: [AbstractImage] = []
    @Published var imageTapOrder: [UInt64] = []
    // Recall answers — Historic Dates
    @Published var historicDateAnswers: [String] = []

    @Published var correct = 0

    private var timer: Timer?

    init(discipline: Discipline) {
        self.discipline = discipline
        // Use saved default item count if available, otherwise fall back to built-in default
        let builtInDefault: Int
        switch discipline {
        case .numbers:       builtInDefault = 20
        case .binary:        builtInDefault = 20
        case .words:         builtInDefault = 10
        case .cards:         builtInDefault = 10
        case .names:         builtInDefault = 6
        case .images:        builtInDefault = 10
        case .historicDates: builtInDefault = 10
        }
        let key = "defaultItems_\(discipline.rawValue)"
        let saved = UserDefaults.standard.integer(forKey: key)
        itemCount = saved > 0 ? saved : builtInDefault
        memorizeSeconds = discipline == .historicDates ? 90 : 60
    }

    /// Minimum item count for the setup stepper.
    var minItems: Int {
        switch discipline {
        case .binary: return 8
        case .cards:  return 5
        default:      return 4
        }
    }

    /// Maximum item count for the setup stepper.
    var maxItems: Int {
        switch discipline {
        case .numbers:       return 200
        case .binary:        return 40
        case .words:         return 50
        case .cards:         return 20
        case .names:         return 16
        case .images:        return 30
        case .historicDates: return HistoricEventsBank.events.count
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
        case .numbers:
            digitAnswer = ""
        case .binary:
            binaryTappedDigits = []
        case .words:
            wordAnswers = Array(repeating: "", count: words.count)
        case .cards:
            shuffledCardsGrid = cards.shuffled()
            cardTapOrder = []
        case .names:
            shuffledFaces = faces.shuffled()
            faceAnswers = Array(repeating: "", count: faces.count)
        case .images:
            shuffledImages = abstractImages.shuffled()
            imageTapOrder = []
        case .historicDates:
            historicDateAnswers = Array(repeating: "", count: historicEvents.count)
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

    // MARK: - Generation

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
            faces = (0..<itemCount).map { i in
                FaceItem(name: "\(names[i % names.count]) \(lasts[i % lasts.count])")
            }
        case .images:
            var seen = Set<UInt64>()
            abstractImages = []
            while abstractImages.count < itemCount {
                let image = AbstractImage.random()
                if seen.insert(image.seed).inserted { abstractImages.append(image) }
            }
        case .historicDates:
            historicEvents = Array(HistoricEventsBank.events.shuffled().prefix(itemCount))
        }
    }

    // MARK: - Scoring

    private func score() -> Int {
        switch discipline {
        case .numbers:
            let typed = digitAnswer.filter(\.isNumber).map { Int(String($0))! }
            return zip(digits, typed).filter { $0 == $1 }.count
        case .binary:
            return zip(digits, binaryTappedDigits).filter { $0 == $1 }.count
        case .words:
            return zip(words, wordAnswers).filter {
                $0.lowercased() == $1.trimmingCharacters(in: .whitespaces).lowercased()
            }.count
        case .cards:
            return zip(cards, cardTapOrder).filter { $0 == $1 }.count
        case .names:
            return zip(shuffledFaces, faceAnswers).filter {
                $0.name.lowercased() == $1.trimmingCharacters(in: .whitespaces).lowercased()
            }.count
        case .images:
            return zip(abstractImages, imageTapOrder).filter { $0.seed == $1 }.count
        case .historicDates:
            return zip(historicEvents, historicDateAnswers).filter { event, answer in
                guard let typed = Int(answer.trimmingCharacters(in: .whitespaces)) else { return false }
                return abs(typed - event.year) <= 5
            }.count
        }
    }

    // MARK: - Binary tap helpers

    /// Append a 0 or 1 to the binary recall sequence.
    func tapBinaryDigit(_ digit: Int) {
        guard binaryTappedDigits.count < digits.count else { return }
        binaryTappedDigits.append(digit)
    }

    /// Remove the last tapped binary digit.
    func backspaceBinary() {
        guard !binaryTappedDigits.isEmpty else { return }
        binaryTappedDigits.removeLast()
    }

    // MARK: - Cards tap helpers

    /// Toggle a card in/out of the recall sequence.
    func toggleCardTap(_ card: PlayingCard) {
        if let index = cardTapOrder.firstIndex(of: card) {
            cardTapOrder.remove(at: index)
        } else {
            cardTapOrder.append(card)
        }
    }

    // MARK: - Images tap helpers

    func toggleImageTap(_ image: AbstractImage) {
        if let index = imageTapOrder.firstIndex(of: image.seed) {
            imageTapOrder.remove(at: index)
        } else {
            imageTapOrder.append(image.seed)
        }
    }
}
