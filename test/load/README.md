# Tests de charge (k6) — via Docker

## Prérequis

- L’API doit être accessible sur `http://localhost:15002`.
- Avoir un admin existant en base (pour le script dashboard).

## Health (sans auth)

```bash
docker compose -f docker-compose.yml -f docker-compose.tests.yml run --rm \
  k6 run -e API_BASE_URL=http://host.docker.internal:15002 /scripts/k6-health.js
```

## Admin dashboard (avec auth)

```bash
docker compose -f docker-compose.yml -f docker-compose.tests.yml run --rm \
  -e API_BASE_URL=http://host.docker.internal:15002 \
  -e K6_ADMIN_EMAIL=admin@healthai.local \
  -e K6_ADMIN_PASSWORD=Password123! \
  k6 run /scripts/k6-admin-dashboard.js
```

Notes:

- Sur Windows / Docker Desktop, `host.docker.internal` permet au container k6 d’atteindre l’API exposée sur le host.
