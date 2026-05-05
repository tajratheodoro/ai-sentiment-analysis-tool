from backend.core.analyzer import SentimentAnalyzer
from backend.core.database import DatabaseManager
from backend.core.models import Feedback


SENTIMENTS = ("Positive", "Neutral", "Negative")


def get_next_user_id() -> int:
    return 101 + len(ia.historical_analysis)


def submit_feedback() -> None:
    user_input = input("\nPlease, enter your feedback: ").strip()

    if not user_input:
        print("Warning: Please enter some feedback before submitting.")
        return

    new_client = Feedback(user_input, get_next_user_id())
    ia.analyse(new_client)
    db.save_feedback(user_input, new_client.score)

    print("Analysis completed for the current feedback.")
    print(f"Sentiment score: {new_client.score}")


def view_performance_dashboard() -> None:
    total = db.get_total_analysis()

    print("\nPerformance Dashboard")

    if not total:
        print("No feedback has been analyzed yet.")
        return

    counts = db.get_sentiment_counts()
    positives = counts.get("Positive", 0)
    percentage_positives = (positives / total) * 100

    print("FINAL FEEDBACK ANALYSIS REPORT:")
    print(f"Total feedbacks analyzed: {total}")
    print(f"Customer Satisfaction: {percentage_positives:.2f}% positive.")


def get_sentiment_counts(history: list[tuple[int, str, str]]) -> dict[str, int]:
    sentiment_counts = {sentiment: 0 for sentiment in SENTIMENTS}

    for row in history:
        sentiment = row[2]
        if sentiment in sentiment_counts:
            sentiment_counts[sentiment] += 1

    return sentiment_counts


def view_feedback_history() -> None:
    history_db = db.get_all_analysis()

    print("\nFeedback Analysis History")

    if not history_db:
        print("No feedback history yet.")
        return

    for row in history_db:
        feedback_preview = row[1][:42]
        if len(row[1]) > 42:
            feedback_preview += "..."

        print(f"{row[2]} | {feedback_preview} ({row[2]})")


def view_sentiment_bar_chart() -> None:
    history_db = db.get_all_analysis()
    sentiment_counts = get_sentiment_counts(history_db)
    max_count = max(sentiment_counts.values(), default=0)

    print("\nSentiment Bar Chart")

    if max_count == 0:
        print("No feedback history yet.")
        return

    for sentiment in SENTIMENTS:
        count = sentiment_counts[sentiment]
        bar = "#" * count
        print(f"{sentiment:<8} | {bar} {count}")


def clear_history() -> None:
    confirmation = input("\nType 'yes' to clear all feedback analysis history: ").strip().lower()

    if confirmation != "yes":
        print("Clear history cancelled.")
        return

    db.clear_database()
    ia.historical_analysis.clear()
    print("History cleared successfully!")


MENU_ACTIONS = {
    "1": submit_feedback,
    "2": view_performance_dashboard,
    "3": view_feedback_history,
    "4": view_sentiment_bar_chart,
    "5": clear_history,
}


def show_menu() -> None:
    print("\nCustomer Satisfaction Score System")
    print("1. Submit Feedback")
    print("2. View Performance Dashboard")
    print("3. View Feedback Analysis History")
    print("4. View Sentiment Bar Chart")
    print("5. Clear History")
    print("6. Exit")


def run_cli() -> None:
    print("Welcome to the customer feedback analysis system!")

    while True:
        show_menu()
        option = input("Choose an option: ").strip()

        if option == "6":
            print("Goodbye!")
            break

        action = MENU_ACTIONS.get(option)
        if action:
            action()
        else:
            print("Invalid option. Please choose a number from 1 to 6.")


ia = SentimentAnalyzer()
db = DatabaseManager()


if __name__ == "__main__":
    run_cli()
