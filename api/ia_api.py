from fastapi import FastAPI
from pydantic import BaseModel

from medaillon.predict import predict_with_confidence as predict_diet_model_with_confidence
from medaillon.ia.exercise.predict_e import predict_with_confidence as predict_exercise_with_confidence
from medaillon.ia.nutrition.predict_n import predict_with_confidence as predict_nutrition_with_confidence

app = FastAPI()

class UserInput(BaseModel):
    age: int
    weight_kg: float
    height_m: float
    bmi: float
    daily_caloric_intake_kcal: float


class ExerciseInput(BaseModel):
    age: int
    weight_kg: float
    height_m: float
    bmi: float
    calories_burned: float
    avg_bpm: float
    workout_frequency_days_week: int


class NutritionInput(BaseModel):
    calories_kcal: float
    protein_g: float
    carbohydrates_g: float
    fat_g: float
    fiber_g: float
    sodium_g: float


@app.get("/")
def root():
    return {"message": "HealthAI IA API running"}


@app.post("/predict")
def predict_diet_route(user: UserInput):
    data = [
        user.age,
        user.weight_kg,
        user.height_m,
        user.bmi,
        user.daily_caloric_intake_kcal
    ]

    result, confidence = predict_diet_model_with_confidence(data)

    return {
        "recommendation": result,
        "confidence": confidence,
    }


@app.post("/predict/exercise")
def predict_exercise_route(user: ExerciseInput):
    data = [
        user.age,
        user.weight_kg,
        user.height_m,
        user.bmi,
        user.calories_burned,
        user.avg_bpm,
        user.workout_frequency_days_week,
    ]

    result, confidence = predict_exercise_with_confidence(data)
    return {
        "recommendation": result,
        "confidence": confidence,
    }


@app.post("/predict/nutrition")
def predict_nutrition_route(user: NutritionInput):
    data = [
        user.calories_kcal,
        user.protein_g,
        user.carbohydrates_g,
        user.fat_g,
        user.fiber_g,
        user.sodium_g,
    ]

    result, confidence = predict_nutrition_with_confidence(data)
    return {
        "recommendation": result,
        "confidence": confidence,
    }