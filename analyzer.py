# Aqui está toda a lógica da inteligência artificial para análise de feedbacks.

class SentimentAnalyzer:
    def __init__(self):
        self.analise_historico = []
    
    def analisar(self, feedback_objeto):
        texto = feedback_objeto.text.lower()

        if "bom" in texto or "excelente" in texto:
            analise = "Feedback dos clientes foi excelente!."
        elif "ruim" in texto or "péssimo" in texto:
            analise = "Feedback dos clientes foi negativo..."
        else:
            analise = "Feedback dos clientes foi neutro.."   

        feedback_objeto.nota = analise
        self.analise_historico.append(feedback_objeto)
    
    def gerar_relatorio(self):
        # Verificando se há feedbacks analisados
        if not self.analise_historico:
            return "Nenhum feedback analisado ainda."

        # Contando o número total de feedbacks analisados
        total = len(self.analise_historico)

        # Contando o número de feedbacks positivos
        positivos = 0
        for f in self.analise_historico:
            if "excelente" in f.nota:
                positivos += 1

        porcentagem_positivos = (positivos / total) * 100

        return f"RELATÓRIO FINAL DE ANÁLISE DE FEEDBACKS:\nTotal analisados: {total}\nSatisfação dos clientes: {porcentagem_positivos:.2f}% positivos."