import SwiftUI
import UserNotifications

struct SettingsView: View {
    // API keys
    @State private var anthropicKey = ""
    @State private var openAIKey = ""
    @State private var saved = false

    // Daily reminder
    @AppStorage("reminderEnabled") private var reminderEnabled = false
    @AppStorage("reminderHour")    private var reminderHour    = 9
    @AppStorage("reminderMinute")  private var reminderMinute  = 0

    // Default session lengths per discipline
    @AppStorage("defaultItems_Numbers")       private var defaultNumbers = 20
    @AppStorage("defaultItems_Binary")        private var defaultBinary  = 20
    @AppStorage("defaultItems_Words")         private var defaultWords   = 10
    @AppStorage("defaultItems_Cards")         private var defaultCards   = 10
    @AppStorage("defaultItems_Names & Faces") private var defaultNames   = 6
    @AppStorage("defaultItems_Images")        private var defaultImages  = 10
    @AppStorage("defaultItems_Historic Dates") private var defaultDates  = 10

    /// Computed date binding so DatePicker writes back to AppStorage ints.
    private var reminderDate: Binding<Date> {
        Binding {
            var c = DateComponents()
            c.hour = reminderHour; c.minute = reminderMinute
            return Calendar.current.date(from: c) ?? Date()
        } set: { date in
            let c = Calendar.current.dateComponents([.hour, .minute], from: date)
            reminderHour   = c.hour   ?? 9
            reminderMinute = c.minute ?? 0
            if reminderEnabled { scheduleReminder() }
        }
    }

    var body: some View {
        Form {
            // MARK: Daily reminder
            Section {
                Toggle("Daily practice reminder", isOn: $reminderEnabled)
                    .onChange(of: reminderEnabled) { _, enabled in
                        enabled ? requestAndSchedule() : cancelReminder()
                    }
                if reminderEnabled {
                    DatePicker("Reminder time",
                               selection: reminderDate,
                               displayedComponents: .hourAndMinute)
                }
            } header: {
                Text("Reminder")
            } footer: {
                Text("Sends a daily notification at the chosen time. Requires notification permissions.")
            }

            // MARK: Default session lengths
            Section {
                Stepper("Numbers: \(defaultNumbers)",  value: $defaultNumbers,  in: 4...200, step: 10)
                Stepper("Binary: \(defaultBinary)",    value: $defaultBinary,   in: 8...40,  step: 4)
                Stepper("Words: \(defaultWords)",      value: $defaultWords,    in: 4...50,  step: 2)
                Stepper("Cards: \(defaultCards)",      value: $defaultCards,    in: 5...20,  step: 1)
                Stepper("Names: \(defaultNames)",      value: $defaultNames,    in: 4...16,  step: 2)
                Stepper("Images: \(defaultImages)",    value: $defaultImages,   in: 4...30,  step: 2)
                Stepper("Historic Dates: \(defaultDates)", value: $defaultDates, in: 4...50, step: 2)
            } header: {
                Text("Default Session Length")
            } footer: {
                Text("Starting item count when you open a new training session.")
            }

            // MARK: API keys
            Section {
                SecureField("sk-ant-…", text: $anthropicKey)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
            } header: {
                Text("Anthropic API Key")
            } footer: {
                Text("Used for mnemonic generation and Dominic pair suggestions (Claude). Get a key at console.anthropic.com. Stored in the iOS Keychain.")
            }

            Section {
                SecureField("sk-…", text: $openAIKey)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
            } header: {
                Text("OpenAI API Key")
            } footer: {
                Text("Used to generate mnemonic pictures for Dominic persons and actions. Get a key at platform.openai.com. Stored in the iOS Keychain.")
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

            // MARK: About
            Section("About") {
                LabeledContent("Version", value: "1.0")
                LabeledContent("Build",   value: "1")
                Text("Training methods based on the Dominic System (Dominic O'Brien) and Mind Mapping (Tony Buzan). Spaced repetition uses the SM-2 algorithm.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .navigationTitle("Settings")
        .onAppear {
            anthropicKey = KeychainHelper.read(AIService.anthropicKeyName)
            openAIKey    = KeychainHelper.read(AIService.openAIKeyName)
        }
    }

    // MARK: - Notification helpers

    private func requestAndSchedule() {
        UNUserNotificationCenter.current()
            .requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
                DispatchQueue.main.async {
                    if granted { scheduleReminder() }
                    else { reminderEnabled = false }
                }
            }
    }

    private func scheduleReminder() {
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: ["daily-reminder"])
        let content = UNMutableNotificationContent()
        content.title = "Time to train! 🧠"
        content.body  = "Your daily Memory Master session is waiting."
        content.sound = .default
        var comps = DateComponents()
        comps.hour   = reminderHour
        comps.minute = reminderMinute
        let trigger = UNCalendarNotificationTrigger(dateMatching: comps, repeats: true)
        let request = UNNotificationRequest(identifier: "daily-reminder",
                                            content: content,
                                            trigger: trigger)
        center.add(request)
    }

    private func cancelReminder() {
        UNUserNotificationCenter.current()
            .removePendingNotificationRequests(withIdentifiers: ["daily-reminder"])
    }
}
