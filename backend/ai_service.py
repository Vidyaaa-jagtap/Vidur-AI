"""
AI Service Layer for Vidur AI.

This module is the single entry-point for all AI generation. It is intentionally
provider-agnostic so the underlying LLM can be swapped later (e.g., to IBM
watsonx.ai Granite) without touching the API or PDF layers.

Current backend: Emergent LLM Key -> Anthropic Claude Sonnet 4.6
Future migration: implement a new `_BlueprintProvider` subclass and change the
factory in `get_provider()`. Nothing else in the codebase should change.
"""
from __future__ import annotations

import json
import logging
import os
import re
import uuid
from abc import ABC, abstractmethod
from typing import Any, Dict

from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are Vidur AI, an elite startup strategist and business
architect. You transform raw startup ideas into structured, investor-ready
business blueprints.

You must ALWAYS respond with a single valid JSON object matching exactly the
schema requested by the user. Do not include markdown fences, commentary, or
prose outside the JSON. Every field must be filled with substantive, concrete,
non-generic content grounded in the founder's inputs."""


BLUEPRINT_SCHEMA_INSTRUCTIONS = """Generate a complete business blueprint as a
single JSON object with EXACTLY the following keys and structure:

{
  "problem_statement": "A crisp 3-5 sentence paragraph describing the concrete pain point this startup solves, who feels it, and why it matters now.",
  "business_objectives": ["4 to 6 concrete, measurable objectives, each a full sentence"],
  "business_model_canvas": {
    "key_partners": ["3-5 short bullets"],
    "key_activities": ["3-5 short bullets"],
    "key_resources": ["3-5 short bullets"],
    "value_propositions": ["3-5 short bullets"],
    "customer_relationships": ["3-5 short bullets"],
    "channels": ["3-5 short bullets"],
    "customer_segments": ["3-5 short bullets"],
    "cost_structure": ["3-5 short bullets"],
    "revenue_streams": ["3-5 short bullets"]
  },
  "swot_analysis": {
    "strengths": ["3-5 bullets"],
    "weaknesses": ["3-5 bullets"],
    "opportunities": ["3-5 bullets"],
    "threats": ["3-5 bullets"]
  },
  "risk_analysis": [
    {"risk": "short name", "impact": "High|Medium|Low", "likelihood": "High|Medium|Low", "mitigation": "one concrete sentence"}
  ],
  "functional_requirements": ["6 to 10 concise, testable requirement statements"],
  "user_stories": [
    {"persona": "e.g. New user, Admin", "story": "As a <persona>, I want <goal> so that <benefit>.", "acceptance_criteria": ["2-3 bullets"]}
  ],
  "product_backlog": [
    {"id": "VDR-1", "title": "short title", "priority": "P0|P1|P2", "effort": "S|M|L|XL", "description": "one sentence"}
  ],
  "development_roadmap": [
    {"phase": "Phase 1 - Discovery", "timeline": "Weeks 1-2", "milestones": ["2-4 bullets"]}
  ]
}

Rules:
- Provide at least 5 items in risk_analysis, 5 in user_stories, 8 in product_backlog, and 4 phases in development_roadmap.
- Keep each bullet under 20 words. Be specific to the founder's inputs.
- Return ONLY the JSON object. No preamble, no fences, no trailing text.
"""


# ---------------------------------------------------------------------------
# Provider abstraction (IBM Granite-friendly)
# ---------------------------------------------------------------------------


class _BlueprintProvider(ABC):
    """Abstract base for any provider that can produce a startup blueprint.

    To migrate to IBM watsonx.ai Granite later, implement a
    `GraniteBlueprintProvider(_BlueprintProvider)` and switch `get_provider()`.
    """

    @abstractmethod
    async def generate_blueprint(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        ...


class EmergentClaudeProvider(_BlueprintProvider):
    """Uses the Emergent Universal Key with Anthropic Claude Sonnet 4.6."""

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-6"):
        self.api_key = api_key
        self.model = model

    async def generate_blueprint(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        user_prompt = self._build_user_prompt(payload)

        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"vidur-{uuid.uuid4()}",
            system_message=SYSTEM_PROMPT,
        ).with_model("anthropic", self.model)

        response = await chat.send_message(UserMessage(text=user_prompt))
        return self._parse_json(response)

    @staticmethod
    def _build_user_prompt(payload: Dict[str, Any]) -> str:
        return (
            f"Startup Name: {payload['startup_name']}\n"
            f"Industry: {payload['industry']}\n"
            f"Target Audience: {payload['target_audience']}\n"
            f"Startup Idea: {payload['startup_idea']}\n\n"
            f"{BLUEPRINT_SCHEMA_INSTRUCTIONS}"
        )

    @staticmethod
    def _parse_json(raw: str) -> Dict[str, Any]:
        text = raw.strip()
        # Strip markdown fences if the model added them despite instructions.
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?", "", text).strip()
            text = re.sub(r"```$", "", text).strip()
        # Grab the outermost JSON object.
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            logger.error("AI response did not contain JSON: %s", raw[:500])
            raise ValueError("AI response did not contain valid JSON.")
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError as exc:
            logger.error("AI JSON parse error: %s -- raw: %s", exc, raw[:500])
            raise ValueError("AI response was not valid JSON.") from exc


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------


def get_provider() -> _BlueprintProvider:
    """Return the currently-configured blueprint provider.

    Swap this factory to change providers (e.g., IBM Granite) without touching
    the API layer.
    """
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY is not configured.")
    return EmergentClaudeProvider(api_key=api_key)


async def generate_blueprint(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Public entry-point used by the API layer."""
    provider = get_provider()
    return await provider.generate_blueprint(payload)
