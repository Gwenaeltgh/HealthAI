# from fastapi import FastAPI
# from pydantic import BaseModel

# # IMPORT TES MODELES
# from medaillon.ia.diet.predict_d import predict as predict_diet
# from medaillon.ia.exercise.predict_e import predict as predict_exercise
# from medaillon.ia.nutrition.predict_n import predict as predict_nutrition

# app = FastAPI()


# # INPUT GLOBAL UTILISATEUR
# class UserInput(BaseModel):
#     age: int
#     weight_kg: float
#     height_m: float
#     bmi: float
#     daily_caloric_intake_kcal: float

#     avg_bpm: float
#     resting_bpm: float
#     session_duration_hours: float
#     calories_burned: float

#     # nutrition input (optionnel)
#     calories_kcal: float
#     protein_g: float
#     carbohydrates_g: float
#     fat_g: float
#     fiber_g: float
#     sodium_g: float


# @app.get("/")
# def root():
#     return {"message": "Global AI API running"}


# @app.post("/ai/recommendation")
# def full_recommendation(user: UserInput):

#     # --- DIET ---
#     diet_data = [
#         user.age,
#         user.weight_kg,
#         user.height_m,
#         user.bmi,
#         user.daily_caloric_intake_kcal
#     ]
#     diet_result = predict_diet(diet_data)

#     # --- EXERCISE ---
#     exercise_data = [
#         user.age,
#         user.weight_kg,
#         user.height_m,
#         user.avg_bpm,
#         user.resting_bpm,
#         user.session_duration_hours,
#         user.calories_burned,
#         user.bmi
#     ]
#     exercise_result = predict_exercise(exercise_data)

#     # --- NUTRITION ---
#     nutrition_data = [
#         user.calories_kcal,
#         user.protein_g,
#         user.carbohydrates_g,
#         user.fat_g,
#         user.fiber_g,
#         user.sodium_g
#     ]
#     nutrition_result = predict_nutrition(nutrition_data)

#     return {
#         "diet_recommendation": diet_result,
#         "exercise_recommendation": exercise_result,
#         "nutrition_recommendation": nutrition_result
#     }