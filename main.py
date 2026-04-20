from analyzer import SentimentAnalyzer
from models import Feedback

ia = SentimentAnalyzer()

print("Bem-vindo ao sistema de análise de feedbacks dos clientes!\n")
cliente1 = Feedback("O bot do whatsapp é excelente e muito rápido!", 101)
cliente2 = Feedback("Achei o sistema péssimo, travou tudo.", 102)
cliente3 = Feedback("Funciona de forma ok, nada demais.", 103)
cliente4 = Feedback("O atendimento é bom, mas poderia ser melhor.", 104)

print("Começando a análise de feedbacks dos clientes...\n")

ia.analisar(cliente1)
ia.analisar(cliente2)
ia.analisar(cliente3)
ia.analisar(cliente4)

print(f"Resultado da análise do cliente 1: {cliente1.nota}  ")
print(f"Resultado da análise do cliente 2: {cliente2.nota}  ")
print(f"Resultado da análise do cliente 3: {cliente3.nota}  ")
print(ia.gerar_relatorio())
