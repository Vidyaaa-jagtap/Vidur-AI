<div align="center">

# Vidur AI — Business Analyst Copilot

### Turn a startup idea into an investor-ready business blueprint.

**IBM watsonx.ai · Multi-agent architecture · 13 specialised business analysts**

</div>

---

## Overview

Vidur AI is a full-stack GenAI web application that converts a raw startup idea into a **structured, investor-ready business blueprint**. It runs entirely on **IBM watsonx.ai** — no OpenAI, Anthropic, Gemini, or Emergent APIs — using a multi-agent orchestration pattern that avoids Watsonx token limits by having each of thirteen specialised agents own exactly one section of the report.

Built for the **IBM AICTE Edunet Internship Program**.

## Sections generated

1. **Startup Viability Score** (0–100 with 5 sub-scores: market potential, product-market fit, execution feasibility, monetization strength, defensibility)
2. **Problem Statement**
3. **Business Objectives**
4. **Market Opportunity Analysis** (TAM / SAM / SOM, growth rate, trends, drivers)
5. **Competitive Landscape** (direct competitors, differentiators, moats)
6. **Business Model Canvas** (9 blocks)
7. **SWOT Analysis** (2×2 matrix)
8. **Risk Analysis** (categorized, with impact × likelihood × mitigation)
9. **Functional Requirements**
10. **User Stories** (with acceptance criteria)
11. **Product Backlog** (P0/P1/P2, effort-sized)
12. **Development Roadmap** (phased with timelines)
13. **AI Recommendations** (prioritized next actions)
14. **Investor-Ready PDF Report**

## Technology stack

- **Backend**: FastAPI (async), MongoDB (Motor), IBM watsonx.ai SDK, tenacity retries, ReportLab
- **Frontend**: React 19, React Router, Tailwind CSS, shadcn/ui, lucide-react, sonner
- **LLM**: `meta-llama/llama-3-3-70b-instruct` on **IBM watsonx.ai** (region: `eu-gb`, London)
- **Async job pattern** so the UI never blocks on long inference

## Folder structure

```
/app
├── backend/
│   ├── .env                        # IBM Watsonx credentials + Mongo config
│   ├── requirements.txt
│   ├── server.py                   # FastAPI app + routes + background jobs
│   ├── watsonx_client.py           # IBM watsonx.ai client (async wrapper + retries)
│   ├── ai_service.py               # Multi-agent orchestrator
│   ├── pdf_service.py              # ReportLab PDF renderer (13 sections)
│   ├── json_utils.py               # Robust JSON extraction + repair
│   └── agents/
│       ├── __init__.py
│       ├── base.py                 # BaseAgent (retry + validation)
│       ├── problem.py
│       ├── objectives.py
│       ├── canvas.py
│       ├── swot.py
│       ├── risk.py
│       ├── requirements.py
│       ├── stories.py
│       ├── backlog.py
│       ├── roadmap.py
│       ├── viability.py            # Startup viability scoring agent
│       ├── market.py               # Market opportunity agent
│       ├── competitive.py          # Competitive analysis agent
│       └── recommendations.py      # AI recommendation engine
├── frontend/
│   ├── .env                        # REACT_APP_BACKEND_URL
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── index.js
│       ├── index.css
│       ├── App.js
│       ├── App.css
│       ├── lib/api.js
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   └── ui/                 # shadcn/ui components
│       └── pages/
│           ├── Home.jsx
│           ├── Create.jsx          # Multi-agent progress panel
│           └── Results.jsx         # Viability hero + 13 sections
├── memory/
│   └── PRD.md
└── README.md
```

## Environment variables

`/app/backend/.env`:

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="vidur_ai"
CORS_ORIGINS="*"
WATSONX_API_KEY=""
WATSONX_PROJECT_ID=""
WATSONX_URL="https://eu-gb.ml.cloud.ibm.com"
WATSONX_MODEL_ID="meta-llama/llama-3-3-70b-instruct"
```

Supported `WATSONX_MODEL_ID` values (any Watsonx-hosted text model):

- `meta-llama/llama-3-3-70b-instruct` (default, recommended)
- `meta-llama/llama-4-maverick-17b-128e-instruct-fp8`
- `mistralai/mistral-small-3-1-24b-instruct-2503`
- (any other Watsonx text-generation model your project has access to)

`/app/frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Installation & run

```bash
# 1. Backend
cd backend
pip install -r requirements.txt

# 2. Add IBM credentials to backend/.env:
#    WATSONX_API_KEY=... ; WATSONX_PROJECT_ID=...

# 3. Start MongoDB (e.g. Docker):
docker run -d -p 27017:27017 mongo:6

# 4. Start backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# 5. Frontend (in a new terminal)
cd ../frontend
yarn install         # use yarn, not npm
yarn start

# 6. Open http://localhost:3000
```

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/` | Health + Watsonx metadata |
| `POST` | `/api/blueprint/jobs` | Enqueue async generation — returns `{id, status:"pending", progress}` |
| `GET` | `/api/blueprint/jobs/{job_id}` | Poll job. Includes `progress` map (section → status) |
| `POST` | `/api/blueprint/generate` | Synchronous generation (long call) |
| `GET` | `/api/blueprint/{id}` | Fetch a stored blueprint |
| `GET` | `/api/blueprints` | Recent blueprints |
| `GET` | `/api/blueprint/{id}/pdf` | Download PDF |

## Architecture — multi-agent, token-limit-aware

```
                 ┌────────────────────────────────┐
                 │   React SPA (async polling)    │
                 └────────────────┬───────────────┘
                                  │
                 ┌────────────────▼───────────────┐
                 │       FastAPI /api/*           │
                 │   Background job + progress    │
                 └────────────────┬───────────────┘
                                  │
                 ┌────────────────▼───────────────┐
                 │       ai_service.py            │
                 │  asyncio.gather(13 agents,     │
                 │  Semaphore(4) concurrency)     │
                 └──┬───────┬────────┬────────┬───┘
                    │       │        │        │
       Problem  Objectives  Canvas  SWOT  Risk  Requirements
       Stories  Backlog  Roadmap  Viability  Market  Competitive
                                                       Recommendations
                    │       │        │        │
                    ▼       ▼        ▼        ▼
                 ┌────────────────────────────────┐
                 │     IBM watsonx.ai (eu-gb)     │
                 │   Llama-3.3-70B-Instruct       │
                 └────────────────────────────────┘
                                  │
                                  ▼
                 ┌────────────────────────────────┐
                 │           MongoDB              │
                 │  blueprints · blueprint_jobs   │
                 └────────────────────────────────┘
```

### Why 13 agents instead of one prompt?

- **Token limits**: Watsonx models have per-request output token caps. Splitting into 13 focused prompts keeps every response comfortably under the cap.
- **Reliability**: Each agent validates its own JSON schema and self-repairs on failure (up to 2 automatic retries).
- **Speed**: Agents run with `asyncio.gather` (bounded by a semaphore of 4) → total wall time ≈ single agent × 4, not × 13.
- **Extensibility**: Adding a new section = one new agent file. No mega-prompt to rewrite.

### JSON validation & repair pipeline

Every LLM response is passed through `json_utils.parse_json`, which:

1. Strips markdown fences (` ```json ... ``` `).
2. Extracts the outermost balanced `{…}` block (auto-closes if the model truncated).
3. Removes trailing commas.
4. Falls back to `json.loads` variants.

If parsing still fails, the agent retries the prompt with a targeted error hint, up to two more times.

## IBM Evaluation Criteria — how Vidur AI scores

| Criterion | How Vidur AI addresses it |
|-----------|---------------------------|
| **IBM Cloud Platform usage** | Sole LLM provider is IBM watsonx.ai. Region-configurable (defaults to `eu-gb`). Uses official `ibm-watsonx-ai` SDK. |
| **Scalability** | Stateless FastAPI + Motor async Mongo. Bounded-concurrency agent orchestration. Background jobs so ingress timeouts don't matter. Ready to deploy behind IBM Code Engine or OpenShift. |
| **Innovation** | Multi-agent Business Analyst Copilot with a proprietary viability score, market sizing (TAM/SAM/SOM), competitive teardown, and an AI recommendation engine — all backed by IBM Watsonx. |
| **Social Impact** | Democratizes strategic-consulting-grade output for first-time and non-technical founders in India, Africa, and other emerging ecosystems — replaces $5k–$50k consulting engagements with a free tool. |
| **Deployment Readiness** | Single `.env` for credentials, no hardcoded secrets, MongoDB via env var, `pip install` + `yarn install` and run. Docker-friendly. |
| **Commercial Viability** | Freemium: 1 blueprint free, paid tiers for saved history, team plans, and accelerator cohort licensing. |
| **Future Scope** | Section-level "refine this" regeneration · Shareable public blueprint URLs · Notion/PPTX export · Watsonx.data grounding on live market data · Multi-language support · Founder-persona voice tuning. |

## License

MIT
