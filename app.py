import streamlit as st
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
st.write("Welcome! Here you can enter your feedback and we will analyze it for you. You can use this tool to share your thoughts and help us improve our services.")

user_input = st.text_area("Please, enter your feedback:")

if st.button("Submit Feedback"):
    if user_input.strip() == "":
        st.warning("Please enter some feedback before submitting.")
    else:
        new_client = Feedback(user_input, st.session_state.id_counter)
        st.session_state.ia.analyse(new_client)
        st.session_state.id_counter += 1
        st.session_state.db.save_feedback(user_input, new_client.score)
        st.success(f"Analysis completed for the current feedback. Sentiment score: {new_client.score}")

st.sidebar.header("Performance Dashboard")
report_text = st.session_state.ia.generate_report()
st.sidebar.text(report_text)

st.sidebar.divider()

if st.sidebar.button("🗑️ Clear History"):
    st.session_state.db.clear_database()
    st.success("History cleared successfully!")
    st.rerun()

st.sidebar.subheader("Recent Feedback Analysis")
history_db = st.session_state.db.get_all_analysis()
history_db.reverse()

for row in history_db:
    if row[2] == "Positive":
        icon = "Positive 🟢 | "
    elif row[2] == "Negative":
        icon = "Negative 🔴 | "
    else:
        icon = "Neutral 🟡 | "
    
    st.sidebar.write(f"{icon} {row[1][:30]}... **({row[2]})**")
