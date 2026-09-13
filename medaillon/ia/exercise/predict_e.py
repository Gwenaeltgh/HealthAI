import joblib
import pandas as pd
from pathlib import Path

_MEDAILLON_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = _MEDAILLON_DIR / "models" / "exercise_model.pkl"

def load_model():
    data = joblib.load(MODEL_PATH)
    return data["model"], data["scaler"]

def predict(user_data):
    model, scaler = load_model()

    columns = [
        "age",
        "weight_kg",
        "height_m",
        "bmi",
        "calories_burned",
        "avg_bpm",
        "workout_frequency_days_week"
    ]

    df = pd.DataFrame([user_data], columns=columns)
    df_scaled = scaler.transform(df)

    return model.predict(df_scaled)[0]


def predict_with_confidence(user_data):
    model, scaler = load_model()

    columns = [
        "age",
        "weight_kg",
        "height_m",
        "bmi",
        "calories_burned",
        "avg_bpm",
        "workout_frequency_days_week"
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
    user = [30, 80, 1.75, 26, 500, 140, 3]

    print("\n=== PREDICTION EXERCISE ===")
    print("Workout recommandé :", predict(user))