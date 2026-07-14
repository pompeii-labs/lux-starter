# Lux Starter

A full-stack starter for small-team apps: auth, profiles, teams, members, and invites, updating in realtime.

## Stack

| Layer    | Tech                                                              |
| -------- | ----------------------------------------------------------------- |
| Frontend | [SvelteKit 2](https://svelte.dev/docs/kit) (Svelte 5), Tailwind 4, shadcn-svelte, superforms + zod |
| Backend  | [Hono](https://hono.dev) on [Bun](https://bun.sh)                 |
| Data     | [Lux](https://luxdb.dev) — tables, auth, and realtime on one connection |

```
apps/
  web/   SvelteKit app (UI, session cookies, calls the API)
  api/   Hono API (bearer-auth'd, talks to Lux with the secret key)
lux/
  migrations/   schema + row-level access grants (*.lux)
  types/        generated database types
```

Data access is API-first: the browser client is only used for auth/session and realtime `.live()` subscriptions; all reads/writes go through `apps/api`, which uses the Lux secret key.

## Setup

```sh
# 1. Install the Lux CLI (needs Docker running)
curl -fsSL https://luxdb.dev/install.sh | sh

# 2. Install dependencies
bun install

# 3. Boot Lux locally (applies lux/migrations, prints project keys)
lux init
lux start

# 4. Configure env — copy the examples, paste the keys `lux start` printed
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env

# 5. Run everything
bun run dev
```

## Services & ports

| Service        | Port | Command (from repo root)  |
| -------------- | ---- | ------------------------- |
| Web (SvelteKit)| 5173 | `bun run dev:web`         |
| API (Hono)     | 3000 | `bun run dev:api`         |
| Lux HTTP API   | 8080 | `lux start`               |
| Lux (RESP)     | 6379 | `lux start`               |

Health check: `GET http://localhost:3000/v1` returns 200.

## Environment variables

| App        | Variable                     | Purpose                                  |
| ---------- | ---------------------------- | ---------------------------------------- |
| `apps/web` | `PUBLIC_LUX_URL`             | Lux endpoint (browser + SSR)             |
| `apps/web` | `PUBLIC_LUX_PUBLISHABLE_KEY` | Public key; row-level security enforced  |
| `apps/web` | `PUBLIC_API_URL`             | Base URL of the Hono API                 |
| `apps/api` | `LUX_URL`                    | Lux endpoint                             |
| `apps/api` | `LUX_SECRET_KEY`             | Full-access key — server only            |

## Production build

```sh
bun run build          # builds apps/web with adapter-node
bun run --cwd apps/web start   # serves the built app on :5173
bun run --cwd apps/api start   # serves the API on :3000
```

## Schema changes

Add a migration, then regenerate types:

```sh
lux migrate new <name>   # edit the new file in lux/migrations/
lux migrate run
lux types                # refreshes lux/types/database.ts
```

Keep the hand-written types in `apps/*/src/**/types/lux.ts` in sync with the schema until type generation is wired into both apps.

## Continuous deployment

`.github/workflows/migrate.yml` applies pending Lux migrations to your Lux Cloud
project on every push to `main` that changes `lux/migrations/` (and on manual
dispatch), using [`lux-db/actions/migrate@v1`](https://github.com/lux-db/actions).
It installs the Lux CLI and runs `lux migrate run <project> --dir lux/migrations`.

Set these in the repo's GitHub settings before it can run:

| Kind     | Name          | Where                              | Value                                        |
| -------- | ------------- | ---------------------------------- | -------------------------------------------- |
| Secret   | `LUX_API_KEY` | Settings → Secrets and variables → Actions → Secrets   | A `lux_...` key from your Lux dashboard      |
| Variable | `LUX_PROJECT` | Settings → Secrets and variables → Actions → Variables | Your Lux project name, ID, or slug           |

`LUX_API_KEY` is a full-access key — keep it a secret, never a variable.
