import SwiftUI

/// Renders an AbstractImage deterministically from its seed: a colored tile
/// with 2–3 overlaid geometric shapes, so every image is distinct and
/// reproducible across the memorize and recall phases.
struct AbstractImageView: View {
    let image: AbstractImage

    var body: some View {
        let spec = ImageSpec(seed: image.seed)
        ZStack {
            RoundedRectangle(cornerRadius: 10)
                .fill(spec.background)
            shape(spec.primaryShape)
                .fill(spec.primary)
                .rotationEffect(.degrees(spec.rotation))
                .padding(8)
            shape(spec.secondaryShape)
                .fill(spec.secondary.opacity(0.85))
                .rotationEffect(.degrees(-spec.rotation))
                .padding(20)
        }
        .aspectRatio(1, contentMode: .fit)
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }

    private func shape(_ kind: Int) -> AnyShape {
        switch kind {
        case 0: return AnyShape(Circle())
        case 1: return AnyShape(Rectangle())
        case 2: return AnyShape(Capsule())
        case 3: return AnyShape(TriangleShape())
        default: return AnyShape(DiamondShape())
        }
    }
}

private struct ImageSpec {
    let background: Color
    let primary: Color
    let secondary: Color
    let primaryShape: Int
    let secondaryShape: Int
    let rotation: Double

    init(seed: UInt64) {
        var rng = SeededGenerator(seed: seed)
        background = Color(hue: .random(in: 0...1, using: &rng),
                           saturation: 0.35, brightness: 0.95)
        primary = Color(hue: .random(in: 0...1, using: &rng),
                        saturation: 0.85, brightness: 0.8)
        secondary = Color(hue: .random(in: 0...1, using: &rng),
                          saturation: 0.9, brightness: 0.55)
        primaryShape = Int.random(in: 0...4, using: &rng)
        secondaryShape = Int.random(in: 0...4, using: &rng)
        rotation = .random(in: 0...360, using: &rng)
    }
}

struct TriangleShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.midX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
        path.closeSubpath()
        return path
    }
}

struct DiamondShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.midX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.midY))
        path.addLine(to: CGPoint(x: rect.midX, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.midY))
        path.closeSubpath()
        return path
    }
}
