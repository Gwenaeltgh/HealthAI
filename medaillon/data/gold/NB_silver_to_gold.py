# Generated from NB_silver_to_gold.ipynb
# Notebook: Transformation Medaillon (Silver -> Gold)

# %%
# ### 1) Imports utiles
import os
from pathlib import Path

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

# %%
# ### 2) Definition des paths CSV
SILVER_DIR_CANDIDATES = [
    Path('medaillon/data/silver'),
    Path('../silver'),
    Path('data/silver'),
]
SILVER_DIR = next((p for p in SILVER_DIR_CANDIDATES if p.exists()), None)
if SILVER_DIR is None:
    raise FileNotFoundError('Dossier silver introuvable: medaillon/data/silver')

GOLD_DIR_CANDIDATES = [
    Path('medaillon/data/gold'),
    Path('.'),
    Path('../gold'),
]
GOLD_DIR = next((p for p in GOLD_DIR_CANDIDATES if p.exists()), Path('medaillon/data/gold'))
GOLD_DIR.mkdir(parents=True, exist_ok=True)

print('SILVER_DIR =', SILVER_DIR.resolve())
print('GOLD_DIR   =', GOLD_DIR.resolve())

# %%
# ### 3) Nommage simplifie des datasets
nutrition_name = 'nutrition'
diet_name = 'diet'
exercise_name = 'exercise'

SILVER_FILES = {
    nutrition_name: 'daily_food_nutrition_dataset_silver.csv',
    diet_name: 'diet_recommendations_dataset_silver.csv',
    exercise_name: 'gym_members_exercise_tracking_silver.csv',
}

CSV_PATHS = {name: SILVER_DIR / filename for name, filename in SILVER_FILES.items()}

for name, path in CSV_PATHS.items():
    if not path.exists():
        raise FileNotFoundError(f'Fichier introuvable pour {name}: {path}')

NUTRITION_PATH = CSV_PATHS[nutrition_name]
DIET_PATH = CSV_PATHS[diet_name]
EXERCISE_PATH = CSV_PATHS[exercise_name]

print('Sources silver retenues:')
for name, path in CSV_PATHS.items():
    print(f'- {name}: {path.resolve()}')

# %%
# ### 4) Calcul metier (colonnes calculees, sans graphiques)
def max_rows_from_env() -> int | None:
    raw = os.environ.get('HEALTHIA_MAX_ROWS')
    if not raw:
        return None
    try:
        value = int(str(raw).strip())
    except Exception:
        return None
    return value if value > 0 else None


MAX_ROWS = max_rows_from_env()

nutrition_df = pd.read_csv(NUTRITION_PATH, encoding='utf-8', on_bad_lines='skip', nrows=MAX_ROWS)
diet_df = pd.read_csv(DIET_PATH, encoding='utf-8', on_bad_lines='skip', nrows=MAX_ROWS)
exercise_df = pd.read_csv(EXERCISE_PATH, encoding='utf-8', on_bad_lines='skip', nrows=MAX_ROWS)


def to_numeric_cols(df: pd.DataFrame, cols: list[str]) -> None:
    for col in cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')


# 1) Nutrition: structure conservee + colonnes calculees
nutrition_gold = nutrition_df.copy()
to_numeric_cols(nutrition_gold, ['calories_kcal', 'protein_g', 'carbohydrates_g', 'fat_g', 'sodium_mg'])

if set(['protein_g', 'carbohydrates_g', 'fat_g']).issubset(nutrition_gold.columns):
    nutrition_gold['macro_total_g'] = (
        nutrition_gold['protein_g']
        + nutrition_gold['carbohydrates_g']
        + nutrition_gold['fat_g']
    )
    nutrition_gold['kcal_from_macros_estimated'] = (
        nutrition_gold['protein_g'] * 4
        + nutrition_gold['carbohydrates_g'] * 4
        + nutrition_gold['fat_g'] * 9
    )

if set(['calories_kcal', 'kcal_from_macros_estimated']).issubset(nutrition_gold.columns):
    nutrition_gold['kcal_gap_vs_macros'] = (
        nutrition_gold['calories_kcal'] - nutrition_gold['kcal_from_macros_estimated']
    )

if 'sodium_mg' in nutrition_gold.columns:
    nutrition_gold['sodium_g'] = nutrition_gold['sodium_mg'] / 1000


# 2) Diet: structure conservee + colonnes calculees
diet_gold = diet_df.copy()
to_numeric_cols(diet_gold, ['weight_kg', 'height_cm', 'bmi', 'daily_caloric_intake'])

if 'height_cm' in diet_gold.columns:
    diet_gold['height_m'] = diet_gold['height_cm'] / 100

if set(['weight_kg', 'height_m']).issubset(diet_gold.columns):
    height_sq = diet_gold['height_m'] * diet_gold['height_m']
    diet_gold['bmi_recomputed'] = diet_gold['weight_kg'] / height_sq

if set(['bmi', 'bmi_recomputed']).issubset(diet_gold.columns):
    diet_gold['bmi_gap'] = diet_gold['bmi'] - diet_gold['bmi_recomputed']


# 2.b) Normalisation coherence Obesity vs BMI (corrige le dataset en amont)
def normalize_obesity_labels(df: pd.DataFrame, *, bmi_source_col: str) -> None:
    """Normalise disease_type/disease_severity pour 'Obesity' a partir du BMI.

    - Si disease_type == 'Obesity' mais BMI < 30: clear disease_type & disease_severity
        - Si BMI >= 30 et (disease_type est NULL ou deja 'Obesity'): set disease_type='Obesity'
            et severity: 30-35 Mild, 35-40 Moderate, >=40 Severe

    Ne touche pas aux autres maladies (Diabetes, Hypertension, ...).
    """

    if 'disease_type' not in df.columns:
        return

    if bmi_source_col not in df.columns:
        return

    bmi = pd.to_numeric(df[bmi_source_col], errors='coerce')
    disease = df['disease_type'].astype('string')

    has_severity_col = 'disease_severity' in df.columns
    if not has_severity_col:
        df['disease_severity'] = pd.NA

    is_obesity = disease == 'Obesity'
    is_null_or_obesity = disease.isna() | (disease == 'Obesity')

    # Clear inconsistent obesity when BMI < 30
    clear_mask = is_obesity & (bmi < 30)
    df.loc[clear_mask, 'disease_type'] = pd.NA
    df.loc[clear_mask, 'disease_severity'] = pd.NA

    # Set/normalize obesity when BMI >= 30 (only if no disease or already obesity)
    set_mask = (bmi >= 30) & is_null_or_obesity
    df.loc[set_mask, 'disease_type'] = 'Obesity'
    df.loc[set_mask & (bmi >= 40), 'disease_severity'] = 'Severe'
    df.loc[set_mask & (bmi >= 35) & (bmi < 40), 'disease_severity'] = 'Moderate'
    df.loc[set_mask & (bmi >= 30) & (bmi < 35), 'disease_severity'] = 'Mild'


if 'bmi_recomputed' in diet_gold.columns:
    normalize_obesity_labels(diet_gold, bmi_source_col='bmi_recomputed')
elif 'bmi' in diet_gold.columns:
    normalize_obesity_labels(diet_gold, bmi_source_col='bmi')

if 'blood_pressure_mmhg' in diet_gold.columns:
    bp_text = diet_gold['blood_pressure_mmhg'].astype(str)
    bp_pair = bp_text.str.extract(r'(\d+)\s*/\s*(\d+)')
    bp_single = pd.to_numeric(bp_text, errors='coerce')
    diet_gold['blood_pressure_systolic'] = pd.to_numeric(bp_pair[0], errors='coerce').fillna(bp_single)
    diet_gold['blood_pressure_diastolic'] = pd.to_numeric(bp_pair[1], errors='coerce')

if 'daily_caloric_intake' in diet_gold.columns:
    diet_gold['daily_caloric_intake_kcal'] = diet_gold['daily_caloric_intake']


# 3) Exercise: structure conservee + colonnes calculees
exercise_gold = exercise_df.copy()
to_numeric_cols(
    exercise_gold,
    ['weight_kg', 'height_m', 'max_bpm', 'avg_bpm', 'resting_bpm', 'session_duration_hours', 'calories_burned', 'bmi'],
)

if set(['calories_burned', 'session_duration_hours']).issubset(exercise_gold.columns):
    duration = exercise_gold['session_duration_hours'].replace(0, pd.NA)
    exercise_gold['calories_burned_per_hour'] = exercise_gold['calories_burned'] / duration

if set(['avg_bpm', 'max_bpm']).issubset(exercise_gold.columns):
    max_bpm_nonzero = exercise_gold['max_bpm'].replace(0, pd.NA)
    exercise_gold['avg_bpm_ratio'] = exercise_gold['avg_bpm'] / max_bpm_nonzero

if set(['max_bpm', 'resting_bpm']).issubset(exercise_gold.columns):
    exercise_gold['heart_rate_reserve'] = exercise_gold['max_bpm'] - exercise_gold['resting_bpm']

if set(['weight_kg', 'height_m']).issubset(exercise_gold.columns):
    height_sq = exercise_gold['height_m'] * exercise_gold['height_m']
    exercise_gold['bmi_recomputed'] = exercise_gold['weight_kg'] / height_sq

if set(['bmi', 'bmi_recomputed']).issubset(exercise_gold.columns):
    exercise_gold['bmi_gap'] = exercise_gold['bmi'] - exercise_gold['bmi_recomputed']


summary_df = pd.DataFrame([
    {
        'dataset': nutrition_name,
        'input_rows': len(nutrition_df),
        'output_rows': len(nutrition_gold),
        'input_cols': len(nutrition_df.columns),
        'output_cols': len(nutrition_gold.columns),
    },
    {
        'dataset': diet_name,
        'input_rows': len(diet_df),
        'output_rows': len(diet_gold),
        'input_cols': len(diet_df.columns),
        'output_cols': len(diet_gold.columns),
    },
    {
        'dataset': exercise_name,
        'input_rows': len(exercise_df),
        'output_rows': len(exercise_gold),
        'input_cols': len(exercise_df.columns),
        'output_cols': len(exercise_gold.columns),
    },
])

display(summary_df)
display(nutrition_gold.head())
display(diet_gold.head())
display(exercise_gold.head())

gold_dfs = {
    'nutrition_gold.csv': nutrition_gold,
    'diet_gold.csv': diet_gold,
    'exercise_gold.csv': exercise_gold,
}

# %%
# ### 5) Ecriture des sorties Gold
output_paths = {}

for out_name, df_out in gold_dfs.items():
    out_path = GOLD_DIR / out_name
    df_out.to_csv(out_path, index=False, encoding='utf-8')
    output_paths[out_name] = out_path

print('Fichiers gold enregistres (noms simplifies):')
for out_name, out_path in output_paths.items():
    print(f'- {out_name} -> {out_path.resolve()}')
