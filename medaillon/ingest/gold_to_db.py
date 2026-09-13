#!/usr/bin/env python3
"""Ingest Gold CSVs into MySQL database.

Reads CSVs from `medaillon/data/gold` and writes them to MySQL tables:
- nutrition_gold.csv -> nutrition_gold
- diet_gold.csv -> diet_gold
- exercise_gold.csv -> exercise_gold

Connection is taken from `DATABASE_URL` env var (SQLAlchemy URL) or from
MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE env vars.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Dict

import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
import os
from pathlib import Path


def load_env(env_file: Path | str | None = None):
    if env_file is None:
        env_file = Path(__file__).resolve().parents[2] / '.env'
    env_file = Path(env_file)
    if not env_file.exists():
        return {}
    loaded = {}
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
                loaded[k] = v
    return loaded

GOLD_DIR = Path('medaillon') / 'data' / 'gold'
MAP = {
    'nutrition_gold.csv': 'nutrition_gold',
    'diet_gold.csv': 'diet_gold',
    'exercise_gold.csv': 'exercise_gold',
}


def get_engine():
    database_url = os.environ.get('TRAINING_DATABASE_URL') or os.environ.get('DATABASE_URL')
    if database_url:
        # ensure a PyMySQL driver is specified for MySQL URLs
        # ensure a PyMySQL driver is specified for MySQL URLs
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
    db = os.environ.get('TRAINING_MYSQL_DATABASE', os.environ.get('MYSQL_DATABASE', 'healthia'))
    url = URL.create('mysql+pymysql', username=user, password=password, host=host, port=port, database=db)
    return create_engine(url)


def ingest_file(engine, csv_path: Path, table_name: str) -> Dict[str, int]:
    print(f"Reading {csv_path}...")
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
    total = len(df)
    if total == 0:
        print(f"[WARN] {csv_path} is empty, skipping")
        return {'rows': 0}
    print(f"Writing {total} rows to table `{table_name}` (replace)...")
    df.to_sql(table_name, con=engine, if_exists='replace', index=False, method='multi', chunksize=1000)
    return {'rows': total}


def main():
    load_env(None)
    if not GOLD_DIR.exists():
        print(f"Gold dir not found: {GOLD_DIR.resolve()}")
        return 1
    engine = None
    try:
        engine = get_engine()
    except Exception as e:
        print(f"Could not create DB engine: {e}")
        return 2

    results = {}
    for fname, table in MAP.items():
        path = GOLD_DIR / fname
        if not path.exists():
            print(f"Gold file missing: {path}")
            continue
        try:
            res = ingest_file(engine, path, table)
            results[table] = res.get('rows', 0)
        except Exception as e:
            print(f"Error ingesting {path}: {e}")
            return 3

    print('\nIngestion summary:')
    for table, rows in results.items():
        print(f'- {table}: {rows} rows')
    return 0


if __name__ == '__main__':
    sys.exit(main())
