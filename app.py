import streamlit as st
import pandas as pd
import altair as alt
from analyzer import SentimentAnalyzer
from models import Feedback
from database import DatabaseManager


st.set_page_config(
    page_title="Customer Satisfaction Score",
    page_icon="💬",
    layout="wide",
)

st.markdown(
    """
    <style>
        .block-container {
            padding-top: 2rem;
            padding-bottom: 2rem;
            max-width: 1080px;
        }

        .main-header {
            padding: 1.5rem 0 1rem 0;
            border-bottom: 1px solid rgba(49, 51, 63, 0.15);
            margin-bottom: 1.5rem;
        }

        .main-header h1 {
            font-size: 2.4rem;
            line-height: 1.15;
            margin-bottom: 0.5rem;
        }

        .main-header p {
            color: #5f6b7a;
            font-size: 1.05rem;
            max-width: 760px;
        }

        section[data-testid="stSidebar"] {
            background: #f7f9fc;
            border-right: 1px solid rgba(49, 51, 63, 0.12);
        }

        div[data-testid="stTextArea"] textarea {
            border-radius: 8px;
            border: 1px solid #d7dde8;
            min-height: 180px;
        }

        div.stButton > button {
            border-radius: 8px;
            border: 0;
            background: #2563eb;
            color: white;
            font-weight: 700;
            padding: 0.55rem 1rem;
        }

        div.stButton > button:hover {
            background: #1d4ed8;
            color: white;
            border: 0;
        }

        .history-item {
            padding: 0.55rem 0.65rem;
            margin-bottom: 0.45rem;
            background: white;
            border: 1px solid rgba(49, 51, 63, 0.1);
            border-radius: 8px;
            font-size: 0.92rem;
        }
    </style>
    """,
    unsafe_allow_html=True,
)

if "ia" not in st.session_state:
    st.session_state.ia = SentimentAnalyzer()

if "db" not in st.session_state:
    st.session_state.db = DatabaseManager()

if "id_counter" not in st.session_state:
    st.session_state.id_counter = 101


st.markdown(
    """
    <div class="main-header">
        <h1>💬 Customer Satisfaction Score System</h1>
        <p>
            Welcome! Share customer feedback below and the application will analyze
            the sentiment to help your team understand satisfaction trends faster.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

st.subheader("📝 Feedback Analysis")
user_input = st.text_area(
    "Please, enter your feedback:",
    placeholder="Example: The service was fast, friendly, and solved my issue.",
)

if st.button("🚀 Submit Feedback", use_container_width=True):
    if user_input.strip() == "":
        st.warning("⚠️ Please enter some feedback before submitting.")
    else:
        new_client = Feedback(user_input, st.session_state.id_counter)
        st.session_state.ia.analyse(new_client)
        st.session_state.id_counter += 1
        st.session_state.db.save_feedback(user_input, new_client.score)
        st.success(
            "✅ Analysis completed for the current feedback. "
            f"Sentiment score: {new_client.score}"
        )


st.sidebar.header("📊 Performance Dashboard")
report_text = st.session_state.ia.generate_report()
st.sidebar.text(report_text)

st.sidebar.divider()

if st.sidebar.button("🗑️ Clear History", use_container_width=True):
    st.session_state.db.clear_database()
    st.success("✅ History cleared successfully!")
    st.rerun()

st.sidebar.subheader("Feedback Analysis History ✉️")
history_db = st.session_state.db.get_all_analysis()
history_db.reverse()

history_view = st.sidebar.radio(
    "History View",
    ["Written History 🧾", "Bar Chart 📈"],
)

if history_view == "Written History 🧾":
    if not history_db:
        st.sidebar.info("📭 No feedback history yet.")
    else:
        for row in history_db:
            if row[2] == "Positive":
                sentiment_label = "Positive 🟢"
            elif row[2] == "Negative":
                sentiment_label = "Negative 🔴"
            else:
                sentiment_label = "Neutral 🟡"

            st.sidebar.markdown(
                (
                    '<div class="history-item">'
                    f"<strong>{sentiment_label}</strong> | {row[1][:42]}... "
                    f"<strong>({row[2]})</strong>"
                    "</div>"
                ),
                unsafe_allow_html=True,
            )
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

    sentiment_chart = (
        alt.Chart(sentiment_chart_data)
        .mark_bar(cornerRadiusTopLeft=4, cornerRadiusTopRight=4)
        .encode(
            x=alt.X(
                "Sentiment:N",
                sort=["Positive", "Neutral", "Negative"],
                axis=alt.Axis(labelAngle=0, title=None),
            ),
            y=alt.Y("Count:Q", axis=alt.Axis(title="Feedback Count")),
            color=alt.Color(
                "Sentiment:N",
                scale=alt.Scale(
                    domain=["Positive", "Neutral", "Negative"],
                    range=["#22c55e", "#facc15", "#ef4444"],
                ),
                legend=None,
            ),
            tooltip=["Sentiment", "Count"],
        )
        .properties(height=260)
    )

    st.sidebar.altair_chart(sentiment_chart, use_container_width=True)
