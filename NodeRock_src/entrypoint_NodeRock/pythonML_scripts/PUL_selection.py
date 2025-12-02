# pip install pandas numpy scikit-learn pulearn

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MinMaxScaler
from pulearn import ElkanotoPuClassifier
import json
import warnings
import random
import os

# Configuration
RANDOM_STATE = 42

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

ANALYZED_PROJECT_FILE = os.path.join(CURRENT_DIR, '../..', 'FoldersUsedDuringExecution/temporary_analyzedProjectInfo/temporary_analyzedProject.json')
with open(ANALYZED_PROJECT_FILE, 'r', encoding='utf-8') as file:
    analyzed_project_data = json.load(file)

ANALYZED_PROJECT_PATH = analyzed_project_data['pathProjectFolder']
ANALYZED_PROJECT_NAME = analyzed_project_data['benchmarkName']
# print(ANALYZED_PROJECT_PATH)
# print(ANALYZED_PROJECT_NAME)


KNOWN_DATA_PATH = os.path.join(CURRENT_DIR, '../../..', 'results/combined_df.csv')
UNKNOWN_DATA_PATH = os.path.join(CURRENT_DIR, '../../..', ANALYZED_PROJECT_PATH, 'NodeRock_Info/', ANALYZED_PROJECT_NAME + '.csv')

JSON_OUTPUT_PATH = os.path.join(CURRENT_DIR, '../../..', ANALYZED_PROJECT_PATH, 'NodeRock_Info/', 'selected_tests_results.json')
# OUTPUT_CSV_PATH = './results/predictions_output.csv'
# JSON_OUTPUT_PATH = './results/predicted_races.json'


def main():
    np.random.seed(RANDOM_STATE)
    random.seed(RANDOM_STATE)
    scaler = MinMaxScaler()


    print("="*60)
    print("1. LOADING AND PREPARING DATA")
    print("="*60)

    if not os.path.exists(KNOWN_DATA_PATH):
        raise FileNotFoundError(f"File not found: {KNOWN_DATA_PATH}")
    if not os.path.exists(UNKNOWN_DATA_PATH):
        raise FileNotFoundError(f"File not found: {UNKNOWN_DATA_PATH}")

    df_known = pd.read_csv(KNOWN_DATA_PATH)
    df_unknown = pd.read_csv(UNKNOWN_DATA_PATH)

    print(f"\nKnown data (Train): {len(df_known)} samples")
    print(f"Unknown data (Predict): {len(df_unknown)} samples")

    # Total_duration_s_Normalized feature inclusion on df_unknown
    df_unknown = df_unknown.rename(columns={'Total_duration_s': 'Total_duration_s_Raw'})
    df_unknown['Total_duration_s_Normalized'] = df_unknown.groupby('BenchmarkName')['Total_duration_s_Raw'].transform(
        lambda x: scaler.fit_transform(x.values.reshape(-1, 1)).flatten()
    )

    target_col = 'HasEventRace'
    info_cols = ['BenchmarkName', 'TestFilePath', 'TestCaseName', 'HasEventRace', 'Unnamed: 0']
    
    numeric_cols_known = df_known.select_dtypes(include=[np.number]).columns.tolist()
    feature_cols = [c for c in numeric_cols_known if c not in info_cols]
        
    # for col in feature_cols:
    #     if col not in df_unknown.columns:
    #         df_unknown[col] = 0
            
    print(f"Total features used: {len(feature_cols)}")
    # print(f"Features: {feature_cols}")


    X_known = df_known[feature_cols].fillna(0).values 
    y_known = df_known['HasEventRace'].astype(int).values
    X_unknown = df_unknown[feature_cols].fillna(0).values 

    print(f"\nDistribution of y_known (0=Unlabeled, 1=Positive): {np.bincount(y_known)}")

    print("\n" + "="*60)
    print("2. DATA NORMALIZATION")
    print("="*60)

    X_known_scaled = X_known
    X_unknown_scaled = scaler.fit_transform(X_unknown)

    print("\n" + "="*60)
    print("3. TRAINING PU LEARNING MODEL WITH RANDOM FOREST")
    print("="*60)

    print(f"Positive examples: {np.sum(y_known == 1)}, Unlabeled: {np.sum(y_known == 0)}")

    base_estimator = RandomForestClassifier(
        n_estimators=50,
        class_weight='balanced',
        n_jobs=-1,
        random_state=RANDOM_STATE
    )

    pu_estimator = ElkanotoPuClassifier(
        estimator=base_estimator,
        hold_out_ratio=0.2
    )

    print("\nTraining PU Learning model...")
    np.random.seed(RANDOM_STATE)
    
    try:
        pu_estimator.fit(X_known_scaled, y_known)
        print("PU Model trained successfully!")
    except Exception as e:
        print(f"Error during training: {e}")
        return

    print("\n" + "="*60)
    print("4. PREDICTING LABELS")
    print("="*60)

    y_pred_proba_raw = pu_estimator.predict_proba(X_unknown_scaled)[:, 1]

    preds_proba = np.clip(y_pred_proba_raw, 0, 1)

    THRESHOLD = 0.3
    y_pred_unknown = (preds_proba >= THRESHOLD).astype(int)

    df_unknown['Predicted_HasEventRace'] = y_pred_unknown
    df_unknown['Predicted_Probability'] = preds_proba

    print("\n" + "="*60)
    print("5. FINAL RESULTS")
    print("="*60)

    positive_predictions_df = df_unknown[df_unknown['Predicted_HasEventRace'] == 1]

    print(f"\nTotal tests analyzed: {len(df_unknown)}")
    print(f"Predicted as TRUE (HasEventRace): {len(positive_predictions_df)}")
    print(f"Predicted as FALSE/UNKNOWN: {len(df_unknown) - len(positive_predictions_df)}")

    print(f"\n--- Probability Statistics (Calibrated) ---")
    print(f"Threshold used: {THRESHOLD}")
    print(f"Mean Probability: {preds_proba.mean():.4f}")
    print(f"Min Probability: {preds_proba.min():.4f}")
    print(f"Max Probability: {preds_proba.max():.4f}")
    print(f"Std Dev: {preds_proba.std():.4f}")

    print("\n--- Details of predictions (Top 10 highest probability) ---")
    cols_to_show = ['TestCaseName', 'Predicted_HasEventRace', 'Predicted_Probability']
    # Check if TestCaseName exists, otherwise pick columns that exist
    display_cols = [c for c in cols_to_show if c in df_unknown.columns]
    
    print(df_unknown[display_cols]
          .sort_values('Predicted_Probability', ascending=False)
          .head(50)
          .to_string(index=False))

    # Optional: Save results to disk
    # df_unknown.to_csv(OUTPUT_CSV_PATH, index=False)
    # print(f"\nFull results saved to {OUTPUT_CSV_PATH}")

    print("\n" + "="*60)
    print("6. GERANDO ARQUIVO JSON DE SAÍDA")
    print("="*60)

    df_export = df_unknown[df_unknown['Predicted_HasEventRace'] == 1].copy()

    df_export = df_export.sort_values(by='Predicted_Probability', ascending=False)

    required_cols = ['TestFilePath', 'TestCaseName']
    if all(col in df_export.columns for col in required_cols):
        
        df_export = df_export.rename(columns={
            'TestFilePath': 'file',
            'TestCaseName': 'title'
        })

        final_json_data = df_export[['file', 'title']]

        final_json_data.to_json(JSON_OUTPUT_PATH, orient='records', indent=4)

    print(f"Sucesso! Arquivo JSON gerado em: {os.path.abspath(JSON_OUTPUT_PATH)}")
    print(f"Foram exportados {len(final_json_data)} itens.")

if __name__ == "__main__":
    main()