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
- XcodeGen and jq (`brew install xcodegen jq`)
- The Lux CLI built or installed
- Sibling checkouts at `../lux` and `../lux-swift` when validating unreleased work

## Local stack

The project pins `ghcr.io/lux-db/lux:pr-validation`. Build the current engine
stack into that local tag before booting Lux Lab:

```sh
docker build -t ghcr.io/lux-db/lux:pr-validation ../lux
lux start --http-port 15890 --resp-port 15894
lux env use local
lux status
```

`lux start` creates the ignored local profile and `.env.local`, applies the
committed migrations, starts the engine on `127.0.0.1:15890`, and starts Studio.
It does not use a hand-written Compose substitute.

The explicit flags are intentional: the CLI remembers an existing project's
ports in `lux/.lux-local.json`, so rerunning the same command keeps Lux Lab on
its reserved block even after other local projects have been started.

For a physical iPhone on a trusted private network, bind the stack to the Mac's
LAN address instead of loopback:

```sh
export LUX_LAB_DEVICE_HOST=192.168.1.50
lux stop
lux start --bind "$LUX_LAB_DEVICE_HOST" --http-port 15890 --resp-port 15894
lux env use local
```

This also makes the local Studio and RESP surfaces reachable on that LAN. Use
it only on a network you trust, keep Lux authentication enabled, and stop the
stack after testing with `lux stop`. Stopping preserves the project's local
volume. Lux Lab does not install a local reverse proxy.

Activate the generated `local` profile, then synchronize it into the ignored
app env files:

```sh
bun run env:local
```

The script copies only the publishable key into `apps/web/.env`, keeps the
secret key in `apps/api/.env`, creates a separate random `LAB_CONTROLLER_KEY`
for privileged lab API routes, and generates an ignored iOS xcconfig pointing
at the Mac's private LAN address. It never prints credential values.

## Web and API

```sh
bun install
bun run dev
```

| Service | URL |
| --- | --- |
| SvelteKit | http://localhost:15893 |
| Hono controller | http://localhost:15892/v1 |
| Lux engine | http://localhost:15890 |
| Lux Studio | http://localhost:15891 |
| Lux RESP | localhost:15894 |

The browser callback URL is `http://localhost:15893/auth/callback`. Configure it
in the Lux provider redirect allow-list. Provider consoles continue to point at
the engine callback URL.

## iOS

The Xcode project is generated from `apps/ios/project.yml` and resolves Lux from
the sibling `../lux-swift` checkout:

```sh
bun run ios:generate
open apps/ios/LuxLab.xcodeproj
```

Simulator builds use `http://127.0.0.1:15890`. The generated device profile uses
the Mac's private LAN address and Lux Swift's explicit `.localDevelopment`
network policy; public cleartext endpoints remain rejected. Google and GitHub
OAuth still require a public HTTPS engine callback because their servers cannot
reach a private address. See [`infra/tunnel/README.md`](infra/tunnel/README.md)
for that boundary.

Configure the project URL and publishable key inside Lux Lab. They are stored in
the app's local preferences and can be cleared from the Diagnostics screen.

## Verification

Run the automated gates:

```sh
bun test
bun run check
bun run build
bun run ios:build
bun run ios:test
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
