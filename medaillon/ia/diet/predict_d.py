import joblib
import pandas as pd
from pathlib import Path

_MEDAILLON_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = _MEDAILLON_DIR / "models" / "diet_model.pkl"

def load_model():
    data = joblib.load(MODEL_PATH)
    return data["model"], data["scaler"]

def predict(user_data):
    model, scaler = load_model()

    columns = ["age", "weight_kg", "height_m", "bmi", "daily_caloric_intake_kcal"]
    user_df = pd.DataFrame([user_data], columns=columns)

    user_scaled = scaler.transform(user_df)

    prediction = model.predict(user_scaled)[0]

    return prediction


if __name__ == "__main__":
    user = [30, 80, 1.75, 26, 2500]

    result = predict(user)

    print("\n=== PREDICTION ===")
    print("Recommandation :", result)