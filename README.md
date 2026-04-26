# 🤖 AI Customer Sentiment Analyzer

Um sistema completo de análise de sentimentos impulsionado por Inteligência Artificial (NLP) e desenvolvido em Python. Este projeto avalia feedbacks de clientes em tempo real, classificando-os como Positivos, Negativos ou Neutros, e gera um dashboard com o nível de satisfação (Customer Satisfaction Score).

## 🎯 Destaques do Projeto (Arquitetura)

O maior diferencial deste projeto é a sua **arquitetura modular**. A regra de negócio (Motor de IA) foi construída utilizando Programação Orientada a Objetos (POO), permitindo que a aplicação rode em duas interfaces completamente diferentes sem duplicação de código:

1. **Interface Web (GUI):** Um dashboard interativo e reativo construído com Streamlit.
2. **Interface de Terminal (CLI):** Um fluxo iterativo e robusto rodando direto no console.

## 🛠️ Tecnologias Utilizadas

- **Python 3.x** - Linguagem principal.
- **TextBlob** - Biblioteca de Processamento de Linguagem Natural (NLP) para extração de polaridade léxica.
- **Streamlit** - Framework web para criação da interface gráfica e gestão de estado (Session State).
- **Git/GitHub** - Versionamento Semântico e controle de código.

## 🧠 Soluções de Engenharia (Regras de Negócio)

- **Heurística Customizada:** Implementação de penalidade léxica (-0.4 no score) para contornar limitações do modelo _Bag-of-Words_ do TextBlob em frases com conjunções adversativas (ex: _"The app is good, BUT..."_), forçando avaliações mistas para a zona Neutra.
- **Prevenção de Colisão:** Lógica de validação contínua (via _List Comprehensions_) na versão CLI para impedir a inserção de usuários (IDs) duplicados na base de dados em memória.
- **Internacionalização (i18n):** Código, variáveis e saídas textuais padronizados em inglês para facilitar a interoperabilidade com bibliotecas globais de NLP.

## 🎯 Casos de Uso

Esta ferramenta foi projetada para ser versátil, atendendo tanto ao setor privado quanto a iniciativas de modernização pública:

### 🏛️ Análise de Dados Governamentais (GovTech)
* **Ouvidoria Digital:** Processamento automático de grandes volumes de feedbacks de cidadãos sobre serviços públicos, identificando áreas críticas que necessitam de intervenção imediata.
* **Monitoramento de Clima Social:** Análise de sentimento em redes sociais ou formulários de consulta pública para medir a aceitação de novos projetos de infraestrutura ou políticas governamentais.

### 📈 Inteligência de Mercado e Investimentos
* **Atração de Investimentos:** Monitoramento do sentimento de investidores estrangeiros em relação ao ecossistema econômico local, auxiliando agências de desenvolvimento a ajustar suas narrativas de captação.
* **Customer Experience (CX) para Startups:** Implementação em dashboards de SaaS para que empresas parceiras do estado possam monitorar a saúde da relação com seus clientes de forma automatizada.

### 🔬 Pesquisa e Desenvolvimento
* Utilização como base para estudos acadêmicos em Processamento de Linguagem Natural (NLP) e para a validação de modelos de IA aplicados à língua portuguesa e inglesa.