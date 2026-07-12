import SwiftUI

struct SettingsView: View {
    @State private var anthropicKey = ""
    @State private var openAIKey = ""
    @State private var saved = false

    var body: some View {
        Form {
            Section {
                SecureField("sk-ant-…", text: $anthropicKey)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
            } header: {
                Text("Anthropic API key")
            } footer: {
                Text("Used for mnemonic generation and Dominic pair suggestions (Claude). Get a key at console.anthropic.com. Stored in the iOS Keychain.")
            }

            Section {
                SecureField("sk-…", text: $openAIKey)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
            } header: {
                Text("OpenAI API key")
            } footer: {
                Text("Used to generate mnemonic pictures for Dominic persons and actions (gpt-image-1). Get a key at platform.openai.com. Stored in the iOS Keychain.")
            }

            Section {
                Button("Save keys") {
                    KeychainHelper.save(anthropicKey.trimmingCharacters(in: .whitespaces),
                                        for: AIService.anthropicKeyName)
                    KeychainHelper.save(openAIKey.trimmingCharacters(in: .whitespaces),
                                        for: AIService.openAIKeyName)
                    saved = true
                }
                if saved {
                    Label("Saved", systemImage: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                }
            }

            Section("About") {
                LabeledContent("App", value: "Memory Master 1.0")
                Text("Training methods based on the Dominic System (Dominic O'Brien) and Mind Mapping (Tony Buzan). Spaced repetition uses the SM-2 algorithm.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .navigationTitle("Settings")
        .onAppear {
            anthropicKey = KeychainHelper.read(AIService.anthropicKeyName)
            openAIKey = KeychainHelper.read(AIService.openAIKeyName)
        }
    }
}
