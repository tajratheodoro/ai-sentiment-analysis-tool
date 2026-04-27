import streamlit as st
import pandas as pd
from analyzer import SentimentAnalyzer
from models import Feedback
from database import DatabaseManager


if "ia" not in st.session_state:
    st.session_state.ia = SentimentAnalyzer()

if "db" not in st.session_state:
    st.session_state.db = DatabaseManager()

if "id_counter" not in st.session_state:
    st.session_state.id_counter = 101


st.title("Customer Satisfaction Score System Streamlit Version")
st.write(
    "Welcome! Here you can enter your feedback and we will analyze it for you. "
    "You can use this tool to share your thoughts and help us improve our services."
)

user_input = st.text_area("Please, enter your feedback:")

if st.button("Submit Feedback"):
    if user_input.strip() == "":
        st.warning("Please enter some feedback before submitting.")
    else:
        new_client = Feedback(user_input, st.session_state.id_counter)
        st.session_state.ia.analyse(new_client)
        st.session_state.id_counter += 1
        st.session_state.db.save_feedback(user_input, new_client.score)
        st.success(
            "Analysis completed for the current feedback. "
            f"Sentiment score: {new_client.score}"
        )


st.sidebar.header("Performance Dashboard")
report_text = st.session_state.ia.generate_report()
st.sidebar.text(report_text)

st.sidebar.divider()

if st.sidebar.button("Clear History"):
    st.session_state.db.clear_database()
    st.success("History cleared successfully!")
    st.rerun()

st.sidebar.subheader("Feedback Analysis History")
history_db = st.session_state.db.get_all_analysis()
history_db.reverse()

history_view = st.sidebar.radio(
    "History View",
    ["Written History", "Bar Chart"]
)

if history_view == "Written History":
    if not history_db:
        st.sidebar.write("No feedback history yet.")
    else:
        for row in history_db:
            if row[2] == "Positive":
                sentiment_label = "Positive 🟢 | "
            elif row[2] == "Negative":
                sentiment_label = "Negative 🔴 | "
            else:
                sentiment_label = "Neutral 🟡 | "

            st.sidebar.write(f"{sentiment_label} {row[1][:30]}... **({row[2]})**")
else:
    sentiment_counts = {
        "Positive": 0,
        "Neutral": 0,
        "Negative": 0,
    }

    for row in history_db:
        sentiment = row[2]
        if sentiment in sentiment_counts:
            sentiment_counts[sentiment] += 1

    sentiment_chart_data = pd.DataFrame({
        "Sentiment": sentiment_counts.keys(),
        "Count": sentiment_counts.values(),
    })
    st.sidebar.bar_chart(sentiment_chart_data, x="Sentiment", y="Count")
