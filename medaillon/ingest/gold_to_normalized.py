#!/usr/bin/env python3
"""Populate normalized DB tables (Food, Exercise) from Gold CSVs.

Reads `medaillon/data/gold/nutrition_gold.csv` and
`medaillon/data/gold/exercise_gold.csv` and inserts missing rows into
the Prisma-managed tables `Food` and `Exercise` using SQLAlchemy.

This script reuses the DB connection logic from `gold_to_db.py`.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Set

import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL


def load_env(env_file: Path | str | None = None):
    if env_file is None:
        env_file = Path(__file__).resolve().parents[2] / '.env'
    env_file = Path(env_file)
    if not env_file.exists():
        return {}
    with open(env_file, 'r', encoding='utf-8') as f:
        for line in f:
            s = line.strip()
            if not s or s.startswith('#'):
                continue
            if '=' in s:
                k, _, v = s.partition('=')
                v = v.strip().strip('"').strip("'")
                k = k.strip()
                os.environ.setdefault(k, v)
    return {}


GOLD_DIR = Path('medaillon') / 'data' / 'gold'


def get_engine():
    # Normalized tables (Food, Exercise) live in the Prisma-managed app database.
    # Use DATABASE_URL (healthia_api), not TRAINING_DATABASE_URL (healthia).
    database_url = os.environ.get('DATABASE_URL')
    if database_url:
        if database_url.startswith('mysql://') and 'mysql+pymysql' not in database_url:
            database_url = database_url.replace('mysql://', 'mysql+pymysql://', 1)
        # If the URL references the internal Docker host 'db', swap to localhost ONLY when running outside containers.
        # In Docker/CI, 'db' is resolvable on the compose network; forcing 127.0.0.1 breaks connectivity.
        in_docker = os.path.exists('/.dockerenv')
        if not in_docker and ('@db' in database_url or '://db:' in database_url):
            database_url = database_url.replace('@db:', '@127.0.0.1:').replace('@db/', '@127.0.0.1/')
            database_url = database_url.replace('://db:', '://127.0.0.1:')
        return create_engine(database_url)
    user = os.environ.get('MYSQL_USER', 'healthia')
    password = os.environ.get('MYSQL_PASSWORD', os.environ.get('MYSQL_ROOT_PASSWORD', 'root'))
    host = os.environ.get('MYSQL_HOST', os.environ.get('MYSQL_HOSTNAME', 'localhost'))
    port = int(os.environ.get('MYSQL_PORT', os.environ.get('MYSQL_PORT_NUMBER', 3306)))
    db = os.environ.get('MYSQL_DATABASE', 'healthia_api')
    url = URL.create('mysql+pymysql', username=user, password=password, host=host, port=port, database=db)
    return create_engine(url)


def ingest_foods(engine, csv_path: Path) -> int:
    print(f"Reading foods from {csv_path}...")
    max_rows = None
    raw = os.environ.get('HEALTHIA_MAX_ROWS')
    if raw:
        try:
            value = int(str(raw).strip())
            if value > 0:
                max_rows = value
        except Exception:
            max_rows = None

    df = pd.read_csv(csv_path, encoding='utf-8', on_bad_lines='skip', nrows=max_rows)
    if df.empty:
        print("No food rows found.")
        return 0

    inserted = 0
    with engine.begin() as conn:
        # Ensure target table exists (when Prisma schema wasn't applied yet)
        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS Food (
                  id INT NOT NULL AUTO_INCREMENT,
                  name VARCHAR(191) NOT NULL,
                  category VARCHAR(191) NOT NULL,
                  calories DOUBLE NOT NULL,
                  protein DOUBLE NOT NULL,
                  carbohydrates DOUBLE NOT NULL,
                  fat DOUBLE NOT NULL,
                  fiber DOUBLE NOT NULL,
                  sugars DOUBLE NOT NULL,
                  sodium DOUBLE NOT NULL,
                  cholesterol DOUBLE NOT NULL,
                  PRIMARY KEY (id)
                )
                """
            )
        )

        # gather existing food names to avoid duplicates
        res = conn.execute(text('SELECT name FROM Food'))
        existing: Set[str] = set(r[0] for r in res.fetchall())

        for _, row in df.iterrows():
            name = str(row.get('food_item') or row.get('food') or '')
            if not name:
                continue
            if name in existing:
                continue

            category = row.get('category') if 'category' in row else ''
            calories = row.get('calories_kcal') if 'calories_kcal' in row else row.get('calories')
            protein = row.get('protein_g') if 'protein_g' in row else row.get('protein')
            carbs = row.get('carbohydrates_g') if 'carbohydrates_g' in row else row.get('carbohydrates')
            fat = row.get('fat_g') if 'fat_g' in row else row.get('fat')
            fiber = row.get('fiber_g') if 'fiber_g' in row else row.get('fiber')
            sugars = row.get('sugars_g') if 'sugars_g' in row else row.get('sugars')
            sodium = None
            if 'sodium_mg' in row and not pd.isna(row['sodium_mg']):
                try:
                    sodium = float(row['sodium_mg'])
                except Exception:
                    sodium = None
            cholesterol = row.get('cholesterol_mg') if 'cholesterol_mg' in row else None

            stmt = text(
                "INSERT INTO Food (name, category, calories, protein, carbohydrates, fat, fiber, sugars, sodium, cholesterol)"
                " VALUES (:name, :category, :calories, :protein, :carbohydrates, :fat, :fiber, :sugars, :sodium, :cholesterol)"
            )
            conn.execute(
                stmt,
                {
                    'name': name,
                    'category': category,
                    'calories': float(calories) if calories and not pd.isna(calories) else 0.0,
                    'protein': float(protein) if protein and not pd.isna(protein) else 0.0,
                    'carbohydrates': float(carbs) if carbs and not pd.isna(carbs) else 0.0,
                    'fat': float(fat) if fat and not pd.isna(fat) else 0.0,
                    'fiber': float(fiber) if fiber and not pd.isna(fiber) else 0.0,
                    'sugars': float(sugars) if sugars and not pd.isna(sugars) else 0.0,
                    'sodium': float(sodium) if sodium is not None else 0.0,
                    'cholesterol': float(cholesterol) if cholesterol and not pd.isna(cholesterol) else 0.0,
                },
            )
            existing.add(name)
            inserted += 1

    print(f"Inserted {inserted} new foods.")
    return inserted


def ingest_exercises(engine, csv_path: Path) -> int:
    print(f"Reading exercises from {csv_path}...")
    max_rows = None
    raw = os.environ.get('HEALTHIA_MAX_ROWS')
    if raw:
        try:
            value = int(str(raw).strip())
            if value > 0:
                max_rows = value
        except Exception:
            max_rows = None

    df = pd.read_csv(csv_path, encoding='utf-8', on_bad_lines='skip', nrows=max_rows)
    if df.empty:
        print("No exercise rows found.")
        return 0

    inserted = 0
    with engine.begin() as conn:
        # Ensure target table exists (when Prisma schema wasn't applied yet)
        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS Exercise (
                  id INT NOT NULL AUTO_INCREMENT,
                  name VARCHAR(191) NOT NULL,
                  equipment VARCHAR(191) NULL,
                  body_part VARCHAR(191) NULL,
                  exercise_type VARCHAR(191) NULL,
                  PRIMARY KEY (id)
                )
                """
            )
        )

        res = conn.execute(text('SELECT name FROM Exercise'))
        existing: Set[str] = set(r[0] for r in res.fetchall())

        # use 'workout_type' column as exercise name/type
        if 'workout_type' in df.columns:
            types = df['workout_type'].dropna().unique()
        elif 'exercise' in df.columns:
            types = df['exercise'].dropna().unique()
        else:
            types = []

        for t in types:
            name = str(t).strip()
            if not name or name in existing:
                continue
            stmt = text(
                "INSERT INTO Exercise (name, exercise_type) VALUES (:name, :exercise_type)"
            )
            conn.execute(stmt, {'name': name, 'exercise_type': name})
            existing.add(name)
            inserted += 1

    print(f"Inserted {inserted} new exercises.")
    return inserted


def main():
    load_env(None)
    engine = None
    try:
        engine = get_engine()
    except Exception as e:
        print(f"Could not create DB engine: {e}")
        return 2

    total = 0

    nut = GOLD_DIR / 'nutrition_gold.csv'
    if nut.exists():
        total += ingest_foods(engine, nut)
    else:
        print(f"Missing {nut}, skipping foods import")

    ex = GOLD_DIR / 'exercise_gold.csv'
    if ex.exists():
        total += ingest_exercises(engine, ex)
    else:
        print(f"Missing {ex}, skipping exercises import")

    print(f"Done. Total inserted rows: {total}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
