import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.preprocessing import StandardScaler



# CONFIG
DATA_PATH = "medaillon/data/gold/diet_gold.csv"
MODEL_PATH = "medaillon/models/diet_model.pkl"



# LOAD DATA
def load_data():
    df = pd.read_csv(DATA_PATH)
    print(f"Dataset chargé : {df.shape}")
    return df


# PREPROCESSING
def preprocess(df):
    features = [
        "age",
        "weight_kg",
        "height_m",
        "bmi",
        "daily_caloric_intake_kcal"
    ]

    target = "diet_recommendation"

    # Drop NaN
    df = df.dropna(subset=features + [target])

    X = df[features]
    y = df[target]

    # Normalisation (optionnel mais pro)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return X_scaled, y, scaler

# TRAIN MODEL
def train_model(X, y):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42
    )

    model.fit(X_train, y_train)

    # Evaluation
    y_pred = model.predict(X_test)

    print("\n=== RESULTATS ===")
    print(classification_report(y_test, y_pred))

    return model


# SAVE MODEL
def save_model(model, scaler):
    os.makedirs("medaillon/models", exist_ok=True)

    joblib.dump({
        "model": model,
        "scaler": scaler
    }, MODEL_PATH)

    print(f"\nModèle sauvegardé dans {MODEL_PATH}")



# LOAD MODEL
def load_model():
    data = joblib.load(MODEL_PATH)
    return data["model"], data["scaler"]


# PREDICT
def predict_user(model, scaler, user_data):
    """
    user_data = [age, weight, height, bmi, calories]
    """
    user_scaled = scaler.transform([user_data])
    prediction = model.predict(user_scaled)

    return prediction[0]


# MAIN
def main():
    df = load_data()

    X, y, scaler = preprocess(df)

    model = train_model(X, y)

    save_model(model, scaler)

    # Exemple utilisateur
    user = [30, 80, 1.75, 26, 2500]

    result = predict_user(model, scaler, user)

    print("\n=== PREDICTION UTILISATEUR ===")
    print("Profil :", user)
    print("Recommandation :", result)


if __name__ == "__main__":
    main()