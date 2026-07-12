import WidgetKit
import SwiftUI

// MARK: - Timeline entry

struct StreakEntry: TimelineEntry {
    let date: Date
    let streak: Int
    let practicedToday: Bool
    let longest: Int
}

// MARK: - Provider

struct StreakProvider: TimelineProvider {
    func placeholder(in context: Context) -> StreakEntry {
        StreakEntry(date: .now, streak: 7, practicedToday: false, longest: 14)
    }

    func getSnapshot(in context: Context, completion: @escaping (StreakEntry) -> Void) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<StreakEntry>) -> Void) {
        // Refresh at midnight so the streak badge updates even without opening the app
        let cal = Calendar.current
        let tomorrow = cal.startOfDay(for: cal.date(byAdding: .day, value: 1, to: .now)!)
        completion(Timeline(entries: [currentEntry()], policy: .after(tomorrow)))
    }

    private func currentEntry() -> StreakEntry {
        let mgr = StreakManager.shared
        return StreakEntry(date: .now,
                           streak: mgr.currentStreak,
                           practicedToday: mgr.practicedToday,
                           longest: mgr.longestStreak)
    }
}

// MARK: - Small widget view

struct StreakWidgetSmallView: View {
    let entry: StreakEntry

    var body: some View {
        VStack(spacing: 6) {
            Spacer()
            HStack(spacing: 4) {
                Image(systemName: "flame.fill")
                    .foregroundStyle(.orange)
                Text("\(entry.streak)")
                    .font(.system(size: 36, weight: .heavy, design: .rounded).monospacedDigit())
            }
            Text("day streak")
                .font(.caption2.bold())
                .foregroundStyle(.secondary)
            Spacer()
            Group {
                if entry.practicedToday {
                    Label("Done today", systemImage: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                } else {
                    Text("Practice now!")
                        .foregroundStyle(.tint)
                }
            }
            .font(.caption2.bold())
        }
        .padding(12)
        .containerBackground(.fill.tertiary, for: .widget)
        .widgetURL(URL(string: "memorymaster://train"))
    }
}

// MARK: - Medium widget view

struct StreakWidgetMediumView: View {
    let entry: StreakEntry

    var body: some View {
        HStack(spacing: 20) {
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Image(systemName: "flame.fill")
                        .font(.title)
                        .foregroundStyle(.orange)
                    Text("\(entry.streak)")
                        .font(.system(size: 44, weight: .heavy, design: .rounded).monospacedDigit())
                }
                Text("day streak")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Divider()

            VStack(alignment: .leading, spacing: 8) {
                Label("Best: \(entry.longest) days", systemImage: "trophy.fill")
                    .font(.caption.bold())
                    .foregroundStyle(.yellow)
                if entry.practicedToday {
                    Label("Trained today", systemImage: "checkmark.circle.fill")
                        .font(.caption.bold())
                        .foregroundStyle(.green)
                } else {
                    Link(destination: URL(string: "memorymaster://train")!) {
                        Label("Practice Now", systemImage: "bolt.fill")
                            .font(.caption.bold())
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(.tint, in: Capsule())
                            .foregroundStyle(.white)
                    }
                }
            }
            Spacer()
        }
        .padding()
        .containerBackground(.fill.tertiary, for: .widget)
    }
}

// MARK: - Entry view dispatcher

struct StreakWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: StreakEntry

    var body: some View {
        switch family {
        case .systemSmall:
            StreakWidgetSmallView(entry: entry)
        default:
            StreakWidgetMediumView(entry: entry)
        }
    }
}

// MARK: - Widget configuration

struct StreakWidget: Widget {
    let kind = "StreakWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: StreakProvider()) { entry in
            StreakWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Memory Streak")
        .description("Track your daily memory training streak and jump straight into practice.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
