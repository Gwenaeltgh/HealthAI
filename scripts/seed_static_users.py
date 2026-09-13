#!/usr/bin/env python3
"""Seed/delete ~30 deterministic fake users in the API database.

This script is meant for local/dev environments to quickly populate the
`Utilisateur` table with a small, deterministic set of users, and to remove them
safely later.

Safety principles:
- Users are identified by a unique, explicit `nom` prefix.
- Deletion only targets that exact static list (not a broad LIKE).
- Optional dependent rows are deleted first (Meal/MealFood/UserExercise/...)
  so FK constraints won't block.

Usage:
  python scripts/seed_static_users.py create
  python scripts/seed_static_users.py delete

Connection:
- Uses `DATABASE_URL` if present.
- If the hostname is not reachable (common when running on host vs Docker),
  it will try the same URL with host swapped between `db` and `127.0.0.1`.

Notes:
- Targets the API database (DATABASE_URL), not TRAINING_DATABASE_URL.
"""

from __future__ import annotations

import argparse
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional, Sequence, Tuple

from sqlalchemy import create_engine, text


SEED_PREFIX = "__seed_static_user__"
ENTERPRISE_SEED_PREFIX = "__seed_enterprise_user__"


@dataclass(frozen=True)
class StaticUser:
    nom: str
    age: int
    gender: str
    poids: float
    taille: float
    disease_type: Optional[str] = None
    disease_severity: Optional[str] = None
    daily_caloric_intake: Optional[int] = None
    adherence_to_diet_plan: Optional[float] = None
    physical_activity_level: Optional[str] = None
    enterprise_id: Optional[int] = None


def build_static_users() -> List[StaticUser]:
    # Deterministic set: stable across runs and machines.
    # Keep values realistic but simple.
    genders = ["Male", "Female"]
    activity_levels = ["Low", "Moderate", "High"]

    users: List[StaticUser] = []
    for i in range(1, 31):
        nom = f"{SEED_PREFIX}{i:02d}"
        age = 20 + (i % 25)  # 20..44
        gender = genders[i % 2]
        poids = float(55 + (i % 35))  # 55..89
        taille = float(155 + (i % 30))  # 155..184
        pal = activity_levels[i % 3]

        # Add a small amount of optional fields (still deterministic).
        disease_type = None
        disease_severity = None
        if i % 10 == 0:
            disease_type = "hypertension"
            disease_severity = "mild"
        elif i % 15 == 0:
            disease_type = "diabetes"
            disease_severity = "moderate"

        users.append(
            StaticUser(
                nom=nom,
                age=age,
                gender=gender,
                poids=poids,
                taille=taille,
                disease_type=disease_type,
                disease_severity=disease_severity,
                daily_caloric_intake=2000 + (i * 10),
                adherence_to_diet_plan=round(0.4 + ((i % 10) / 20), 2),
                physical_activity_level=pal,
                enterprise_id=None,
            )
        )

    return users


def build_enterprise_seed_users(count: int, enterprise_id: int) -> List[StaticUser]:
    """Deterministically generate `count` users for a given enterprise."""
    genders = ["Male", "Female"]
    activity_levels = ["Low", "Moderate", "High"]

    users: List[StaticUser] = []
    base = int(enterprise_id) * 10_000
    for i in range(1, int(count) + 1):
        nom = f"{ENTERPRISE_SEED_PREFIX}{enterprise_id}__{i:04d}"
        seed = base + i
        age = 18 + (seed % 47)  # 18..64
        gender = genders[seed % 2]
        poids = float(50 + (seed % 50))  # 50..99
        taille = float(150 + (seed % 40))  # 150..189 (cm)
        pal = activity_levels[seed % 3]

        disease_type = None
        disease_severity = None
        if seed % 11 == 0:
            disease_type = "hypertension"
            disease_severity = "mild"
        elif seed % 17 == 0:
            disease_type = "diabetes"
            disease_severity = "moderate"

        users.append(
            StaticUser(
                nom=nom,
                age=age,
                gender=gender,
                poids=poids,
                taille=taille,
                disease_type=disease_type,
                disease_severity=disease_severity,
                daily_caloric_intake=1900 + (seed % 600),
                adherence_to_diet_plan=round(0.3 + ((seed % 14) / 20), 2),
                physical_activity_level=pal,
                enterprise_id=int(enterprise_id),
            )
        )

    return users


def list_enterprises(engine) -> List[Tuple[int, str, str]]:
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT id, slug, name FROM Enterprise ORDER BY id ASC")).fetchall()
    out: List[Tuple[int, str, str]] = []
    for r in rows:
        if not r:
            continue
        out.append((int(r[0]), str(r[1]), str(r[2])))
    return out


def resolve_enterprise_ids(engine, enterprise_selector: Optional[str], all_enterprises: bool) -> List[int]:
    enterprises = list_enterprises(engine)
    if not enterprises:
        return []

    if all_enterprises or not enterprise_selector:
        return [eid for (eid, _slug, _name) in enterprises]

    raw = str(enterprise_selector).strip()
    if raw.isdigit():
        wanted = int(raw)
        return [wanted] if any(eid == wanted for (eid, _slug, _name) in enterprises) else []

    for eid, slug, _name in enterprises:
        if slug == raw:
            return [eid]
    return []


def load_env_from_parent_dir() -> None:
    """Load .env from the directory above /scripts.

    This matches the common workflow where you run:
      PS> cd scripts
      PS> python seed_static_users.py create

    and the project's .env lives at the repo root (../.env).
    Existing environment variables are never overwritten.
    """

    env_path = Path(__file__).resolve().parents[1] / '.env'
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding='utf-8').splitlines():
        line = raw_line.strip()
        if not line or line.startswith('#'):
            continue
        if '=' not in line:
            continue
        key, _, value = line.partition('=')
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def _ensure_sqlalchemy_mysql_driver(url: str) -> str:
    # prisma/compose often provide mysql://..., SQLAlchemy expects mysql+pymysql://
    if url.startswith("mysql://") and "mysql+pymysql" not in url:
        return url.replace("mysql://", "mysql+pymysql://", 1)
    return url


def _swap_db_host(url: str) -> str:
    # Simple, pragmatic swaps for typical local/Docker setups.
    # We avoid heavy parsing to keep dependencies minimal.
    if "@db:" in url:
        return url.replace("@db:", "@127.0.0.1:", 1)
    if "@127.0.0.1:" in url:
        return url.replace("@127.0.0.1:", "@db:", 1)
    if "://db:" in url:
        return url.replace("://db:", "://127.0.0.1:", 1)
    if "://127.0.0.1:" in url:
        return url.replace("://127.0.0.1:", "://db:", 1)
    return url


def get_engine(database_url: Optional[str] = None):
    url = database_url or os.environ.get("DATABASE_URL")
    if not url:
        raise RuntimeError(
            "Missing DATABASE_URL. Provide it via env var or --database-url."
        )

    url = _ensure_sqlalchemy_mysql_driver(url)

    # First try as-is, then try swapping host between db and 127.0.0.1.
    engine = create_engine(url)
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return engine
    except Exception:
        swapped = _swap_db_host(url)
        if swapped == url:
            raise
        engine2 = create_engine(swapped)
        with engine2.connect() as conn:
            conn.execute(text("SELECT 1"))
        return engine2


def _chunk(items: Sequence[int], size: int = 500) -> Iterable[Sequence[int]]:
    for i in range(0, len(items), size):
        yield items[i : i + size]


def _chunk_str(items: Sequence[str], size: int = 400) -> Iterable[Sequence[str]]:
    for i in range(0, len(items), size):
        yield items[i : i + size]


def _fetch_existing_names(conn, names: Sequence[str]) -> set:
    existing: set = set()
    if not names:
        return existing

    for chunk_names in _chunk_str(list(names), 400):
        params = {f"n{i}": name for i, name in enumerate(chunk_names)}
        in_list = ",".join(f":n{i}" for i in range(len(chunk_names)))
        rows = conn.execute(text(f"SELECT nom FROM Utilisateur WHERE nom IN ({in_list})"), params).fetchall()
        for r in rows:
            if r and r[0] is not None:
                existing.add(str(r[0]))
    return existing


def create_users(engine, users: Sequence[StaticUser], dry_run: bool = False) -> Tuple[int, int]:
    """Return (created_count, already_present_count)."""
    names = [u.nom for u in users]

    with engine.begin() as conn:
        existing = _fetch_existing_names(conn, names)

        to_insert = [u for u in users if u.nom not in existing]
        if dry_run:
            return (len(to_insert), len(existing))

        created = 0
        for u in to_insert:
            conn.execute(
                text(
                    "INSERT INTO Utilisateur "
                    "(nom, age, gender, poids, taille, disease_type, disease_severity, daily_caloric_intake, adherence_to_diet_plan, physical_activity_level, enterprise_id) "
                    "VALUES (:nom, :age, :gender, :poids, :taille, :disease_type, :disease_severity, :daily_caloric_intake, :adherence_to_diet_plan, :physical_activity_level, :enterprise_id)"
                ),
                {
                    "nom": u.nom,
                    "age": int(u.age),
                    "gender": u.gender,
                    "poids": float(u.poids),
                    "taille": float(u.taille),
                    "disease_type": u.disease_type,
                    "disease_severity": u.disease_severity,
                    "daily_caloric_intake": u.daily_caloric_intake,
                    "adherence_to_diet_plan": u.adherence_to_diet_plan,
                    "physical_activity_level": u.physical_activity_level,
                    "enterprise_id": u.enterprise_id,
                },
            )
            created += 1

        return (created, len(existing))


def _delete_user_ids(conn, user_ids: Sequence[int]) -> int:
    if not user_ids:
        return 0

    # Delete dependent rows first.
    # MealFood -> Meal
    deleted_total = 0
    for chunk_ids in _chunk(list(user_ids), 200):
        id_params = {f"u{i}": v for i, v in enumerate(chunk_ids)}
        id_in = ",".join(f":u{i}" for i in range(len(chunk_ids)))

        conn.execute(
            text(
                "DELETE FROM MealFood WHERE meal_id IN (SELECT id FROM Meal WHERE user_id IN ("
                + id_in
                + "))"
            ),
            id_params,
        )
        conn.execute(text("DELETE FROM Meal WHERE user_id IN (" + id_in + ")"), id_params)
        conn.execute(text("DELETE FROM UserExercise WHERE user_id IN (" + id_in + ")"), id_params)
        conn.execute(text("DELETE FROM Recommendation WHERE user_id IN (" + id_in + ")"), id_params)
        conn.execute(text("DELETE FROM UserAllergy WHERE user_id IN (" + id_in + ")"), id_params)
        conn.execute(text("DELETE FROM UserDietaryRestriction WHERE user_id IN (" + id_in + ")"), id_params)
        conn.execute(text("DELETE FROM Utilisateur WHERE id IN (" + id_in + ")"), id_params)
        deleted_total += len(chunk_ids)

    return deleted_total


def delete_users(engine, users: Sequence[StaticUser], dry_run: bool = False) -> int:
    names = [u.nom for u in users]

    params = {f"n{i}": name for i, name in enumerate(names)}
    in_list = ",".join(f":n{i}" for i in range(len(names)))

    with engine.begin() as conn:
        rows = conn.execute(
            text(f"SELECT id FROM Utilisateur WHERE nom IN ({in_list})"),
            params,
        ).fetchall()
        user_ids = [int(r[0]) for r in rows if r and r[0] is not None]

        if not user_ids:
            return 0

        if dry_run:
            return len(user_ids)

        _delete_user_ids(conn, user_ids)
        return len(user_ids)


def delete_enterprise_seed_users(engine, enterprise_ids: Sequence[int], dry_run: bool = False) -> int:
    """Delete all users created by the enterprise seeder for the selected enterprises."""
    deleted = 0
    with engine.begin() as conn:
        for eid in enterprise_ids:
            prefix = f"{ENTERPRISE_SEED_PREFIX}{int(eid)}__%"
            rows = conn.execute(
                text(
                    "SELECT id FROM Utilisateur "
                    "WHERE enterprise_id = :eid AND nom LIKE :prefix"
                ),
                {"eid": int(eid), "prefix": prefix},
            ).fetchall()
            user_ids = [int(r[0]) for r in rows if r and r[0] is not None]
            if not user_ids:
                continue
            if dry_run:
                deleted += len(user_ids)
                continue
            deleted += _delete_user_ids(conn, user_ids)

    return deleted


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create/delete deterministic fake users (static seed)")
    parser.add_argument(
        "--database-url",
        default=None,
        help="Override DATABASE_URL (SQLAlchemy mysql URL).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would change without writing.",
    )

    sub = parser.add_subparsers(dest="cmd", required=True)

    p_create = sub.add_parser("create", help="Insert users (static seed by default, enterprise seed with flags)")
    p_create.add_argument(
        "--count",
        type=int,
        default=None,
        help="Number of users to create per enterprise (enterprise seed mode only).",
    )
    p_create.add_argument(
        "--enterprise",
        default=None,
        help="Target enterprise (id or slug). If omitted, targets all enterprises (default).",
    )
    p_create.add_argument(
        "--all-enterprises",
        action="store_true",
        help="Create users for all enterprises (default when using enterprise seed mode).",
    )

    p_delete = sub.add_parser("delete", help="Delete users (static seed by default, enterprise seed with flags)")
    p_delete.add_argument(
        "--enterprise",
        default=None,
        help="Delete enterprise-seeded users for a specific enterprise (id or slug).",
    )
    p_delete.add_argument(
        "--all-enterprises",
        action="store_true",
        help="Delete enterprise-seeded users for all enterprises.",
    )

    return parser.parse_args(argv)


def main(argv: Sequence[str]) -> int:
    args = parse_args(argv)

    load_env_from_parent_dir()

    try:
        engine = get_engine(args.database_url)
    except Exception as e:
        print(f"DB connection failed: {e}")
        return 2

    if args.cmd == "create":
        enterprise_mode = args.enterprise is not None or args.all_enterprises or args.count is not None
        if not enterprise_mode:
            users = build_static_users()
            created, existed = create_users(engine, users, dry_run=bool(args.dry_run))
            if args.dry_run:
                print(f"DRY-RUN: would create {created}; already present {existed}")
            else:
                print(f"Created {created} users; already present {existed}")
            return 0

        count = int(args.count) if args.count is not None else 30
        if count <= 0:
            print("--count must be > 0")
            return 2

        enterprise_ids = resolve_enterprise_ids(engine, args.enterprise, bool(args.all_enterprises) or args.enterprise is None)
        if not enterprise_ids:
            print("No enterprise found. Create enterprises first (e.g., scripts/create_enterprises.js).")
            return 2

        users: List[StaticUser] = []
        for eid in enterprise_ids:
            users.extend(build_enterprise_seed_users(count=count, enterprise_id=eid))

        created, existed = create_users(engine, users, dry_run=bool(args.dry_run))
        if args.dry_run:
            print(f"DRY-RUN: would create {created}; already present {existed} (enterprise seed)")
        else:
            print(f"Created {created} users; already present {existed} (enterprise seed)")
        return 0

    if args.cmd == "delete":
        enterprise_mode = args.enterprise is not None or args.all_enterprises
        if not enterprise_mode:
            users = build_static_users()
            deleted = delete_users(engine, users, dry_run=bool(args.dry_run))
            if args.dry_run:
                print(f"DRY-RUN: would delete {deleted} users")
            else:
                print(f"Deleted {deleted} users")
            return 0

        enterprise_ids = resolve_enterprise_ids(engine, args.enterprise, bool(args.all_enterprises) or args.enterprise is None)
        if not enterprise_ids:
            print("No enterprise found for deletion.")
            return 2

        deleted = delete_enterprise_seed_users(engine, enterprise_ids, dry_run=bool(args.dry_run))
        if args.dry_run:
            print(f"DRY-RUN: would delete {deleted} enterprise-seeded users")
        else:
            print(f"Deleted {deleted} enterprise-seeded users")
        return 0

    print("Unknown command")
    return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
