"""Legacy Streamlit prototype.

The main web interface is now the Next.js app in frontend/ backed by FastAPI.
This file is kept only as a functional reference for the original prototype.
"""

from html import escape

import altair as alt
import pandas as pd
import streamlit as st

from analyzer import SentimentAnalyzer
from database import DatabaseManager
from models import Feedback


SENTIMENT_ORDER = ("Positive", "Neutral", "Negative")
SENTIMENT_META = {
    "Positive": {
        "label": "Positive",
        "class": "positive",
        "chart": "#16a34a",
        "description": "Customer language is trending favorable.",
    },
    "Neutral": {
        "label": "Neutral",
        "class": "neutral",
        "chart": "#d97706",
        "description": "The signal is mixed or not strongly polarized.",
    },
    "Negative": {
        "label": "Negative",
        "class": "negative",
        "chart": "#dc2626",
        "description": "The feedback needs closer attention.",
    },
}


st.set_page_config(
    page_title="Customer Sentiment Dashboard",
    page_icon=":material/analytics:",
    layout="wide",
)


def inject_theme():
    st.markdown(
        """
        <style>
            :root {
                --app-ink: var(--text-color);
                --app-muted: color-mix(in srgb, var(--text-color) 68%, transparent);
                --app-faint: color-mix(in srgb, var(--text-color) 48%, transparent);
                --app-line: color-mix(in srgb, var(--text-color) 13%, transparent);
                --app-line-strong: color-mix(in srgb, var(--text-color) 22%, transparent);
                --app-panel: color-mix(in srgb, var(--background-color) 91%, var(--text-color) 4%);
                --app-panel-raised: color-mix(in srgb, var(--secondary-background-color) 88%, var(--text-color) 5%);
                --app-panel-soft: color-mix(in srgb, var(--secondary-background-color) 72%, var(--background-color) 28%);
                --app-accent: oklch(50% 0.145 226);
                --app-accent-hover: oklch(44% 0.145 226);
                --app-accent-soft: color-mix(in srgb, var(--app-accent) 14%, transparent);
                --app-positive: #16a34a;
                --app-neutral: #d97706;
                --app-negative: #dc2626;
                --app-radius: 8px;
                --app-font: ui-sans-serif, "Aptos", "Segoe UI", system-ui, sans-serif;
            }

            html, body, [class*="css"] {
                font-family: var(--app-font);
            }

            .block-container {
                max-width: 1180px;
                padding-top: 1.35rem;
                padding-bottom: 2.4rem;
            }

            h1, h2, h3, p, label {
                letter-spacing: 0;
            }

            .app-shell {
                display: flex;
                flex-direction: column;
                gap: 1.05rem;
            }

            .topbar {
                display: grid;
                grid-template-columns: minmax(0, 1fr) auto;
                gap: 1.4rem;
                align-items: end;
                padding: 0.15rem 0 1rem;
                border-bottom: 1px solid var(--app-line);
            }

            .eyebrow {
                margin: 0 0 0.32rem;
                color: var(--app-faint);
                font-size: 0.72rem;
                font-weight: 780;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }

            .topbar h1 {
                margin: 0;
                color: var(--app-ink);
                font-size: clamp(1.68rem, 3vw, 2.15rem);
                font-weight: 760;
                line-height: 1.08;
            }

            .topbar p {
                max-width: 720px;
                margin: 0.55rem 0 0;
                color: var(--app-muted);
                font-size: 0.98rem;
                line-height: 1.55;
            }

            .status-stack {
                display: flex;
                align-items: flex-end;
                flex-direction: column;
                gap: 0.35rem;
            }

            .status-label {
                color: var(--app-faint);
                font-size: 0.68rem;
                font-weight: 760;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }

            .status-pill {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 2.18rem;
                padding: 0.42rem 0.72rem;
                border: 1px solid var(--app-line);
                border-radius: 999px;
                background: var(--app-panel);
                color: var(--app-muted);
                font-size: 0.82rem;
                font-weight: 720;
                white-space: nowrap;
            }

            .kpi-grid {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 0.75rem;
            }

            .kpi-card,
            .tool-panel,
            .result-card,
            .sidebar-stat,
            .history-item {
                border: 1px solid var(--app-line);
                border-radius: var(--app-radius);
                background: var(--app-panel);
            }

            .kpi-card {
                padding: 0.86rem 0.92rem;
            }

            .kpi-card p,
            .sidebar-stat p {
                margin: 0;
                color: var(--app-faint);
                font-size: 0.7rem;
                font-weight: 780;
                letter-spacing: 0.07em;
                text-transform: uppercase;
            }

            .kpi-card strong,
            .sidebar-stat strong {
                display: block;
                margin-top: 0.18rem;
                color: var(--app-ink);
                font-size: 1.55rem;
                font-weight: 760;
                line-height: 1.06;
            }

            .kpi-card span,
            .sidebar-stat span {
                display: block;
                margin-top: 0.32rem;
                color: var(--app-muted);
                font-size: 0.82rem;
                line-height: 1.35;
            }

            .tool-panel {
                padding: 1rem;
                background:
                    linear-gradient(180deg, color-mix(in srgb, var(--app-panel-raised) 82%, transparent), var(--app-panel));
            }

            .panel-heading {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 1rem;
                margin-bottom: 0.78rem;
            }

            .panel-heading h2 {
                margin: 0;
                color: var(--app-ink);
                font-size: 1.08rem;
                font-weight: 760;
                line-height: 1.25;
            }

            .panel-heading p {
                max-width: 520px;
                margin: 0.28rem 0 0;
                color: var(--app-muted);
                font-size: 0.91rem;
                line-height: 1.46;
            }

            .panel-note {
                flex: 0 0 auto;
                padding-top: 0.1rem;
                color: var(--app-faint);
                font-size: 0.76rem;
                font-weight: 720;
                white-space: nowrap;
            }

            .result-card {
                min-height: 15rem;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 0.66rem;
                padding: 1.1rem;
                background: var(--app-panel-raised);
            }

            .result-card.success {
                border-color: color-mix(in srgb, var(--app-positive) 38%, var(--app-line));
                background:
                    linear-gradient(180deg, color-mix(in srgb, var(--app-positive) 10%, var(--app-panel-raised)), var(--app-panel));
            }

            .result-card.warning {
                border-color: color-mix(in srgb, var(--app-neutral) 42%, var(--app-line));
                background:
                    linear-gradient(180deg, color-mix(in srgb, var(--app-neutral) 12%, var(--app-panel-raised)), var(--app-panel));
            }

            .result-kicker {
                margin: 0;
                color: var(--app-faint);
                font-size: 0.7rem;
                font-weight: 790;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }

            .result-card h3 {
                margin: 0;
                color: var(--app-ink);
                font-size: 1.36rem;
                font-weight: 760;
                line-height: 1.2;
            }

            .result-card p {
                margin: 0;
                color: var(--app-muted);
                font-size: 0.91rem;
                line-height: 1.48;
            }

            .sentiment-badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 5.25rem;
                padding: 0.2rem 0.55rem;
                border-radius: 999px;
                font-size: 0.72rem;
                font-weight: 790;
                line-height: 1.25;
            }

            .sentiment-badge.positive {
                color: color-mix(in srgb, var(--app-positive) 78%, var(--app-ink));
                background: color-mix(in srgb, var(--app-positive) 14%, transparent);
                border: 1px solid color-mix(in srgb, var(--app-positive) 39%, transparent);
            }

            .sentiment-badge.neutral {
                color: color-mix(in srgb, var(--app-neutral) 78%, var(--app-ink));
                background: color-mix(in srgb, var(--app-neutral) 15%, transparent);
                border: 1px solid color-mix(in srgb, var(--app-neutral) 41%, transparent);
            }

            .sentiment-badge.negative {
                color: color-mix(in srgb, var(--app-negative) 78%, var(--app-ink));
                background: color-mix(in srgb, var(--app-negative) 14%, transparent);
                border: 1px solid color-mix(in srgb, var(--app-negative) 39%, transparent);
            }

            .empty-state {
                padding: 0.9rem;
                border: 1px dashed var(--app-line-strong);
                border-radius: var(--app-radius);
                background: color-mix(in srgb, var(--app-panel) 84%, transparent);
                color: var(--app-muted);
                font-size: 0.9rem;
                line-height: 1.45;
            }

            .sidebar-stat {
                padding: 0.86rem;
                margin-bottom: 0.8rem;
                background: var(--app-panel-soft);
            }

            .history-item {
                padding: 0.68rem 0.72rem;
                margin-bottom: 0.52rem;
                background: var(--app-panel-soft);
            }

            .history-topline {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.7rem;
                margin-bottom: 0.36rem;
            }

            .history-id {
                color: var(--app-faint);
                font-size: 0.72rem;
                font-weight: 750;
            }

            .history-text {
                margin: 0;
                color: var(--app-muted);
                font-size: 0.84rem;
                line-height: 1.36;
            }

            .divider-label {
                margin: 0.15rem 0 0.52rem;
                color: var(--app-faint);
                font-size: 0.7rem;
                font-weight: 790;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }

            section[data-testid="stSidebar"] {
                background: color-mix(in srgb, var(--secondary-background-color) 94%, var(--text-color) 2%);
                border-right: 1px solid var(--app-line);
            }

            section[data-testid="stSidebar"] [data-testid="stMarkdownContainer"] p {
                margin-bottom: 0.35rem;
            }

            div[data-testid="stTextArea"] textarea {
                min-height: 204px;
                border: 1px solid var(--app-line);
                border-radius: var(--app-radius);
                background: var(--background-color);
                color: var(--app-ink);
                box-shadow: none;
                line-height: 1.48;
            }

            div[data-testid="stTextArea"] textarea:focus {
                border-color: color-mix(in srgb, var(--app-accent) 64%, var(--app-line));
                box-shadow: 0 0 0 3px var(--app-accent-soft);
            }

            div.stButton > button {
                min-height: 2.72rem;
                border: 1px solid color-mix(in srgb, var(--app-accent) 82%, transparent);
                border-radius: var(--app-radius);
                background: var(--app-accent);
                color: oklch(98% 0.006 245);
                font-weight: 780;
                letter-spacing: 0;
                transition: background 160ms ease-out, border-color 160ms ease-out, transform 160ms ease-out;
            }

            div.stButton > button:hover {
                border-color: color-mix(in srgb, var(--app-accent-hover) 86%, transparent);
                background: var(--app-accent-hover);
                color: oklch(98% 0.006 245);
                transform: translateY(-1px);
            }

            div.stButton > button:focus {
                box-shadow: 0 0 0 3px var(--app-accent-soft);
            }

            div[data-testid="stRadio"] label {
                font-size: 0.88rem;
            }

            @media (max-width: 760px) {
                .topbar {
                    grid-template-columns: 1fr;
                    gap: 0.8rem;
                }

                .status-stack {
                    align-items: flex-start;
                }

                .kpi-grid {
                    grid-template-columns: 1fr;
                }

                .panel-heading {
                    display: block;
                }

                .panel-note {
                    margin-top: 0.45rem;
                    white-space: normal;
                }
            }
        </style>
        """,
        unsafe_allow_html=True,
    )


def initialize_session_state():
    if "ia" not in st.session_state:
        st.session_state.ia = SentimentAnalyzer()

    if "db" not in st.session_state:
        st.session_state.db = DatabaseManager()

    if "id_counter" not in st.session_state:
        st.session_state.id_counter = 101

    if "feedback_input" not in st.session_state:
        st.session_state.feedback_input = ""

    if "feedback_message" not in st.session_state:
        st.session_state.feedback_message = None


def count_sentiments(rows):
    counts = {sentiment: 0 for sentiment in SENTIMENT_ORDER}
    for row in rows:
        sentiment = row[2]
        if sentiment in counts:
            counts[sentiment] += 1
    return counts


def positive_rate(counts):
    total_count = sum(counts.values())
    if total_count == 0:
        return 0
    return (counts["Positive"] / total_count) * 100


def sentiment_badge(sentiment):
    meta = SENTIMENT_META.get(sentiment, SENTIMENT_META["Neutral"])
    return (
        f'<span class="sentiment-badge {meta["class"]}">'
        f'{meta["label"]}</span>'
    )


def get_history():
    history = st.session_state.db.get_all_analysis()
    history.reverse()
    return history


def submit_feedback():
    user_input = st.session_state.feedback_input

    if user_input.strip() == "":
        st.session_state.feedback_message = (
            "warning",
            "Enter customer feedback before running the analysis.",
            None,
        )
        return

    new_client = Feedback(user_input, st.session_state.id_counter)
    st.session_state.ia.analyse(new_client)
    st.session_state.id_counter += 1
    st.session_state.db.save_feedback(user_input, new_client.score)
    st.session_state.feedback_message = (
        "success",
        "Analysis completed for the current feedback.",
        new_client.score,
    )
    st.session_state.feedback_input = ""


def render_header(latest_sentiment):
    st.markdown(
        f"""
        <div class="app-shell">
            <div class="topbar">
                <div>
                    <p class="eyebrow">AI sentiment workspace</p>
                    <h1>Customer Sentiment Dashboard</h1>
                    <p>
                        Analyze customer feedback, classify sentiment, and keep
                        a clean read on the latest satisfaction signal.
                    </p>
                </div>
                <div class="status-stack">
                    <span class="status-label">Latest status</span>
                    <span class="status-pill">{escape(latest_sentiment)}</span>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_kpis(total_feedback, positive_percentage, session_items):
    st.markdown(
        f"""
        <div class="kpi-grid">
            <div class="kpi-card">
                <p>Total feedback</p>
                <strong>{total_feedback}</strong>
                <span>Persisted analyses in local history.</span>
            </div>
            <div class="kpi-card">
                <p>Positive rate</p>
                <strong>{positive_percentage:.0f}%</strong>
                <span>Positive feedback share across stored items.</span>
            </div>
            <div class="kpi-card">
                <p>Session items</p>
                <strong>{session_items}</strong>
                <span>Feedback analyzed during this active session.</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_feedback_form():
    st.markdown(
        """
        <div class="tool-panel">
            <div class="panel-heading">
                <div>
                    <h2>Analyze feedback</h2>
                    <p>
                        Paste a customer comment and run the NLP classifier.
                        The result is saved to the local history for review.
                    </p>
                </div>
                <div class="panel-note">TextBlob NLP</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.text_area(
        "Customer feedback",
        placeholder="Example: The service was fast, friendly, and solved my issue.",
        key="feedback_input",
        label_visibility="collapsed",
    )
    st.button(
        "Analyze feedback",
        use_container_width=True,
        on_click=submit_feedback,
    )


def render_latest_result():
    if not st.session_state.feedback_message:
        st.markdown(
            """
            <div class="result-card">
                <p class="result-kicker">Latest analysis</p>
                <h3>Ready for feedback</h3>
                <p>
                    Results will appear here after analysis, with the sentiment
                    label mirrored in the dashboard history.
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )
        return

    message_type, message_text, sentiment = st.session_state.feedback_message

    if message_type == "warning":
        st.markdown(
            f"""
            <div class="result-card warning">
                <p class="result-kicker">Input needed</p>
                <h3>No feedback entered</h3>
                <p>{escape(message_text)}</p>
            </div>
            """,
            unsafe_allow_html=True,
        )
        return

    sentiment_meta = SENTIMENT_META.get(sentiment, SENTIMENT_META["Neutral"])
    st.markdown(
        f"""
        <div class="result-card success">
            <p class="result-kicker">Latest analysis</p>
            <h3>{sentiment_badge(sentiment)}</h3>
            <p>{escape(message_text)}</p>
            <p>{escape(sentiment_meta["description"])}</p>
        </div>
        """,
        unsafe_allow_html=True,
    )


def build_sentiment_chart(sentiment_counts):
    chart_data = pd.DataFrame(
        {
            "Sentiment": list(sentiment_counts.keys()),
            "Count": list(sentiment_counts.values()),
        }
    )

    return (
        alt.Chart(chart_data)
        .mark_bar(cornerRadiusTopLeft=5, cornerRadiusTopRight=5)
        .encode(
            x=alt.X(
                "Sentiment:N",
                sort=list(SENTIMENT_ORDER),
                axis=alt.Axis(labelAngle=0, title=None),
            ),
            y=alt.Y("Count:Q", axis=alt.Axis(title="Feedback count")),
            color=alt.Color(
                "Sentiment:N",
                scale=alt.Scale(
                    domain=list(SENTIMENT_ORDER),
                    range=[
                        SENTIMENT_META["Positive"]["chart"],
                        SENTIMENT_META["Neutral"]["chart"],
                        SENTIMENT_META["Negative"]["chart"],
                    ],
                ),
                legend=None,
            ),
            tooltip=["Sentiment", "Count"],
        )
        .properties(height=250)
    )


def render_written_history(history):
    st.sidebar.markdown('<p class="divider-label">Recent feedback</p>', unsafe_allow_html=True)

    if not history:
        st.sidebar.markdown(
            """
            <div class="empty-state">
                No feedback has been analyzed yet. Submit the first customer
                comment to start building the local history.
            </div>
            """,
            unsafe_allow_html=True,
        )
        return

    for row in history:
        feedback_text = row[1].strip()
        preview = feedback_text[:76] + ("..." if len(feedback_text) > 76 else "")
        st.sidebar.markdown(
            (
                '<div class="history-item">'
                '<div class="history-topline">'
                f'<span class="history-id">#{row[0]}</span>'
                f"{sentiment_badge(row[2])}"
                "</div>"
                f'<p class="history-text">{escape(preview)}</p>'
                "</div>"
            ),
            unsafe_allow_html=True,
        )


def render_sidebar(history, sentiment_counts, total_feedback, positive_percentage):
    st.sidebar.markdown("### Performance Dashboard")
    st.sidebar.markdown(
        f"""
        <div class="sidebar-stat">
            <p>Customer satisfaction</p>
            <strong>{positive_percentage:.0f}%</strong>
            <span>
                {sentiment_counts["Positive"]} positive of
                {total_feedback} total analyzed feedbacks.
            </span>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.sidebar.divider()

    history_view = st.sidebar.radio(
        "History view",
        ["Written history", "Bar chart"],
        horizontal=True,
    )

    if history_view == "Written history":
        render_written_history(history)
    else:
        st.sidebar.markdown('<p class="divider-label">Sentiment distribution</p>', unsafe_allow_html=True)
        st.sidebar.altair_chart(
            build_sentiment_chart(sentiment_counts),
            use_container_width=True,
        )

    st.sidebar.divider()

    if st.sidebar.button("Clear history", use_container_width=True):
        st.session_state.db.clear_database()
        st.success("History cleared successfully.")
        st.rerun()


def main():
    inject_theme()
    initialize_session_state()

    history = get_history()
    sentiment_counts = count_sentiments(history)
    total_feedback = sum(sentiment_counts.values())
    positive_percentage = positive_rate(sentiment_counts)
    latest_sentiment = history[0][2] if history else "Waiting for feedback"

    render_header(latest_sentiment)
    render_kpis(
        total_feedback,
        positive_percentage,
        len(st.session_state.ia.historical_analysis),
    )

    st.write("")

    input_col, result_col = st.columns([1.55, 1], gap="large")
    with input_col:
        render_feedback_form()
    with result_col:
        render_latest_result()

    render_sidebar(history, sentiment_counts, total_feedback, positive_percentage)


main()
