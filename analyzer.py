from textblob import TextBlob
class SentimentAnalyzer:
    def __init__(self):
        self.historical_analysis = []
    
    def analisar(self, feedback_object):
        blob = TextBlob(feedback_object.text)
        score = blob.sentiment.polarity

        # Nova regra: Se o feedback contiver a palavra "but", reduzimos a pontuação em 0.4 para refletir a ambiguidade.
        if "but" in feedback_object.text.lower():
            score = score - 0.4
        
#        print(f"DEBUG - Text: {feedback_object.text[:3]}... | Score: {score}")

        if score > 0.34:
            analysis = "Positive"
        elif score < -0.3:
            analysis = "Negative"
        else:
            analysis = "Neutral"

        feedback_object.nota = analysis
        self.historical_analysis.append(feedback_object)
    
    def gerar_relatorio(self):
        if not self.historical_analysis:
            return "No feedback has been analyzed yet."

        total = len(self.historical_analysis)
        positives = len([f for f in self.historical_analysis if f.nota.lower() == "positive"])


        porcentagem_positivos = (positives / total) * 100

        return f"\nFINAL FEEDBACK ANALYSIS REPORT:\nTotal feedbacks analyzed: {total}\nCustomer Satisfaction: {porcentagem_positivos:.2f}% positive."