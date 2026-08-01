import SwiftUI

@main
struct LuxLabApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @State private var platform = LabPlatform.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(platform)
                .task {
                    guard platform.project != nil else { return }
                    platform.perform("session restored") { try await platform.restore() }
                }
        }
    }
}
