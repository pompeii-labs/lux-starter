import Lux
import UIKit
@preconcurrency import UserNotifications

final class AppDelegate: NSObject, UIApplicationDelegate, @preconcurrency UNUserNotificationCenterDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        UNUserNotificationCenter.current().delegate = self
        if let payload = launchOptions?[.remoteNotification] as? [AnyHashable: Any] {
            Task { @MainActor in LabPlatform.shared.recordRemoteNotification(payload, source: "launch") }
        }
        return true
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        Task { @MainActor in
            await LabPlatform.shared.reconcileDeliveredNotifications()
        }
    }

    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        Task { @MainActor in await LabPlatform.shared.register(deviceToken: deviceToken) }
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        Task { @MainActor in
            LabPlatform.shared.record("APNs system registration failed", detail: error.localizedDescription)
        }
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification
    ) async -> UNNotificationPresentationOptions {
        await MainActor.run {
            LabPlatform.shared.recordRemoteNotification(
                notification.request.content.userInfo,
                source: "foreground",
                requestID: notification.request.identifier
            )
        }
        try? await center.setBadgeCount(0)
        return [.banner, .list, .sound]
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse
    ) async {
        await MainActor.run {
            LabPlatform.shared.recordRemoteNotification(
                response.notification.request.content.userInfo,
                source: "tap · \(response.actionIdentifier)",
                requestID: response.notification.request.identifier
            )
        }
        try? await center.setBadgeCount(0)
    }

    func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable: Any],
        fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        Task { @MainActor in
            LabPlatform.shared.recordRemoteNotification(userInfo, source: "background")
            completionHandler(.noData)
        }
    }
}
