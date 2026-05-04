# AI Customer Sentiment Analyzer

Aplicacao de analise de sentimentos para feedbacks de clientes. O Streamlit foi tratado como prototipo funcional e substituido por uma arquitetura profissional com frontend Next.js e backend FastAPI, preservando a logica Python existente.

## Arquitetura

Antes:
- `app.py`: prototipo Streamlit.
- `main.py`: CLI.
- `analyzer.py`: analise de sentimento com TextBlob.
- `database.py`: persistencia SQLite.
- `models.py`: modelo `Feedback`.

Agora:
- `frontend/`: aplicacao Next.js + TypeScript + Tailwind CSS + componentes estilo shadcn/ui + Recharts.
- `backend/`: API FastAPI que reutiliza `SentimentAnalyzer`, `DatabaseManager` e `Feedback`.
- `main.py`: CLI preservada.
- `app.py`: legado, fora do fluxo principal.

Fluxo:

```text
Frontend Next.js -> FastAPI -> SentimentAnalyzer -> DatabaseManager -> SQLite
```

## Estrutura de Pastas

```text
backend/
  main.py
  schemas.py
  services.py
frontend/
  app/
  components/ui/
  lib/api.ts
analyzer.py
database.py
models.py
main.py
app.py
```

## Backend FastAPI

Instalar dependencias Python:

```powershell
python -m pip install -r requirements.txt
```

Rodar API:

```powershell
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Documentacao da API:

```text
http://127.0.0.1:8000/docs
```

## Frontend Next.js

Instalar dependencias Node:

```powershell
cd frontend
npm install
```

Rodar frontend:

```powershell
npm run dev
```

Acessar:

```text
http://localhost:3000
```

Configure a URL da API com:

```text
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Um exemplo esta em `frontend/.env.example`.

## Endpoints

### POST `/api/analyze`

Analisa e salva um feedback.

Request:

```json
{ "feedback": "The service was excellent." }
```

Response:

```json
{
  "id": 1,
  "feedback": "The service was excellent.",
  "sentiment": "Positive"
}
```

Validacoes:
- texto obrigatorio;
- trim;
- minimo de 3 caracteres;
- maximo de 2000 caracteres.

### GET `/api/history`

Retorna o historico salvo, do mais recente para o mais antigo.

### GET `/api/report`

Retorna metricas agregadas.

Response:

```json
{
  "total_feedbacks": 3,
  "positive_count": 1,
  "neutral_count": 1,
  "negative_count": 1,
  "positive_percentage": 33.33
}
```

### DELETE `/api/history`

Limpa o historico salvo no SQLite.

## Seguranca

Medidas aplicadas:
- validacao no frontend com Zod;
- validacao no backend com Pydantic;
- limite de 2000 caracteres;
- feedbacks renderizados como texto puro no React;
- `dangerouslySetInnerHTML` nao utilizado;
- CORS restrito a `localhost:3000` e `127.0.0.1:3000`, configuravel por `ALLOWED_ORIGINS`;
- erros tratados sem expor stack trace ao usuario;
- URL da API configuravel por variavel de ambiente;
- `.gitignore` ignora banco local, `.env`, builds, `node_modules` e `__pycache__`.

Recomendacoes futuras:
- adicionar autenticacao;
- adicionar rate limiting;
- usar PostgreSQL em producao;
- configurar HTTPS;
- adicionar logs estruturados sem feedback completo;
- adicionar testes automatizados de API e frontend.

## Streamlit Legado

`app.py` permanece no repositorio apenas como referencia do prototipo original. A interface principal agora e `frontend/` consumindo `backend/`.
