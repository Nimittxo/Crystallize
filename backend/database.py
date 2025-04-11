import sqlite3
import random

# Random data pools
PAGE_TITLES = ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'OpenAI', 'NVIDIA', 'Tesla', 'IBM', 'Intel',
  'Samsung', 'Oracle', 'Adobe', 'Salesforce', 'SAP', 'Uber', 'Lyft', 'SpaceX', 'Blue Origin', 'Stripe',
  'Netflix', 'Spotify', 'Alibaba', 'Tencent', 'Baidu', 'Zoom', 'Airbnb', 'LinkedIn', 'Twitter', 'Reddit',
  'Pinterest', 'Dropbox', 'PayPal', 'Square', 'Visa', 'Mastercard', 'JP Morgan', 'Goldman Sachs', 'Morgan Stanley', 'HSBC',
  'Berkshire Hathaway', 'Accenture', 'McKinsey', 'Boston Consulting Group', 'Deloitte', 'PwC', 'KPMG', 'EY', 'Qualcomm', 'AMD',
  'Arm', 'Cisco', 'TCS', 'Infosys', 'Wipro', 'HCLTech', 'Cognizant', 'Palantir', 'Epic Games', 'Unity',
  'Snapchat', 'GitHub', 'Bitbucket', 'GitLab', 'DigitalOcean', 'Cloudflare', 'Vercel', 'Netlify', 'Shopify', 'Rakuten',
  'eBay', 'Zara', 'Nike', 'Coca-Cola', 'PepsiCo', 'Procter & Gamble', 'Unilever', 'Nestlé', 'LG', 'Sony',
  'Toyota', 'Ford', 'BMW', 'Mercedes-Benz', 'General Motors', 'Volkswagen', 'NASA', 'ISRO', 'CERN', 'DARPA',
  'WHO', 'UNICEF', 'UNESCO', 'World Bank', 'IMF', 'OECD', 'MIT', 'Stanford', 'Harvard', 'Caltech'
]
STATUSES = ['Online', 'Offline']

def init_db():
    conn = sqlite3.connect('crm.db')
    c = conn.cursor()
    
    # Stats table (unchanged)
    c.execute('''
        CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            total_users INTEGER,
            active_sessions INTEGER
        )
    ''')
    c.execute('SELECT COUNT(*) FROM stats')
    if c.fetchone()[0] == 0:
        c.execute('INSERT INTO stats (total_users, active_sessions) VALUES (?, ?)', (150, 42))
    
    # Grid data table - drop and recreate
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
            conversions TEXT  -- Store as JSON string
        )
    ''')
    update_grid_data(conn)
    
    conn.commit()
    conn.close()

def update_grid_data(conn):
    c = conn.cursor()
    # Generate 20 random rows
    sample_data = []
    for _ in range(50):
        page_title = random.choice(PAGE_TITLES)
        status = random.choice(STATUSES)
        users = random.randint(1000, 100000)
        event_count = random.randint(1000, 15000)
        views_per_user = round(random.uniform(2.0, 20.0), 1)
        avg_minutes = random.randint(2, 4)
        avg_seconds = random.randint(0, 59)
        average_time = f"{avg_minutes}m {avg_seconds}s"
        conversions = [random.randint(10000, 2000000) for _ in range(30)]
        conversions_str = str(conversions)  # Store as string for SQLite
        sample_data.append((page_title, status, users, event_count, views_per_user, average_time, conversions_str))
    
    c.executemany('INSERT INTO grid_data (page_title, status, users, event_count, views_per_user, average_time, conversions) VALUES (?, ?, ?, ?, ?, ?, ?)', sample_data)