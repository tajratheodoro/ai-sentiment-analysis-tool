# 🧠 AI Sentiment Analysis Tool

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

> Uma aplicação Full-Stack que utiliza Inteligência Artificial para analisar o sentimento de textos, feedbacks e postagens, transformando dados brutos em insights claros e estruturados.

---

## 👁️ Visão Geral

O **AI Sentiment Analysis Tool** evoluiu de um script de análise simples para uma plataforma web completa e modular. O objetivo do projeto é demonstrar como integrar de forma eficiente um frontend moderno (Next.js) com um backend robusto em Python, utilizando a biblioteca TextBlob para o processamento de linguagem natural (NLP) e análise de polaridade.


## ✨ Principais Funcionalidades

* **Análise em Tempo Real:** Processamento instantâneo de textos para classificar a polaridade (Positivo, Negativo, Neutro).
* **Interface Dinâmica:** Frontend responsivo e interativo criado com componentes UI modernos e Tailwind CSS.
* **Persistência de Dados:** Histórico de análises salvo automaticamente em banco de dados SQLite para consultas futuras.
* **Arquitetura Desacoplada:** Backend e Frontend operam de forma independente, permitindo fácil escalabilidade.

## 🏗️ Arquitetura e Stack Tecnológico

O projeto foi construído separando as responsabilidades (Client-Server) para garantir manutenibilidade e adoção de boas práticas de Engenharia de Software.

**Frontend (`/frontend`)**
* **Framework:** Next.js (App Router)
* **Linguagem:** TypeScript
* **Estilização:** Tailwind CSS + Radix UI (Componentes modulares)

**Backend (`/backend`)**
* **Linguagem:** Python
* **Motor de IA:** Google Gemini API / TextBlob
* **Banco de Dados:** SQLite (com abstração via `core/database.py`)
* **Estrutura:** Dividido em rotas, serviços (`services.py`) e validação de dados (`schemas.py`).

---

### Pré-requisitos
* [Node.js](https://nodejs.org/) instalado
* [Python 3.8+](https://www.python.org/) instalado