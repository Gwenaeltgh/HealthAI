# HealthAI Coach

HealthAI Coach est un backoffice santé/data composé de trois briques principales:

- un pipeline de données Kaggle vers MySQL;
- une API Node pour l’accès admin et entreprise;
- un backoffice React/Vite pour consulter et piloter les données.

## Ce qu’il faut pour démarrer

- Node.js 20 ou plus
- Docker Desktop
- Python 3.11 ou plus pour le pipeline

## Démarrage rapide

1. Crée le fichier `.env` à la racine si besoin, à partir de [`.env.example`](.env.example).
2. Lance la stack:

	```bash
	docker compose up --build -d
	```

3. Attends que les conteneurs soient prêts, puis ouvre:

	- backoffice Docker: http://localhost:15001
	- API: http://localhost:15002/health

## Lancer le backoffice en local

Si tu veux développer sans Docker pour le front:

```bash
cd app
npm install
npm run dev
```

Le backoffice sera alors disponible sur http://localhost:3000.

## Lancer le pipeline de données

Quand la base est disponible, exécute:

```powershell
.\.venv\Scripts\python.exe .\run_pipeline.py
```

Ce script télécharge les jeux de données, construit les couches intermédiaires et alimente la base MySQL.

## Comptes de test

- Admin: `admin@healthai.local` / `Password123!`
- Entreprise: `enterprise@clinique-horizon.healthia.local` / `Enterprise123!`

## Tests optionnels

### Tests unitaires (frontend)

`docker compose -f docker-compose.yml -f docker-compose.tests.yml run --rm app-test`

### Tests unitaires (pipeline Python)

`docker compose -f docker-compose.yml -f docker-compose.tests.yml run --rm python-test`

### Tests de charge (k6)

Voir [test/load/README.md](test/load/README.md)

## Structure du projet

- `app/`: backoffice React/Vite
- `api/`: API Node
- `medaillon/`: pipeline d’ingestion et transformations
- `docker-compose.yml`: stack complète Docker
- `run_pipeline.py`: orchestration du pipeline

## Aide pratique

- Si l’interface ne s’affiche pas, vérifie d’abord que `docker compose ps` montre bien `api`, `app` et `db` en `Up`.
- Si tu vois une erreur de connexion, redémarre la stack avec `docker compose up --build -d`.
- Si tu veux repartir de zéro côté données, relance ensuite le pipeline Python.
