# Event API

Install dependencies with `bun install`. Set `DATABASE_URL` to a PostgreSQL connection string, then run `bun start`. The server uses port 3000 by default; override it with `PORT`.

For environment files, use `bun run dev:local` with `.env.local` or `bun run dev:neon` with `.env.neon`. Set `DATABASE_PROVIDER=neon` for Neon.

CORS is enabled before the routes and JSON parser, including automatic `OPTIONS` preflight handling. The backend reads `FRONEND_URL` (using this exact environment variable spelling), for example `FRONEND_URL=https://674259009-7153403-final-d.vercel.app`. Multiple frontend origins can be comma-separated: `FRONEND_URL=http://localhost:3000,https://674259009-7153403-final-d.vercel.app`. Spaces and trailing slashes are trimmed. If unset or empty, the defaults allow `http://localhost` and `http://127.0.0.1` on ports 3000, 3001, and 3100, plus `https://674259009-7153403-final-d.vercel.app`. Restart or redeploy the backend after changing the variable. For Docker, pass `FRONEND_URL` into the backend container environment. Requests from other origins receive no `Access-Control-Allow-Origin` header. Server-to-server requests and the existing Next.js proxy continue to work.

Startup connects to PostgreSQL and creates missing model tables with `sequelize.sync()`; it does not alter existing tables.

Startup also saves 12 sample events in PostgreSQL (4 each in อบรม, สัมมนา, and จิตอาสา; each category has 2 published and 2 drafts). These are persisted records served by the API and editable through normal CRUD operations. To seed without starting the server, run `bun run db:seed:local` or `bun run db:seed:neon`.

The `seed_runs` table records `initial-events-v1` in the same transaction as the events. A PostgreSQL transaction advisory lock prevents concurrent seeds from duplicating data. Restarts skip an already completed seed, preserving edits and deletions. A failed seed rolls back both the records and marker so the next startup can retry. Existing events are retained when the seed first runs.

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/api/events` | List events ordered by event date; supports search/category queries |
| GET | `/api/events/:id` | Read one event |
| POST | `/api/events` | Create an event |
| PUT | `/api/events/:id` | Update an event with all required fields |
| DELETE | `/api/events/:id` | Delete an event; return 200 with a JSON message |

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

`GET /api/events?search=term&category=อบรม` searches title/organizer case-insensitively and combines an exact category filter. SQL wildcards in search are treated literally. Invalid/repeated filter values return 400.

`status` is optional: it defaults to true on creation and retains its current value when omitted during update. Categories are `อบรม`, `สัมมนา`, and `จิตอาสา`. Only the documented input fields are saved.

Responses wrap event data in `{ "data": ... }`. Invalid input or IDs return 400, missing events return 404, and unexpected failures return 500.

Run `bun run typecheck` and `bun test` to verify types and database configuration. Configuration tests do not require PostgreSQL. Run `bun run test:integration` to verify HTTP CRUD, filtering, errors, CORS, seed behavior, and persistence after actual backend process restarts using a temporary schema on local PostgreSQL.

Run `bun run test:integration` (optionally export `TEST_DATABASE_URL` for a local test database first) to verify seeding against PostgreSQL. This test creates and removes a temporary schema and checks concurrent seeds, repeat runs, existing records, and preservation of edited/deleted records.

Check connectivity without changing tables with `bun run db:check:local` or `bun run db:check:neon`. Use `bun run db:check` when environment variables are already exported.

Local Docker settings: `DATABASE_PROVIDER=local` and `DATABASE_URL=postgres://postgres:postgres@localhost:5433/event_db`. Start PostgreSQL from the project root with `docker compose up -d postgres`. The Compose healthcheck database should match `POSTGRES_DB` (`event_db`).

Swagger UI is available at `http://localhost:4000/api/events/docs` (set `PORT=4000`; adjust the port if needed). Use **Try it out** to call the API. The OpenAPI JSON is available at `/api-docs.json`. Swagger UI loads its assets from unpkg.com and requires internet access; the JSON specification is served locally.
