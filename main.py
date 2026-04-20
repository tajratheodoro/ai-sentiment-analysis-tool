from analyzer import SentimentAnalyzer
from models import Feedback
from time import sleep

ia = SentimentAnalyzer()

print("Welcome to the customer feedback analysis system!\n")
cliente1 = Feedback("The whatsapp bot is amazing and very fast!", 101)
cliente2 = Feedback("I had a terrible experience, it keeps crashing.", 102)
cliente3 = Feedback("It is a decent tool, but could be better.", 103)
cliente4 = Feedback("The customer service is good, but it could be better.", 104)

print("Beginning the analysis of customer feedback...\n")
sleep(2)

ia.analisar(cliente1)
ia.analisar(cliente2)
ia.analisar(cliente3)
ia.analisar(cliente4)

print(f"Resultado da análise do cliente 1: {cliente1.nota}  ")
print(f"Resultado da análise do cliente 2: {cliente2.nota}  ")
print(f"Resultado da análise do cliente 3: {cliente3.nota}  ")
print(f"Resultado da análise do cliente 4: {cliente4.nota}  ")
print(ia.gerar_relatorio())
