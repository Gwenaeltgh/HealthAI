# Generated from NB_bronze_to_silver.ipynb
# Notebook: Transformation Medaillon (Bronze -> Silver)
# Run this script to perform the same cleaning steps as the notebook.

# %%
# ### 1) Imports utiles
import csv
import re
from pathlib import Path

from typing import Optional

import pandas as pd

try:
    from IPython.display import display  # type: ignore
except ModuleNotFoundError:  # pragma: no cover
    def display(obj):  # type: ignore
        if hasattr(obj, "head"):
            try:
                print(obj.head().to_string())
                return
            except Exception:
                pass
        print(str(obj))
import shutil
import sys

# %%
# ### 2) Definition des paths CSV
EXPECTED_FILES = [
    'daily_food_nutrition_dataset.csv',
    'diet_recommendations_dataset.csv',
    'gym_members_exercise_tracking.csv',
]

BRONZE_DIR_CANDIDATES = [
    Path('medaillon/data/copper'),
    Path('../copper'),
    Path('data/copper'),
]
BRONZE_DIR = next((p for p in BRONZE_DIR_CANDIDATES if p.exists()), None)
if BRONZE_DIR is None:
    # try to find the expected files elsewhere in the workspace and copy them into bronze
    print('[WARN] medaillon/data/copper not found — searching workspace for source CSVs...')
    found = {}
    for name in EXPECTED_FILES:
        matches = list(Path('.').rglob(name))
        if matches:
            found[name] = matches[0]
    if found:
        bronze_target = Path('medaillon') / 'data' / 'copper'
        bronze_target.mkdir(parents=True, exist_ok=True)
        for name, src in found.items():
            tgt = bronze_target / name
            try:
                shutil.copy2(src, tgt)
                print(f"[COPY] {src} -> {tgt}")
            except Exception as e:
                print(f"[WARN] failed to copy {src}: {e}")
        BRONZE_DIR = bronze_target
        print(f"[INFO] Populated bronze dir: {BRONZE_DIR}")
    else:
        raise FileNotFoundError('Dossier bronze introuvable: medaillon/data/copper (and no matching CSVs found in workspace)')

SILVER_DIR_CANDIDATES = [
    Path('medaillon/data/silver'),
    Path('.'),
    Path('../silver'),
]
SILVER_DIR = next((p for p in SILVER_DIR_CANDIDATES if p.exists()), Path('medaillon/data/silver'))
SILVER_DIR.mkdir(parents=True, exist_ok=True)

FILES = EXPECTED_FILES
def find_most_recent_bronze(bronze_dir: Path, base_name: str) -> Optional[Path]:
    stem = Path(base_name).stem
    # exact match
    candidates = [p for p in bronze_dir.rglob(base_name) if p.is_file()]
    # match date-suffixed variants
    candidates += [p for p in bronze_dir.rglob(f"{stem}_*.csv") if p.is_file()]
    # match any starting with stem
    candidates += [p for p in bronze_dir.rglob(f"{stem}*.csv") if p.is_file()]
    # deduplicate
    seen = {}
    for p in candidates:
        seen[str(p.resolve())] = p
    candidates = list(seen.values())
    if not candidates:
        return None
    candidates.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    return candidates[0]

CSV_PATHS = {}
print('Fichiers source detectes:')
for name in FILES:
    found = find_most_recent_bronze(BRONZE_DIR, name)
    if found:
        CSV_PATHS[name] = found
        print(f"- {name}: {found.resolve()} | exists=True")
    else:
        print(f"- {name}: {BRONZE_DIR / name} | exists=False")

# %%
# ### 3) Nettoyage de la donnee + visualisation

def to_snake_case(name: str) -> str:
    cleaned = name.strip().lower()
    cleaned = cleaned.replace('%', 'pct')
    cleaned = re.sub(r'[^a-z0-9]+', '_', cleaned)
    cleaned = re.sub(r'_+', '_', cleaned).strip('_')
    return cleaned


def load_csv_robust(csv_path: Path):
    with csv_path.open(encoding='utf-8', errors='replace', newline='') as f:
        reader = csv.reader(f)
        header = next(reader)
        expected_cols = len(header)
        rows = []
        repaired = 0
        skipped = 0

        for row in reader:
            if len(row) == expected_cols:
                rows.append(row)
            elif len(row) == expected_cols + 1:
                fixed = [f"{row[0]},{row[1].lstrip()}", *row[2:]]
                rows.append(fixed)
                repaired += 1
            else:
                skipped += 1

    return pd.DataFrame(rows, columns=header), repaired, skipped


def clean_for_coherence(df: pd.DataFrame):
    report = {}
    out = df.copy()

    out.columns = [to_snake_case(c) for c in out.columns]

    for col in out.select_dtypes(include=['object', 'string']).columns:
        out[col] = out[col].astype(str).str.strip()
        out[col] = out[col].str.replace(r'\s+', ' ', regex=True)
        out[col] = out[col].replace({'': pd.NA, 'nan': pd.NA, 'None': pd.NA, 'NULL': pd.NA})

    for col in out.columns:
        if out[col].dtype != 'object' and str(out[col].dtype) != 'string':
            continue
        candidate = out[col].astype(str).str.replace(',', '.', regex=False).str.replace('%', '', regex=False)
        numeric = pd.to_numeric(candidate, errors='coerce')
        if numeric.notna().mean() >= 0.95:
            out[col] = numeric

    before_dupes = len(out)
    out = out.drop_duplicates().reset_index(drop=True)
    report['duplicates_removed'] = before_dupes - len(out)

    negative_fixed = 0
    for col in out.select_dtypes(include='number').columns:
        mask = out[col] < 0
        negative_fixed += int(mask.fillna(False).sum())
        out.loc[mask, col] = pd.NA
    report['negative_values_set_to_na'] = negative_fixed

    report['rows'] = len(out)
    report['cols'] = len(out.columns)
    report['null_cells'] = int(out.isna().sum().sum())
    return out, report


bronze_dfs = {}
silver_dfs = {}
quality_report = {}

for file_name, path in CSV_PATHS.items():
    bronze_df, repaired, skipped = load_csv_robust(path)
    clean_df, clean_report = clean_for_coherence(bronze_df)

    bronze_dfs[file_name] = bronze_df
    silver_dfs[file_name] = clean_df
    quality_report[file_name] = {
        'input_rows': len(bronze_df),
        'input_cols': len(bronze_df.columns),
        'repaired_rows_during_read': repaired,
        'skipped_rows_during_read': skipped,
        **clean_report,
    }

report_df = pd.DataFrame(quality_report).T
display(report_df)

for file_name in FILES:
    print()
    print(f'Apercu nettoye: {file_name}')
    display(silver_dfs[file_name].head())

# %%
# ### 4) Ecriture des sorties Silver
output_paths = {}

for file_name, clean_df in silver_dfs.items():
    out_name = file_name.replace('.csv', '_silver.csv')
    out_path = SILVER_DIR / out_name
    clean_df.to_csv(out_path, index=False, encoding='utf-8')
    output_paths[file_name] = out_path

print('Fichiers silver enregistres:')
for file_name, out_path in output_paths.items():
    print(f'- {file_name} -> {out_path.resolve()}')
