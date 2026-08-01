import Foundation
import Lux
import Observation
import UIKit

struct LabEvent: Identifiable, Equatable {
    let id = UUID()
    let date: Date
    let name: String
    let detail: String?
}

struct LabPushReceipt: Identifiable, Equatable {
    let id = UUID()
    let date: Date
    let title: String
    let body: String
    let source: String
    let dataKeys: [String]
}

enum LabPlatformError: LocalizedError {
    case notConfigured

    var errorDescription: String? {
        "Configure a Lux project URL and publishable key first."
    }
}

@MainActor
@Observable
final class LabPlatform {
    static let shared = LabPlatform()

    private static let configurationKey = "lux-lab.configuration"

    var configuration: LabConfiguration
    private(set) var project: LuxProject?
    private(set) var events: [LabEvent] = []
    private(set) var receivedPushes: [LabPushReceipt] = []
    private(set) var devices: [LuxPushDevice] = []
    private(set) var lastError: String?
    private(set) var isBusy = false

    @ObservationIgnored
    private var authEventsTask: Task<Void, Never>?

    private init(defaults: UserDefaults = .standard) {
        if let data = defaults.data(forKey: Self.configurationKey),
           let stored = try? JSONDecoder().decode(LabConfiguration.self, from: data) {
            configuration = stored
        } else {
            configuration = .localDefault
        }
        configureProject()
    }

    func saveConfiguration(_ configuration: LabConfiguration) {
        self.configuration = configuration
        if let data = try? JSONEncoder().encode(configuration) {
            UserDefaults.standard.set(data, forKey: Self.configurationKey)
        }
        configureProject()
    }

    func clearConfiguration() {
        UserDefaults.standard.removeObject(forKey: Self.configurationKey)
        configuration = .localDefault
        authEventsTask?.cancel()
        authEventsTask = nil
        project = nil
        devices = []
        lastError = nil
        record("configuration cleared")
    }

    func requireProject() throws -> LuxProject {
        guard let project else { throw LabPlatformError.notConfigured }
        return project
    }

    func perform(_ name: String, operation: @escaping @MainActor () async throws -> Void) {
        guard !isBusy else { return }
        isBusy = true
        lastError = nil
        Task { @MainActor in
            defer { isBusy = false }
            do {
                try await operation()
                record(name)
            } catch {
                lastError = error.localizedDescription
                record("\(name) failed", detail: error.localizedDescription)
            }
        }
    }

    func restore() async throws {
        let project = try requireProject()
        _ = try await project.auth.restoreSession()
        _ = await project.push.refreshAuthorizationStatus()
        if project.auth.isAuthenticated {
            try? await refreshDevices()
        }
    }

    func refreshDevices() async throws {
        let project = try requireProject()
        devices = try await project.push.devices()
    }

    func clearDevices() {
        devices = []
    }

    func register(deviceToken: Data) async {
        do {
            let project = try requireProject()
            try await project.push.register(
                deviceToken: deviceToken,
                appID: Bundle.main.bundleIdentifier ?? "dev.luxdb.lab"
            )
            record("APNs token received", detail: project.auth.isAuthenticated ? "registered" : "pending sign-in")
            if project.auth.isAuthenticated { try? await refreshDevices() }
        } catch {
            lastError = error.localizedDescription
            record("APNs registration failed", detail: error.localizedDescription)
        }
    }

    func recordRemoteNotification(_ userInfo: [AnyHashable: Any], source: String) {
        let payload = LuxPushPayload(userInfo: userInfo)
        receivedPushes.insert(
            LabPushReceipt(
                date: Date(),
                title: payload.alert.title ?? "Untitled notification",
                body: payload.alert.body ?? "",
                source: source,
                dataKeys: payload.data.keys.sorted()
            ),
            at: 0
        )
        receivedPushes = Array(receivedPushes.prefix(50))
        record("push received", detail: source)
    }

    func record(_ name: String, detail: String? = nil) {
        events.insert(LabEvent(date: Date(), name: name, detail: detail), at: 0)
        events = Array(events.prefix(100))
    }

    private func configureProject() {
        authEventsTask?.cancel()
        authEventsTask = nil
        project = nil
        devices = []
        lastError = nil

        guard configuration.isUsable else { return }
        do {
            let configured = try LuxProject(
                url: configuration.projectURL,
                publishableKey: configuration.publishableKey,
                presentationAnchor: Self.presentationAnchor
            )
            project = configured
            authEventsTask = Task { @MainActor [weak self, auth = configured.auth] in
                for await event in auth.events() {
                    guard let self else { return }
                    self.record(Self.name(for: event))
                    if auth.isAuthenticated { try? await self.refreshDevices() }
                    else { self.devices = [] }
                }
            }
            record("project configured", detail: configuration.projectURL)
        } catch {
            lastError = error.localizedDescription
            record("configuration rejected", detail: error.localizedDescription)
        }
    }

    private static func presentationAnchor() -> UIWindow? {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap(\.windows)
            .first(where: \.isKeyWindow)
    }

    private static func name(for event: LuxAuthEvent) -> String {
        switch event {
        case .initialSession(let session): session == nil ? "initial session · signed out" : "initial session · restored"
        case .signedIn: "signed in"
        case .tokenRefreshed: "token refreshed"
        case .userUpdated: "user updated"
        case .signedOut: "signed out"
        }
    }
}
