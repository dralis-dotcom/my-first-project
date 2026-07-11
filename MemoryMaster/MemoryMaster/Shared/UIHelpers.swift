import SwiftUI

extension Color {
    init(hex: String) {
        var value: UInt64 = 0
        var hexString = hex
        if hexString.hasPrefix("#") { hexString.removeFirst() }
        Scanner(string: hexString).scanHexInt64(&value)
        let r = Double((value >> 16) & 0xFF) / 255
        let g = Double((value >> 8) & 0xFF) / 255
        let b = Double(value & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}

/// Buzan-style branch palette.
enum BranchPalette {
    static let hexes = [
        "#E8590C", "#2F9E44", "#1971C2", "#9C36B5",
        "#E64980", "#F08C00", "#0CA678", "#6741D9",
    ]

    static func hex(at index: Int) -> String {
        hexes[index % hexes.count]
    }
}

struct BigButtonStyle: ButtonStyle {
    var color: Color = .accentColor

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .frame(maxWidth: .infinity)
            .padding()
            .background(color.opacity(configuration.isPressed ? 0.7 : 1))
            .foregroundColor(.white)
            .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}
