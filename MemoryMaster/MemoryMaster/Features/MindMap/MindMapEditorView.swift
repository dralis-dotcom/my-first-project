import SwiftUI

/// Radial Buzan-style mind map: central topic, curved colored branches,
/// one keyword per node. Tap a node to select it, then add children,
/// rename, recolor, or delete via the bottom bar. Pinch to zoom, drag to pan.
struct MindMapEditorView: View {
    @EnvironmentObject private var store: AppStore
    let mapID: UUID

    @State private var selectedID: UUID?
    @State private var editingText = ""
    @State private var showingRename = false

    @State private var offset: CGSize = .zero
    @State private var dragStart: CGSize = .zero
    @State private var scale: CGFloat = 1
    @State private var scaleStart: CGFloat = 1

    private var map: MindMap? {
        store.mindMaps.first(where: { $0.id == mapID })
    }

    var body: some View {
        GeometryReader { geo in
            if let map {
                let layout = MindMapLayout(root: map.root)
                let center = CGPoint(x: geo.size.width / 2 + offset.width,
                                     y: geo.size.height / 2 + offset.height)

                ZStack {
                    Canvas { context, _ in
                        for edge in layout.edges {
                            var path = Path()
                            let from = transformed(edge.from, center: center)
                            let to = transformed(edge.to, center: center)
                            let mid = CGPoint(x: (from.x + to.x) / 2, y: (from.y + to.y) / 2)
                            // Curve control point pushed perpendicular for a
                            // Buzan-style organic branch.
                            let dx = to.x - from.x, dy = to.y - from.y
                            let control = CGPoint(x: mid.x - dy * 0.2, y: mid.y + dx * 0.2)
                            path.move(to: from)
                            path.addQuadCurve(to: to, control: control)
                            context.stroke(path,
                                           with: .color(Color(hex: edge.colorHex)),
                                           style: StrokeStyle(lineWidth: max(1.5, 5 - CGFloat(edge.depth)),
                                                              lineCap: .round))
                        }
                    }

                    ForEach(layout.placed, id: \.node.id) { item in
                        nodeView(item)
                            .position(transformed(item.position, center: center))
                    }
                }
                .contentShape(Rectangle())
                .gesture(
                    DragGesture()
                        .onChanged { value in
                            offset = CGSize(width: dragStart.width + value.translation.width,
                                            height: dragStart.height + value.translation.height)
                        }
                        .onEnded { _ in dragStart = offset }
                )
                .simultaneousGesture(
                    MagnificationGesture()
                        .onChanged { value in scale = min(3, max(0.4, scaleStart * value)) }
                        .onEnded { _ in scaleStart = scale }
                )
            }
        }
        .navigationTitle(map?.title ?? "Mind Map")
        .navigationBarTitleDisplayMode(.inline)
        .safeAreaInset(edge: .bottom) { toolbar }
        .alert("Node text", isPresented: $showingRename) {
            TextField("Keyword", text: $editingText)
            Button("Save") { renameSelected() }
            Button("Cancel", role: .cancel) {}
        }
    }

    private func transformed(_ point: CGPoint, center: CGPoint) -> CGPoint {
        CGPoint(x: center.x + point.x * scale, y: center.y + point.y * scale)
    }

    @ViewBuilder
    private func nodeView(_ item: PlacedNode) -> some View {
        let isSelected = item.node.id == selectedID
        Text(item.node.text)
            .font(item.depth == 0 ? .headline : .subheadline)
            .padding(.horizontal, 12)
            .padding(.vertical, 7)
            .background(
                Capsule().fill(item.depth == 0
                               ? Color(hex: item.node.colorHex)
                               : Color(hex: item.node.colorHex).opacity(0.18))
            )
            .foregroundStyle(item.depth == 0 ? .white : Color(hex: item.node.colorHex))
            .overlay(
                Capsule().stroke(isSelected ? Color.primary : .clear, lineWidth: 2)
            )
            .onTapGesture {
                selectedID = isSelected ? nil : item.node.id
            }
    }

    private var toolbar: some View {
        HStack(spacing: 14) {
            Button {
                addChild()
            } label: {
                Label("Add", systemImage: "plus.circle.fill")
            }
            .disabled(selectedID == nil)

            Button {
                if let node = findSelected() {
                    editingText = node.text
                    showingRename = true
                }
            } label: {
                Label("Edit", systemImage: "pencil.circle.fill")
            }
            .disabled(selectedID == nil)

            Button(role: .destructive) {
                deleteSelected()
            } label: {
                Label("Delete", systemImage: "trash.circle.fill")
            }
            .disabled(selectedID == nil || selectedID == map?.root.id)

            Spacer()

            if selectedID == nil {
                Text("Tap a node to select")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .labelStyle(.iconOnly)
        .font(.title2)
        .padding()
        .background(.thinMaterial)
    }

    // MARK: - Tree mutation

    private func findSelected() -> MindMapNode? {
        guard let map, let selectedID else { return nil }
        return find(selectedID, in: map.root)
    }

    private func find(_ id: UUID, in node: MindMapNode) -> MindMapNode? {
        if node.id == id { return node }
        for child in node.children {
            if let found = find(id, in: child) { return found }
        }
        return nil
    }

    private func addChild() {
        guard let map, let parent = findSelected() else { return }
        let colorHex = parent.id == map.root.id
            ? BranchPalette.hex(at: map.root.children.count)
            : parent.colorHex
        parent.children.append(MindMapNode(text: "New idea", colorHex: colorHex))
        store.updateMindMap(map)
    }

    private func renameSelected() {
        guard let map, let node = findSelected() else { return }
        let text = editingText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        node.text = text
        store.updateMindMap(map)
    }

    private func deleteSelected() {
        guard let map, let selectedID else { return }
        remove(selectedID, from: map.root)
        self.selectedID = nil
        store.updateMindMap(map)
    }

    private func remove(_ id: UUID, from node: MindMapNode) {
        node.children.removeAll { $0.id == id }
        for child in node.children { remove(id, from: child) }
    }
}

// MARK: - Radial layout

struct PlacedNode {
    let node: MindMapNode
    let position: CGPoint
    let depth: Int
}

struct MapEdge {
    let from: CGPoint
    let to: CGPoint
    let colorHex: String
    let depth: Int
}

/// Assigns each subtree an angular slice proportional to its leaf count and
/// places nodes at radius = depth * ringSpacing, relative to (0,0).
struct MindMapLayout {
    var placed: [PlacedNode] = []
    var edges: [MapEdge] = []

    private let ringSpacing: CGFloat = 110

    init(root: MindMapNode) {
        placed.append(PlacedNode(node: root, position: .zero, depth: 0))
        layoutChildren(of: root, at: .zero, depth: 1,
                       startAngle: -.pi / 2, endAngle: 1.5 * .pi)
    }

    private func leafCount(_ node: MindMapNode) -> Int {
        node.children.isEmpty ? 1 : node.children.reduce(0) { $0 + leafCount($1) }
    }

    private mutating func layoutChildren(of node: MindMapNode, at position: CGPoint,
                                         depth: Int, startAngle: CGFloat, endAngle: CGFloat) {
        guard !node.children.isEmpty else { return }
        let total = CGFloat(node.children.reduce(0) { $0 + leafCount($1) })
        var angle = startAngle
        for child in node.children {
            let slice = (endAngle - startAngle) * CGFloat(leafCount(child)) / total
            let childAngle = angle + slice / 2
            let radius = CGFloat(depth) * ringSpacing
            let childPos = CGPoint(x: cos(childAngle) * radius,
                                   y: sin(childAngle) * radius)
            placed.append(PlacedNode(node: child, position: childPos, depth: depth))
            edges.append(MapEdge(from: position, to: childPos,
                                 colorHex: child.colorHex, depth: depth))
            layoutChildren(of: child, at: childPos, depth: depth + 1,
                           startAngle: angle, endAngle: angle + slice)
            angle += slice
        }
    }
}
