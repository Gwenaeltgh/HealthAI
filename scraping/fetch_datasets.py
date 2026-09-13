#!/usr/bin/env python3
"""
KAGGLE DATASETS DOWNLOADER - Robust CLI for fetching datasets via Kaggle API

This is a cleaned, self-contained version of the original script.
Features:
- Load optional .env for KAGGLE_USERNAME/KAGGLE_KEY
- Check authentication
- Download datasets via Kaggle API
- Unzip and write metadata
- Optionally add synthetic `date` columns to CSVs
- Export a manifest usable by the ingestion pipeline

Usage examples are kept in the repo README; run `python fetch_datasets.py --help` for options.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import random
import sys
import zipfile
import subprocess
import shutil
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Optional, List, Dict

# Default datasets for calories/fitness app
DEFAULT_DATASETS: List[str] = [
    "valakhorasani/gym-members-exercise-dataset",
    "adilshamim8/daily-food-and-nutrition-dataset",
    "ziya07/diet-recommendations-dataset",
]


@dataclass
class DateRange:
    start: datetime
    end: datetime


def load_env(env_file: Optional[Path] = None) -> Dict[str, str]:
    loaded: Dict[str, str] = {}
    if env_file is None:
        env_file = Path(__file__).parent / ".env"
    if not env_file.exists():
        return loaded
    try:
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                s = line.strip()
                if not s or s.startswith("#"):
                    continue
                if "=" in s:
                    k, _, v = s.partition("=")
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    os.environ[k] = v
                    loaded[k] = v
        print(f"[INFO] Loaded {len(loaded)} variable(s) from {env_file}")
    except Exception as e:
        print(f"[WARN] Could not load .env file: {e}")
    return loaded


def check_auth() -> bool:
    username = os.environ.get("KAGGLE_USERNAME")
    key = os.environ.get("KAGGLE_KEY")
    if username and key:
        print(f"[AUTH] Using environment variables (KAGGLE_USERNAME: {username[:3]}***)")
        return True
    kaggle_json_paths = [
        Path.home() / ".kaggle" / "kaggle.json",
        Path(os.environ.get("USERPROFILE", "")) / ".kaggle" / "kaggle.json",
    ]
    for p in kaggle_json_paths:
        if p.exists():
            try:
                with open(p, "r", encoding="utf-8") as f:
                    creds = json.load(f)
                if "username" in creds and "key" in creds:
                    print(f"[AUTH] Using kaggle.json from {p}")
                    return True
            except Exception:
                continue
    print("[ERROR] Kaggle authentication not found! Provide kaggle.json or KAGGLE_USERNAME/KAGGLE_KEY")
    return False


def compute_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def parse_slug(slug: str) -> tuple[str, str]:
    parts = slug.strip().split("/")
    if len(parts) != 2:
        raise ValueError("Invalid slug, expected owner/dataset-name")
    return parts[0], parts[1]


def sanitize_dir_name(name: str) -> str:
    cleaned = "".join(c.lower() if c.isalnum() or c in {"-", "_"} else "_" for c in name)
    while "__" in cleaned:
        cleaned = cleaned.replace("__", "_")
    return cleaned.strip("_") or "dataset"


def get_dataset_dir(base_dir: Path, owner: str, dataset: str) -> Path:
    return base_dir / "kaggle" / f"{owner}__{dataset}"


def find_existing_dataset_dir(base_dir: Path, slug: str) -> Optional[Path]:
    kaggle_dir = base_dir / "kaggle"
    if not kaggle_dir.exists():
        return None
    for metadata_file in kaggle_dir.glob("**/metadata.json"):
        try:
            with open(metadata_file, "r", encoding="utf-8") as f:
                md = json.load(f)
            if md.get("slug") == slug:
                return metadata_file.parent
        except Exception:
            continue
    return None


def detect_primary_files(dataset_dir: Path) -> List[Dict[str, Any]]:
    primary: List[Dict[str, Any]] = []
    exts = {".csv", ".json", ".xlsx", ".parquet"}
    for ext in exts:
        for p in dataset_dir.glob(f"**/*{ext}"):
            if p.is_file() and p.name.lower() not in {"metadata.json", "index.json"}:
                rel = p.relative_to(dataset_dir)
                primary.append({"name": str(rel), "path": str(p), "size_bytes": p.stat().st_size, "type": ext.lstrip('.')})
    primary.sort(key=lambda x: x["size_bytes"], reverse=True)
    return primary


def build_preferred_dataset_dir(base_dir: Path, owner: str, dataset_name: str, primary_files: List[Dict[str, Any]]) -> Path:
    """Return a preferred dataset directory path.

    If a primary file is available, use its stem to create a friendlier directory name,
    otherwise fall back to the default owner__dataset folder.
    """
    kaggle_dir = base_dir / "kaggle"
    if primary_files:
        first = primary_files[0].get("name", "")
        try:
            stem = Path(first).stem
        except Exception:
            stem = "dataset"
        dir_name = sanitize_dir_name(f"{stem}__{owner}_{dataset_name}")
        return kaggle_dir / dir_name
    return get_dataset_dir(base_dir, owner, dataset_name)


def detect_extracted_files(dataset_dir: Path) -> List[Dict[str, Any]]:
    files: List[Dict[str, Any]] = []
    for p in dataset_dir.rglob("*"):
        if not p.is_file():
            continue
        name = p.name.lower()
        if name.endswith('.zip') or name in {"metadata.json", "index.json"}:
            continue
        rel = p.relative_to(dataset_dir)
        files.append({"name": str(rel), "size_bytes": p.stat().st_size})
    files.sort(key=lambda x: x["name"])
    return files


def ensure_csv_filenames_with_date(dataset_dir: Path, date_tag: str) -> int:
    renamed = 0
    for p in dataset_dir.glob("**/*.csv"):
        if not p.is_file():
            continue
        stem = p.stem
        maybe_base, _, maybe_date = stem.rpartition("_")
        has_date = bool(maybe_base) and len(maybe_date) == 8 and maybe_date.isdigit()
        base = maybe_base if has_date else stem
        new_name = f"{base}_{date_tag}.csv"
        if p.name == new_name:
            continue
        target = p.with_name(new_name)
        # If a file with the same date exists, overwrite it per user preference
        try:
            if target.exists() and target != p:
                target.unlink()
                action = "[OVERWRITE]"
            else:
                action = "[RENAME]"
            p.rename(target)
            renamed += 1
            print(f"{action} {p.name} -> {target.name}")
        except Exception as e:
            print(f"[ERROR] renaming {p} -> {target}: {e}")
    return renamed


def already_up_to_date(dataset_dir: Path, expected_hash: Optional[str] = None) -> bool:
    md_file = dataset_dir / "metadata.json"
    if not dataset_dir.exists() or not md_file.exists():
        return False
    try:
        with open(md_file, "r", encoding="utf-8") as f:
            md = json.load(f)
        if expected_hash and md.get("sha256") != expected_hash:
            return False
        files = md.get("files", [])
        if not files:
            return False
        for fi in files[:3]:
            if not (dataset_dir / fi.get("name", "")).exists():
                return False
        return True
    except Exception:
        return False


def add_dates_to_csv(csv_path: Path, start_date: datetime, end_date: datetime, mode: str = "sequential") -> bool:
    try:
        with open(csv_path, "r", encoding="utf-8", newline="") as f:
            reader = list(csv.reader(f))
        if len(reader) < 2:
            return False
        header = reader[0]
        rows = reader[1:]
        if "date" in [c.lower() for c in header]:
            print(f"[DATES] Skipping {csv_path.name} - already has date column")
            return True
        total_days = (end_date - start_date).days
        if total_days <= 0:
            total_days = 365
        num = len(rows)
        dates = []
        if mode == "sequential":
            for i in range(num):
                d = start_date + timedelta(days=int((i / max(num - 1, 1)) * total_days))
                dates.append(d.strftime("%Y-%m-%d"))
        else:
            for _ in range(num):
                d = start_date + timedelta(days=random.randint(0, total_days))
                dates.append(d.strftime("%Y-%m-%d"))
            dates.sort()
        new_header = ["date"] + header
        new_rows = [[dates[i]] + rows[i] for i in range(num)]
        with open(csv_path, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(new_header)
            writer.writerows(new_rows)
        print(f"[DATES] Added date to {csv_path.name} ({num} rows)")
        return True
    except Exception as e:
        print(f"[ERROR] add_dates_to_csv {csv_path}: {e}")
        return False


def add_dates_to_dataset(dataset_dir: Path, start_date: datetime, end_date: datetime, mode: str = "sequential") -> int:
    count = 0
    for csv_file in dataset_dir.glob("**/*.csv"):
        if csv_file.is_file():
            if add_dates_to_csv(csv_file, start_date, end_date, mode):
                count += 1
    return count


def unzip_dataset(zip_path: Path, target_dir: Path) -> List[Dict[str, Any]]:
    extracted: List[Dict[str, Any]] = []
    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            for info in zf.infolist():
                if not info.is_dir():
                    extracted.append({"name": info.filename, "size_bytes": info.file_size, "compressed_size": info.compress_size})
            zf.extractall(target_dir)
            print(f"[UNZIP] Extracted {len(extracted)} files to {target_dir}")
    except zipfile.BadZipFile:
        print(f"[ERROR] Corrupt zip: {zip_path}")
        return []
    except Exception as e:
        print(f"[ERROR] unzip failed: {e}")
        return []
    return extracted


def write_metadata(dataset_dir: Path, slug: str, owner: str, dataset: str, date_download: str, zip_size: int, zip_hash: str, files: List[Dict[str, Any]], primary_files: List[Dict[str, Any]]) -> Dict[str, Any]:
    md = {
        "source": "kaggle",
        "slug": slug,
        "owner": owner,
        "dataset": dataset,
        "date_download": date_download,
        "zip_size_bytes": zip_size,
        "sha256": zip_hash,
        "files": files,
        "primary_files": primary_files,
        "total_files": len(files),
        "dataset_dir": str(dataset_dir),
    }
    md_path = dataset_dir / "metadata.json"
    with open(md_path, "w", encoding="utf-8") as f:
        json.dump(md, f, indent=2, ensure_ascii=False)
    print(f"[META] Written: {md_path}")
    return md


def download_dataset(slug: str, output_dir: Path, force: bool = False, unzip: bool = True) -> Optional[Dict[str, Any]]:
    api = None
    try:
        from kaggle.api.kaggle_api_extended import KaggleApi  # type: ignore
        api = KaggleApi()
    except Exception:
        # If the Python package is not available, try to use the kaggle CLI if present
        kaggle_cli = shutil.which("kaggle")
        if not kaggle_cli:
            print("[ERROR] kaggle package not installed and kaggle CLI not found. Install via: pip install kaggle")
            return None

        class KaggleCliWrapper:
            def authenticate(self):
                return

            def dataset_download_files(self, dataset: str, path: str, unzip: bool = False, force: bool = False, quiet: bool = False):
                cmd = [kaggle_cli, "datasets", "download", "-d", dataset, "-p", path]
                if unzip:
                    cmd.append("--unzip")
                if force:
                    cmd.append("--force")
                if quiet:
                    # kaggle CLI has no quiet flag, so redirect stdout/stderr
                    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
                else:
                    subprocess.run(cmd, check=True)

        api = KaggleCliWrapper()
    try:
        owner, dataset_name = parse_slug(slug)
    except ValueError as e:
        print(f"[ERROR] {e}")
        return None
    existing = find_existing_dataset_dir(output_dir, slug)
    dataset_dir = existing if existing else get_dataset_dir(output_dir, owner, dataset_name)
    if not force and already_up_to_date(dataset_dir):
        print(f"[SKIP] {slug} up-to-date")
        with open(dataset_dir / "metadata.json", "r", encoding="utf-8") as f:
            return json.load(f)
    print(f"[DOWNLOAD] {slug} -> {dataset_dir}")
    dataset_dir.mkdir(parents=True, exist_ok=True)
    try:
        api.authenticate()
        api.dataset_download_files(dataset=slug, path=str(dataset_dir), unzip=False, force=force, quiet=False)
    except Exception as e:
        em = str(e).lower()
        if "404" in em or "not found" in em:
            print(f"[ERROR] Not found: {slug}")
        elif "403" in em:
            print(f"[ERROR] Forbidden: {slug} - accept terms on Kaggle if needed")
        elif "401" in em:
            print(f"[ERROR] Authentication failed for Kaggle API")
        else:
            print(f"[ERROR] download failed: {e}")
        return None
    downloaded_at = datetime.now(timezone.utc)
    date_tag = downloaded_at.strftime("%Y%m%d")
    zip_files = list(dataset_dir.glob("*.zip"))
    if not zip_files:
        print(f"[ERROR] No zip found for {slug}")
        return None
    zip_path = zip_files[0]
    zip_size = zip_path.stat().st_size
    zip_hash = compute_sha256(zip_path)
    if unzip:
        unzip_dataset(zip_path, dataset_dir)
    primary = detect_primary_files(dataset_dir)
    preferred = build_preferred_dataset_dir(output_dir, owner, dataset_name, primary)
    if preferred != dataset_dir:
        target = preferred
        if target.exists():
            target = output_dir / "kaggle" / sanitize_dir_name(f"{preferred.name}__{owner}_{dataset_name}")
        if not target.exists():
            dataset_dir.rename(target)
            dataset_dir = target
            print(f"[RENAME] {dataset_dir}")
    ensure_csv_filenames_with_date(dataset_dir, date_tag)
    extracted = detect_extracted_files(dataset_dir)
    primary = detect_primary_files(dataset_dir)
    metadata = write_metadata(dataset_dir, slug, owner, dataset_name, downloaded_at.isoformat(), zip_size, zip_hash, extracted, primary)
    print(f"[SUCCESS] {slug} downloaded ({zip_size/1024/1024:.2f} MB)")
    return metadata


def write_global_index(base_dir: Path, datasets_md: List[Dict[str, Any]]) -> Path:
    idx_dir = base_dir / "kaggle"
    idx_dir.mkdir(parents=True, exist_ok=True)
    idx_path = idx_dir / "index.json"
    data = {"generated_at": datetime.now(timezone.utc).isoformat(), "total_datasets": len(datasets_md), "datasets": []}
    for md in datasets_md:
        data["datasets"].append({"slug": md.get("slug"), "owner": md.get("owner"), "dataset": md.get("dataset"), "date_download": md.get("date_download"), "sha256": md.get("sha256"), "total_files": md.get("total_files"), "metadata_path": str(Path(md.get("dataset_dir", "")) / "metadata.json")})
    with open(idx_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[INDEX] Written: {idx_path}")
    return idx_path


def export_manifest(manifest_path: Path, datasets_md: List[Dict[str, Any]]) -> None:
    manifest = {"generated_at": datetime.now(timezone.utc).isoformat(), "version": "1.0", "description": "Kaggle datasets manifest for backend ingestion", "total_datasets": len(datasets_md), "datasets": []}
    for md in datasets_md:
        ds = {"slug": md.get("slug"), "owner": md.get("owner"), "dataset": md.get("dataset"), "source": "kaggle", "date_download": md.get("date_download"), "dataset_dir": md.get("dataset_dir"), "primary_files": [{"name": pf.get("name"), "path": pf.get("path"), "type": pf.get("type"), "size_bytes": pf.get("size_bytes")} for pf in md.get("primary_files", [])]}
        manifest["datasets"].append(ds)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"[MANIFEST] Exported: {manifest_path}")


def find_most_recent_primary_file(dataset_dir: Path, primary_name: str) -> Optional[Path]:
    """Find the most recent file in dataset_dir matching the primary_name base.

    primary_name may include subpaths; we match by base stem, stripping trailing date/suffixes if present.
    """
    if not dataset_dir or not dataset_dir.exists():
        return None
    p = Path(primary_name)
    ext = p.suffix.lstrip('.') or 'csv'
    base_stem = p.stem
    import re
    m = re.match(r"^(?P<base>.+?)_(?P<date>\d{8})(?:_\d+)?$", base_stem)
    if m:
        base = m.group('base')
    else:
        base = base_stem

    candidates = list(dataset_dir.rglob(f"{base}_*.{ext}")) + list(dataset_dir.rglob(f"{base}.{ext}"))
    if not candidates:
        # fallback to provided path
        candidate = dataset_dir / primary_name
        return candidate if candidate.exists() else None
    # choose by modification time
    candidates = [c for c in candidates if c.is_file()]
    if not candidates:
        return None
    candidates.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    return candidates[0]


def install_to_bronze(datasets_md: List[Dict[str, Any]], bronze_dir: Path, overwrite: bool = False) -> int:
    bronze_dir.mkdir(parents=True, exist_ok=True)
    copied = 0
    for md in datasets_md:
        ds_dir = Path(md.get("dataset_dir", ""))
        for pf in md.get("primary_files", []):
            name = pf.get("name", "")
            # find the most recent matching file in the dataset dir
            src = None
            try:
                src = find_most_recent_primary_file(ds_dir, name)
            except Exception:
                src = None
            if not src or not src.exists():
                print(f"[WARN] primary file not found: {name}")
                continue
            target = bronze_dir / src.name
            if target.exists() and not overwrite:
                print(f"[SKIP] exists: {target}")
                continue
            try:
                shutil.copy2(src, target)
                copied += 1
                print(f"[COPY] {src} -> {target}")
            except Exception as e:
                print(f"[ERROR] copying {src} -> {target}: {e}")
    print(f"[INSTALL] Copied {copied} files to {bronze_dir}")
    return copied


def build_argument_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Download Kaggle datasets via official API", formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--out", type=Path, default=Path("./data"), help="Output directory (default: ./data)")
    p.add_argument("--datasets", nargs="*", default=None, help="Dataset slugs to download (owner/dataset-name)")
    p.add_argument("--force", action="store_true", help="Force re-download")
    p.add_argument("--no-unzip", action="store_true", help="Do not unzip downloaded archives")
    p.add_argument("--export-manifest", type=Path, default=None, help="Export a manifest.json for ingestion")
    p.add_argument("--env-file", type=Path, default=None, help="Path to .env file (default: script .env)")
    # Date columns are not optional — filenames will include download date by default
    p.add_argument("--install-bronze", action="store_true", help="Copy primary files into medaillon/data/copper for downstream processing")
    return p


# date column insertion removed: filenames include download date by default


def process_single_dataset(slug: str, args: argparse.Namespace) -> Optional[Dict[str, Any]]:
    """Download a single dataset. Filenames will include the download date by default.

    The script always tags CSV filenames with the download date; the --no-unzip flag
    will prevent extraction and renaming.
    """
    md = download_dataset(slug, args.out, force=args.force, unzip=not args.no_unzip)
    if not md:
        return None
    return md


def main() -> int:
    parser = build_argument_parser()
    args = parser.parse_args()
    load_env(args.env_file)
    if not check_auth():
        return 1
    datasets = args.datasets if args.datasets else DEFAULT_DATASETS
    if not datasets:
        print("[ERROR] No datasets specified")
        return 1
    success: List[Dict[str, Any]] = []
    failed: List[str] = []
    for i, slug in enumerate(datasets, 1):
        print(f"\n[{i}/{len(datasets)}] Processing: {slug}\n{'-'*50}")
        md = process_single_dataset(slug, args)
        if md:
            success.append(md)
        else:
            failed.append(slug)
    if success:
        write_global_index(args.out, success)
        if getattr(args, 'install_bronze', False):
            bronze = Path('medaillon') / 'data' / 'copper'
            install_to_bronze(success, bronze, overwrite=args.force)
    if args.export_manifest and success:
        export_manifest(args.export_manifest, success)
    print("\nSUMMARY\n" + "="*40)
    print(f"Successful: {len(success)}")
    print(f"Failed: {len(failed)}")
    if failed:
        print("Failed datasets:")
        for f in failed:
            print(" - ", f)
        return 1
    print("All datasets downloaded successfully!")
    return 0


if __name__ == '__main__':
    sys.exit(main())
