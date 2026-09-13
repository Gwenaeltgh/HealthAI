# Guide de déploiement - HealthAI Coach

## 1. Pré-requis

- Docker Desktop installé et démarré.
- Node.js et Python disponibles localement si vous lancez certaines commandes hors conteneur.
- Variables d'environnement renseignées via `.env` ou `docker-compose.yml`.

## 2. Démarrage de la stack

Depuis la racine du dépôt:

```powershell
docker compose up --build -d
```

### Variante "performance" (démo sur machine modeste)

Cette variante allège les services (IA optionnelle) et garde les mêmes routes UI.

```powershell
docker compose -f docker-compose.yml -f docker-compose.performance.yml up --build -d
```

Services attendus:

- front Vite: port `15001`
- API Node: port `15002`
- IA FastAPI: port `15003`
- MySQL: port `3306`

## 3. Vérifications utiles

```powershell
docker compose ps
```

La base doit être healthy, et les services app/api/ia doivent être up.

## 4. Initialisation base de données

Le schéma est poussé via Prisma au démarrage du service API.
Le script d'initialisation MySQL crée les deux bases:

- `healthia_api`
- `healthia`

Fichier de référence: [docker/mysql-init/01-create-databases.sql](../docker/mysql-init/01-create-databases.sql)

## 5. Pipeline data

Lancement depuis la racine:

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python .\run_pipeline.py
```

Variante "performance" (dataset réduit, sans téléchargement Kaggle si silver existe déjà):

```powershell
python .\run_pipeline.py --profile performance
```

Étapes:

1. téléchargement Kaggle;
2. bronze / copper;
3. silver;
4. gold;
5. ingestion DB;
6. normalisation.

## 6. Seed de démonstration

Script: [scripts/seed_demo_data.ps1](../scripts/seed_demo_data.ps1)

Exécution:

```powershell
.\scripts\seed_demo_data.ps1
```

## 7. Accès applicatifs

- Front: <http://localhost:15001>
- API: <http://localhost:15002>
- IA: <http://localhost:15003>

## 8. Comptes de test

- Admin: `admin@healthai.local` / `Password123!`
- Entreprise: `enterprise@clinique-horizon.healthia.local` / `Enterprise123!`

## 9. Points d'attention

- Les secrets ne doivent pas être committés.
- Les variables Kaggle doivent rester locales.
- Le guide doit être suivi dans l'ordre: stack, DB, pipeline, seed, vérification UI.
