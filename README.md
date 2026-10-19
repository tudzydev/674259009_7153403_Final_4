# Event Management

Run the complete application with Docker:

```sh
docker compose up -d --build
docker compose ps
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api/events
- PostgreSQL: localhost:5433, database `event_db`

If local development servers already use ports 3000 and 4000:

```sh
FRONTEND_PORT=3100 BACKEND_PORT=4001 docker compose up -d --build
```

This makes the frontend available at http://localhost:3100 and the backend at http://localhost:4001/api/events. The frontend proxies `/api/events` to `backend:4000` within Docker; the backend connects to `postgres:5432`. The frontend API destination is set at image build time, so rebuild it when changing that address. Use the same port variables for subsequent `docker compose up` commands to retain these mappings.

Services wait for their dependencies to become healthy. Backend startup creates missing tables and seeds 12 events once. The database and seed history persist in the `pgdata` volume across restarts. See [backend/README.md](backend/README.md) for seed behavior and tests.

View logs with `docker compose logs --tail=100 backend frontend`. Stop services with `docker compose down`; the database volume is retained.
