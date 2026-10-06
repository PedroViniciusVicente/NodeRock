import random
import warnings

import numpy as np
import pandas as pd
from pulearn import ElkanotoPuClassifier
from sklearn.ensemble import RandomForestClassifier

warnings.filterwarnings("ignore", message=".*'force_all_finite'.*", category=FutureWarning)

# Configs
DATA_PATH = "results/combined_df.csv"
FEATURES = [
    "InvokeFunPre_Count_Raw",
    "InvokeFunPre_Count_Normalized",
    "Invokes_with_callback_Raw",
    "Invokes_with_callback_Normalized",
    "Cbs_Total_delay_ms_Raw",
    "Cbs_Total_delay_ms_Normalized",
    "Cb_Delays_Greater_Than_100_ms_Raw",
    "Cb_Delays_Greater_Than_100_ms_Normalized",
    "InvokesInterval_Greater_Than_100_ms_Raw",
    "InvokesInterval_Greater_Than_100_ms_Normalized",
    "AsyncFunction_Count_Raw",
    "AsyncFunction_Count_Normalized",
    "Await_Count_Raw",
    "Await_Count_Normalized",
    "Unique_Asynchook_ids_Raw",
    "Unique_Asynchook_ids_Normalized",
    "Total_duration_s_Raw",
    "Total_duration_s_Normalized",
    "totalSettledPromises_Raw",
    "totalSettledPromises_Normalized",
    "avgResolved_Raw",
    "avgResolved_Normalized",
    "avgRejected_Raw",
    "avgRejected_Normalized",
    "longestResolved_Raw",
    "longestResolved_Normalized",
    "resolvedPercentage_Raw",
    "resolvedPercentage_Normalized",
    "awaitIntervals_Raw",
    "awaitIntervals_Normalized",
]
TARGET_BENCHMARK = "node-archiver"
TARGET_COL = "HasEventRace"
INFO_COLS = ["BenchmarkName", "TestFilePath", "TestCaseName", "HasEventRace"]
THRESHOLD = 0.3
RANDOM_STATE = 42

np.random.seed(RANDOM_STATE)
random.seed(RANDOM_STATE)


def to_binary(series: pd.Series) -> pd.Series:
    """Convert a True/False/1/0/'True'/'False' column into integers (0/1)."""
    if series.dtype == object:
        series = series.astype(str).str.strip().str.lower().map(
            {"true": 1, "1": 1, "false": 0, "0": 0}
        )
    return series.fillna(0).astype(int)

print("\n" + "=" * 70)
print("1. LOADING AND PREPARING DATA")
print("=" * 70)

df = pd.read_csv(DATA_PATH)
print(f"\nLoaded '{DATA_PATH}' with {len(df)} rows and {df.shape[1]} columns")

df_known = df[df["BenchmarkName"] != TARGET_BENCHMARK].copy()
df_unknown = df[df["BenchmarkName"] == TARGET_BENCHMARK].copy()

if df_unknown.empty:
    raise ValueError(f"No rows found for benchmark '{TARGET_BENCHMARK}' in {DATA_PATH}.")

missing = [c for c in FEATURES if c not in df.columns]
if missing:
    raise ValueError(f"Features missing from {DATA_PATH}: {missing}")
feature_cols = FEATURES

print(f"\nKnown data (training): {len(df_known)} samples")
print(f"Unknown data (prediction): {len(df_unknown)} samples")
print(f"Total features used: {len(feature_cols)}")

X_known = df_known[feature_cols].values
y_known = to_binary(df_known[TARGET_COL]).values
X_unknown = df_unknown[feature_cols].values

print(f"\ny_known distribution (0=Unknown/False, 1=True): {np.bincount(y_known)}")

print("\n" + "=" * 70)
print("2. TRAINING PU LEARNING MODEL")
print("=" * 70)

if np.sum(y_known == 1) == 0:
    raise ValueError("No positive examples available in df_known. PU Learning requires positive samples.")

print(f"Positive examples: {np.sum(y_known == 1)}, unlabeled: {np.sum(y_known == 0)}")

base_estimator = RandomForestClassifier(
    n_estimators=50,
    class_weight="balanced",
    n_jobs=-1,
    random_state=RANDOM_STATE,
)

pu_estimator = ElkanotoPuClassifier(
    estimator=base_estimator,
    hold_out_ratio=0.2,
)

np.random.seed(RANDOM_STATE)
pu_estimator.fit(X_known, y_known)


print("\n" + "=" * 70)
print(f"3. PREDICTING LABELS FOR BENCHMARK '{TARGET_BENCHMARK}'")
print("=" * 70)

y_pred_proba_raw = pu_estimator.predict_proba(X_unknown)[:, 1]
preds_proba = np.clip(y_pred_proba_raw, 0, 1)

df_unknown["Predicted_HasEventRace"] = (preds_proba >= THRESHOLD).astype(int)
df_unknown["Predicted_Probability"] = preds_proba


print("\n" + "=" * 70)
print(f"4. FINAL RESULTS: '{TARGET_BENCHMARK}' TESTS PRIORITIZED FOR 'HasEventRace'")
print("=" * 70)

df_sorted = df_unknown.sort_values("Predicted_Probability", ascending=False)
selected_df = df_sorted[df_sorted["Predicted_HasEventRace"] == 1]
filtered_out_df = df_sorted[df_sorted["Predicted_HasEventRace"] == 0]

print(f"\nTotal tests analyzed: {len(df_unknown)}")
print(f"Tests selected (predicted TRUE): {len(selected_df)}")
print(f"Tests filtered out (predicted FALSE/UNKNOWN): {len(filtered_out_df)}")

print(f"\n--- Priority ranking ({len(selected_df)} tests) ---")
for rank, test_name in enumerate(selected_df["TestCaseName"], start=1):
    print(f"{rank}. {test_name}")

print(f"\n--- Tests filtered out ({len(filtered_out_df)} tests) ---")
for test_name in filtered_out_df["TestCaseName"]:
    print(f"- {test_name}")