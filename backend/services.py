from backend.core.analyzer import SentimentAnalyzer
from backend.core.database import DatabaseManager
from backend.core.models import Feedback


SENTIMENTS = ("Positive", "Neutral", "Negative")


class SentimentService:
    def __init__(self) -> None:
        self.analyzer = SentimentAnalyzer()
        self.database = DatabaseManager()

    def analyze_feedback(self, text: str) -> dict:
        feedback = Feedback(text, user_id=0)
        self.analyzer.analyse(feedback)
        feedback_id = self.database.save_feedback(feedback.text, feedback.score)
        return {
            "id": feedback_id,
            "feedback": feedback.text,
            "sentiment": feedback.score,
        }

    def get_history(self) -> list[dict]:
        rows = self.database.get_all_analysis()
        return [
            {"id": row[0], "feedback": row[1], "sentiment": row[2]}
            for row in rows
        ]

    def get_report(self) -> dict:
        total = self.database.get_total_analysis()
        counts = {sentiment: 0 for sentiment in SENTIMENTS}
        counts.update(
            {
                sentiment: count
                for sentiment, count in self.database.get_sentiment_counts().items()
                if sentiment in counts
            }
        )

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
