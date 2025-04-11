from flask import Flask, jsonify
import pandas as pd
from sklearn.feature_selection import mutual_info_classif
from sklearn.linear_model import LogisticRegression
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}})

# Load and preprocess data
def load_and_prepare_data():
    df = pd.read_csv("Lead Scoring.csv")
    df = df.dropna(subset=['Lead Source', 'TotalVisits', 'Converted'])
    categorical_cols = ['Lead Origin', 'Lead Source', 'Last Activity', 'Tags']
    df_encoded = pd.get_dummies(df[categorical_cols], prefix=categorical_cols)
    numeric_cols = ['TotalVisits', 'Total Time Spent on Website', 'Page Views Per Visit']
    df_numeric = df[numeric_cols]
    y = df['Converted']
    X = pd.concat([df_numeric, df_encoded], axis=1)
    importances = mutual_info_classif(X, y)
    high_score_col = X.columns[importances > 0]
    return X[high_score_col], y, df[['Prospect ID', 'Lead Source', 'TotalVisits', 'Total Time Spent on Website', 'Page Views Per Visit']]

# API endpoint for lead scoring
@app.route('/api/lead-scoring', methods=['GET'])
def get_lead_scoring():
    X, y, meta = load_and_prepare_data()
    
    # Train the model
    model = LogisticRegression(max_iter=1000)
    model.fit(X, y)
    
    # Sample 100 leads
    sample_size = min(100, len(X))
    sample_indices = pd.Series(range(len(X))).sample(sample_size, random_state=42).tolist()
    sample_X = X.iloc[sample_indices]
    sample_meta = meta.iloc[sample_indices]
    
    # Predict conversion probabilities
    conversion_scores = model.predict_proba(sample_X)[:, 1]
    
    # Contact methods for high-conversion leads
    contact_methods = ["Mail", "Newsletter", "Phone"]
    contact_med_methods = ["Follow-Up Email", "Drip Campaign", " Webinar Invite"]
    contact_low_methods = ["Outreach"]
    
    # Prepare response
    lead_data = []
    for i, (idx, row) in enumerate(sample_X.iterrows()):
        score = float(conversion_scores[i])
        # Determine conversion possibility
        if score > 0.80:
            possibility = "High"
            contact_source = random.choice(contact_methods)  # Random contact method for High
        elif score > 0.50:
            possibility = "Medium"
            contact_source = random.choice(contact_med_methods)  # No contact method for Medium/Low
        else:
            possibility = "Low"
            contact_source = "Outreach"
        
        lead_data.append({
            "prospectId": sample_meta.iloc[i]['Prospect ID'],
            "leadSource": sample_meta.iloc[i]['Lead Source'],
            "totalVisits": float(sample_meta.iloc[i]['TotalVisits']),
            "timeSpent": float(sample_meta.iloc[i]['Total Time Spent on Website']),
            "pageViewsPerVisit": float(sample_meta.iloc[i]['Page Views Per Visit']),
            "conversionScore": score,
            "conversionPossibility": possibility,
            "contactingSource": contact_source
        })
    return jsonify(lead_data)

if __name__ == '__main__':
    app.run(port=5001, debug=True)