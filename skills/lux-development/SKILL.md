---
name: lux-development
description: Build and modify Lux applications while preserving schema, grants, generated types, authentication, and realtime conventions.
---

# Lux development

Use this skill for schema, authentication, data access, migrations, and realtime work in this repository.

## Repository contract

- Treat `lux/migrations/` as the schema source of truth.
- Keep `lux/types/database.ts` generated from the applied schema; both applications re-export it.
- Browser code uses the publishable Lux client for sessions and live subscriptions, not privileged mutations.
- Application CRUD flows through `apps/api`, which owns the secret Lux client and authorization checks.
- Preserve the existing `Result<T>` API envelope and route-tree conventions.
- Preserve SvelteKit invalidation keys when changing live queries or the data that feeds them.

## Schema changes

1. Read the existing migrations and every API/UI consumer of the affected table.
2. Add a forward migration rather than rewriting applied history.
3. Define grants deliberately for every new read and write path.
4. Regenerate shared database types after applying the migration.
5. Update API validation, authorization, and UI consumers together.

## Verification

- Run the repository type-check and build commands that cover changed packages.
- Exercise authorization boundaries, not only the happy path.
- For realtime behavior, verify the mutation emits the change observed by the corresponding live subscription.
- Never claim a migration or generated type is correct without applying or otherwise validating it.
