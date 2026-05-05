import os
import sqlite3


class DatabaseManager:
    def __init__(self, db_name: str = "feedback_analysis.db") -> None:
        self.db_name = os.getenv("SENTIMENT_DB_PATH", db_name)
        self.setup_database()

    def setup_database(self) -> None:
        with sqlite3.connect(self.db_name) as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS historical_analysis (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    feedback TEXT NOT NULL,
                    sentiment TEXT NOT NULL
                )
                """
            )

    def save_feedback(self, feedback: str, sentiment: str) -> int:
        with sqlite3.connect(self.db_name) as conn:
            cursor = conn.execute(
                """
                INSERT INTO historical_analysis (feedback, sentiment)
                VALUES (?, ?)
                """,
                (feedback, sentiment),
            )
            return cursor.lastrowid

    def get_all_analysis(self) -> list[tuple[int, str, str]]:
        with sqlite3.connect(self.db_name) as conn:
            cursor = conn.execute(
                """
                SELECT id, feedback, sentiment
                FROM historical_analysis
                ORDER BY id DESC
                """
            )
            return cursor.fetchall()

    def get_sentiment_counts(self) -> dict[str, int]:
        with sqlite3.connect(self.db_name) as conn:
            cursor = conn.execute(
                """
                SELECT sentiment, COUNT(*)
                FROM historical_analysis
                GROUP BY sentiment
                """
            )
            return dict(cursor.fetchall())

    def get_total_analysis(self) -> int:
        with sqlite3.connect(self.db_name) as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM historical_analysis")
            return cursor.fetchone()[0]

    def clear_database(self) -> None:
        with sqlite3.connect(self.db_name) as conn:
            conn.execute("DELETE FROM historical_analysis")
            conn.execute("DELETE FROM sqlite_sequence WHERE name = ?", ("historical_analysis",))
