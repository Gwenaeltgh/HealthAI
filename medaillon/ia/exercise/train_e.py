import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.preprocessing import StandardScaler

DATA_PATH = "medaillon/data/gold/exercise_gold.csv"
MODEL_PATH = "medaillon/models/exercise_model.pkl"


def load_data():
    df = pd.read_csv(DATA_PATH)
    print(f"Dataset chargé : {df.shape}")
    return df


def preprocess(df):
    features = [
        "age",
        "weight_kg",
        "height_m",
        "bmi",
        "calories_burned",
        "avg_bpm",
        "workout_frequency_days_week"
    ]

    target = "workout_type"

    df = df.dropna(subset=features + [target])

    X = df[features]
    y = df[target]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return X_scaled, y, scaler


def train_model(X, y):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    print("\n=== RESULTATS ===")
    print(classification_report(y_test, y_pred))

    return model


def save_model(model, scaler):
    os.makedirs("medaillon/models", exist_ok=True)

    joblib.dump({
        "model": model,
        "scaler": scaler
    }, MODEL_PATH)

    print(f"\nModèle sauvegardé dans {MODEL_PATH}")


def main():
    df = load_data()
    X, y, scaler = preprocess(df)
    model = train_model(X, y)
    save_model(model, scaler)


if __name__ == "__main__":
    main()