# SalesGPT SDR Engine

TypeScript port of the SalesGPT conversation logic, integrated with the Barak Real Estate backend.

## Sales Stages (from original SalesGPT)

1. **Introduction** – Greet, introduce company, clarify reason for contact
2. **Qualification** – Confirm they're the right person / have authority
3. **Value proposition** – Explain benefits and unique selling points
4. **Needs analysis** – Ask open-ended questions, uncover pain points
5. **Solution presentation** – Present product as the solution
6. **Objection handling** – Address objections with evidence
7. **Close** – Propose next step (demo, trial, meeting)
8. **End conversation** – Wrap up

## Setup

1. Add `OPENAI_API_KEY` to `real-estate-backend/.env`
2. Optionally set `FRONTEND_URL` (default: http://localhost:3000)

## API Endpoints

### Generate Opening Email

```bash
curl -X POST http://localhost:5000/api/salesgpt/generate-opening \
  -H "Content-Type: application/json" \
  -d '{"clientSlug":"azrieli-barak-tower"}'
```

Returns: `{ opening, dashboardLink, stageId }`

### Chat Turn

```bash
curl -X POST http://localhost:5000/api/salesgpt/chat \
  -H "Content-Type: application/json" \
  -d '{"clientSlug":"azrieli-barak-tower","userMessage":"Tell me more about the properties"}'
```

Returns: `{ text, endOfCall, stageId, conversationHistory }`

## SDR Script

Generate opening email from CLI (run from real-estate-backend):

```bash
cd real-estate-backend
npm run generate-email -- azrieli-barak-tower
```

## Database Integration

The engine automatically:

- Loads client by `unique_slug`
- Fetches assigned properties
- Injects dashboard link: `{FRONTEND_URL}/dashboard/{slug}`
- Injects property summary (address, area, monthly cost) into the agent context

When the agent reaches **Solution presentation** or **Close**, it will share the dashboard link.
