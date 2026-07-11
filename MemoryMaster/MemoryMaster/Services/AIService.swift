import Foundation

enum AIError: LocalizedError {
    case missingKey(String)
    case badResponse(String)

    var errorDescription: String? {
        switch self {
        case .missingKey(let provider):
            return "No \(provider) API key set. Add one in Settings."
        case .badResponse(let message):
            return message
        }
    }
}

/// Calls the Anthropic Messages API (text: mnemonics, Dominic suggestions)
/// and the OpenAI Images API (Dominic person/action pictures).
enum AIService {

    static let anthropicKeyName = "anthropic_api_key"
    static let openAIKeyName = "openai_api_key"

    // MARK: - Claude text generation

    private static func askClaude(system: String, prompt: String, maxTokens: Int = 1024) async throws -> String {
        let key = KeychainHelper.read(anthropicKeyName)
        guard !key.isEmpty else { throw AIError.missingKey("Anthropic") }

        var request = URLRequest(url: URL(string: "https://api.anthropic.com/v1/messages")!)
        request.httpMethod = "POST"
        request.setValue(key, forHTTPHeaderField: "x-api-key")
        request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 120

        let body: [String: Any] = [
            "model": "claude-opus-4-8",
            "max_tokens": maxTokens,
            "system": system,
            "messages": [["role": "user", "content": prompt]],
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            let text = String(decoding: data, as: UTF8.self)
            throw AIError.badResponse("Claude API error: \(text.prefix(300))")
        }

        guard
            let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
            let content = json["content"] as? [[String: Any]]
        else {
            throw AIError.badResponse("Unexpected Claude API response format.")
        }
        // Concatenate text blocks; skip thinking or other block types.
        let text = content.compactMap { block -> String? in
            guard block["type"] as? String == "text" else { return nil }
            return block["text"] as? String
        }.joined()
        guard !text.isEmpty else {
            throw AIError.badResponse("Claude returned no text (stop_reason: \(json["stop_reason"] as? String ?? "unknown")).")
        }
        return text.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    /// Generate a mnemonic for arbitrary study material.
    static func generateMnemonic(front: String, back: String) async throws -> String {
        try await askClaude(
            system: """
            You are a memory coach trained in Tony Buzan and Dominic O'Brien techniques. \
            Create one short, vivid mnemonic to remember the given fact. Prefer, in order: \
            a concrete visual image or mini-story, an acronym, or a rhyme. If the answer \
            contains numbers, encode them with the Dominic System \
            (1=A 2=B 3=C 4=D 5=E 6=S 7=G 8=H 9=N 0=O; pairs become a famous person's \
            initials plus their action). Reply with the mnemonic only, 1-3 sentences, \
            no preamble.
            """,
            prompt: "Question/cue: \(front)\nAnswer to remember: \(back)"
        )
    }

    /// Suggest a person + action for a Dominic pair.
    static func suggestDominicPair(number: String, letters: String) async throws -> (person: String, action: String) {
        let text = try await askClaude(
            system: """
            You help build a Dominic System table. Given a two-digit number and its \
            letter pair, suggest one globally famous person (real or fictional) whose \
            initials match the letters, plus their single most iconic, visually vivid \
            action. Reply in exactly two lines:
            PERSON: <name>
            ACTION: <action, present participle phrase>
            """,
            prompt: "Number: \(number)\nLetters: \(letters)"
        )
        var person = "", action = ""
        for line in text.split(separator: "\n") {
            let l = line.trimmingCharacters(in: .whitespaces)
            if l.uppercased().hasPrefix("PERSON:") {
                person = String(l.dropFirst("PERSON:".count)).trimmingCharacters(in: .whitespaces)
            } else if l.uppercased().hasPrefix("ACTION:") {
                action = String(l.dropFirst("ACTION:".count)).trimmingCharacters(in: .whitespaces)
            }
        }
        guard !person.isEmpty else { throw AIError.badResponse("Could not parse suggestion:\n\(text)") }
        return (person, action)
    }

    // MARK: - Image generation (OpenAI)

    /// Generate a memorable cartoon image for a Dominic person + action.
    static func generateDominicImage(person: String, action: String) async throws -> Data {
        let key = KeychainHelper.read(openAIKeyName)
        guard !key.isEmpty else { throw AIError.missingKey("OpenAI") }

        var request = URLRequest(url: URL(string: "https://api.openai.com/v1/images/generations")!)
        request.httpMethod = "POST"
        request.setValue("Bearer \(key)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 180

        let prompt = """
        A vivid, colorful, slightly exaggerated cartoon illustration of \(person) \(action). \
        Bold outlines, bright colors, single clear subject, plain background. \
        Designed to be instantly memorable as a mnemonic image.
        """
        let body: [String: Any] = [
            "model": "gpt-image-1",
            "prompt": prompt,
            "size": "1024x1024",
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            let text = String(decoding: data, as: UTF8.self)
            throw AIError.badResponse("Image API error: \(text.prefix(300))")
        }
        guard
            let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
            let items = json["data"] as? [[String: Any]],
            let b64 = items.first?["b64_json"] as? String,
            let imageData = Data(base64Encoded: b64)
        else {
            throw AIError.badResponse("Unexpected image API response format.")
        }
        return imageData
    }
}
