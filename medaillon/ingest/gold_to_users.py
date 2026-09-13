#!/usr/bin/env python3
"""Populate Utilisateur (+ allergies/restrictions) tables from diet_gold.csv.

Reads `medaillon/data/gold/diet_gold.csv` and inserts:
- Utilisateur rows
- Allergy / DietaryRestriction lookup rows (deduplicated by name)
- UserAllergy / UserDietaryRestriction join rows

Connection is taken from `DATABASE_URL` env var (SQLAlchemy URL) or from
MYSQL_* env vars (same strategy as other ingest scripts).

The importer is designed to be safe to run multiple times: it avoids inserting
rows when a Utilisateur with the same `nom` already exists (we use `patient_id`
as the `nom`), and it avoids duplicate join rows using INSERT IGNORE.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL


def load_env(env_file: Path | str | None = None) -> Dict[str, str]:
    if env_file is None:
        env_file = Path(__file__).resolve().parents[2] / '.env'
    env_file = Path(env_file)
    if not env_file.exists():
        return {}

    loaded: Dict[str, str] = {}
    with open(env_file, 'r', encoding='utf-8') as f:
        for line in f:
            s = line.strip()
            if not s or s.startswith('#'):
                continue
            if '=' not in s:
                continue
            k, _, v = s.partition('=')
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            os.environ.setdefault(k, v)
            loaded[k] = v
    return loaded


GOLD_DIR = Path('medaillon') / 'data' / 'gold'
DIET_CSV = GOLD_DIR / 'diet_gold.csv'


def get_engine():
    database_url = os.environ.get('DATABASE_URL')
    if database_url:
        if database_url.startswith('mysql://') and 'mysql+pymysql' not in database_url:
            database_url = database_url.replace('mysql://', 'mysql+pymysql://', 1)
        if '@db' in database_url or '://db:' in database_url:
            database_url = database_url.replace('@db:', '@127.0.0.1:').replace('@db/', '@127.0.0.1/')
            database_url = database_url.replace('://db:', '://127.0.0.1:')
        return create_engine(database_url)

    user = os.environ.get('MYSQL_USER', 'healthia')
    password = os.environ.get('MYSQL_PASSWORD', os.environ.get('MYSQL_ROOT_PASSWORD', 'root'))
    host = os.environ.get('MYSQL_HOST', os.environ.get('MYSQL_HOSTNAME', 'localhost'))
    port = int(os.environ.get('MYSQL_PORT', os.environ.get('MYSQL_PORT_NUMBER', 3306)))
    db = os.environ.get('MYSQL_DATABASE', 'healthia')

    url = URL.create('mysql+pymysql', username=user, password=password, host=host, port=port, database=db)
    return create_engine(url)


def split_multi(value: object) -> List[str]:
    if value is None:
        return []
    if isinstance(value, float) and pd.isna(value):
        return []
    s = str(value).strip()
    if not s:
        return []

    # common separators in datasets
    for sep in [';', '|', '/']:
        s = s.replace(sep, ',')
    parts = [p.strip() for p in s.split(',')]

    # remove empties and normalize
    out: List[str] = []
    for p in parts:
        if not p:
            continue
        out.append(p)
    return out


def to_int(value: object) -> int:
    if value is None:
        return 0
    if isinstance(value, float) and pd.isna(value):
        return 0
    try:
        return int(float(value))
    except Exception:
        return 0


def to_float(value: object) -> float:
    if value is None:
        return 0.0
    if isinstance(value, float) and pd.isna(value):
        return 0.0
    try:
        return float(value)
    except Exception:
        return 0.0


def to_nullable_str(value: object) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, float) and pd.isna(value):
        return None
    s = str(value).strip()
    return s or None


def ensure_lookup(conn, table: str, name: str, cache: Dict[str, int]) -> int:
    name = name.strip()
    if not name:
        return 0
    if name in cache:
        return cache[name]

    # try to find existing
    row = conn.execute(text(f"SELECT id FROM {table} WHERE name = :name LIMIT 1"), {'name': name}).fetchone()
    if row:
        cache[name] = int(row[0])
        return cache[name]

    # insert
    res = conn.execute(text(f"INSERT INTO {table} (name) VALUES (:name)"), {'name': name})
    inserted_id = int(res.lastrowid) if res.lastrowid else int(
        conn.execute(text("SELECT LAST_INSERT_ID()"))
        .fetchone()[0]
    )
    cache[name] = inserted_id
    return inserted_id


def main() -> int:
    load_env(None)

    if not DIET_CSV.exists():
        print(f"Missing {DIET_CSV}, cannot import users")
        return 1

    engine = get_engine()

    print(f"Reading users from {DIET_CSV}...")
    df = pd.read_csv(DIET_CSV, encoding='utf-8', on_bad_lines='skip')
    if df.empty:
        print("diet_gold.csv is empty, nothing to import")
        return 0

    # minimal required column
    if 'patient_id' not in df.columns:
        print("diet_gold.csv missing column patient_id")
        return 2

    inserted_users = 0
    linked_allergies = 0
    linked_restrictions = 0

    with engine.begin() as conn:
        existing_names = {
            r[0]
            for r in conn.execute(text('SELECT nom FROM Utilisateur')).fetchall()
            if r and r[0] is not None
        }

        allergy_cache: Dict[str, int] = {
            r[0]: int(r[1])
            for r in conn.execute(text('SELECT name, id FROM Allergy')).fetchall()
            if r and r[0] is not None
        }
        restriction_cache: Dict[str, int] = {
            r[0]: int(r[1])
            for r in conn.execute(text('SELECT name, id FROM DietaryRestriction')).fetchall()
            if r and r[0] is not None
        }

        for _, row in df.iterrows():
            patient_id = str(row.get('patient_id') or '').strip()
            if not patient_id:
                continue

            # We store patient_id as `nom` to make reruns idempotent.
            nom = patient_id

            if nom in existing_names:
                # user already imported; find its id for linking
                user_row = conn.execute(
                    text('SELECT id FROM Utilisateur WHERE nom = :nom LIMIT 1'),
                    {'nom': nom},
                ).fetchone()
                if not user_row:
                    continue
                user_id = int(user_row[0])
            else:
                user_insert = conn.execute(
                    text(
                        'INSERT INTO Utilisateur '
                        '(nom, age, gender, poids, taille, disease_type, disease_severity, daily_caloric_intake, adherence_to_diet_plan, physical_activity_level) '
                        'VALUES (:nom, :age, :gender, :poids, :taille, :disease_type, :disease_severity, :daily_caloric_intake, :adherence_to_diet_plan, :physical_activity_level)'
                    ),
                    {
                        'nom': nom,
                        'age': to_int(row.get('age')),
                        'gender': str(row.get('gender') or '').strip() or 'Unknown',
                        'poids': to_float(row.get('weight_kg')),
                        'taille': to_float(row.get('height_cm')),
                        'disease_type': to_nullable_str(row.get('disease_type')),
                        'disease_severity': to_nullable_str(row.get('severity')),
                        'daily_caloric_intake': to_int(row.get('daily_caloric_intake')),
                        'adherence_to_diet_plan': to_float(row.get('adherence_to_diet_plan')),
                        'physical_activity_level': to_nullable_str(row.get('physical_activity_level')),
                    },
                )
                user_id = int(user_insert.lastrowid) if user_insert.lastrowid else int(
                    conn.execute(text('SELECT LAST_INSERT_ID()')).fetchone()[0]
                )
                existing_names.add(nom)
                inserted_users += 1

            # allergies (comma-separated string)
            for allergy_name in split_multi(row.get('allergies')):
                allergy_id = ensure_lookup(conn, 'Allergy', allergy_name, allergy_cache)
                if allergy_id <= 0:
                    continue
                conn.execute(
                    text('INSERT IGNORE INTO UserAllergy (user_id, allergy_id) VALUES (:user_id, :allergy_id)'),
                    {'user_id': user_id, 'allergy_id': allergy_id},
                )
                linked_allergies += 1

            # restrictions
            for restriction_name in split_multi(row.get('dietary_restrictions')):
                restriction_id = ensure_lookup(conn, 'DietaryRestriction', restriction_name, restriction_cache)
                if restriction_id <= 0:
                    continue
                conn.execute(
                    text(
                        'INSERT IGNORE INTO UserDietaryRestriction (user_id, restriction_id) '
                        'VALUES (:user_id, :restriction_id)'
                    ),
                    {'user_id': user_id, 'restriction_id': restriction_id},
                )
                linked_restrictions += 1

    print('Done.')
    print(f'- inserted Utilisateur: {inserted_users}')
    print(f'- linked UserAllergy rows (attempted): {linked_allergies}')
    print(f'- linked UserDietaryRestriction rows (attempted): {linked_restrictions}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
