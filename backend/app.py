from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3
import threading
import ast  # To parse conversions string back to list

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}})

def get_db_connection():
    conn = sqlite3.connect('crm.db')
    conn.row_factory = sqlite3.Row
    return conn

def update_grid_data_periodically():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('DROP TABLE IF EXISTS grid_data')
    c.execute('''
        CREATE TABLE grid_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            page_title TEXT,
            status TEXT,
            users INTEGER,
            event_count INTEGER,
            views_per_user REAL,
            average_time TEXT,
            conversions TEXT
        )
    ''')
    import database
    database.update_grid_data(conn)
    conn.commit()
    conn.close()
    threading.Timer(2.0, update_grid_data_periodically).start()

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM stats ORDER BY id DESC LIMIT 1')
    row = c.fetchone()
    conn.close()
    if row:
        return jsonify({"totalUsers": row['total_users'], "activeSessions": row['active_sessions']})
    return jsonify({"totalUsers": 0, "activeSessions": 0})

@app.route('/api/grid-data', methods=['GET'])
def get_grid_data():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM grid_data')
    rows = c.fetchall()
    conn.close()
    return jsonify([{
        "pageTitle": row['page_title'],
        "status": row['status'],
        "users": row['users'],
        "eventCount": row['event_count'],
        "viewsPerUser": row['views_per_user'],
        "averageTime": row['average_time'],
        "conversions": ast.literal_eval(row['conversions'])  # Parse string back to list
    } for row in rows])

if __name__ == '__main__':
    import database
    database.init_db()
    update_grid_data_periodically()
    app.run(port=5000, debug=True)