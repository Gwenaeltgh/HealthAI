Quick test server for exercises API

This is a tiny standalone Node HTTP server (no dependencies) intended for local testing.

Run:

```powershell
# from repo root
node tools/exercises_test_server/server.js
```

It listens on port 15002 by default (or set `PORT` env var).

Endpoints:
- GET /api/exercises/options -> returns a simple catalog
- POST /api/exercises/options -> accepts JSON body or { features: {...} } and returns `options` array
