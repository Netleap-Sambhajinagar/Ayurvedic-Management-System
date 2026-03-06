# Rule-based Vikriti analyzer — classifies patient Vikriti into three categories:

import re
import os
import requests
import pandas as pd
from datetime import datetime, timezone
from pymongo import MongoClient

KEYWORD_WEIGHT_MAP: dict[str, float] = {
    "body":       1.0,
    "skin":       1.2,
    "digestion":  1.5,
    "hunger":     1.3,
    "appetite":   1.3,
    "sleep":      1.2,
    "bowel":      1.4,
    "stress":     1.3,
    "energy":     1.1,
    "joint":      1.0,
    "thinking":   1.2,
    "clarity":    1.2,
    "thirst":     1.1,
    "weather":    1.0,
    "temp":       1.0,
    "speaking":   0.9,
    "speech":     0.9,
    "memory":     1.0,
    "immunity":   1.3,
}

DEFAULT_WEIGHT: float = 1.0


def identify_columns(df: pd.DataFrame):
    id_col = None
    question_map = []

    for col in df.columns:
        if re.search(r'\bemail\b', col.lower()):
            id_col = col
            break
    if id_col is None:
        for col in df.columns:
            if re.search(r'\bname\b', col.lower()):
                id_col = col
                break
    if id_col is None:
        id_col = df.columns[0]  

    for col in df.columns:
        c_low = col.lower().strip()
        if col == id_col or re.search(r'\btimestamp\b', c_low):
            continue
        matched_weight = DEFAULT_WEIGHT
        for kw, weight in KEYWORD_WEIGHT_MAP.items():
            if re.search(r'\b' + re.escape(kw) + r'\b', c_low):
                matched_weight = weight
                break
        question_map.append((col, matched_weight))

    return id_col, question_map


SEVERITY_THRESHOLDS: dict[str, float] = {
    "Sthula":   0.60,   
    "Madhyama": 0.45,   
    "Sukshma":  0.00,   
}


MIXED_IMBALANCE_TOLERANCE: float = 0.10

LOW_CONFIDENCE_THRESHOLD: float = 0.40



def classify_severity(dominant_score: float) -> str:
    """Return Sthula / Madhyama / Sukshma based on the dominant dosha score."""
    if dominant_score >= SEVERITY_THRESHOLDS["Sthula"]:
        return "Sthula"
    if dominant_score >= SEVERITY_THRESHOLDS["Madhyama"]:
        return "Madhyama"
    return "Sukshma"


def detect_mixed_imbalance(
    vata: float, pitta: float, kapha: float
) -> str | None:
    pairs = [
        ("Vata-Pitta",  vata,  pitta),
        ("Vata-Kapha",  vata,  kapha),
        ("Pitta-Kapha", pitta, kapha),
    ]
    candidates = [
        (label, s1, s2)
        for label, s1, s2 in pairs
        if abs(s1 - s2) <= MIXED_IMBALANCE_TOLERANCE
    ]
    if not candidates:
        return None
    best = max(candidates, key=lambda t: t[1] + t[2])
    return best[0]


def compute_confidence(dominant_score: float, second_score: float) -> float:
    margin = dominant_score - second_score
    confidence = min(margin / 0.50, 1.0)
    return round(max(confidence, 0.0), 3)




GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnsJo1kvnQ46conDKuzx4pGo2RFymXKKBDCg6ZrozrNt3JxDLpHuEhNAACZsTd5wAYk5Qf8PQOiMsf/pub?output=csv"

client     = MongoClient("mongodb://localhost:27017/")
db         = client["ayurveda"]          # shared DB with the Node.js backend
collection = db["vikriti_results"]       # audit / history collection
patients   = db["patients"]             # main patients collection (Node.js)


def run_analysis():
    if GOOGLE_SHEET_URL:
        print(f"Fetching data from Google Sheets URL...")
        df = pd.read_csv(GOOGLE_SHEET_URL)
    else:
        
        base_dir = os.path.dirname(__file__) or os.getcwd()
        preferred_names = [
            "Vikriti_data - Form Responses 1.csv",
            "vikriti_data.csv",
        ]
        csv_path = None
        for name in preferred_names:
            candidate = os.path.join(base_dir, name)
            if os.path.exists(candidate):
                csv_path = candidate
                break

        if csv_path is None:
            raise FileNotFoundError(
                "No GOOGLE_SHEET_URL provided and could not find a local CSV."
            )
        print(f"Loading local data from: {csv_path}")
        df = pd.read_csv(csv_path)

    id_col, questions = identify_columns(df)
    results = []

    for _, row in df.iterrows():
        vata_w  = 0.0
        pitta_w = 0.0
        kapha_w = 0.0

        for col, weight in questions:
            raw = str(row[col]).strip()
            if not raw or raw.lower() == "nan":
                continue

            
            m = re.match(r'^[\s\(\[]*([ABC])[.\)\]\s,:]', raw.upper())
            if not m:
                
                m = re.match(r'^[\s]*([ABC])\s*$', raw.upper())
            if not m:
                continue
            answer = m.group(1)

            if answer == "A":
                vata_w  += weight
            elif answer == "B":
                pitta_w += weight
            elif answer == "C":
                kapha_w += weight

        total = vata_w + pitta_w + kapha_w
        if total == 0:
            continue

        vata_score  = vata_w  / total
        pitta_score = pitta_w / total
        kapha_score = kapha_w / total

        scores = {"Vata": vata_score, "Pitta": pitta_score, "Kapha": kapha_score}
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)

        dominant        = sorted_scores[0][0]
        dominant_score  = sorted_scores[0][1]
        second_score    = sorted_scores[1][1]

        severity        = classify_severity(dominant_score)
        mixed_imbalance = detect_mixed_imbalance(vata_score, pitta_score, kapha_score)
        confidence      = compute_confidence(dominant_score, second_score)
        confidence_label = "Low" if confidence < LOW_CONFIDENCE_THRESHOLD else (
                           "High" if confidence >= 0.70 else "Moderate")

        
        if mixed_imbalance:
            vikriti_type = f"{mixed_imbalance} Vikriti"
        else:
            vikriti_type = f"{dominant} Vikriti"

        results.append({
            "email":            row[id_col].strip().lower(),   # email is the identifier
            "vata_score":       round(vata_score,  3),
            "pitta_score":      round(pitta_score, 3),
            "kapha_score":      round(kapha_score, 3),
            "dominant":         dominant,
            "severity":         severity,
            "mixed_imbalance":  mixed_imbalance if mixed_imbalance else "None",
            "confidence":       confidence,
            "confidence_label": confidence_label,
            "vikriti_type":     vikriti_type,
            "created_at":       datetime.now(timezone.utc),
        })

    if not results:
        print("No valid responses found in CSV — nothing to save.")
    else:
        results_df = pd.DataFrame(results)
        try:
            # ── 1. Audit log: save to vikriti_results (skip duplicates by email) ──
            existing = set()
            try:
                cursor = collection.find({}, {"email": 1, "_id": 0})
                existing = {doc["email"] for doc in cursor if "email" in doc}
            except Exception:
                pass
            before = len(results_df)
            new_df = results_df[~results_df["email"].isin(existing)]
            skipped = before - len(new_df)
            if skipped:
                print(f"Skipped {skipped} already-stored audit record(s).")
            if new_df.empty:
                print("All audit records already exist — nothing new to audit-log.")
            else:
                collection.insert_many(new_df.to_dict(orient="records"))
                print(f"Audit log: {len(new_df)} new record(s) saved.")

            # ── 2. Patch patients collection with vikritiType + severity ──────────
            updated = 0
            for record in results:
                res = patients.update_one(
                    {"email": record["email"]},
                    {"$set": {
                        "vikritiType": record["vikriti_type"],
                        "severity":    record["severity"],
                    }},
                    upsert=False,   # only update existing patients
                )
                if res.matched_count:
                    updated += 1
            print(f"Patients updated with Vikriti results: {updated}/{len(results)}\n")

        except Exception as exc:
            print("Failed to write results to database:", exc)
            raise
    
    return results

if __name__ == "__main__":
    results = run_analysis()
    if results:
        print("=" * 75)
        print(f"{'Email':<35} {'Vikriti Type':<22} {'Severity':<12} {'Confidence'}")
        print("-" * 75)
        for record in results:
            print(
                f"{record['email']:<35} "
                f"{record['vikriti_type']:<22} "
                f"{record['severity']:<12} "
                f"{record['confidence_label']} ({record['confidence']})"
            )
        print("=" * 75)


