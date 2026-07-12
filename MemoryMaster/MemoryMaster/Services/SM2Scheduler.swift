import Foundation

/// SM-2 spaced repetition algorithm (SuperMemo 2), as used for flashcards
/// and Dominic pair drills.
enum SM2Scheduler {

    static func review(_ state: SRSState, grade: ReviewGrade, now: Date = .now) -> SRSState {
        var s = state
        let quality = grade.rawValue

        if quality < 3 {
            s.repetitions = 0
            s.intervalDays = 0
            // Due again in 10 minutes within the same session.
            s.dueDate = now.addingTimeInterval(10 * 60)
            return s
        }

        switch s.repetitions {
        case 0: s.intervalDays = 1
        case 1: s.intervalDays = 6
        default: s.intervalDays = (s.intervalDays * s.easeFactor).rounded()
        }
        s.repetitions += 1

        let q = Double(quality)
        s.easeFactor = max(1.3, s.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
        s.dueDate = now.addingTimeInterval(s.intervalDays * 86_400)
        return s
    }
}
