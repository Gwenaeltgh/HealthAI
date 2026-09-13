#!/usr/bin/env python3
"""Fix inconsistent obesity labels in Utilisateur.

Your dataset can contain `disease_type='Obesity'` while the weight/height imply a
normal BMI. This script recomputes BMI from `poids` (kg) and `taille` (cm) and:

- If `disease_type='Obesity'` but BMI < 30: set `disease_type` and
  `disease_severity` to NULL.
- If BMI >= 30 and (`disease_type` is NULL OR `disease_type='Obesity'`): set
    `disease_type='Obesity'` and set a severity derived from BMI:
    - 30–35  -> Mild
    - 35–40  -> Moderate
    - >=40   -> Severe

This keeps non-obesity diseases (Diabetes, Hypertension, ...) untouched.

Connection is taken from `DATABASE_URL` env var (SQLAlchemy URL) or from MYSQL_*
variables (same convention as other scripts).
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL


def load_env(env_file: Path | str | None = None):
    if env_file is None:
        env_file = Path(__file__).resolve().parents[2] / '.env'
    env_file = Path(env_file)
    if not env_file.exists():
        return
    with open(env_file, 'r', encoding='utf-8') as f:
        for line in f:
            s = line.strip()
            if not s or s.startswith('#'):
                continue
            if '=' in s:
                k, _, v = s.partition('=')
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                os.environ.setdefault(k, v)


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


def main() -> int:
    load_env(None)
    engine = get_engine()

    # BMI = poids / (taille_m^2) = poids / ((taille_cm/100)^2)
    bmi_expr = "(poids / POW((taille / 100.0), 2))"

    with engine.begin() as conn:
        before = conn.execute(text("SELECT COUNT(*) FROM Utilisateur WHERE disease_type = 'Obesity'"))
        before_obesity = int(before.scalar() or 0)

        # 1) Remove obesity when BMI < 30
        res1 = conn.execute(
            text(
                f"UPDATE Utilisateur "
                f"SET disease_type = NULL, disease_severity = NULL "
                f"WHERE disease_type = 'Obesity' AND {bmi_expr} < 30"
            )
        )

        # 2) Set/normalize obesity when BMI >= 30 (only when disease_type is NULL or already Obesity)
        res2 = conn.execute(
            text(
                f"UPDATE Utilisateur "
                f"SET disease_type = 'Obesity', "
                f"    disease_severity = CASE "
                f"        WHEN {bmi_expr} >= 40 THEN 'Severe' "
                f"        WHEN {bmi_expr} >= 35 THEN 'Moderate' "
                f"        ELSE 'Mild' "
                f"    END "
                f"WHERE {bmi_expr} >= 30 AND (disease_type IS NULL OR disease_type = 'Obesity')"
            )
        )

        after = conn.execute(text("SELECT COUNT(*) FROM Utilisateur WHERE disease_type = 'Obesity'"))
        after_obesity = int(after.scalar() or 0)

    print("Obesity label repair done.")
    print(f"- obesity count before: {before_obesity}")
    print(f"- cleared obesity (BMI<30): {getattr(res1, 'rowcount', None)}")
    print(f"- set/normalized obesity (BMI>=30): {getattr(res2, 'rowcount', None)}")
    print(f"- obesity count after: {after_obesity}")

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
