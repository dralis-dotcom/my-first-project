import SwiftUI

// MARK: - Programmatic App Icon
//
// This view defines the MemoryMaster app icon design.
// To produce the required 1024×1024 PNG:
//   1. Open the file in Xcode and select the #Preview canvas.
//   2. Right-click the rendered preview → "Save Preview As…" → save as
//      MemoryMaster/Assets.xcassets/AppIcon.appiconset/1024.png
//
// The icon shows a white brain silhouette on a purple gradient,
// with a gold lightning-bolt overlay to represent mental energy.

struct AppIconView: View {
    var size: CGFloat = 256

    var body: some View {
        ZStack {
            // Purple gradient background
            LinearGradient(
                colors: [Color(hex: "#4A00E0"), Color(hex: "#8E2DE2")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            // Brain silhouette
            BrainShape()
                .fill(Color.white.opacity(0.92))
                .frame(width: size * 0.68, height: size * 0.60)

            // Gold lightning-bolt overlay
            LightningBoltShape()
                .fill(Color(hex: "#FFD700"))
                .frame(width: size * 0.22, height: size * 0.34)
                .shadow(color: Color(hex: "#FFD700").opacity(0.7), radius: size * 0.04)
        }
        .clipShape(
            RoundedRectangle(cornerRadius: size * 0.18, style: .continuous)
        )
        .frame(width: size, height: size)
    }
}

// MARK: - Brain silhouette shape

struct BrainShape: Shape {
    func path(in rect: CGRect) -> Path {
        let w = rect.width, h = rect.height
        var p = Path()

        // Right hemisphere outer curve
        p.move(to: CGPoint(x: w * 0.50, y: h * 0.08))
        p.addCurve(to: CGPoint(x: w * 0.92, y: h * 0.30),
                   control1: CGPoint(x: w * 0.76, y: h * 0.04),
                   control2: CGPoint(x: w * 0.96, y: h * 0.14))
        p.addCurve(to: CGPoint(x: w * 0.88, y: h * 0.60),
                   control1: CGPoint(x: w * 1.01, y: h * 0.44),
                   control2: CGPoint(x: w * 0.99, y: h * 0.56))
        // Right frontal lobe bump
        p.addCurve(to: CGPoint(x: w * 0.72, y: h * 0.82),
                   control1: CGPoint(x: w * 0.77, y: h * 0.64),
                   control2: CGPoint(x: w * 0.82, y: h * 0.78))
        // Bottom centre bridge
        p.addCurve(to: CGPoint(x: w * 0.50, y: h * 0.92),
                   control1: CGPoint(x: w * 0.62, y: h * 0.88),
                   control2: CGPoint(x: w * 0.56, y: h * 0.93))
        // Left hemisphere mirror
        p.addCurve(to: CGPoint(x: w * 0.28, y: h * 0.82),
                   control1: CGPoint(x: w * 0.44, y: h * 0.93),
                   control2: CGPoint(x: w * 0.38, y: h * 0.88))
        p.addCurve(to: CGPoint(x: w * 0.12, y: h * 0.60),
                   control1: CGPoint(x: w * 0.18, y: h * 0.78),
                   control2: CGPoint(x: w * 0.01, y: h * 0.56))
        p.addCurve(to: CGPoint(x: w * 0.08, y: h * 0.30),
                   control1: CGPoint(x: w * 0.01, y: h * 0.44),
                   control2: CGPoint(x: w * -0.01, y: h * 0.14))
        p.addCurve(to: CGPoint(x: w * 0.50, y: h * 0.08),
                   control1: CGPoint(x: w * 0.04, y: h * 0.14),
                   control2: CGPoint(x: w * 0.24, y: h * 0.04))
        p.closeSubpath()

        // Corpus-callosum divider (centre groove)
        p.move(to: CGPoint(x: w * 0.50, y: h * 0.18))
        p.addLine(to: CGPoint(x: w * 0.50, y: h * 0.84))

        return p
    }
}

// MARK: - Lightning-bolt shape

struct LightningBoltShape: Shape {
    func path(in rect: CGRect) -> Path {
        let w = rect.width, h = rect.height
        var p = Path()
        // Upper-right point → lower-left of upper half
        p.move(to:    CGPoint(x: w * 0.68, y: h * 0.00))
        p.addLine(to: CGPoint(x: w * 0.22, y: h * 0.50))
        p.addLine(to: CGPoint(x: w * 0.54, y: h * 0.50))
        // Lower-left point → upper-right of lower half
        p.addLine(to: CGPoint(x: w * 0.32, y: h * 1.00))
        p.addLine(to: CGPoint(x: w * 0.78, y: h * 0.50))
        p.addLine(to: CGPoint(x: w * 0.46, y: h * 0.50))
        p.closeSubpath()
        return p
    }
}

// MARK: - Preview

#Preview("App Icon 256pt") {
    AppIconView(size: 256)
        .padding(24)
        .background(Color(.systemGroupedBackground))
}

#Preview("App Icon 1024pt — export as PNG") {
    AppIconView(size: 1024)
}
