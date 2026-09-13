#!/usr/bin/env python3
"""Run the full pipeline: download -> bronze -> silver -> gold

Usage: python run_pipeline.py [--force] [--profile complete|performance] [--skip-download] [--max-rows N]
"""
from __future__ import annotations

import argparse
import os
import socket
import time
import subprocess
import sys


EXPECTED_SILVER_FILES = [
    'daily_food_nutrition_dataset_silver.csv',
    'diet_recommendations_dataset_silver.csv',
    'gym_members_exercise_tracking_silver.csv',
]


def can_connect(host: str, port: int, *, timeout_s: float = 1.0) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout_s):
            return True
    except OSError:
        return False


def ensure_mysql_running() -> bool:
    in_docker = os.path.exists('/.dockerenv')
    default_host = 'db' if in_docker else '127.0.0.1'
    host = os.environ.get('MYSQL_HOST', default_host)
    port = int(os.environ.get('MYSQL_PORT', '3306'))

    # When running on the host, docker-compose exposes MySQL on localhost.
    # If someone set MYSQL_HOST=db (docker internal hostname), that won't work on the host.
    if not in_docker and host.strip().lower() == 'db':
        host = '127.0.0.1'

    if can_connect(host, port):
        return True

    print(f"[INFO] MySQL not reachable at {host}:{port}. Trying to start docker service 'db'...")
    try:
        subprocess.run(['docker', 'compose', 'up', '-d', 'db'], check=False)
    except FileNotFoundError:
        print("[WARN] Docker not found. Start MySQL manually or run: docker compose up -d db")
        return False

    # Prefer waiting for Docker healthcheck to report "healthy"
    for _ in range(90):
        try:
            res = subprocess.run(
                ['docker', 'inspect', 'healthia-db', '--format', '{{.State.Health.Status}}'],
                capture_output=True,
                text=True,
                check=False,
            )
            status = (res.stdout or '').strip().lower()
            if status == 'healthy':
                return True
        except Exception:
            status = ''

        # Fallback: accept as soon as the TCP port is open
        if can_connect(host, port):
            # If health isn't available, port-open is the best signal we have.
            if not status:
                return True
        time.sleep(1)

    print(f"[WARN] MySQL still not reachable at {host}:{port}.")
    return False

def run(cmd: list[str], *, extra_env: dict[str, str] | None = None) -> int:
    print(f"RUN: {' '.join(cmd)}")
    env = os.environ.copy()
    if extra_env:
        env.update({k: v for k, v in extra_env.items() if v is not None})
    res = subprocess.run(cmd, env=env)
    return res.returncode


def has_silver_ready() -> bool:
    silver_dir = os.path.join('medaillon', 'data', 'silver')
    return all(os.path.exists(os.path.join(silver_dir, name)) for name in EXPECTED_SILVER_FILES)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description='Run the HealthIA pipeline')
    parser.add_argument('--force', action='store_true', help='Force re-download (Kaggle)')
    parser.add_argument(
        '--profile',
        choices=['complete', 'performance'],
        default='complete',
        help='Pipeline profile. performance is optimized for demo on modest machines.',
    )
    parser.add_argument(
        '--skip-download',
        action='store_true',
        help='Skip Kaggle download step. Useful for demo/offline environments when silver already exists.',
    )
    parser.add_argument(
        '--max-rows',
        type=int,
        default=None,
        help='Limit dataset rows processed/ingested (passed as HEALTHIA_MAX_ROWS to downstream scripts).',
    )
    return parser

def main():
    args = build_parser().parse_args()

    extra_env: dict[str, str] = {}
    if args.profile == 'performance' and args.max_rows is None:
        # Reasonable default for a demo on modest hardware.
        args.max_rows = 2_000

    if args.max_rows is not None and args.max_rows > 0:
        extra_env['HEALTHIA_MAX_ROWS'] = str(int(args.max_rows))

    # PERF profile tries hard to avoid requiring Kaggle auth by reusing existing silver outputs.
    # If silver isn't present yet, we keep the option to download (unless explicitly skipped).
    skip_download = bool(args.skip_download) or (args.profile == 'performance' and has_silver_ready())

    # 1) download + install bronze (optional)
    if not skip_download:
        cmd1 = [sys.executable, 'scraping/fetch_datasets.py', '--install-bronze']
        if args.force:
            cmd1.append('--force')
        if run(cmd1) != 0:
            print('Downloader failed')
            return 1

    # 2) silver (optional if already present)
    if not has_silver_ready():
        if run([sys.executable, 'medaillon/data/silver/NB_bronze_to_silver.py'], extra_env=extra_env) != 0:
            print('Silver step failed')
            return 2

    # 3) gold
    if run([sys.executable, 'medaillon/data/gold/NB_silver_to_gold.py'], extra_env=extra_env) != 0:
        print('Gold step failed')
        return 3

    # 4) ingest gold CSVs into DB tables (nutrition_gold, diet_gold, exercise_gold)
    if not ensure_mysql_running():
        print('Gold->DB ingestion failed (MySQL not running)')
        return 4
    if run([sys.executable, 'medaillon/ingest/gold_to_db.py'], extra_env=extra_env) != 0:
        print('Gold->DB ingestion failed')
        return 4

    # 5) populate normalized app tables (Food, Exercise)
    if run([sys.executable, 'medaillon/ingest/gold_to_normalized.py'], extra_env=extra_env) != 0:
        print('Gold->Normalized ingestion failed')
        return 5

    # NOTE: intentionally does NOT import users into DB.
    # (i.e. we do not run medaillon/ingest/gold_to_users.py here.)
    print('Pipeline completed successfully')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
