from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd


_THIS_DIR = Path(__file__).resolve().parent
MODEL_PATH = _THIS_DIR / "models" / "diet_model.pkl"


def load_model():
	data = joblib.load(MODEL_PATH)
	return data["model"], data["scaler"]


def predict(user_data: list[float] | tuple[float, ...]):
	"""Predict diet recommendation for a single user.

	Expected order: [age, weight_kg, height_m, bmi, daily_caloric_intake_kcal]
	"""
	model, scaler = load_model()

	columns = [
		"age",
		"weight_kg",
		"height_m",
		"bmi",
		"daily_caloric_intake_kcal",
	]
	user_df = pd.DataFrame([list(user_data)], columns=columns)
	user_scaled = scaler.transform(user_df)
	prediction = model.predict(user_scaled)[0]
	return prediction


def predict_with_confidence(user_data: list[float] | tuple[float, ...]):
	"""Predict diet recommendation + confidence (if available).

	Confidence is returned as a float in [0, 1] when the underlying model
	supports predict_proba, otherwise None.
	"""
	model, scaler = load_model()

	columns = [
		"age",
		"weight_kg",
		"height_m",
		"bmi",
		"daily_caloric_intake_kcal",
	]
	user_df = pd.DataFrame([list(user_data)], columns=columns)
	user_scaled = scaler.transform(user_df)
	prediction = model.predict(user_scaled)[0]

	confidence = None
	if hasattr(model, "predict_proba"):
		try:
			proba = model.predict_proba(user_scaled)[0]
			confidence = float(max(proba))
		except Exception:
			confidence = None

	return prediction, confidence


if __name__ == "__main__":
	user = [30, 80, 1.75, 26, 2500]
	result = predict(user)

	print("\n=== PREDICTION ===")
	print("Recommandation :", result)