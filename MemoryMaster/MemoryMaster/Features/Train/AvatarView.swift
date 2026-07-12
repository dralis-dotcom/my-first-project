import SwiftUI

/// Procedurally generated avatar: the person's initials centred on a
/// deterministic colour circle. The colour derives from the name string so
/// the same name always produces the same colour, and it looks distinct
/// enough at a glance to aid recall.
struct AvatarView: View {
    let name: String
    var size: CGFloat = 60

    var body: some View {
        ZStack {
            Circle()
                .fill(avatarColor)
            Text(initials)
                .font(.system(size: size * 0.38, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
        }
        .frame(width: size, height: size)
    }

    // MARK: - Private helpers

    private var initials: String {
        let parts = name.split(separator: " ").map { String($0) }
        switch parts.count {
        case 0: return "?"
        case 1: return String(parts[0].prefix(2)).uppercased()
        default: return (String(parts[0].prefix(1)) + String(parts[1].prefix(1))).uppercased()
        }
    }

    /// Stable hue derived from the UTF-8 bytes of the name.
    private var avatarColor: Color {
        let hash = name.utf8.reduce(5381) { ($0 &<< 5) &+ $0 &+ UInt32($1) }
        let hue = Double(hash % 360) / 360.0
        return Color(hue: hue, saturation: 0.55, brightness: 0.78)
    }
}

#Preview {
    HStack(spacing: 16) {
        AvatarView(name: "Alice Johnson", size: 72)
        AvatarView(name: "Bob Smith",     size: 72)
        AvatarView(name: "Carlos López",  size: 72)
        AvatarView(name: "Dina Müller",   size: 72)
    }
    .padding()
}
