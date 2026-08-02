import Lux
import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            NavigationStack { OverviewView() }
                .tabItem { Label("Overview", systemImage: "square.grid.2x2") }
            NavigationStack { AuthLabView() }
                .tabItem { Label("Auth", systemImage: "person.badge.key") }
            NavigationStack { PushLabView() }
                .tabItem { Label("Push", systemImage: "bell.badge") }
            NavigationStack { DiagnosticsView() }
                .tabItem { Label("Diagnostics", systemImage: "waveform.path.ecg") }
        }
        .tint(.purple)
    }
}

private struct OverviewView: View {
    @Environment(LabPlatform.self) private var platform
    @State private var url = ""
    @State private var apiURL = ""
    @State private var key = ""

    var body: some View {
        @Bindable var platform = platform
        Form {
            Section("Active project") {
                LabeledContent("URL", value: platform.configuration.projectURL)
                LabeledContent("Lab API", value: platform.configuration.apiURL)
                LabeledContent("Publishable key", value: platform.configuration.displayKey)
                LabeledContent("SDK", value: "Lux Swift 1.1 candidate")
                LabeledContent("Engine", value: "0.37 candidate")
            }
            Section {
                TextField("https://engine.lab.luxdb.dev", text: $url)
                    .textInputAutocapitalization(.never)
                    .keyboardType(.URL)
                TextField("http://10.0.0.144:15892", text: $apiURL)
                    .textInputAutocapitalization(.never)
                    .keyboardType(.URL)
                TextField("lux_pub_…", text: $key)
                    .textInputAutocapitalization(.never)
                    .privacySensitive()
                Button("Save and reconnect") {
                    platform.saveConfiguration(.init(projectURL: url, publishableKey: key, apiURL: apiURL))
                }
                .disabled(!LabConfiguration(projectURL: url, publishableKey: key, apiURL: apiURL).isUsable)
            } header: {
                Text("Connection")
            } footer: {
                Text("Simulator may use 127.0.0.1. A physical phone may use an explicit trusted-LAN profile or HTTPS; public cleartext URLs and secret keys are rejected by Lux Swift.")
            }
            if let error = platform.lastError {
                Section("Latest error") { Text(error).foregroundStyle(.red) }
            }
        }
        .navigationTitle("Lux Lab")
        .onAppear {
            url = platform.configuration.projectURL
            apiURL = platform.configuration.apiURL
            key = platform.configuration.publishableKey
        }
    }
}

private struct AuthLabView: View {
    @Environment(LabPlatform.self) private var platform
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        Form {
            if let project = platform.project {
                if let user = project.auth.user {
                    Section("Current user") {
                        LabeledContent("ID", value: user.id)
                        LabeledContent("Email", value: user.email ?? "Anonymous")
                        LabeledContent("Anonymous", value: user.isAnonymous == true ? "Yes" : "No")
                    }
                    Section("Session lifecycle") {
                        action("Refresh session", event: "session refreshed") { _ = try await project.auth.refreshSession() }
                        action("Fetch current user", event: "current user fetched") { _ = try await project.auth.getUser() }
                        Button("Sign out", role: .destructive) {
                            platform.perform("sign out completed") { try await project.auth.signOut() }
                        }
                    }
                } else {
                    Section("Email and password") {
                        TextField("Email", text: $email).textInputAutocapitalization(.never).keyboardType(.emailAddress)
                        SecureField("Password", text: $password)
                        action("Create user", event: "email sign-up completed") { _ = try await project.auth.signUp(email: email, password: password) }
                        action("Sign in", event: "password sign-in completed") { _ = try await project.auth.signInWithPassword(email: email, password: password) }
                    }
                    Section("Native and browser providers") {
                        action("Sign in with Apple", event: "Apple sign-in completed") { _ = try await project.auth.signInWithApple() }
                        action("Continue with Google", event: "Google PKCE sign-in completed") {
                            _ = try await project.auth.signInWithOAuth(.google, redirectURL: callbackURL)
                        }
                        action("Continue with GitHub", event: "GitHub PKCE sign-in completed") {
                            _ = try await project.auth.signInWithOAuth(.github, redirectURL: callbackURL)
                        }
                        action("Continue anonymously", event: "anonymous sign-in completed") { _ = try await project.auth.signInAnonymously() }
                    }
                }
            } else {
                ContentUnavailableView("Project not configured", systemImage: "link.badge.plus", description: Text("Add the local or Cloud project on the Overview tab."))
            }
            if let error = platform.lastError { Section("Latest error") { Text(error).foregroundStyle(.red) } }
        }
        .navigationTitle("Authentication")
    }

    private var callbackURL: URL { URL(string: "lux-lab://auth/callback")! }

    private func action(_ title: String, event: String, operation: @escaping @MainActor () async throws -> Void) -> some View {
        Button(title) { platform.perform(event, operation: operation) }.disabled(platform.isBusy)
    }
}

private struct PushLabView: View {
    @Environment(LabPlatform.self) private var platform

    var body: some View {
        Form {
            if let project = platform.project {
                Section("System") {
                    LabeledContent("Permission", value: status(project.push.authorizationStatus))
                    LabeledContent("Local token", value: project.push.registration == nil ? "None" : "Stored")
                    LabeledContent("Server registration", value: project.push.isRegistered ? "Registered" : "Pending")
                    LabeledContent("Environment", value: project.push.registration?.environment.rawValue.isEmpty == false ? project.push.registration!.environment.rawValue : "Unspecified")
                    Button("Request permission and register") {
                        platform.perform("push permission requested") { _ = try await project.push.requestAuthorization() }
                    }.disabled(platform.isBusy)
                    Button("Synchronize registration") {
                        platform.perform("push registration synchronized") { try await project.push.synchronize(); try await platform.refreshDevices() }
                    }.disabled(!project.auth.isAuthenticated || project.push.registration == nil || platform.isBusy)
                    Button("Refresh server devices") {
                        platform.perform("push devices refreshed") { try await platform.refreshDevices() }
                    }.disabled(!project.auth.isAuthenticated || platform.isBusy)
                    Button("Send test push to this user") {
                        platform.perform("test push enqueued") { try await platform.sendTestPush() }
                    }.disabled(!project.auth.isAuthenticated || !project.push.isRegistered || platform.isBusy)
                }
                Section("Authenticated user's devices") {
                    if platform.devices.isEmpty { Text("No server-side device rows").foregroundStyle(.secondary) }
                    ForEach(platform.devices) { device in
                        VStack(alignment: .leading, spacing: 5) {
                            Text(device.appID).font(.headline)
                            Text("\(device.platform) · \(device.environment?.rawValue ?? "unspecified")")
                                .font(.caption).foregroundStyle(.secondary)
                            Text(device.id).font(.caption2.monospaced()).foregroundStyle(.secondary)
                        }
                    }
                }
                Section("Cleanup") {
                    Button("Unregister but retain token") {
                        platform.perform("push unregistered") { try await project.push.unregister(); try await platform.refreshDevices() }
                    }.disabled(!project.auth.isAuthenticated || platform.isBusy)
                    Button("Disable and forget token", role: .destructive) {
                        platform.perform("push disabled") { try await project.push.disable(); platform.clearDevices() }
                    }.disabled(platform.isBusy)
                }
            } else {
                ContentUnavailableView("Project not configured", systemImage: "bell.slash")
            }
        }
        .navigationTitle("Push")
    }

    private func status(_ status: LuxPushAuthorizationStatus) -> String {
        switch status {
        case .notDetermined: "Not determined"
        case .denied: "Denied"
        case .authorized: "Authorized"
        case .provisional: "Provisional"
        case .ephemeral: "Ephemeral"
        }
    }
}

private struct DiagnosticsView: View {
    @Environment(LabPlatform.self) private var platform

    var body: some View {
        List {
            Section("Received notifications") {
                if platform.receivedPushes.isEmpty { Text("No notifications received yet").foregroundStyle(.secondary) }
                ForEach(platform.receivedPushes) { receipt in
                    VStack(alignment: .leading, spacing: 5) {
                        Text(receipt.title).font(.headline)
                        if !receipt.body.isEmpty { Text(receipt.body) }
                        Text("\(receipt.source) · \(receipt.date.formatted(date: .omitted, time: .standard))")
                            .font(.caption).foregroundStyle(.secondary)
                        if !receipt.dataKeys.isEmpty { Text("data: \(receipt.dataKeys.joined(separator: ", "))").font(.caption2.monospaced()) }
                    }
                }
                if !platform.receivedPushes.isEmpty {
                    Button("Clear notification history", role: .destructive) {
                        platform.clearReceivedPushes()
                    }
                }
            }
            Section("SDK timeline") {
                if platform.events.isEmpty { Text("No events yet").foregroundStyle(.secondary) }
                ForEach(platform.events) { event in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(event.name)
                        HStack {
                            Text(event.date.formatted(date: .omitted, time: .standard))
                            if let detail = event.detail { Text(detail).lineLimit(2) }
                        }.font(.caption.monospaced()).foregroundStyle(.secondary)
                    }
                }
            }
            Section {
                Button("Clear project configuration", role: .destructive) { platform.clearConfiguration() }
            } header: {
                Text("Reset")
            } footer: {
                Text("The timeline deliberately records lifecycle names and redacted identifiers only. Tokens and credentials never appear here.")
            }
        }
        .navigationTitle("Diagnostics")
    }
}
