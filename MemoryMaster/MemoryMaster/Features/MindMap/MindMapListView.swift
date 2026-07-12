import SwiftUI

struct MindMapListView: View {
    @EnvironmentObject private var store: AppStore
    @State private var showingNew = false
    @State private var newTitle = ""

    var body: some View {
        NavigationStack {
            List {
                ForEach(store.mindMaps) { map in
                    NavigationLink(value: map.id) {
                        VStack(alignment: .leading) {
                            Text(map.title).font(.headline)
                            Text("\(nodeCount(map.root)) nodes")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .onDelete { store.mindMaps.remove(atOffsets: $0) }
            }
            .navigationTitle("Mind Maps")
            .navigationDestination(for: UUID.self) { id in
                if store.mindMaps.contains(where: { $0.id == id }) {
                    MindMapEditorView(mapID: id)
                }
            }
            .toolbar {
                Button {
                    newTitle = ""
                    showingNew = true
                } label: {
                    Image(systemName: "plus")
                }
            }
            .alert("New mind map", isPresented: $showingNew) {
                TextField("Central topic", text: $newTitle)
                Button("Create") {
                    let title = newTitle.trimmingCharacters(in: .whitespaces)
                    guard !title.isEmpty else { return }
                    store.mindMaps.append(MindMap(title: title))
                }
                Button("Cancel", role: .cancel) {}
            }
        }
    }

    private func nodeCount(_ node: MindMapNode) -> Int {
        1 + node.children.reduce(0) { $0 + nodeCount($1) }
    }
}
