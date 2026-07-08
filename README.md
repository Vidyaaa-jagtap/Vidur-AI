<div align="center">

# 🧭 Vidur AI

### From a paragraph of vision to an investor-ready startup blueprint — in under a minute.

*Nine strategic sections. One coherent report. One click to PDF.*

[![Stack](https://img.shields.io/badge/stack-React%20%2B%20FastAPI%20%2B%20MongoDB-0f172a?style=flat-square)](#-technology-stack)
[![LLM](https://img.shields.io/badge/LLM-Claude%20Sonnet%204.6-2563eb?style=flat-square)](#-technology-stack)
[![Migration-Ready](https://img.shields.io/badge/migration-IBM%20watsonx.ai%20Granite-054ada?style=flat-square)](#-future-ibm-granite-integration)
[![License](https://img.shields.io/badge/license-MIT-emerald?style=flat-square)](#-license)

</div>

---

## 📖 Project Overview

**Vidur AI** is a full-stack AI web application that turns a raw startup idea into a structured, investor-ready **business blueprint**. Founders, consultants, and incubators describe an idea in a few sentences — Vidur AI returns a professionally organized nine-section report covering everything from the Business Model Canvas to a phased Development Roadmap, exportable as a polished PDF.

The application was designed for **hackathons, startup incubators, and enterprise showcases**. The AI layer is intentionally decoupled behind a provider abstraction so the current LLM (Anthropic Claude Sonnet 4.6, via the Emergent Universal Key) can be swapped for **IBM watsonx.ai Granite** models with a single-file change.

**Named after Vidur** — the sage-strategist from the Mahabharata, revered for turning complex situations into clear, structured counsel.

---

## ✨ Features

- 🚀 **Idea → Blueprint in ~60–90 seconds** — a founder pastes a paragraph, Vidur AI synthesizes a full report.
- 🧩 **Nine strategic sections**, every time:
  1. Problem Statement
  2. Business Objectives
  3. Business Model Canvas (9 blocks)
  4. SWOT Analysis (2×2 matrix)
  5. Risk Analysis (impact × likelihood × mitigation)
  6. Functional Requirements
  7. User Stories (with acceptance criteria)
  8. Product Backlog (prioritized, effort-sized)
  9. Development Roadmap (phased with timelines)
- 📄 **Server-side PDF export** — publisher-quality report generated with ReportLab, cover page included.
- ⏱ **Async job pattern** — non-blocking generation with polling; survives ingress timeouts.
- 🎨 **Founder / pitch-deck design aesthetic** — Outfit + IBM Plex Sans, slate-900 + blue-600, card-based dashboard, generous whitespace.
- 🧠 **Provider-agnostic AI layer** — swap Claude for IBM Granite by editing one factory function.
- 📱 **Responsive** — pitch-ready on desktop, functional on mobile.
- 🧪 **Fully tested** — backend regression suite + frontend E2E via Playwright.

---

## 🛠 Technology Stack

| Layer            | Choice                                              | Why                                                                 |
|------------------|-----------------------------------------------------|---------------------------------------------------------------------|
| **Frontend**     | React 19, React Router 7, TailwindCSS, shadcn/ui    | Fast iteration; investor-grade component quality                    |
| **Icons / Motion** | lucide-react, framer-motion                       | Consistent iconography, tasteful micro-interactions                 |
| **Toasts**       | sonner                                              | Non-intrusive, accessible notifications                             |
| **Backend**      | Python 3.11, FastAPI, Uvicorn                       | Async-first, type-safe API with automatic OpenAPI docs              |
| **Database**     | MongoDB (Motor async driver)                        | Flexible schema for evolving blueprint structure                    |
| **LLM**          | Anthropic **Claude Sonnet 4.6** via `emergentintegrations` (Emergent Universal Key) | Best-in-class reasoning for structured strategy output |
| **PDF**          | ReportLab 5                                         | Precise, publication-quality server-side PDFs                       |
| **Typography**   | Outfit (headings), IBM Plex Sans (body), JetBrains Mono (code) | Distinctive, editorial, "Swiss" aesthetic              |
| **Testing**      | Pytest (backend), Playwright (frontend E2E)         | Deterministic regression coverage                                   |

---

## 🏗 Architecture

```
                     ┌─────────────────────────────────────────────┐
                     │                  React SPA                  │
                     │  Home  ·  Create  ·  Results dashboard      │
                     └────────────────┬────────────────────────────┘
                                      │  REACT_APP_BACKEND_URL
                                      ▼
                     ┌─────────────────────────────────────────────┐
                     │              FastAPI (/api/*)               │
                     │                                             │
                     │  POST /blueprint/jobs   ──►  BackgroundTask │
                     │  GET  /blueprint/jobs/:id (poll)            │
                     │  GET  /blueprint/:id                        │
                     │  GET  /blueprint/:id/pdf                    │
                     └────────┬────────────────────┬───────────────┘
                              │                    │
                              ▼                    ▼
             ┌──────────────────────┐   ┌──────────────────────┐
             │   ai_service.py      │   │   pdf_service.py     │
             │  ┌────────────────┐  │   │   ReportLab renderer │
             │  │ Provider (ABC) │  │   │   9-section layout   │
             │  ├────────────────┤  │   └──────────────────────┘
             │  │  Emergent      │  │
             │  │  Claude 4.6    │◄─┼───── EMERGENT_LLM_KEY
             │  ├────────────────┤  │
             │  │  ⟵ Granite     │  │
             │  │    (future)    │  │
             │  └────────────────┘  │
             └──────────┬───────────┘
                        ▼
             ┌──────────────────────┐
             │       MongoDB        │
             │  blueprints          │
             │  blueprint_jobs      │
             └──────────────────────┘
```

**Why an async job pattern?** LLM generation takes ~60–90 seconds. Reverse proxies typically close idle HTTP requests around the 60-second mark. Vidur AI's frontend POSTs to `/api/blueprint/jobs`, gets a `job_id` instantly, then polls every 2.5s until the background task completes — a resilient, cloud-friendly pattern.

### Repository layout

```
vidur-ai/
├── backend/
│   ├── server.py            # FastAPI app + routes
│   ├── ai_service.py        # Provider abstraction (Claude today, Granite tomorrow)
│   ├── pdf_service.py       # ReportLab PDF renderer
│   ├── requirements.txt
│   └── .env                 # MONGO_URL · DB_NAME · EMERGENT_LLM_KEY
├── frontend/
│   ├── src/
│   │   ├── pages/           # Home · Create · Results
│   │   ├── components/      # Navbar · Footer · shadcn/ui
│   │   ├── lib/api.js       # startBlueprintJob · getBlueprintJob · pdfUrl
│   │   ├── App.js
│   │   ├── index.css        # fonts + design tokens
│   │   └── index.js
│   ├── package.json
│   └── .env                 # REACT_APP_BACKEND_URL
├── memory/
│   └── PRD.md               # product spec + backlog
└── README.md
```

---

## ⚙️ Installation Steps

### Prerequisites

- **Node.js ≥ 18** and **Yarn** (do *not* use `npm`)
- **Python ≥ 3.11**
- **MongoDB ≥ 6** (local or Atlas)
- An **Emergent Universal Key** — obtain from your Emergent profile

### 1. Clone

```bash
git clone https://github.com/your-org/vidur-ai.git
cd vidur-ai
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="vidur"
CORS_ORIGINS="*"
EMERGENT_LLM_KEY="sk-emergent-xxxxxxxxxxxxxxxx"
```

Run:

```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The API is now live at **http://localhost:8001/api**.

### 3. Frontend

```bash
cd ../frontend
yarn install
```

Create `frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

Run:

```bash
yarn start
```

Open **http://localhost:3000** and generate your first blueprint 🚀

### 4. Testing (optional)

```bash
# Backend regression tests
cd backend && pytest tests/

# Frontend E2E (Playwright)
cd ../frontend && yarn test
```

---

## 🔌 API Endpoints

All endpoints are prefixed with `/api`.

| Method | Endpoint                          | Description                                              |
|--------|-----------------------------------|----------------------------------------------------------|
| `GET`  | `/api/`                           | Health check → `{ "service": "Vidur AI", "status": "ok" }` |
| `POST` | `/api/blueprint/jobs`             | **Enqueue** blueprint generation. Returns `{ id, status: "pending" }` immediately. |
| `GET`  | `/api/blueprint/jobs/{job_id}`    | Poll a job. Returns `status` (`pending` → `running` → `done` \| `error`) and `blueprint_id` when done. |
| `POST` | `/api/blueprint/generate`         | **Sync** generation (server-to-server callers). Blocks until the LLM completes. |
| `GET`  | `/api/blueprint/{id}`             | Fetch a stored blueprint by ID.                          |
| `GET`  | `/api/blueprints?limit=20`        | List recent blueprints (summary view).                   |
| `GET`  | `/api/blueprint/{id}/pdf`         | Stream the PDF report (`Content-Type: application/pdf`). |

### Example: end-to-end via curl

```bash
# 1. Kick off a job
JOB=$(curl -s -X POST http://localhost:8001/api/blueprint/jobs \
    -H "Content-Type: application/json" \
    -d '{
      "startup_name": "SprintDeck",
      "industry": "SaaS",
      "target_audience": "Early-stage startup founders",
      "startup_idea": "An AI copilot that turns raw startup ideas into investor-ready blueprints in under a minute."
    }')

JOB_ID=$(echo "$JOB" | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")

# 2. Poll until done
while :; do
  STATUS=$(curl -s http://localhost:8001/api/blueprint/jobs/$JOB_ID)
  echo "$STATUS"
  echo "$STATUS" | grep -q '"status":"done"' && break
  sleep 3
done

# 3. Extract the blueprint_id and download the PDF
BP_ID=$(echo "$STATUS" | python3 -c "import sys,json;print(json.load(sys.stdin)['blueprint_id'])")
curl -o SprintDeck.pdf http://localhost:8001/api/blueprint/$BP_ID/pdf
```

### Request schema (`/api/blueprint/jobs`)

```json
{
  "startup_name":     "string (1-120)",
  "startup_idea":     "string (10-4000)",
  "industry":         "string (1-120)",
  "target_audience":  "string (1-400)"
}
```

### Response schema (a completed blueprint)

```json
{
  "id": "uuid",
  "startup_name": "...",
  "startup_idea": "...",
  "industry": "...",
  "target_audience": "...",
  "blueprint": {
    "problem_statement": "...",
    "business_objectives": ["..."],
    "business_model_canvas": {
      "key_partners": ["..."], "key_activities": ["..."], "key_resources": ["..."],
      "value_propositions": ["..."], "customer_relationships": ["..."], "channels": ["..."],
      "customer_segments": ["..."], "cost_structure": ["..."], "revenue_streams": ["..."]
    },
    "swot_analysis": { "strengths": ["..."], "weaknesses": ["..."], "opportunities": ["..."], "threats": ["..."] },
    "risk_analysis": [ { "risk": "...", "impact": "High|Medium|Low", "likelihood": "High|Medium|Low", "mitigation": "..." } ],
    "functional_requirements": ["..."],
    "user_stories": [ { "persona": "...", "story": "...", "acceptance_criteria": ["..."] } ],
    "product_backlog": [ { "id": "VDR-1", "title": "...", "priority": "P0|P1|P2", "effort": "S|M|L|XL", "description": "..." } ],
    "development_roadmap": [ { "phase": "Phase 1 - Discovery", "timeline": "Weeks 1-2", "milestones": ["..."] } ]
  },
  "created_at": "2026-02-08T18:43:48.970150Z"
}
```

---

## 🔷 Future IBM Granite Integration

The AI layer was designed from day one for a clean migration to **IBM watsonx.ai Granite** models. All prompt logic, parsing, and validation live in `ai_service.py` behind a provider abstraction:

```python
class _BlueprintProvider(ABC):
    @abstractmethod
    async def generate_blueprint(self, payload) -> dict: ...
```

**Nothing** in `server.py`, `pdf_service.py`, or the frontend depends on the underlying provider. To migrate, implement one new class and change one factory function:

```python
# backend/ai_service.py

from ibm_watsonx_ai.foundation_models import ModelInference

class GraniteBlueprintProvider(_BlueprintProvider):
    def __init__(self, api_key: str, project_id: str,
                 model_id: str = "ibm/granite-3-8b-instruct"):
        self._model = ModelInference(
            model_id=model_id,
            credentials={"apikey": api_key, "url": "https://us-south.ml.cloud.ibm.com"},
            project_id=project_id,
        )

    async def generate_blueprint(self, payload):
        prompt = EmergentClaudeProvider._build_user_prompt(payload)
        raw = self._model.generate_text(
            prompt=f"{SYSTEM_PROMPT}\n\n{prompt}",
            params={"max_new_tokens": 4096, "temperature": 0.4},
        )
        return EmergentClaudeProvider._parse_json(raw)


def get_provider() -> _BlueprintProvider:
    return GraniteBlueprintProvider(
        api_key=os.environ["WATSONX_API_KEY"],
        project_id=os.environ["WATSONX_PROJECT_ID"],
    )
```

Add to `backend/.env`:

```env
WATSONX_API_KEY="..."
WATSONX_PROJECT_ID="..."
```

That's the entire migration. The frontend, PDF layer, database, and API contracts are unaffected.

**Why Granite?** IBM Granite models are enterprise-grade, transparent (open training data), and cost-efficient for structured business reasoning — ideal for regulated verticals, procurement-friendly deployments, and long-term IBM Cloud alignment.

---

## 🖼 Screenshots

> *Add screenshots to `/docs/screenshots/` and reference them here.*

<div align="center">

|                Home                |               Create               |              Results               |
|:----------------------------------:|:----------------------------------:|:----------------------------------:|
| ![Home](docs/screenshots/home.png) | ![Create](docs/screenshots/create.png) | ![Results](docs/screenshots/results.png) |

</div>

<div align="center">

|          Business Model Canvas         |         SWOT Analysis         |             Exported PDF             |
|:--------------------------------------:|:-----------------------------:|:------------------------------------:|
| ![BMC](docs/screenshots/bmc.png) | ![SWOT](docs/screenshots/swot.png) | ![PDF](docs/screenshots/pdf.png) |

</div>

---

## 🛣 Roadmap

- [x] MVP: Home + Create + Results + PDF export
- [x] Async job pattern (survives long LLM calls)
- [x] Provider abstraction (IBM Granite migration-ready)
- [ ] User accounts + saved blueprint history (Emergent Google Auth)
- [ ] Section-level "refine this" regeneration
- [ ] Shareable public blueprint URLs (`vidur.ai/b/{id}`) with OG images
- [ ] Notion / Google Docs / PPTX export
- [ ] Cohort & team plans for accelerators
- [ ] IBM watsonx.ai Granite provider swap

---

## 🤝 Contributing

1. Fork the repo and create a feature branch: `git checkout -b feat/your-feature`
2. Backend changes: run `pytest` before submitting.
3. Frontend changes: keep `data-testid` attributes on all interactive elements.
4. Do **not** introduce `npm` — this project uses `yarn` exclusively.
5. Open a PR with a clear description and screenshots for UI changes.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for full details.

```
MIT License

Copyright (c) 2026 Vidur AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**Built for founders. Designed for investors. Ready for IBM.**

*If Vidur AI helps you land your next round — tell us. We love a good origin story.*

</div>
