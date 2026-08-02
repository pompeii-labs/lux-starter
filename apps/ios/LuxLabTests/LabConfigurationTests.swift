import Foundation
import Testing
@testable import LuxLab

struct LabConfigurationTests {
    @Test func acceptsLocalAndHTTPSProjectsWithPublishableKeys() {
        #expect(LabConfiguration(projectURL: "http://127.0.0.1:15890", publishableKey: "lux_pub_local_test").isUsable)
        #expect(LabConfiguration(projectURL: "https://engine.lab.luxdb.dev", publishableKey: "lux_pub_cloud_test").isUsable)
    }

    @Test func rejectsSecretKeysAndMalformedURLs() {
        #expect(!LabConfiguration(projectURL: "https://engine.lab.luxdb.dev", publishableKey: "lux_sec_nope").isUsable)
        #expect(!LabConfiguration(projectURL: "not a url", publishableKey: "lux_pub_test").isUsable)
        #expect(!LabConfiguration(projectURL: "http://example.com", publishableKey: "lux_pub_test").isUsable)
        #expect(!LabConfiguration(
            projectURL: "https://engine.lab.luxdb.dev",
            publishableKey: "lux_pub_test",
            apiURL: "http://example.com"
        ).isUsable)
    }

    @Test func displayKeyNeverReturnsTheWholeCredential() {
        let configuration = LabConfiguration(projectURL: "https://engine.lab.luxdb.dev", publishableKey: "lux_pub_1234567890abcdef")
        #expect(configuration.displayKey == "lux_pub_…90abcdef")
    }
}

@MainActor
struct LabPushDiagnosticsTests {
    @Test func persistsAndDeduplicatesObservedNotifications() throws {
        let suiteName = "dev.luxdb.lab.tests.\(UUID().uuidString)"
        let defaults = try #require(UserDefaults(suiteName: suiteName))
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let first = LabPlatform(defaults: defaults)
        let userInfo: [AnyHashable: Any] = [
            "aps": ["alert": ["title": "Lux Lab", "body": "Delivered"]],
            "source": "test",
        ]
        first.recordRemoteNotification(userInfo, source: "foreground", requestID: "request-1")
        first.recordRemoteNotification(userInfo, source: "notification center", requestID: "request-1")
        #expect(first.receivedPushes.count == 1)

        let restored = LabPlatform(defaults: defaults)
        let receipt = try #require(restored.receivedPushes.first)
        #expect(receipt.id == "request-1")
        #expect(receipt.title == "Lux Lab")
        #expect(receipt.body == "Delivered")
        #expect(receipt.source == "foreground")
        #expect(receipt.dataKeys == ["source"])

        restored.clearReceivedPushes()
        #expect(LabPlatform(defaults: defaults).receivedPushes.isEmpty)
    }
}
