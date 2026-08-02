# Lux Lab Web

This SvelteKit application exercises the public Lux browser-auth surface
against the same project as the native lab. It intentionally stays small: one
screen exposes engine health, password and anonymous auth, Apple/Google/GitHub
OAuth, refresh, sign-out, and a redacted event timeline.

It uses `@luxdb/sdk` directly. Only `PUBLIC_LUX_URL` and the publishable key are
available to browser code; the Lux secret and lab controller credential live in
the API process.

## Run

```sh
bun run env:local
bun run dev:web
```

The local page is fixed at `http://localhost:15893` and the OAuth return route is
`http://localhost:15893/auth/callback`. Add that exact URL to the Lux provider
redirect allow-list. Provider consoles still use the callback URL exposed by
the Lux engine.

## Verify

```sh
bun test
bun run check
bun run build
```
