# api

Hono API on Bun. All app data access goes through here — it talks to Lux with the full-access secret key and authenticates requests with the caller's session token (`Authorization: Bearer <access_token>`).

## Run

```sh
bun run dev    # watch mode on :3000
```

Requires `.env` (see `.env.example`).

## Routes

All routes are prefixed `/v1` and require a bearer token unless noted.

- `GET /` — health check (no auth)
- `GET|POST|PUT /profiles/me` — the caller's profile
- `GET|POST /teams`, `GET|PUT|DELETE /teams/:teamId`
- `GET /teams/:teamId/members`, `PUT|DELETE /teams/:teamId/members/:memberId`
- `GET|POST /teams/:teamId/invites`, `GET|DELETE /teams/:teamId/invites/:inviteId`
- `GET /invites` — invites for the caller's email
- `POST /invites/:inviteId/accept`

## Conventions

- Validation with `@hono/zod-validator`; responses use the `Result<T>` envelope in `src/utils/result.ts`
- Auth/role middleware lives in `src/middleware/index.ts` (`verifyUser`, `getTeam`, `verifyMember`, `requireRole`)
- Roles: `user` < `admin` < `owner`
