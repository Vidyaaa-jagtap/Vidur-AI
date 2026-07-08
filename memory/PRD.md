# Vidur AI — Product Requirements Document

## Original Problem Statement
Build a full-stack AI web application called Vidur AI. It helps startup founders convert startup ideas into structured business blueprints.

Pages: Home, Startup Idea Input Form, Results Dashboard.
Input Fields: Startup Name, Startup Idea, Industry, Target Audience.
Output Sections: Problem Statement, Business Objectives, Business Model Canvas, SWOT Analysis, Risk Analysis, Functional Requirements, User Stories, Product Backlog, Development Roadmap.
Add a PDF Export button.

## User Choices (First Session)
- **Stack**: React + FastAPI + MongoDB (env pre-configured).
- **AI**: Real LLM via Emergent Universal Key. Dedicated `ai_service.py` service layer — swappable for IBM watsonx.ai Granite later.
- **PDF**: Server-side via ReportLab (`pdf_service.py`).
- **Design**: Founder / pitch-deck aesthetic (Outfit + IBM Plex Sans, slate-900 primary, blue-600 accent, white background, card-based sections).

## Architecture
- **Backend** (`/app/backend`)
  - `server.py` — FastAPI routes (all under `/api`).
  - `ai_service.py` — Provider-agnostic layer. Current: `EmergentClaudeProvider` (`claude-sonnet-4-6`). To migrate: implement a new subclass of `_BlueprintProvider` and change `get_provider()`.
  - `pdf_service.py` — ReportLab renderer.
- **Frontend** (`/app/frontend/src`)
  - Routes: `/`, `/create`, `/results/:id`.
  - `pages/Home.jsx`, `pages/Create.jsx`, `pages/Results.jsx`.
  - `lib/api.js` — API client (async job pattern).

## Endpoints
| Method | Path | Purpose |
|-------|------|---------|
| POST | `/api/blueprint/jobs` | Enqueue generation, returns job_id immediately |
| GET | `/api/blueprint/jobs/{job_id}` | Poll job status (pending / running / done / error) |
| POST | `/api/blueprint/generate` | Sync fallback (server-to-server callers) |
| GET | `/api/blueprint/{id}` | Fetch a saved blueprint |
| GET | `/api/blueprints` | List recent blueprints |
| GET | `/api/blueprint/{id}/pdf` | Download PDF |

## What's Been Implemented (Feb 2026)
- [x] Home page with hero, features, how-it-works, CTA
- [x] Create page with 4 inputs, industry chip picker + custom industry, example loader, form validation
- [x] Async job-based generation (avoids 60s ingress timeout)
- [x] Results dashboard with all 9 sections (canvas 3×3 grid, SWOT 2×2, risk/backlog tables, roadmap timeline)
- [x] Server-side PDF export with polished ReportLab layout
- [x] Founder/pitch-deck design system (Outfit + IBM Plex Sans, slate-900 + blue-600, grid textures, card hover states)
- [x] Backend + frontend E2E tests green (iteration_3)

## Backlog

### P1 — Value adds
- Persistent user accounts (Emergent Google Auth or JWT) so founders can save multiple blueprints
- Section-level regeneration ("refine this section" prompt)
- Editable blueprint fields (in-place edit before export)
- Shareable public URL for a blueprint

### P2 — Growth
- Notion / Google Docs export
- Cohort/team plans for accelerators
- Pitch-deck (PPTX) export
- Investor persona picker for tone tuning

### P3 — Migration
- Swap `EmergentClaudeProvider` for `GraniteBlueprintProvider` (IBM watsonx.ai) — only `ai_service.py::get_provider()` changes

## Tech Notes
- LLM: Anthropic `claude-sonnet-4-6` via emergentintegrations (Emergent Universal Key).
- Streaming not used: blueprint generation is a single structured-JSON request.
- Frontend polling: 2.5s cadence, 180s hard timeout, in-memory job store via MongoDB `blueprint_jobs` collection.
