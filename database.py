import os
import sqlite3

class DatabaseManager:
    def __init__(self, db_name="feedback_analysis.db"):
        self.db_name = os.getenv("SENTIMENT_DB_PATH", db_name)
        self.setup_database()

    def setup_database(self):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS historical_analysis (
                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                        feedback TEXT NOT NULL,
                        sentiment TEXT NOT NULL
                       )
                    """)
        conn.commit()   
        conn.close()

    def save_feedback(self, feedback, sentiment):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO historical_analysis (feedback, sentiment) VALUES (?, ?)
                       """, (feedback, sentiment))
        conn.commit()
        conn.close()

    def get_latest_id(self):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        cursor.execute("SELECT MAX(id) FROM historical_analysis")
        latest_id = cursor.fetchone()[0]
        conn.close()
        return latest_id
    
    def get_all_analysis(self):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM historical_analysis")
        # O comando fetchall() pega as linhas que o execute encontrou e guarda numa lista
        rows = cursor.fetchall()
        conn.close()
        return rows
    
    def clear_database(self):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM historical_analysis")
        conn.commit()
        conn.close()
