import Testing
@testable import LuxLab

struct LabConfigurationTests {
    @Test func acceptsLocalAndHTTPSProjectsWithPublishableKeys() {
        #expect(LabConfiguration(projectURL: "http://127.0.0.1:5890", publishableKey: "lux_pub_local_test").isUsable)
        #expect(LabConfiguration(projectURL: "https://engine.lab.luxdb.dev", publishableKey: "lux_pub_cloud_test").isUsable)
    }

    @Test func rejectsSecretKeysAndMalformedURLs() {
        #expect(!LabConfiguration(projectURL: "https://engine.lab.luxdb.dev", publishableKey: "lux_sec_nope").isUsable)
        #expect(!LabConfiguration(projectURL: "not a url", publishableKey: "lux_pub_test").isUsable)
    }

    @Test func displayKeyNeverReturnsTheWholeCredential() {
        let configuration = LabConfiguration(projectURL: "https://engine.lab.luxdb.dev", publishableKey: "lux_pub_1234567890abcdef")
        #expect(configuration.displayKey == "lux_pub_…90abcdef")
    }
}
