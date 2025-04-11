from flask import Flask, jsonify
import pandas as pd
import random
from flask_cors import CORS

app = Flask(__name__)
# Allow both 5173 and 5174, or all origins for debugging
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}})
# Alternative: CORS(app)  # Uncomment this to allow all origins if needed

# Simulate client data from converted leads
def generate_client_data():
    df = pd.read_csv("Lead Scoring.csv")
    clients = df[df['Converted'] == 1].sample(50, random_state=42)
    statuses = ["Online", "Offline"]
    activities = ["Call", "Email", "Purchase", "Support Ticket", "Meeting"]
    client_data = []
    for i, row in clients.iterrows():
        client_data.append({
            "clientId": row['Prospect ID'],
            "name": f"Client {i+1}",
            "status": random.choice(statuses),
            "totalPurchases": random.randint(1, 10),
            "lastActivity": random.choice(activities),
            "lastActivityDate": f"2025-04-{random.randint(1, 9):02d}",
            "revenue": random.uniform(100, 5000)
        })
    return client_data

@app.route('/api/clients', methods=['GET'])
def get_clients():
    clients = generate_client_data()
    total_clients = len(clients)
    active_clients = sum(1 for c in clients if c['status'] == "Online")
    total_revenue = sum(c['revenue'] for c in clients)
    status_counts = {"Online": active_clients, "Offline": total_clients - active_clients}
    recent_activities = sorted(clients, key=lambda x: x['lastActivityDate'], reverse=True)[:5]
    response = {
        "summary": {
            "totalClients": total_clients,
            "activeClients": active_clients,
            "totalRevenue": round(total_revenue, 2)
        },
        "statusCounts": status_counts,
        "recentActivities": recent_activities,
        "clients": clients
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(port=5002, debug=True)