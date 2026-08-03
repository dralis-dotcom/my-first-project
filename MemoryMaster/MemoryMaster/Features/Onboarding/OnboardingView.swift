import SwiftUI

// MARK: - Onboarding container

/// Shown on first launch; dismissed when the user finishes all three pages.
/// Completion is stored in UserDefaults so it never re-appears.
struct OnboardingView: View {
    @AppStorage("hasCompletedOnboarding") private var hasCompleted = false
    @State private var selectedDiscipline: Discipline = .numbers

    var body: some View {
        TabView {
            // Page 1 — Welcome
            OnboardingWelcomePage()
                .tag(0)

            // Page 2 — Pick first discipline
            OnboardingPickDisciplinePage(selected: $selectedDiscipline)
                .tag(1)

            // Page 3 — Technique tip + finish
            OnboardingTipPage(discipline: selectedDiscipline) {
                hasCompleted = true
            }
            .tag(2)
        }
        .tabViewStyle(.page(indexDisplayMode: .always))
        .ignoresSafeArea(edges: .bottom)
    }
}

// MARK: - Page 1: Welcome

private struct OnboardingWelcomePage: View {
    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            Image(systemName: "brain.head.profile")
                .font(.system(size: 80))
                .foregroundStyle(.tint)
                .padding(.bottom, 8)

            Text("Memory Master")
                .font(.largeTitle.bold())

            Text("Train your memory with world-championship techniques — the Dominic System, Method of Loci, and structured competition disciplines.")
                .font(.body)
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
                .padding(.horizontal, 36)

            VStack(alignment: .leading, spacing: 12) {
                FeatureBullet(icon: "bolt.fill",        text: "7 competition disciplines")
                FeatureBullet(icon: "flame.fill",       text: "Daily streak tracking")
                FeatureBullet(icon: "rectangle.on.rectangle.angled", text: "Spaced-repetition flashcards")
                FeatureBullet(icon: "brain.head.profile", text: "Dominic System & Mind Maps")
            }
            .padding(.horizontal, 40)

            Spacer()
            Text("Swipe to continue →")
                .font(.caption)
                .foregroundStyle(.tertiary)
            Spacer().frame(height: 60)
        }
    }
}

private struct FeatureBullet: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(.tint)
                .frame(width: 24)
            Text(text).font(.subheadline)
        }
    }
}

// MARK: - Page 2: Pick first discipline

private struct OnboardingPickDisciplinePage: View {
    @Binding var selected: Discipline
    private let columns = [GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        VStack(spacing: 20) {
            Spacer().frame(height: 60)
            Text("Pick your first discipline")
                .font(.title2.bold())
            Text("You can train all of them — just pick one to start with.")
                .font(.callout)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)

            LazyVGrid(columns: columns, spacing: 12) {
                ForEach(Discipline.allCases) { discipline in
                    Button { selected = discipline } label: {
                        let isSelected = selected == discipline
                        VStack(spacing: 8) {
                            Image(systemName: discipline.symbol)
                                .font(.title2)
                                .foregroundStyle(isSelected ? .white : .tint)
                            Text(discipline.rawValue)
                                .font(.subheadline.bold())
                                .foregroundStyle(isSelected ? .white : .primary)
                                .multilineTextAlignment(.center)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(14)
                        .background(
                            isSelected ? Color.accentColor : Color(.secondarySystemBackground),
                            in: RoundedRectangle(cornerRadius: 14)
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)

            Spacer()
            Text("Swipe to continue →")
                .font(.caption)
                .foregroundStyle(.tertiary)
            Spacer().frame(height: 60)
        }
    }
}

// MARK: - Page 3: Technique tip + finish

private struct OnboardingTipPage: View {
    let discipline: Discipline
    let onFinish: () -> Void

    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            Image(systemName: discipline.symbol)
                .font(.system(size: 64))
                .foregroundStyle(.tint)

            Text("Your first technique")
                .font(.title2.bold())

            Text(tip(for: discipline))
                .font(.body)
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
                .padding(.horizontal, 32)

            Spacer()
            Button("Start training!") { onFinish() }
                .buttonStyle(.borderedProminent)
                .font(.headline)
                .controlSize(.large)
                .padding(.horizontal, 40)
            Spacer().frame(height: 60)
        }
    }

    private func tip(for discipline: Discipline) -> String {
        switch discipline {
        case .numbers:
            return "Chunk digits into pairs and convert each to a Dominic person. Combine two pairs as person + action, then place each scene on a familiar journey route."
        case .binary:
            return "Group binary digits into 3s (000–111 = 0–7), pair the resulting digits, and use your Dominic people and actions to encode them."
        case .words:
            return "Link words into a vivid, exaggerated story — the wilder the better! Or place one strong image per locus on a journey you know well."
        case .cards:
            return "Assign each card a character (e.g. A♠ = a favourite spy). Pair cards as person + action and place each scene on your journey."
        case .names:
            return "Find a striking facial feature, pick a sound-alike word for the name, then link the feature to the word with a vivid image."
        case .images:
            return "Name each image aloud in your head, then chain those names into a crazy story — or place each one at a locus on your journey."
        case .historicDates:
            return "Encode each year with the Dominic or Major System. Place the person + year scene at a locus associated with the event you are memorising."
        case .spokenNumbers:
            return "Digits arrive by ear, one per second, and you can't look back — convert each pair to its Dominic person the instant you hear it and keep moving along your journey."
        }
    }
}
