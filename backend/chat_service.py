"""Vidur AI — Copilot chat service.

Conversational AI Business Analyst grounded in the generated blueprint.
Every response uses IBM watsonx.ai (Llama-3.3-70B) with the blueprint injected
into the system prompt as read-only context.
"""
from __future__ import annotations

import json
import logging
from typing import Any, Dict, List

from watsonx_client import format_llama_prompt, watsonx_generate

logger = logging.getLogger(__name__)


SYSTEM_TEMPLATE = """You are Vidur AI Copilot — a senior business analyst and
startup advisor. You are in a live conversation with a founder about their
startup: "{startup_name}" ({industry}).

You have access to the founder's full generated business blueprint (below).
When answering:
- Be direct and specific. Cite numbers, competitors, or sections from the
  blueprint when relevant.
- Never invent facts not implied by the blueprint. If you don't know, say so.
- Keep answers under 300 words unless a table or list adds clarity.
- Use plain-English markdown. No JSON. No code fences.
- Speak like a confident consultant, not a chatbot.

STARTUP CONTEXT
Idea: {startup_idea}
Target audience: {target_audience}

FULL BLUEPRINT (JSON):
{blueprint_json}
""".strip()


def _build_prompt(blueprint_record: Dict[str, Any],
                  history: List[Dict[str, str]],
                  user_message: str) -> str:
    """Compose a Llama-formatted multi-turn prompt with blueprint context."""
    system = SYSTEM_TEMPLATE.format(
        startup_name=blueprint_record.get("startup_name", ""),
        industry=blueprint_record.get("industry", ""),
        startup_idea=blueprint_record.get("startup_idea", ""),
        target_audience=blueprint_record.get("target_audience", ""),
        blueprint_json=json.dumps(blueprint_record.get("blueprint", {}),
                                  ensure_ascii=False)[:12000],  # safety cap
    )

    prompt = (
        "<|begin_of_text|>"
        "<|start_header_id|>system<|end_header_id|>\n\n"
        f"{system}<|eot_id|>"
    )
    for msg in history[-12:]:  # last 12 turns
        role = msg.get("role", "user")
        content = msg.get("content", "")
        prompt += (
            f"<|start_header_id|>{role}<|end_header_id|>\n\n{content}<|eot_id|>"
        )
    prompt += (
        f"<|start_header_id|>user<|end_header_id|>\n\n{user_message}<|eot_id|>"
        "<|start_header_id|>assistant<|end_header_id|>\n\n"
    )
    return prompt


async def chat(blueprint_record: Dict[str, Any],
               history: List[Dict[str, str]],
               user_message: str) -> str:
    """Return the Copilot reply to the user's message."""
    # We reuse watsonx_generate's system_prompt+user_prompt formatter by
    # sending the whole assembled multi-turn prompt as the user_prompt.
    # To avoid double-formatting, we call the sync generator directly.
    from watsonx_client import _sync_generate, _default_model_id  # local import
    import asyncio

    prompt = _build_prompt(blueprint_record, history, user_message)
    loop = asyncio.get_running_loop()
    try:
        reply = await loop.run_in_executor(
            None, _sync_generate, prompt, _default_model_id(), 900, 0.4,
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("Copilot chat failed")
        raise
    return reply.strip()


SUGGESTED_PROMPTS = [
    "Is this startup idea viable?",
    "How can I improve my business model?",
    "What should my MVP include?",
    "Who are my most dangerous competitors?",
    "Draft a 90-day go-to-market plan.",
    "How much funding should I raise, and at what stage?",
    "What are the biggest risks and how do I mitigate them?",
    "Suggest a pricing and monetization strategy.",
    "What are three growth experiments to run in month one?",
]
