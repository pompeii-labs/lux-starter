import Foundation
import Lux

struct LabConfiguration: Codable, Equatable, Sendable {
    var projectURL: String
    var publishableKey: String
    var apiURL: String = "http://127.0.0.1:15892"

    static let localDefault = LabConfiguration(
        projectURL: "http://127.0.0.1:15890",
        publishableKey: "",
        apiURL: "http://127.0.0.1:15892"
    )

    static var appDefault: LabConfiguration {
        let bundled = LabConfiguration(
            projectURL: Bundle.main.object(forInfoDictionaryKey: "LuxLabProjectURL") as? String ?? "",
            publishableKey: Bundle.main.object(forInfoDictionaryKey: "LuxLabPublishableKey") as? String ?? "",
            apiURL: Bundle.main.object(forInfoDictionaryKey: "LuxLabAPIURL") as? String ?? ""
        )
        return bundled.isUsable ? bundled : localDefault
    }

    var isUsable: Bool {
        guard publishableKey.hasPrefix("lux_pub_") else { return false }
        return (try? LuxClient(
            url: projectURL,
            publishableKey: publishableKey,
            networkPolicy: .localDevelopment
        )) != nil && (try? LuxClient(
            url: apiURL,
            publishableKey: "lux_pub_lab_validation",
            networkPolicy: .localDevelopment
        )) != nil
    }

    var displayKey: String {
        guard !publishableKey.isEmpty else { return "Not configured" }
        let suffix = publishableKey.suffix(8)
        return "lux_pub_…\(suffix)"
    }
}
