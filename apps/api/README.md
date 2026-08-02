# Lux Lab API

This is a deliberately small Hono controller for trusted Auth + Push
verification. It holds the Lux secret key server-side and gives the lab a safe
place to inspect push state or request a test send. The browser and iOS apps
talk directly to Lux with publishable keys and user sessions; ordinary client
auth does not pass through this API.

## Run

```sh
bun run dev:api
```

From the repository root, `bun run env:local` writes the ignored `.env` from
the CLI-managed local project. `LAB_CONTROLLER_KEY` protects every `/v1/push/*`
route. Do not expose it to either client application.

## Routes

All routes are prefixed `/v1`.

- `GET /v1/` — controller identity (public)
- `GET /v1/health` — redacted engine health and capability check (public)
- `POST /v1/me/push` — validate a user session and send only to that user
- `GET /v1/push/stats` — push registry counts
- `GET /v1/push/outbox` — queued and recent sends
- `GET /v1/push/devices/:subjectID` — devices for one Lux Auth subject
- `POST /v1/push/send` — send a validated notification to one subject

The push administration routes require `Authorization: Bearer <LAB_CONTROLLER_KEY>` and proxy
the request with the Lux secret key. Requests are schema-validated and the
health response never includes credentials.

`/v1/me/push` instead requires a Lux user access token. The controller resolves
the subject from that token before sending, so a client cannot target another
user and never receives the controller or Lux secret key.

## Verify

```sh
bun test
bun run check
bun run build
```
