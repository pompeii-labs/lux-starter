# Lux starter repository map

## Product shape

This is a Bun workspace containing a SvelteKit web application, a Hono API,
and a shared Lux database schema. It is a working team-management starter,
not disposable scaffolding: authentication, profiles, teams, membership,
invitations, authorization grants, and realtime refresh behavior already span
the repository.

## Runtime topology

| Surface | Location | Command | Local port |
| --- | --- | --- | --- |
| Web | `apps/web` | `bun run dev:web` | 5173 |
| API | `apps/api` | `bun run dev:api` | 3000 |
| Lux HTTP | `lux/` via `lux start` | `lux start` | 5890 in Preview |
| Lux Studio | managed by `lux start` | `lux start` | 5891 in Preview |

The Preview setup in the template bundle installs dependencies, starts Lux,
writes the generated Lux URLs and keys into the two app env files, then starts
the API and web surfaces. The web service is the primary surface.

## Architecture

- `apps/api/src/index.ts` is the Bun/Hono server entrypoint.
- `apps/api/src/routes/` contains the API route tree.
- `apps/api/src/middleware/` owns authentication, membership, and role checks.
- `apps/api/src/utils/lux.ts` creates the privileged server Lux client.
- `apps/web/src/routes/` contains SvelteKit auth and protected routes.
- `apps/web/src/lib/actions/` contains typed API wrappers and form behavior.
- `apps/web/src/lib/components/ui/` contains the shadcn-svelte primitives.
- `lux/migrations/` is the database schema and grants source of truth.
- `lux/types/database.ts` is the generated database type source shared by both apps.

## Contracts to preserve

- Browser-side Lux access is limited to authentication and live subscriptions.
  Data mutations go through the Hono API and its secret-key client.
- Every schema change needs a forward migration, deliberate grants, regenerated
  shared types, API validation/authorization updates, and matching UI changes.
- API responses use the repository's existing `Result<T>` envelope.
- SvelteKit loaders and live subscriptions share invalidation keys; changing one
  side without the other breaks realtime refresh.
- Role ordering is `user`, `admin`, `owner` and must stay aligned across API and web.

## Verification

- Install with `bun install`.
- Type-check with `bun run check`.
- Build with `bun run build`.
- For schema work, apply the migration and regenerate types before claiming the
  change is complete.
- For authorization or realtime work, exercise the boundary behavior as well as
  the successful path.
