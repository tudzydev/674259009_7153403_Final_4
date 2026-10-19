# Event API

Install dependencies with `bun install`. Set `DATABASE_URL` to a PostgreSQL connection string, then run `bun start`. The server uses port 3000 by default; override it with `PORT`.

For environment files, use `bun run dev:local` with `.env.local` or `bun run dev:neon` with `.env.neon`. Set `DATABASE_PROVIDER=neon` for Neon.

Startup connects to PostgreSQL and creates missing model tables with `sequelize.sync()`; it does not alter existing tables.

Startup also saves 12 sample events in PostgreSQL (4 each in อบรม, สัมมนา, and จิตอาสา; each category has 2 published and 2 drafts). These are persisted records served by the API and editable through normal CRUD operations. To seed without starting the server, run `bun run db:seed:local` or `bun run db:seed:neon`.

The `seed_runs` table records `initial-events-v1` in the same transaction as the events. A PostgreSQL transaction advisory lock prevents concurrent seeds from duplicating data. Restarts skip an already completed seed, preserving edits and deletions. A failed seed rolls back both the records and marker so the next startup can retry. Existing events are retained when the seed first runs.

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/api/events` | List events ordered by event date |
| GET | `/api/events/:id` | Read one event |
| POST | `/api/events` | Create an event |
| PUT | `/api/events/:id` | Update an event with all required fields |
| DELETE | `/api/events/:id` | Delete an event; return 204 |

POST and PUT accept JSON:

```json
{
  "title": "กิจกรรมอบรม",
  "organizer": "ผู้จัดกิจกรรม",
  "category": "อบรม",
  "eventDate": "2026-12-01",
  "description": "รายละเอียดกิจกรรม",
  "status": true
}
```

`status` is optional: it defaults to true on creation and retains its current value when omitted during update. Categories are `อบรม`, `สัมมนา`, and `จิตอาสา`. Only the documented input fields are saved.

Responses wrap event data in `{ "data": ... }`. Invalid input or IDs return 400, missing events return 404, and unexpected failures return 500.

Run `bun run typecheck` and `bun test` to verify types and database configuration. Configuration tests do not require PostgreSQL.

Run `RUN_DB_TESTS=1 bun --env-file=.env.local test tests/event-seed.integration.test.ts` to verify seeding against PostgreSQL. This test creates and removes a temporary schema and checks concurrent seeds, repeat runs, existing records, and preservation of edited/deleted records.

Check connectivity without changing tables with `bun run db:check:local` or `bun run db:check:neon`. Use `bun run db:check` when environment variables are already exported.

Local Docker settings: `DATABASE_PROVIDER=local` and `DATABASE_URL=postgres://postgres:postgres@localhost:5433/event_db`. Start PostgreSQL from the project root with `docker compose up -d postgres`. The Compose healthcheck database should match `POSTGRES_DB` (`event_db`).

Swagger UI is available at `http://localhost:3000/api-docs` (adjust the port if needed). Use **Try it out** to call the API. The OpenAPI JSON is available at `/api-docs.json`. Swagger UI loads its assets from unpkg.com and requires internet access; the JSON specification is served locally.
