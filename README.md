# 🤖 AI Customer Sentiment Analyzer

Um sistema completo de análise de sentimentos impulsionado por Inteligência Artificial (NLP) e desenvolvido em Python. Este projeto avalia feedbacks de clientes em tempo real, classificando-os como Positivos, Negativos ou Neutros, e gera um dashboard com o nível de satisfação (Customer Satisfaction Score).

## 🎯 Destaques do Projeto (Arquitetura)

O maior diferencial deste projeto é a sua **arquitetura modular**. A regra de negócio (Motor de IA) foi construída utilizando Programação Orientada a Objetos (POO), permitindo que a aplicação rode em duas interfaces completamente diferentes sem duplicação de código:

1. **Interface Web (GUI):** Um dashboard interativo construído com Streamlit, apresentando:
   - **Design Responsivo e Temático:** Estilização injetada via CSS customizado com variáveis nativas e `color-mix()`, garantindo adaptação perfeita e automática aos temas Claro e Escuro (Light/Dark mode).
   - **Visualização de Dados:** Alternância dinâmica entre o histórico textual e gráficos interativos de barras construídos com Altair.
2. **Interface de Terminal (CLI):** Uma aplicação de console completa baseada no padrão de projeto _Dispatcher_ (via dicionários em Python), oferecendo:
   - **Menu Interativo:** Fluxo contínuo de navegação com opções de submissão, painel de performance e limpeza de dados.
   - **Gráficos em Texto (ASCII):** Geração dinâmica de gráficos de barras diretamente no terminal para visualização rápida da distribuição de sentimentos.
   - **Integração com Banco de Dados:** Persistência total e recuperação de dados via SQLite3 diretamente pelo console.

## 🛠️ Tecnologias Utilizadas

- **Python 3.x** - Linguagem principal.
- **TextBlob** - Biblioteca de Processamento de Linguagem Natural (NLP) para extração de polaridade léxica.
- **Streamlit** - Framework web para criação da interface gráfica e gestão de estado (Session State).
- **Git/GitHub** - Versionamento Semântico e controle de código.
- **Altair & Pandas** - Bibliotecas de visualização e manipulação de dados utilizadas para renderizar gráficos interativos no dashboard.
- **SQLite3** - Banco de dados relacional leve e embutido utilizado para persistência do histórico de análises de forma local.

## 🧠 Soluções de Engenharia (Regras de Negócio)

- **Heurística Customizada:** Implementação de penalidade léxica (-0.4 no score) para contornar limitações do modelo _Bag-of-Words_ do TextBlob em frases com conjunções adversativas (ex: _"The app is good, BUT..."_), forçando avaliações mistas para a zona Neutra.
- **Geração Automática de Entidades:** Implementação de uma lógica de auto-incremento baseada no tamanho do histórico (ex: `101 + len(history)`), eliminando a necessidade de validação manual de colisão de IDs e melhorando a fluidez da experiência do usuário na submissão de feedbacks.
- **Internacionalização (i18n):** Código, variáveis e saídas textuais padronizados em inglês para facilitar a interoperabilidade com bibliotecas globais de NLP.
- **Gestão de Estado Avançada (Callbacks):** Implementação de um fluxo de submissão orientado a eventos no Streamlit. A utilização de callbacks vinculados ao `session_state` permite limpar os campos de input automaticamente e renderizar mensagens de sucesso/erro sem recarregar a página desnecessariamente, melhorando drasticamente a Experiência do Usuário (UX).
- **Persistência Local (SQLite3):** Integração com um banco de dados relacional local através de uma classe gerenciadora (`DatabaseManager`), permitindo o armazenamento e a recuperação de históricos de feedback entre sessões.

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