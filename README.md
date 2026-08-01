# Lux Lab

Lux Lab is the permanent full-stack proving ground for Lux. It runs real
client applications against a real CLI-managed Lux project so unreleased
engine and SDK changes can be exercised before they are merged or published.

This repository is deliberately a skinny monorepo:

```text
apps/ios   SwiftUI device lab using the sibling lux-swift checkout
apps/web   SvelteKit browser-auth lab using the public TypeScript SDK
apps/api   Bun/Hono trusted controller using the Lux secret key
lux        The actual project consumed by `lux start`, migrations, and Studio
```

The first validation surface is **Auth + Push**. Database application APIs,
realtime, storage, vectors, and other Lux features can be added as focused labs
later without changing the repository shape.

## Security boundaries

| Surface | Credential | Responsibility |
| --- | --- | --- |
| iOS | Publishable key + user JWT | Native/web auth, durable session lifecycle, APNs registration |
| Web | Publishable key + user JWT | Browser OAuth, SSR cookie persistence, session lifecycle |
| API | Secret key | Engine diagnostics, device inspection, test notification sending |
| Studio/CLI | Operator credential | Local project configuration and administration |

No secret key, APNs token, OAuth token, P8 key, or tunnel credential belongs in
the iOS or browser application, source control, logs, or verification reports.

## Prerequisites

- Docker Desktop
- Bun
- Xcode 16 or newer
- XcodeGen (`brew install xcodegen`)
- The Lux CLI built or installed
- Sibling checkouts at `../lux` and `../lux-swift` when validating unreleased work

## Local stack

The project pins `ghcr.io/lux-db/lux:pr-validation`. Build the current engine
stack into that local tag before booting Lux Lab:

```sh
docker build -t ghcr.io/lux-db/lux:pr-validation ../lux
lux start
lux status
```

`lux start` creates the ignored local profile and `.env.local`, applies the
committed migrations, starts the engine on `127.0.0.1:5890`, and starts Studio.
It does not use a hand-written Compose substitute.

Synchronize the generated local profile into the ignored app env files:

```sh
bun run env:local
```

The script copies only the publishable key into `apps/web/.env`, keeps the
secret key in `apps/api/.env`, and creates a separate random
`LAB_CONTROLLER_KEY` for privileged lab API routes. It never prints any of
those values.

## Web and API

```sh
bun install
bun run dev
```

| Service | URL |
| --- | --- |
| SvelteKit | http://localhost:5174 |
| Hono controller | http://localhost:3000/v1 |
| Lux engine | http://localhost:5890 |
| Lux Studio | Printed by `lux start` |

The browser callback URL is `http://localhost:5174/auth/callback`. Configure it
in the Lux provider redirect allow-list. Provider consoles continue to point at
the engine callback URL.

## iOS

The Xcode project is generated from `apps/ios/project.yml` and resolves Lux from
the sibling `../lux-swift` checkout:

```sh
bun run ios:generate
open apps/ios/LuxLab.xcodeproj
```

Simulator builds can use `http://127.0.0.1:5890`. A physical iPhone must use a
trusted HTTPS URL. Route a stable development hostname to the loopback-bound
engine with a tunnel; do not expose Studio or weaken Lux Swift's HTTP policy.
See [`infra/tunnel/README.md`](infra/tunnel/README.md) for the intended boundary.

Configure the project URL and publishable key inside Lux Lab. They are stored in
the app's local preferences and can be cleared from the Diagnostics screen.

## Verification

Run the automated gates:

```sh
bun test
bun run check
bun run build
bun run ios:build
bun run smoke:local
```

Then complete [verification/auth-push.md](verification/auth-push.md) on a
physical iPhone. Record the exact engine and SDK commits under
`verification/runs/`; redact every credential and device token.

## Local and Cloud parity

Lux Lab is environment-driven. The same iOS, web, and API code should be run
against both the dedicated local project and a dedicated Lux Cloud project.
Changing environments changes URLs and keys only; it must not fork application
behavior.
