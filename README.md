# AquaRank

Live underwater-orienteering results, archived leaderboards, and configurable Parallel knockout brackets.

## Local development

Requirements: Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

Copy `.env.example` to `.env` and set a strong `ADMIN_PASSWORD` before testing the organizer portal.

## Railway deployment preparation

The repository contains a production `Dockerfile`, `railway.json`, `/health` endpoint, and a start command that listens on Railway's injected `PORT` using `0.0.0.0`.

When the Railway deployment is created:

1. Create a service from this repository. Railway will detect the root `Dockerfile`.
2. Add `ADMIN_PASSWORD` as a secret service variable. Use a long, unique value.
3. Attach a Railway Volume mounted at `/app/.wrangler`. AquaRank automatically uses Node's SQLite driver on Railway and stores the database at `/app/.wrangler/railway.db`.
4. Generate a public domain under the service's Networking settings.
5. Deploy. Railway will call `/health` and only activate a release after it returns HTTP 200.

Do not run multiple replicas while using the embedded database volume. Railway volumes attach to one service instance and do not support replicas. If horizontal scaling is required later, migrate the storage adapter to Railway Postgres first.

## Production commands

```bash
npm run build
npm run start:railway
```

`vinext start` automatically reads `PORT`; the command explicitly binds to `0.0.0.0` for Railway networking.

## Existing Sites deployment

The `.openai/hosting.json`, Worker entry point, D1 schema, and migrations remain intact, so the existing private Sites deployment continues to be supported alongside the Railway-ready container setup.
