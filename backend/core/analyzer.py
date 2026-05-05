from textblob import TextBlob

from backend.core.models import Feedback


class SentimentAnalyzer:
    def __init__(self) -> None:
        self.historical_analysis: list[Feedback] = []

    def analyse(self, feedback: Feedback) -> None:
        blob = TextBlob(feedback.text)
        score = blob.sentiment.polarity

        if "but" in feedback.text.lower():
            score -= 0.4

        if score > 0.34:
            analysis = "Positive"
        elif score < -0.3:
            analysis = "Negative"
        else:
            analysis = "Neutral"

        feedback.score = analysis
        self.historical_analysis.append(feedback)

    def generate_report(self) -> str:
        if not self.historical_analysis:
            return "No feedback has been analyzed yet."

        total = len(self.historical_analysis)
        positives = len(
            [feedback for feedback in self.historical_analysis if feedback.score.lower() == "positive"]
        )
        percentage_positives = (positives / total) * 100

        return (
            "\nFINAL FEEDBACK ANALYSIS REPORT:"
            f"\nTotal feedbacks analyzed: {total}"
            f"\nCustomer Satisfaction: {percentage_positives:.2f}% positive."
        )
