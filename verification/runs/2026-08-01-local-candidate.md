# 2026-08-01 local candidate

## Candidate

- Engine: `7df31770c4839be183f70306f61abd5284d9f353`
  (`chore/engine-0.37.0`)
- Lux Swift: `c1dcc28404e87964a636208be70f67bb687b0675`
  (`feat/swift-auth-push-docs`)
- Lux Lab: this `feat/lux-lab` commit (record its immutable remote SHA after
  the branch is published)
- Engine profile: CLI-managed local project using the locally built
  `ghcr.io/lux-db/lux:pr-validation` image
- Device: not yet run; the paired iPhones were unavailable to Xcode

No credentials, sessions, device tokens, or notification payloads are included
in this record.

## Automated gates

- [x] Full candidate engine unit, integration, reliability, and doc-test suite
  completed with no failures.
- [x] Lux Swift package completed 41 tests across 6 suites with no failures.
- [x] Lux Lab API tests completed 3 tests with no failures.
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

## Physical-device gate

- [ ] Install a signed Lux Lab build on a physical iPhone through the stable
  trusted HTTPS engine hostname.
- [ ] Complete native Apple, Google PKCE, GitHub PKCE, password, anonymous,
  refresh, restoration, cancellation, and remote sign-out checks.
- [ ] Complete APNs foreground, background, terminated, rich image, token
  rotation, sign-out cleanup, and next-user re-registration checks.

The engine and Lux Swift stacks are not cleared for merge by this record until
the physical-device items pass or their supported scope is explicitly changed.
