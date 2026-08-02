# 2026-08-01 local candidate

## Candidate

- Engine: `7df31770c4839be183f70306f61abd5284d9f353`
  (`chore/engine-0.37.0`)
- Lux Swift: `3b79f96d6f4075354a0e60d971fc0718af833ea6`
  (`fix/swift-1-1-hardening`)
- Lux Lab: this `feat/lux-lab` commit (record its immutable remote SHA after
  the branch is published)
- Engine profile: CLI-managed local project using the locally built
  `ghcr.io/lux-db/lux:pr-validation` image
- Device: iPhone 17 running iOS 26.5.2, using a signed development build
- Device connection: explicit `.localDevelopment` policy over a trusted private
  LAN to the CLI-managed engine; no ad-hoc proxy

No credentials, sessions, device tokens, or notification payloads are included
in this record.

## Automated gates

- [x] Full candidate engine unit, integration, reliability, and doc-test suite
  completed with no failures.
- [x] Lux Swift package completed 48 tests across 6 suites with no failures.
- [x] The 1.1 candidate introduced no breaking changes from the `1.0.0`
  public API.
- [x] Lux Swift built for iOS Simulator, generated DocC, and type-checked the
  application and notification-service samples.
- [x] Lux Lab completed 16 Bun tests with no failures, including 4 API tests.
- [x] Lux Lab completed 4 iOS tests across 2 suites with no failures.
- [x] Svelte and TypeScript checks completed with 0 errors and 0 warnings.
- [x] Web and API production builds completed.
- [x] Lux Lab and its notification service extension built for a generic iOS
  simulator against the sibling candidate Lux Swift checkout.
- [x] Engine `0.37.0` responded from the CLI-managed project.
- [x] Migration `20260801000000_lab_marker` was applied exactly once.
- [x] Custom-scheme OAuth without PKCE was rejected.
- [x] Email signup returned a complete session and the test user was deleted.
- [x] A user JWT registered, listed, and deleted only its own sandbox APNs token.
- [x] Sign-out revoked the candidate session.
- [x] The trusted Hono controller reached redacted health and protected push
  administration routes without exposing its credential.
- [x] Candidate source files contain no private key or committed Lux secret.

## Physical-device results

- [x] Installed and repeatedly upgraded a signed Lux Lab build on the device.
- [x] Connected directly to the candidate engine through the SDK's explicit
  private-LAN development policy; the default policy still rejects public HTTP.
- [x] Anonymous sign-in succeeded.
- [x] Notification permission was reported as authorized.
- [x] The APNs token was retained while signed out and associated after sign-in.
- [x] The server row used `dev.luxdb.lab` and the APNs sandbox environment.
- [x] Authenticated self-send validated the user token in the lab API and kept
  all controller credentials outside the iOS app.
- [x] Foreground, background, and force-terminated notification delivery passed.
- [x] Sound, badge, category, thread, interruption-level, and custom-data fields
  were included in physical deliveries.
- [x] A valid HTTPS image was downloaded and displayed by the notification
  service extension.
- [x] Physical sign-out removed the server device row (one to zero).
- [x] A later anonymous sign-in re-associated the retained token (zero to one).
- [ ] Confirm the corrected app-active badge reset and persisted Diagnostics
  receipt using a fresh notification on the latest installed build.
- [ ] Confirm Keychain restoration after force-quit and manual token refresh.
- [ ] Complete native Apple authorization, including a repeat authorization.
- [ ] Complete native password sign-in.
- [ ] Complete Google and GitHub PKCE through a public HTTPS callback.
- [ ] Complete native OAuth cancellation.
- [ ] Physically exercise invalid/oversized image fallback and APNs token
  rotation. Both remain covered by automated contract tests only.

The engine and Lux Swift stacks are not cleared for merge by this record until
the physical-device items pass or their supported scope is explicitly changed.
