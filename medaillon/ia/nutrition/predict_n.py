import joblib
import pandas as pd
from pathlib import Path

_MEDAILLON_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = _MEDAILLON_DIR / "models" / "nutrition_model.pkl"

def load_model():
    data = joblib.load(MODEL_PATH)
    return data["model"], data["scaler"]

def predict(user_data):
    model, scaler = load_model()

    columns = [
        "calories_kcal",
        "protein_g",
        "carbohydrates_g",
        "fat_g",
        "fiber_g",
        "sodium_g"
    ]

    df = pd.DataFrame([user_data], columns=columns)
    df_scaled = scaler.transform(df)

    return model.predict(df_scaled)[0]


def predict_with_confidence(user_data):
    model, scaler = load_model()

    columns = [
        "calories_kcal",
        "protein_g",
        "carbohydrates_g",
        "fat_g",
        "fiber_g",
        "sodium_g"
    ]

    df = pd.DataFrame([user_data], columns=columns)
    df_scaled = scaler.transform(df)

    prediction = model.predict(df_scaled)[0]
    confidence = None
    if hasattr(model, "predict_proba"):
        try:
            proba = model.predict_proba(df_scaled)[0]
            confidence = float(max(proba))
        except Exception:
            confidence = None

    return prediction, confidence


if __name__ == "__main__":
    user = [300, 20, 30, 10, 5, 0.2]

    print("\n=== PREDICTION NUTRITION ===")
    print("Meal type :", predict(user))