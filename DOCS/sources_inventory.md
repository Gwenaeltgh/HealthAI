# Inventaire des sources de données - HealthAI Coach

## Vue d'ensemble

Le projet exploite trois sources Kaggle distinctes, toutes téléchargées automatiquement par le pipeline.

## Sources retenues

| Source | Type | Usage projet | Emplacement local |
| --- | --- | --- | --- |
| `valakhorasani/gym-members-exercise-dataset` | CSV Kaggle | Données activité / sport | [data/kaggle/gym_members_exercise_tracking_valakhorasani_gym-members-exercise-dataset/](../data/kaggle/gym_members_exercise_tracking_valakhorasani_gym-members-exercise-dataset/) |
| `adilshamim8/daily-food-and-nutrition-dataset` | CSV Kaggle | Données nutrition / alimentation | [data/kaggle/daily_food_nutrition_dataset_adilshamim8_daily-food-and-nutrition-dataset/](../data/kaggle/daily_food_nutrition_dataset_adilshamim8_daily-food-and-nutrition-dataset/) |
| `ziya07/diet-recommendations-dataset` | CSV Kaggle | Recommandations diététiques | [data/kaggle/diet_recommendations_dataset_ziya07_diet-recommendations-dataset/](../data/kaggle/diet_recommendations_dataset_ziya07_diet-recommendations-dataset/) |

## Justification métier

- Le dataset sport alimente le volet exercice et engagement physique.
- Le dataset nutrition alimente le catalogue alimentaire et les analyses nutritionnelles.
- Le dataset diète alimente la partie recommandations et classification des profils.

## Traçabilité

- Le manifest de téléchargement est stocké dans [data/kaggle/index.json](../data/kaggle/index.json).
- Les sorties intermédiaires silver et gold sont présentes dans [medaillon/data/silver/](../medaillon/data/silver/) et [medaillon/data/gold/](../medaillon/data/gold/).
