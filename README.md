# AI Customer Sentiment Analyzer

Aplicacao full stack de analise de sentimentos para feedbacks de clientes. O projeto usa Python no backend, tecnicas simples de IA/NLP com TextBlob, API REST com FastAPI, persistencia em SQLite e uma interface web em Next.js.

O objetivo deste projeto e demonstrar, de forma pratica, como transformar comentarios de clientes em indicadores de satisfacao: o usuario envia um feedback, a API classifica o sentimento como positivo, neutro ou negativo, salva o resultado e exibe metricas em um dashboard.

## O que este projeto demonstra

- Backend Python organizado em camadas, com separacao entre API, regras de negocio e persistencia.
- Uso de FastAPI para expor endpoints REST documentados automaticamente.
- Validacao de dados com Pydantic no backend e Zod no frontend.
- Aplicacao de NLP/IA com TextBlob para estimar polaridade de textos.
- Regra complementar para tratar feedbacks ambiguos com a palavra `but`.
- Persistencia local com SQLite, incluindo historico e relatorio agregado.
- Frontend moderno consumindo uma API real, com dashboard, grafico e historico.
- Cuidados basicos de seguranca, como CORS restrito, limite de caracteres e tratamento de erros.

## Funcionalidades

- Analisar feedbacks de clientes em texto livre.
- Classificar cada feedback como `Positive`, `Neutral` ou `Negative`.
- Salvar historico das analises em SQLite.
- Exibir total de feedbacks, percentual positivo e distribuicao por sentimento.
- Limpar o historico quando necessario.
- Rodar pelo navegador ou pela CLI.

## Stack tecnica

| Area | Tecnologias |
| --- | --- |
| Backend | Python, FastAPI, Pydantic |
| IA/NLP | TextBlob |
| Banco de dados | SQLite |
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Visualizacao | Recharts |
| Dev local | Uvicorn, scripts npm, variaveis de ambiente |

## Arquitetura

```text
Frontend Next.js -> FastAPI -> backend/core -> SQLite
```

O backend fica concentrado em `backend/`:

```text
backend/
  core/
    analyzer.py    # analise de sentimento com TextBlob
    database.py    # acesso SQLite e consultas agregadas
    models.py      # modelo simples de feedback
  cli.py           # interface de terminal
  main.py          # aplicacao FastAPI e rotas HTTP
  schemas.py       # contratos Pydantic de entrada e saida
  services.py      # orquestracao entre API, core e banco
```

O frontend fica em `frontend/` e consome os endpoints da API:

```text
frontend/
  app/
  components/ui/
  lib/api.ts
```

## Como rodar

### 1. Instalar dependencias Python

```powershell
python -m pip install -r requirements.txt
```

### 2. Instalar dependencias do frontend

```powershell
cd frontend
npm install
```

### 3. Rodar o projeto completo

```powershell
npm run dev
```

Esse comando inicia o frontend em `http://localhost:3000` e tambem sobe a API FastAPI local em `http://127.0.0.1:8000` quando ela ainda nao estiver rodando.

### Rodar apenas a API

```powershell
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

A documentacao interativa da API fica em:

```text
http://127.0.0.1:8000/docs
```

### Rodar a CLI

```powershell
python -m backend.cli
```

## Endpoints principais

| Metodo | Rota | Descricao |
| --- | --- | --- |
| `GET` | `/api/health` | Verifica se a API esta online |
| `POST` | `/api/analyze` | Analisa e salva um feedback |
| `GET` | `/api/history` | Lista o historico do mais recente para o mais antigo |
| `GET` | `/api/report` | Retorna metricas agregadas |
| `DELETE` | `/api/history` | Limpa o historico |

Exemplo de request para analise:

```json
{
  "feedback": "The service was excellent."
}
```

Exemplo de response:

```json
{
  "id": 1,
  "feedback": "The service was excellent.",
  "sentiment": "Positive"
}
```

## Decisoes tecnicas

- **FastAPI** foi escolhido por ser simples, performatico e adequado para APIs Python modernas.
- **TextBlob** permite demonstrar NLP de forma objetiva, sem depender de modelos pesados.
- **SQLite** atende bem ao contexto local do projeto e facilita avaliacao por recrutadores.
- **Camadas no backend** deixam o codigo mais legivel: rotas, schemas, servico, core e banco.
- **Next.js + TypeScript** mostram consumo real da API e cuidado com experiencia do usuario.

## Seguranca e qualidade

- Entrada limitada a 2000 caracteres.
- Validacao no frontend e no backend.
- CORS configurado para ambiente local.
- Erros tratados sem expor stack trace para o usuario.
- Banco local e arquivos de ambiente ignorados pelo Git.
- Dashboard renderiza feedbacks como texto, sem uso de `dangerouslySetInnerHTML`.

## Proximos passos

- Adicionar testes automatizados de backend e frontend.
- Adicionar autenticacao para uso com multiplos usuarios.
- Evoluir de SQLite para PostgreSQL em ambiente de producao.
- Criar logs estruturados sem armazenar feedback sensivel completo.
- Publicar uma versao deployada para demonstracao online.

## Perfil do projeto

Este projeto foi pensado para demonstrar fundamentos importantes para uma vaga de estagio ou junior com Python e IA: organizacao de codigo, criacao de API, validacao de dados, uso pratico de NLP, persistencia, integracao com frontend e capacidade de evoluir um prototipo para uma estrutura mais profissional.
