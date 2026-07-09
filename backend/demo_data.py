"""Deterministic demo blueprint (no LLM calls).

Used by the /api/blueprint/demo endpoint so users can experience the full
Results dashboard and Copilot chat without configuring Watsonx credentials.
"""
from __future__ import annotations

from typing import Any, Dict

DEMO_META: Dict[str, str] = {
    "startup_name": "SprintDeck",
    "startup_idea": (
        "An AI copilot that turns raw startup ideas into investor-ready "
        "blueprints — canvas, SWOT, viability score, roadmap and backlog — "
        "in under a minute. Founders paste a paragraph; SprintDeck produces "
        "the same 14-section report a top-tier strategy consultant would."
    ),
    "industry": "SaaS",
    "target_audience": "Early-stage startup founders and product managers",
}


DEMO_BLUEPRINT: Dict[str, Any] = {
    "executive_summary": {
        "headline": "SprintDeck compresses 3 weeks of strategy work into 90 seconds — with an AI Copilot that already knows your plan.",
        "thesis": "Solo and first-time founders lose funding opportunities because they cannot articulate a structured business plan in the compressed timelines investors now expect. SprintDeck replaces $10k consulting engagements with an AI-generated blueprint plus an on-demand analyst chat, at a fraction of the cost.",
        "key_metrics": [
            {"label": "TAM", "value": "$18B"},
            {"label": "3yr SOM", "value": "$120M"},
            {"label": "Target CAGR", "value": "22%"},
            {"label": "Viability", "value": "87/100"},
            {"label": "Payback", "value": "< 6 months"},
            {"label": "ICP", "value": "Solo founders"},
        ],
        "call_to_action": "Ship the paid tier within 6 weeks and secure the first accelerator partnership by month 3.",
    },
    "problem_statement": (
        "Early-stage founders routinely spend two to three weeks assembling "
        "business canvases, SWOTs, and roadmaps before their first investor "
        "conversation. That preparation gap is now a funding gap: investors "
        "expect structured, defensible plans in days, not weeks. Existing "
        "tools are generic templates or expensive consultants; nothing "
        "bridges the two. SprintDeck automates the entire translation from "
        "raw idea to investor-ready blueprint in under a minute."
    ),
    "business_objectives": [
        "Acquire 1,000 paying subscribers within six months of launch.",
        "Reach $500k ARR by end of year one at 12% freemium-to-paid conversion.",
        "Achieve 95% Month-3 net revenue retention on the Pro tier.",
        "Sign three accelerator partnerships by month nine.",
        "Deliver 60-second average generation time for 95% of blueprints.",
    ],
    "viability_score": {
        "overall": 87,
        "market_potential": 90,
        "product_market_fit": 88,
        "execution_feasibility": 84,
        "monetization_strength": 86,
        "defensibility": 82,
        "verdict": "Strong founder-market fit with a clear paid wedge.",
        "rationale": (
            "SprintDeck plays in an expanding first-time-founder TAM with a "
            "sub-60-second wow-moment that translates directly to conversion. "
            "The main risks are undifferentiated output vs. general-purpose "
            "LLMs and thin defensibility at scale — both addressable via a "
            "proprietary prompt architecture and accelerator lock-in."
        ),
    },
    "market_analysis": {
        "tam": "$18B global market for founder productivity and startup tooling by 2028.",
        "sam": "$4.6B serviceable market covering AI-native founder productivity and market-research tooling.",
        "som": "$120M reachable in three years across early-stage founders and accelerator programs in NA / EU / IN.",
        "growth_rate": "CAGR ~22% (2024–2029)",
        "trends": [
            "Explosion of solo and non-technical founders post-2023 AI boom.",
            "Investors compressing due-diligence timelines to under two weeks.",
            "Accelerators actively procuring tools to accelerate cohort prep.",
            "Shift from static templates to AI-generated strategic artifacts.",
        ],
        "growth_drivers": [
            "Lower cost of starting an AI-native business.",
            "Rising founder education level via YouTube and Twitter.",
            "Cross-border acceleration programs increasing accessible cohorts.",
            "Enterprise adoption of AI copilots normalising the category.",
        ],
    },
    "competitive_analysis": {
        "direct_competitors": [
            {"name": "Notion AI", "strength": "Massive distribution and general-purpose flexibility.", "weakness": "Not opinionated on business strategy; requires user to know frameworks."},
            {"name": "Miro AI", "strength": "Strong canvas UX and enterprise contracts.", "weakness": "Blueprint quality depends heavily on user inputs; no viability scoring."},
            {"name": "Perplexity", "strength": "Excellent research and citations.", "weakness": "Conversation-only; no structured strategic artifact output."},
            {"name": "General ChatGPT", "strength": "Ubiquitous, free tier, huge context window.", "weakness": "No specialised business-analyst workflow; inconsistent output structure."},
        ],
        "indirect_competitors": ["Strategy consultants", "Fractional CFOs", "Static Notion templates"],
        "differentiators": [
            "14 specialised analyst agents vs. one general-purpose prompt.",
            "Proprietary viability score benchmarked across 5 dimensions.",
            "Live Copilot chat grounded in the founder's actual blueprint.",
            "Investor-grade PDF export ready to attach to a warm intro.",
        ],
        "moats": [
            "Data flywheel: every generation refines the prompt architecture.",
            "Accelerator co-marketing lock-in via cohort licensing.",
            "Founder-community brand built on quality, not marketing spend.",
        ],
    },
    "ai_recommendations": [
        {"action": "Ship the Pro tier with saved blueprint history and PDF export.", "priority": "P0", "timeline": "Weeks 1-2", "rationale": "Unlocks monetization and creates the primary conversion moment."},
        {"action": "Launch a Product Hunt debut with three anchor testimonials.", "priority": "P0", "timeline": "Week 3", "rationale": "Cheapest concentrated top-of-funnel for founder ICP."},
        {"action": "Sign one accelerator partnership for cohort licensing.", "priority": "P1", "timeline": "Month 2-3", "rationale": "Bulk distribution and instant credibility with the ICP."},
        {"action": "Add section-level refine and Notion export.", "priority": "P1", "timeline": "Month 2", "rationale": "Reduces churn by making the blueprint an editable working document."},
        {"action": "Instrument a viability-score benchmark across cohorts.", "priority": "P2", "timeline": "Month 3", "rationale": "Creates a defensible data moat plus a shareable stat for PR."},
    ],
    "business_model_canvas": {
        "key_partners": ["IBM watsonx.ai for LLM inference", "Startup accelerators for distribution", "Stripe for billing", "Notion for workflow integration", "Angel networks for beta credibility"],
        "key_activities": ["Prompt architecture R&D", "Product & AI pipeline engineering", "Founder-community marketing", "Customer success onboarding", "Accelerator BD partnerships"],
        "key_resources": ["Proprietary agent architecture", "Founder community brand", "Cloud + LLM infrastructure", "Small elite engineering team", "First 100 case studies"],
        "value_propositions": ["Full blueprint in 60 seconds", "$10k consulting quality at $49/mo", "Live Copilot with your blueprint context", "Investor-grade PDF one click away", "Single tool replaces 5 apps"],
        "customer_relationships": ["Self-serve onboarding with guided first blueprint", "In-app Copilot support", "Founder community Slack", "Content-led education (newsletter, YT)", "Accelerator success owners"],
        "channels": ["Product Hunt launch", "IndieHackers + HN posts", "Accelerator bundles", "SEO on 'business model canvas' + 'startup blueprint'", "Founder-thought-leadership on LinkedIn"],
        "customer_segments": ["Pre-seed and seed founders", "Solo non-technical founders", "Accelerator cohort participants", "SME consultants and fractional operators", "VC scouts screening deals"],
        "cost_structure": ["Watsonx / LLM API usage", "Engineering salaries", "Cloud hosting", "Sales & partnerships", "Customer support tools"],
        "revenue_streams": ["Starter $19/mo · Pro $49/mo · Team $149/mo", "Annual plans with discount", "Accelerator cohort licensing (flat fee)", "API access for platforms", "Add-ons: investor deck, financial models"],
    },
    "swot_analysis": {
        "strengths": ["Sub-60-second blueprint wow moment", "All-in-one output eliminates multi-tool friction", "Founder-authentic brand voice", "Low marginal cost per generation", "Clear paid wedge from day one"],
        "weaknesses": ["Thin defensibility vs. general-purpose LLMs early on", "Small founding team constrains parallel bets", "Cold-start data moat until 1,000 blueprints in", "Freemium risk of low conversion", "Dependence on LLM API cost trajectory"],
        "opportunities": ["Massive expanding first-time-founder TAM", "Accelerator programs actively procuring tools", "Adjacent expansion into investor-side dealflow", "Non-English founder market largely untapped", "Enterprise innovation-lab licensing"],
        "threats": ["ChatGPT / Claude adding ad-hoc canvas features", "LLM API pricing spikes compressing margins", "Big-tool incumbents (Notion, Miro) shipping AI parity", "Founder churn after single-use generation", "Regulatory uncertainty around AI-generated advice"],
    },
    "risk_analysis": [
        {"risk": "LLM cost spike", "category": "Financial", "impact": "High", "likelihood": "Medium", "mitigation": "Negotiate volume pricing and cache repeated section patterns."},
        {"risk": "Low freemium conversion", "category": "Market", "impact": "High", "likelihood": "Medium", "mitigation": "Gate PDF export and saved history behind paid; add contextual upgrade prompts."},
        {"risk": "Big-tech feature parity", "category": "Market", "impact": "High", "likelihood": "Medium", "mitigation": "Accelerate accelerator lock-in and community moat before incumbents ship."},
        {"risk": "Blueprint quality inconsistency", "category": "Technical", "impact": "Medium", "likelihood": "High", "mitigation": "Regression suite over prompts + human-in-loop quality scoring."},
        {"risk": "Single-use churn", "category": "Market", "impact": "High", "likelihood": "High", "mitigation": "Ship versioning, section-level refine, and living-roadmap features."},
        {"risk": "Data privacy concerns", "category": "Regulatory", "impact": "Medium", "likelihood": "Medium", "mitigation": "Explicit opt-out of training, clear privacy policy, self-host option for enterprise."},
        {"risk": "Key talent attrition", "category": "Team", "impact": "High", "likelihood": "Low", "mitigation": "Competitive equity vesting and comprehensive internal knowledge base."},
    ],
    "functional_requirements": [
        "The system shall accept a startup idea input up to 4,000 characters and produce a full blueprint within 120 seconds for 95% of requests.",
        "The system shall generate all 14 sections with structured JSON matching the published schema.",
        "The system shall export the full blueprint to PDF and structured JSON on demand.",
        "The system shall allow authenticated users to save up to ten blueprints and revisit them.",
        "The system shall support section-level regeneration via a plain-language refinement prompt.",
        "The system shall provide a Copilot chat grounded in the current blueprint with multi-turn history.",
        "The system shall enforce Free, Pro, and Team plan capabilities at the feature level.",
        "The system shall log per-request telemetry for latency, model, and section success rate.",
    ],
    "user_stories": [
        {"persona": "First-time Founder", "story": "As a first-time founder, I want to paste my raw idea and get an investor-ready blueprint instantly so that my first angel meeting sounds structured and confident.", "acceptance_criteria": ["Full blueprint generated in under 120s.", "All sections contain idea-specific content.", "PDF export available immediately."]},
        {"persona": "Serial Entrepreneur", "story": "As a serial entrepreneur, I want to save and organise multiple blueprints so that I can iterate across ventures without losing history.", "acceptance_criteria": ["Save up to 10 blueprints on Pro.", "Each blueprint independently editable.", "Dashboard lists all saved with metadata."]},
        {"persona": "Accelerator Manager", "story": "As an accelerator program manager, I want cohort access under one billing account so that founders start Day 1 with a structured blueprint.", "acceptance_criteria": ["Bulk invite up to 50 seats.", "Per-seat usage analytics.", "Single invoice."]},
        {"persona": "Non-technical Founder", "story": "As a non-technical founder, I want to refine individual sections with plain language so I can iterate without understanding the AI.", "acceptance_criteria": ["'Refine' input on each section.", "Section-only re-render.", "Undo to previous version."]},
        {"persona": "Free-tier Evaluator", "story": "As a free-tier user, I want to preview all sections so I can decide before paying.", "acceptance_criteria": ["One free full blueprint.", "PDF export locked behind upgrade prompt.", "Upgrade CTA after 60s review."]},
    ],
    "product_backlog": [
        {"id": "VDR-1", "title": "Multi-agent blueprint generation engine", "priority": "P0", "effort": "XL", "description": "The Watsonx-powered pipeline producing all 14 sections with retry + JSON repair."},
        {"id": "VDR-2", "title": "Founder onboarding & idea input flow", "priority": "P0", "effort": "M", "description": "Guided idea submission with validation, industry chip picker, and examples."},
        {"id": "VDR-3", "title": "Blueprint dashboard viewer", "priority": "P0", "effort": "L", "description": "Structured Results page with all sections, viability hero, and Copilot launcher."},
        {"id": "VDR-4", "title": "Auth + Stripe plan enforcement", "priority": "P0", "effort": "M", "description": "Google OAuth sign-up plus Free / Pro / Team plan gating."},
        {"id": "VDR-5", "title": "Server-side PDF export", "priority": "P1", "effort": "M", "description": "Investor-grade PDF report downloadable from any saved blueprint."},
        {"id": "VDR-6", "title": "Section-level Copilot refine", "priority": "P1", "effort": "M", "description": "Regenerate one section from a plain-language prompt without touching others."},
        {"id": "VDR-7", "title": "Save + version history + dashboard", "priority": "P1", "effort": "L", "description": "Save up to 10 blueprints with named versions and undo."},
        {"id": "VDR-8", "title": "Copilot chat with blueprint context", "priority": "P1", "effort": "M", "description": "Multi-turn chat grounded in the current blueprint and persistent history."},
        {"id": "VDR-9", "title": "Notion export integration", "priority": "P2", "effort": "L", "description": "OAuth push of the full blueprint into a pre-formatted Notion page."},
        {"id": "VDR-10", "title": "Team plan admin dashboard", "priority": "P2", "effort": "L", "description": "Cohort invites, seat management, and per-member analytics for accelerators."},
    ],
    "development_roadmap": [
        {"phase": "Phase 1 · Foundation", "timeline": "Weeks 1-4", "milestones": ["Multi-agent pipeline live in staging", "Auth + Stripe integration", "PDF export shipped", "10 hand-picked founder beta users"]},
        {"phase": "Phase 2 · Launch & monetization", "timeline": "Weeks 5-9", "milestones": ["Public Product Hunt launch", "Pro tier live with saved history", "Section refine shipped", "500 signups target"]},
        {"phase": "Phase 3 · Retention & ecosystem", "timeline": "Weeks 10-16", "milestones": ["Notion export", "First accelerator cohort deal", "Copilot chat GA", "A/B tested upgrade flows"]},
        {"phase": "Phase 4 · Scale", "timeline": "Weeks 17-26", "milestones": ["Public API", "Second accelerator partnership", "SEO engine producing weekly content", "$500k ARR milestone"]},
    ],
}
