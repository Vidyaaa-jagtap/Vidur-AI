"""AI Service — Watsonx multi-agent orchestrator.

Runs all 13 section agents concurrently with a bounded semaphore so we don't
hammer the Watsonx endpoint. Aggregates their outputs into a single
blueprint dict matching the front-end schema.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any, Awaitable, Callable, Dict, List, Optional

from agents import ALL_AGENTS
from agents.base import AgentContext

logger = logging.getLogger(__name__)

# Max concurrent watsonx.ai calls — keep low to respect free-tier rate limits.
_MAX_CONCURRENCY = 4


ProgressCallback = Optional[Callable[[str, str], Awaitable[None]]]
# progress(section_key, status)  -- status in {"running", "done", "error"}


async def _run_one(agent_cls, ctx: AgentContext, sem: asyncio.Semaphore,
                   on_progress: ProgressCallback):
    agent = agent_cls()
    if on_progress:
        await on_progress(agent.key, "running")
    async with sem:
        try:
            value = await agent.generate(ctx)
            if on_progress:
                await on_progress(agent.key, "done")
            return agent.key, value, None
        except Exception as exc:  # noqa: BLE001
            logger.exception("Agent %s failed", agent.__class__.__name__)
            if on_progress:
                await on_progress(agent.key, "error")
            return agent.key, None, str(exc)


async def generate_blueprint(payload: Dict[str, Any],
                             on_progress: ProgressCallback = None) -> Dict[str, Any]:
    """Public entry-point. Returns the aggregated blueprint dict."""
    ctx = AgentContext(
        startup_name=payload["startup_name"],
        startup_idea=payload["startup_idea"],
        industry=payload["industry"],
        target_audience=payload["target_audience"],
    )
    sem = asyncio.Semaphore(_MAX_CONCURRENCY)
    tasks = [_run_one(a, ctx, sem, on_progress) for a in ALL_AGENTS]
    results = await asyncio.gather(*tasks)

    blueprint: Dict[str, Any] = {}
    errors: List[str] = []
    for key, value, err in results:
        if err is not None:
            errors.append(f"{key}: {err}")
            blueprint[key] = _fallback_for(key)
        else:
            blueprint[key] = value

    # If MORE than half the agents failed, treat this as a hard failure.
    if len(errors) > len(ALL_AGENTS) // 2:
        raise RuntimeError(
            "Watsonx blueprint generation failed for most sections: "
            + " | ".join(errors[:5])
        )
    if errors:
        logger.warning("Blueprint generated with partial errors: %s", errors)
    return blueprint


def _fallback_for(key: str) -> Any:
    """Empty-but-typed fallback so the UI never crashes on a partial failure."""
    if key in {"problem_statement"}:
        return "Section generation failed. Please regenerate to view this section."
    if key in {"business_objectives", "functional_requirements",
               "risk_analysis", "user_stories", "product_backlog",
               "development_roadmap", "ai_recommendations"}:
        return []
    if key == "business_model_canvas":
        return {k: [] for k in [
            "key_partners", "key_activities", "key_resources",
            "value_propositions", "customer_relationships", "channels",
            "customer_segments", "cost_structure", "revenue_streams",
        ]}
    if key == "swot_analysis":
        return {"strengths": [], "weaknesses": [], "opportunities": [], "threats": []}
    if key == "market_analysis":
        return {"tam": "", "sam": "", "som": "", "growth_rate": "",
                "trends": [], "growth_drivers": []}
    if key == "competitive_analysis":
        return {"direct_competitors": [], "indirect_competitors": [],
                "differentiators": [], "moats": []}
    if key == "viability_score":
        return {"overall": 0, "market_potential": 0, "product_market_fit": 0,
                "execution_feasibility": 0, "monetization_strength": 0,
                "defensibility": 0, "verdict": "", "rationale": ""}
    return {}
