# Auth + Push pre-merge verification

Create a dated record under `verification/runs/` containing the engine SHA,
Lux Swift SHA, Lux Lab SHA, device/iOS version, environment, and pass/fail for
every item. Never paste tokens, keys, provider secrets, device tokens, or full
notification payloads into the record.

## Automated gates

- [ ] Engine unit and integration suites pass on the candidate stack.
- [ ] `swift test` passes in `../lux-swift`.
- [ ] The Lux package builds for a generic iOS simulator.
- [ ] `bun test` passes in Lux Lab.
- [ ] `bun run check` passes in Lux Lab.
- [ ] `bun run build` passes in Lux Lab.
- [ ] `bun run ios:build` passes against the candidate Lux Swift checkout.
- [ ] `lux status` reports the pinned candidate image and a healthy engine.
- [ ] `lux migrate status` shows `20260801000000_lab_marker` applied exactly once.

## Browser Auth

- [ ] Clean browser profile begins signed out.
- [ ] Email signup creates a user without exposing session tokens.
- [ ] Password sign-in and sign-out work.
- [ ] Anonymous sign-in works.
- [ ] Apple web OAuth returns through `/auth/callback`.
- [ ] Google OAuth returns through `/auth/callback`.
- [ ] GitHub OAuth returns through `/auth/callback`.
- [ ] Refresh survives SSR navigation and cookie restoration.
- [ ] OAuth cancellation leaves the browser signed out.

## Native Auth on a physical iPhone

- [ ] The app connects through trusted HTTPS, never insecure LAN HTTP.
- [ ] A clean install begins signed out.
- [ ] Email signup and password sign-in work.
- [ ] Anonymous sign-in works.
- [ ] Native Sign in with Apple works on first and repeat authorization.
- [ ] Google returns through `lux-lab://auth/callback` using PKCE.
- [ ] GitHub returns through `lux-lab://auth/callback` using PKCE.
- [ ] Cancelling `ASWebAuthenticationSession` leaves no partial session.
- [ ] Force-quitting and reopening restores the Keychain session.
- [ ] Manual refresh rotates the session successfully.
- [ ] Sign-out revokes the remote session and clears local state.

## PKCE adversarial contract

- [ ] A custom-scheme code flow without a challenge is rejected.
- [ ] A malformed challenge or a non-S256 method is rejected.
- [ ] A missing verifier cannot redeem a challenge-bound code.
- [ ] An incorrect verifier cannot redeem it.
- [ ] Failed verification does not consume the legitimate code.
- [ ] The matching verifier redeems the code exactly once.
- [ ] A second redemption is rejected.

## APNs on a physical iPhone

- [ ] Notification permission state is accurately reported.
- [ ] A token received while signed out is retained as pending.
- [ ] Signing in automatically associates the pending token with that user.
- [ ] The server device row uses `dev.luxdb.lab` and the sandbox environment.
- [ ] Foreground delivery appears in the notification and diagnostics UI.
- [ ] Background delivery arrives.
- [ ] Terminated delivery arrives and is captured after launch/tap.
- [ ] Badge, sound, category, thread, interruption level, and custom data decode.
- [ ] A valid HTTPS image is added by the notification service extension.
- [ ] An invalid or oversized image falls back to the original notification.
- [ ] Sign-out removes the authenticated user's device row.
- [ ] The locally retained token re-registers for the next signed-in user.
- [ ] A rotated token removes the superseded server row.

## Exit criteria

Do not merge the engine or Lux Swift stacks while an unchecked item represents
a supported behavior. A failed item needs either a fix and rerun or an explicit
scope decision recorded beside it.
