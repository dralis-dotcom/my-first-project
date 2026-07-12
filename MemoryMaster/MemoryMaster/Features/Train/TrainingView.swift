import SwiftUI

struct TrainingView: View {
    @EnvironmentObject private var store: AppStore
    @StateObject private var session: TrainingSession

    init(discipline: Discipline) {
        _session = StateObject(wrappedValue: TrainingSession(discipline: discipline))
    }

    var body: some View {
        Group {
            switch session.phase {
            case .setup:    SetupPhaseView(session: session)
            case .memorize: MemorizePhaseView(session: session)
            case .recall:   RecallPhaseView(session: session) {
                let result = session.finish()
                store.addResult(result)
            }
            case .results:  ResultsPhaseView(session: session)
            }
        }
        .navigationTitle(session.discipline.rawValue)
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Setup

struct SetupPhaseView: View {
    @ObservedObject var session: TrainingSession

    var body: some View {
        Form {
            Section("Session") {
                Stepper("Items: \(session.itemCount)",
                        value: $session.itemCount,
                        in: 4...session.maxItems,
                        step: stepSize)
                Stepper("Memorize time: \(session.memorizeSeconds)s",
                        value: $session.memorizeSeconds,
                        in: 10...600, step: 10)
            }
            Section {
                Button("Start memorizing") { session.start() }
                    .frame(maxWidth: .infinity)
                    .font(.headline)
            }
            Section("Tip") {
                Text(tip)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var stepSize: Int {
        switch session.discipline {
        case .numbers, .binary: return 10
        default: return 2
        }
    }

    private var tip: String {
        switch session.discipline {
        case .numbers:
            return "Chunk digits into pairs and convert each pair to its Dominic person. Combine two pairs into person + action, then place the scene on a journey."
        case .binary:
            return "Group binary digits into 3s (000–111 = 0–7), then pair the resulting digits and use your Dominic people."
        case .words:
            return "Link words into an exaggerated story, or place one vivid image per locus along a journey."
        case .cards:
            return "Assign each card a person (e.g. King of Hearts = your father figure). Place pairs of cards as person + action scenes along a journey."
        case .names:
            return "Study each face's colour and initials, then link the sound of the full name to a vivid image. In recall, avatars are shuffled — test yourself!"
        case .images:
            return "Name each image aloud in your head (\"red diamond on mint\"), then chain the names into a story or place them along a journey. In recall, tap the images in their original order."
        case .historicDates:
            return "Link each event to a vivid scene at a journey locus. Encode the year using the Major System or Dominic numbers so you can reconstruct it exactly."
        }
    }
}

// MARK: - Memorize

struct MemorizePhaseView: View {
    @ObservedObject var session: TrainingSession

    private let digitColumns  = Array(repeating: GridItem(.flexible()), count: 10)
    private let cardColumns   = Array(repeating: GridItem(.flexible()), count: 5)
    private let avatarColumns = [GridItem(.flexible()), GridItem(.flexible())]
    private let imageColumns  = Array(repeating: GridItem(.flexible()), count: 3)

    var body: some View {
        VStack(spacing: 16) {
            Text("\(session.remainingSeconds)s")
                .font(.system(size: 44, weight: .bold, design: .rounded).monospacedDigit())
                .foregroundStyle(session.remainingSeconds <= 10 ? .red : .primary)

            ScrollView {
                switch session.discipline {
                case .numbers, .binary:
                    LazyVGrid(columns: digitColumns, spacing: 12) {
                        ForEach(Array(session.digits.enumerated()), id: \.offset) { _, digit in
                            Text("\(digit)")
                                .font(.title2.monospacedDigit().bold())
                        }
                    }
                    .padding()

                case .words:
                    VStack(alignment: .leading, spacing: 10) {
                        ForEach(Array(session.words.enumerated()), id: \.offset) { index, word in
                            Text("\(index + 1). \(word)")
                                .font(.title3)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()

                case .cards:
                    LazyVGrid(columns: cardColumns, spacing: 10) {
                        ForEach(Array(session.cards.enumerated()), id: \.offset) { _, card in
                            CardFace(card: card)
                        }
                    }
                    .padding()

                case .names:
                    LazyVGrid(columns: avatarColumns, spacing: 16) {
                        ForEach(Array(session.faces.enumerated()), id: \.element.id) { index, face in
                            VStack(spacing: 8) {
                                AvatarView(name: face.name, size: 72)
                                Text("\(index + 1). \(face.name)")
                                    .font(.caption.bold())
                                    .multilineTextAlignment(.center)
                            }
                            .padding(12)
                            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
                        }
                    }
                    .padding(.horizontal)

                case .images:
                    LazyVGrid(columns: imageColumns, spacing: 12) {
                        ForEach(Array(session.abstractImages.enumerated()), id: \.element.id) { index, image in
                            VStack(spacing: 4) {
                                AbstractImageView(image: image)
                                Text("\(index + 1)")
                                    .font(.caption.monospacedDigit().bold())
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .padding()

                case .historicDates:
                    VStack(alignment: .leading, spacing: 12) {
                        ForEach(Array(session.historicEvents.enumerated()), id: \.element.id) { index, event in
                            VStack(alignment: .leading, spacing: 4) {
                                Text("\(index + 1). \(event.description)")
                                    .font(.subheadline)
                                Text(String(event.year))
                                    .font(.title2.bold().monospacedDigit())
                                    .foregroundStyle(.tint)
                            }
                            .padding(12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 10))
                        }
                    }
                    .padding(.horizontal)
                }
            }

            Button("Done — recall now") { session.beginRecall() }
                .buttonStyle(BigButtonStyle())
                .padding(.horizontal)
        }
        .padding(.vertical)
    }
}

struct CardFace: View {
    let card: PlayingCard

    var body: some View {
        Text(card.display)
            .font(.headline)
            .foregroundStyle(card.isRed ? .red : .primary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
            .background(.background, in: RoundedRectangle(cornerRadius: 8))
            .overlay(RoundedRectangle(cornerRadius: 8).stroke(.quaternary))
    }
}

// MARK: - Recall

struct RecallPhaseView: View {
    @ObservedObject var session: TrainingSession
    var onFinish: () -> Void

    private let avatarColumns = [GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                switch session.discipline {
                case .numbers, .binary:
                    Text("Type the digits in order")
                        .font(.headline)
                    TextField("e.g. 3141592…", text: $session.digitAnswer, axis: .vertical)
                        .keyboardType(.numberPad)
                        .font(.title3.monospaced())
                        .textFieldStyle(.roundedBorder)
                        .padding(.horizontal)

                case .words:
                    Text("Type each word in order").font(.headline)
                    ForEach(session.wordAnswers.indices, id: \.self) { index in
                        TextField("Word \(index + 1)", text: $session.wordAnswers[index])
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .textFieldStyle(.roundedBorder)
                            .padding(.horizontal)
                    }

                case .cards:
                    Text("Pick each card in order").font(.headline)
                    ForEach(session.cardAnswers.indices, id: \.self) { index in
                        CardPickerRow(index: index, selection: $session.cardAnswers[index])
                            .padding(.horizontal)
                    }

                case .names:
                    Text("Avatars are shuffled — type each name")
                        .font(.headline)
                    Text("The coloured initials are your cue")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    LazyVGrid(columns: avatarColumns, spacing: 14) {
                        ForEach(session.shuffledFaces.indices, id: \.self) { index in
                            VStack(spacing: 8) {
                                AvatarView(name: session.shuffledFaces[index].name, size: 64)
                                TextField("Full name", text: $session.faceAnswers[index])
                                    .textInputAutocapitalization(.words)
                                    .autocorrectionDisabled()
                                    .textFieldStyle(.roundedBorder)
                                    .font(.caption)
                                    .multilineTextAlignment(.center)
                            }
                            .padding(10)
                            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
                        }
                    }
                    .padding(.horizontal)

                case .images:
                    Text("Tap the images in their original order")
                        .font(.headline)
                    Text("Selected: \(session.imageTapOrder.count)/\(session.abstractImages.count) — tap again to unselect")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 12) {
                        ForEach(session.shuffledImages) { image in
                            Button {
                                session.toggleImageTap(image)
                            } label: {
                                AbstractImageView(image: image)
                                    .overlay(alignment: .topTrailing) {
                                        if let position = session.imageTapOrder.firstIndex(of: image.seed) {
                                            Text("\(position + 1)")
                                                .font(.caption.bold().monospacedDigit())
                                                .foregroundStyle(.white)
                                                .frame(width: 24, height: 24)
                                                .background(Circle().fill(.blue))
                                                .padding(4)
                                        }
                                    }
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 10)
                                            .stroke(session.imageTapOrder.contains(image.seed) ? .blue : .clear,
                                                    lineWidth: 3)
                                    )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal)

                case .historicDates:
                    Text("What year did each event occur?")
                        .font(.headline)
                    Text("±5 years counts as correct")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    ForEach(Array(session.historicEvents.enumerated()), id: \.element.id) { index, event in
                        VStack(alignment: .leading, spacing: 6) {
                            Text("\(index + 1). \(event.description)")
                                .font(.subheadline)
                            TextField("Year", text: $session.historicDateAnswers[index])
                                .keyboardType(.numberPad)
                                .textFieldStyle(.roundedBorder)
                                .frame(maxWidth: 120)
                        }
                        .padding(.horizontal)
                    }
                }

                Button("Check answers") { onFinish() }
                    .buttonStyle(BigButtonStyle())
                    .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .scrollDismissesKeyboard(.interactively)
    }
}

struct CardPickerRow: View {
    let index: Int
    @Binding var selection: PlayingCard?

    private static let deck = PlayingCard.fullDeck()

    var body: some View {
        HStack {
            Text("#\(index + 1)")
                .font(.subheadline.monospacedDigit())
                .foregroundStyle(.secondary)
                .frame(width: 40, alignment: .leading)
            Picker("Card \(index + 1)", selection: $selection) {
                Text("—").tag(PlayingCard?.none)
                ForEach(Self.deck) { card in
                    Text(card.display).tag(PlayingCard?.some(card))
                }
            }
            .pickerStyle(.menu)
            Spacer()
        }
        .padding(8)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 10))
    }
}

// MARK: - Results

struct ResultsPhaseView: View {
    @ObservedObject var session: TrainingSession
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 20) {
            Text(session.correct == session.itemCount ? "🏆 Perfect!" : "Session complete")
                .font(.title.bold())

            Text("\(session.correct) / \(session.itemCount)")
                .font(.system(size: 56, weight: .heavy, design: .rounded).monospacedDigit())

            Text("Accuracy \(Int(Double(session.correct) / Double(max(session.itemCount, 1)) * 100))% · \(session.memorizeSeconds)s memorization")
                .foregroundStyle(.secondary)

            // Historic Dates: show a breakdown of exact vs close answers
            if session.discipline == .historicDates && !session.historicDateAnswers.isEmpty {
                HistoricDatesResultDetail(session: session)
            }

            Button("Train again") { session.phase = .setup }
                .buttonStyle(BigButtonStyle())
                .padding(.horizontal)

            Button("Back to disciplines") { dismiss() }
                .padding(.top, 4)
        }
        .padding()
    }
}

/// Compact breakdown for Historic Dates results.
private struct HistoricDatesResultDetail: View {
    @ObservedObject var session: TrainingSession

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            ForEach(Array(session.historicEvents.enumerated()), id: \.element.id) { index, event in
                let answer = index < session.historicDateAnswers.count
                    ? session.historicDateAnswers[index] : ""
                let typed  = Int(answer.trimmingCharacters(in: .whitespaces)) ?? Int.min
                let diff   = abs(typed - event.year)
                HStack(spacing: 8) {
                    Image(systemName: diff == 0 ? "checkmark.circle.fill"
                                    : diff <= 5  ? "circle.dotted.circle"
                                                 : "xmark.circle.fill")
                        .foregroundStyle(diff == 0 ? .green : diff <= 5 ? .orange : .red)
                    Text(event.description)
                        .font(.caption)
                        .lineLimit(1)
                    Spacer()
                    Text(answer.isEmpty ? "—" : answer)
                        .font(.caption.monospacedDigit())
                        .foregroundStyle(.secondary)
                    Text("(\(event.year))")
                        .font(.caption.monospacedDigit().bold())
                }
            }
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
        .padding(.horizontal)
    }
}
