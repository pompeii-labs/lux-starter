import Foundation

struct LabConfiguration: Codable, Equatable, Sendable {
    var projectURL: String
    var publishableKey: String

    static let localDefault = LabConfiguration(
        projectURL: "http://127.0.0.1:5890",
        publishableKey: ""
    )

    var isUsable: Bool {
        guard let components = URLComponents(string: projectURL),
              let scheme = components.scheme?.lowercased(),
              let host = components.host,
              !host.isEmpty,
              ["http", "https"].contains(scheme)
        else { return false }
        return publishableKey.hasPrefix("lux_pub_")
    }

    var displayKey: String {
        guard !publishableKey.isEmpty else { return "Not configured" }
        let suffix = publishableKey.suffix(8)
        return "lux_pub_…\(suffix)"
    }
}
