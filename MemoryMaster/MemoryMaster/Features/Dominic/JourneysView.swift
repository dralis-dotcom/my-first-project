import SwiftUI

/// Method-of-loci journeys: create routes of loci, then practice by pegging
/// random Dominic scenes (number pairs) onto the stops and recalling them.
struct JourneysView: View {
    @EnvironmentObject private var store: AppStore
    @State private var showingNew = false
    @State private var newName = ""

    var body: some View {
        List {
            ForEach(store.journeys) { journey in
                NavigationLink {
                    JourneyDetailView(journeyID: journey.id)
                } label: {
                    HStack {
                        Text(journey.emoji).font(.title2)
                        VStack(alignment: .leading) {
                            Text(journey.name).font(.headline)
                            Text("\(journey.loci.count) loci")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
            .onDelete { store.journeys.remove(atOffsets: $0) }

            Button {
                newName = ""
                showingNew = true
            } label: {
                Label("New journey", systemImage: "plus")
            }
        }
        .listStyle(.plain)
        .alert("New journey", isPresented: $showingNew) {
            TextField("Journey name (e.g. Walk to work)", text: $newName)
            Button("Create") {
                let name = newName.trimmingCharacters(in: .whitespaces)
                guard !name.isEmpty else { return }
                store.journeys.append(Journey(name: name))
            }
            Button("Cancel", role: .cancel) {}
        }
    }
}

struct JourneyDetailView: View {
    @EnvironmentObject private var store: AppStore
    let journeyID: UUID

    @State private var newLocus = ""
    @State private var practicing = false

    private var journey: Journey? {
        store.journeys.first(where: { $0.id == journeyID })
    }

    var body: some View {
        List {
            Section {
                Button {
                    practicing = true
                } label: {
                    Label("Practice on this journey", systemImage: "figure.walk")
                        .font(.headline)
                }
                .disabled((journey?.loci.count ?? 0) < 3)
            }

            Section("Loci (in walking order)") {
                if let journey {
                    ForEach(Array(journey.loci.enumerated()), id: \.element.id) { index, locus in
                        HStack {
                            Text("\(index + 1)")
                                .font(.caption.monospacedDigit())
                                .foregroundStyle(.secondary)
                                .frame(width: 24)
                            Text(locus.name)
                        }
                    }
                    .onDelete { offsets in
                        var j = journey
                        j.loci.remove(atOffsets: offsets)
                        store.updateJourney(j)
                    }
                    .onMove { source, destination in
                        var j = journey
                        j.loci.move(fromOffsets: source, toOffset: destination)
                        store.updateJourney(j)
                    }
                }
                HStack {
                    TextField("Add a locus (e.g. Mailbox)", text: $newLocus)
                    Button("Add") {
                        guard var j = journey else { return }
                        let name = newLocus.trimmingCharacters(in: .whitespaces)
                        guard !name.isEmpty else { return }
                        j.loci.append(Locus(name: name))
                        store.updateJourney(j)
                        newLocus = ""
                    }
                    .disabled(newLocus.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
        .navigationTitle(journey?.name ?? "Journey")
        .toolbar { EditButton() }
        .fullScreenCover(isPresented: $practicing) {
            if let journey {
                JourneyPracticeView(journey: journey)
            }
        }
    }
}

/// Pegs a random 2-digit number on each locus; you visualize the Dominic
/// person performing their action at that stop, then recall the digits.
struct JourneyPracticeView: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss

    let journey: Journey

    @State private var targets: [String] = []
    @State private var answers: [String] = []
    @State private var phase = 0  // 0 memorize, 1 recall, 2 results

    var body: some View {
        NavigationStack {
            Group {
                switch phase {
                case 0: memorizeView
                case 1: recallView
                default: resultsView
                }
            }
            .navigationTitle(journey.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
        }
        .onAppear {
            targets = journey.loci.map { _ in String(format: "%02d", Int.random(in: 0...99)) }
            answers = Array(repeating: "", count: journey.loci.count)
        }
    }

    private func pair(for number: String) -> DominicPair? {
        store.dominicPairs.first(where: { $0.number == number })
    }

    private var memorizeView: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                Text("Visualize each person doing their action at the locus.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                ForEach(Array(journey.loci.enumerated()), id: \.element.id) { index, locus in
                    if index < targets.count {
                        let number = targets[index]
                        HStack(alignment: .top, spacing: 12) {
                            Text(number)
                                .font(.title3.monospacedDigit().bold())
                                .frame(width: 44)
                                .padding(.vertical, 6)
                                .background(.tint.opacity(0.15), in: RoundedRectangle(cornerRadius: 8))
                            VStack(alignment: .leading, spacing: 2) {
                                Text(locus.name).font(.subheadline.bold())
                                if let p = pair(for: number) {
                                    Text("\(p.person) \(p.action)")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                            Spacer()
                        }
                    }
                }
                Button("I've walked the journey — recall") { phase = 1 }
                    .buttonStyle(BigButtonStyle())
                    .padding(.top)
            }
            .padding()
        }
    }

    private var recallView: some View {
        ScrollView {
            VStack(spacing: 12) {
                Text("Which number was at each locus?")
                    .font(.headline)
                ForEach(Array(journey.loci.enumerated()), id: \.element.id) { index, locus in
                    HStack {
                        Text(locus.name)
                            .font(.subheadline)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        TextField("00", text: $answers[index])
                            .keyboardType(.numberPad)
                            .font(.title3.monospacedDigit())
                            .multilineTextAlignment(.center)
                            .frame(width: 70)
                            .textFieldStyle(.roundedBorder)
                    }
                }
                Button("Check") { phase = 2 }
                    .buttonStyle(BigButtonStyle())
                    .padding(.top)
            }
            .padding()
        }
        .scrollDismissesKeyboard(.interactively)
    }

    private var resultsView: some View {
        let correct = zip(targets, answers).filter { $0 == $1.trimmingCharacters(in: .whitespaces) }.count
        return ScrollView {
            VStack(spacing: 14) {
                Text("\(correct) / \(targets.count)")
                    .font(.system(size: 52, weight: .heavy, design: .rounded).monospacedDigit())
                ForEach(Array(journey.loci.enumerated()), id: \.element.id) { index, locus in
                    HStack {
                        Image(systemName: targets[index] == answers[index].trimmingCharacters(in: .whitespaces)
                              ? "checkmark.circle.fill" : "xmark.circle.fill")
                            .foregroundStyle(targets[index] == answers[index].trimmingCharacters(in: .whitespaces)
                                             ? .green : .red)
                        Text(locus.name).font(.subheadline)
                        Spacer()
                        Text(targets[index]).font(.subheadline.monospacedDigit().bold())
                    }
                }
                Button("Done") { dismiss() }
                    .buttonStyle(BigButtonStyle())
                    .padding(.top)
            }
            .padding()
        }
    }
}
