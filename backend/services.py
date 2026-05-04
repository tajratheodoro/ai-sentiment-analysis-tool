from analyzer import SentimentAnalyzer
from database import DatabaseManager
from models import Feedback


SENTIMENTS = ("Positive", "Neutral", "Negative")


class SentimentService:
    def __init__(self) -> None:
        self.analyzer = SentimentAnalyzer()
        self.database = DatabaseManager()

    def analyze_feedback(self, text: str) -> dict:
        feedback = Feedback(text, user_id=0)
        self.analyzer.analyse(feedback)
        self.database.save_feedback(feedback.text, feedback.score)

        latest_id = self.database.get_latest_id()
        return {
            "id": latest_id,
            "feedback": feedback.text,
            "sentiment": feedback.score,
        }

    def get_history(self) -> list[dict]:
        rows = self.database.get_all_analysis()
        rows = sorted(rows, key=lambda row: row[0], reverse=True)
        return [
            {"id": row[0], "feedback": row[1], "sentiment": row[2]}
            for row in rows
        ]

    def get_report(self) -> dict:
        rows = self.database.get_all_analysis()
        total = len(rows)
        counts = {sentiment: 0 for sentiment in SENTIMENTS}

        for row in rows:
            sentiment = row[2]
            if sentiment in counts:
                counts[sentiment] += 1

        positive_percentage = (counts["Positive"] / total * 100) if total else 0
        return {
            "total_feedbacks": total,
            "positive_count": counts["Positive"],
            "neutral_count": counts["Neutral"],
            "negative_count": counts["Negative"],
            "positive_percentage": round(positive_percentage, 2),
        }

    def clear_history(self) -> None:
        self.database.clear_database()
        self.analyzer.historical_analysis.clear()
