import streamlit as st
from analyzer import SentimentAnalyzer
from models import Feedback

if "ia" not in st.session_state:
    st.session_state.ia = SentimentAnalyzer()
if "id_counter" not in st.session_state:
    st.session_state.id_counter = 101   

st.title("Costumer Feedback Analysis System")
st.write("Welcome! Here you can enter your feedback and we will analyze it for you.")

user_input = st.text_area("Please, enter your feedback:")

if st.button("Submit Feedback"):
    if user_input.strip() == "":
        st.warning("Please enter some feedback before submitting.")
    else:
        new_client = Feedback(user_input, st.session_state.id_counter)
        st.session_state.ia.analyse(new_client)
        st.session_state.id_counter += 1
        st.success(f"Analysis completed for the current feedback. Sentiment score: {new_client.score}")

st.sidebar.header("Performance Dashboard")
report_text = st.session_state.ia.generate_report()
st.sidebar.text(report_text)

st.sidebar.divider()

st.subheader("Recent Feedback Analysis")

history = reversed(st.session_state.ia.historical_analysis)

for f in history:
    if f.score == "Positive":
        icon = "Positive 🟢"
    elif f.score == "Negative":
        icon = "Negative 🔴"
    else:
        icon = "Neutral 🟡"
    
    st.sidebar.write(f"{icon} {f.text[:30]}... **({f.score})**")