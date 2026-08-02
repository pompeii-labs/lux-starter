import SwiftUI

@main
struct LuxLabApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @Environment(\.scenePhase) private var scenePhase
    @State private var platform = LabPlatform.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(platform)
                .task {
                    await platform.reconcileDeliveredNotifications()
                    guard platform.project != nil else { return }
                    platform.perform("session restored") { try await platform.restore() }
                }
                .onChange(of: scenePhase) { _, phase in
                    guard phase == .active else { return }
                    Task { await platform.reconcileDeliveredNotifications() }
                }
        }
    }
}
