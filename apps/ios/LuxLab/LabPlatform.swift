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

struct LabPushReceipt: Identifiable, Codable, Equatable {
    let id: String
    let date: Date
    let title: String
    let body: String
    let source: String
    let dataKeys: [String]
}

enum LabPlatformError: LocalizedError {
    case notConfigured
    case invalidAPIResponse

    var errorDescription: String? {
        switch self {
        case .notConfigured: "Configure the Lux project and lab API first."
        case .invalidAPIResponse: "The Lux Lab API returned an invalid response."
        }
    }
}

@MainActor
@Observable
final class LabPlatform {
    static let shared = LabPlatform()

    private static let configurationKey = "lux-lab.configuration"
    private static let receivedPushesKey = "lux-lab.received-pushes"

    var configuration: LabConfiguration
    private(set) var project: LuxProject?
    private(set) var events: [LabEvent] = []
    private(set) var receivedPushes: [LabPushReceipt] = []
    private(set) var devices: [LuxPushDevice] = []
    private(set) var lastError: String?
    private(set) var isBusy = false

    @ObservationIgnored
    private var authEventsTask: Task<Void, Never>?
    @ObservationIgnored
    private let defaults: UserDefaults

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        if let data = defaults.data(forKey: Self.configurationKey),
           let stored = try? JSONDecoder().decode(LabConfiguration.self, from: data) {
            configuration = stored
        } else {
            configuration = .appDefault
        }
        if let data = defaults.data(forKey: Self.receivedPushesKey),
           let stored = try? JSONDecoder().decode([LabPushReceipt].self, from: data) {
            receivedPushes = Array(stored.prefix(50))
        }
        configureProject()
    }

    func saveConfiguration(_ configuration: LabConfiguration) {
        self.configuration = configuration
        if let data = try? JSONEncoder().encode(configuration) {
            defaults.set(data, forKey: Self.configurationKey)
        }
        configureProject()
    }

    func clearConfiguration() {
        defaults.removeObject(forKey: Self.configurationKey)
        configuration = .appDefault
        authEventsTask?.cancel()
        authEventsTask = nil
        configureProject()
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
        var restorationError: Error?
        do {
            _ = try await project.auth.restoreSession()
        } catch {
            restorationError = error
        }
        let status = await project.push.refreshAuthorizationStatus()
        switch status {
        case .authorized, .provisional, .ephemeral:
            project.push.registerForRemoteNotifications()
        case .notDetermined, .denied:
            break
        }
        if project.auth.isAuthenticated {
            try? await refreshDevices()
        }
        if let restorationError { throw restorationError }
    }

    func refreshDevices() async throws {
        let project = try requireProject()
        devices = try await project.push.devices()
    }

    func reconcileDeliveredNotifications() async {
        let center = UNUserNotificationCenter.current()
        do {
            try await center.setBadgeCount(0)
        } catch {
            record("badge reset failed", detail: error.localizedDescription)
        }
        let delivered = await center.deliveredNotifications()
        for notification in delivered {
            recordRemoteNotification(
                notification.request.content.userInfo,
                source: "notification center",
                requestID: notification.request.identifier
            )
        }
    }

    func sendTestPush() async throws {
        let project = try requireProject()
        let accessToken = try await project.auth.accessToken()
        guard let baseURL = URL(string: configuration.apiURL) else {
            throw LabPlatformError.notConfigured
        }
        var request = URLRequest(url: baseURL.appending(path: "v1/me/push"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        request.httpBody = try JSONSerialization.data(withJSONObject: [
            "notification": [
                "title": "Lux Lab",
                "body": "Authenticated APNs delivery works.",
                "sound": "default",
                "badge": 1,
                "thread_id": "lux-lab",
                "interruption_level": "active",
                "data": ["source": "ios-self-test"]
            ]
        ])
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw LabPlatformError.invalidAPIResponse
        }
        guard (200..<300).contains(http.statusCode) else {
            let message = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])?["error"] as? String
            throw LuxError(code: "LAB_PUSH_FAILED", message: message ?? "Test push failed with HTTP \(http.statusCode)")
        }
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

    func recordRemoteNotification(
        _ userInfo: [AnyHashable: Any],
        source: String,
        requestID: String? = nil
    ) {
        let id = requestID ?? UUID().uuidString
        guard !receivedPushes.contains(where: { $0.id == id }) else { return }
        let payload = LuxPushPayload(userInfo: userInfo)
        receivedPushes.insert(
            LabPushReceipt(
                id: id,
                date: Date(),
                title: payload.alert.title ?? "Untitled notification",
                body: payload.alert.body ?? "",
                source: source,
                dataKeys: payload.data.keys.sorted()
            ),
            at: 0
        )
        receivedPushes = Array(receivedPushes.prefix(50))
        persistReceivedPushes()
        record("push received", detail: source)
    }

    func clearReceivedPushes() {
        receivedPushes = []
        defaults.removeObject(forKey: Self.receivedPushesKey)
        record("push history cleared")
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
                networkPolicy: .localDevelopment,
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

    private func persistReceivedPushes() {
        guard let data = try? JSONEncoder().encode(receivedPushes) else { return }
        defaults.set(data, forKey: Self.receivedPushesKey)
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
