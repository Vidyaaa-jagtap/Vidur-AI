"""BaseAgent: shared prompt scaffolding, retry, JSON validation.

Every section agent inherits from BaseAgent and only overrides:
- key       : output key in the final blueprint dict
- schema    : short description of the JSON shape expected
- required  : list of top-level keys that MUST be present
- rules     : extra content rules (bulleted string)

The base class handles Watsonx invocation, JSON parsing, and up to two
re-prompts on validation failure.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Iterable, List

from json_utils import parse_json
from watsonx_client import watsonx_generate

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class AgentContext:
    """Founder inputs shared with every agent."""
    startup_name: str
    startup_idea: str
    industry: str
    target_audience: str

    def as_prompt(self) -> str:
        return (
            f"Startup Name: {self.startup_name}\n"
            f"Industry: {self.industry}\n"
            f"Target Audience: {self.target_audience}\n"
            f"Startup Idea: {self.startup_idea}\n"
        )


BASE_SYSTEM = (
    "You are Vidur AI, an elite startup strategist and business analyst. "
    "You produce investor-ready analysis grounded in the founder's inputs.\n"
    "OUTPUT RULES (STRICT):\n"
    "1. Respond with a SINGLE valid JSON object matching the schema.\n"
    "2. NO markdown fences, NO commentary, NO prose outside the JSON.\n"
    "3. All strings must use double quotes. No trailing commas.\n"
    "4. Every field must be substantive and specific to the founder's inputs — "
    "never generic placeholders."
)


class BaseAgent:
    key: str = ""
    schema: str = ""
    required: List[str] = []
    rules: str = ""
    max_new_tokens: int = 1200
    temperature: float = 0.2

    async def generate(self, context: AgentContext) -> Any:
        """Run the agent with up to 2 self-repair retries."""
        last_error: str = ""
        for attempt in range(3):
            user_prompt = self._build_user_prompt(context, last_error)
            raw = await watsonx_generate(
                system_prompt=BASE_SYSTEM,
                user_prompt=user_prompt,
                max_new_tokens=self.max_new_tokens,
                temperature=self.temperature,
            )
            try:
                data = parse_json(raw)
                self._validate(data)
                return data
            except ValueError as exc:
                last_error = str(exc)
                logger.warning(
                    "Agent %s attempt %d failed: %s", self.__class__.__name__, attempt + 1, exc
                )
        raise ValueError(f"Agent {self.__class__.__name__} failed after 3 attempts: {last_error}")

    # -- overridable helpers --

    def _build_user_prompt(self, context: AgentContext, previous_error: str) -> str:
        parts = [context.as_prompt(), "", "TASK:", self.schema.strip()]
        if self.rules:
            parts += ["", "RULES:", self.rules.strip()]
        if previous_error:
            parts += [
                "",
                "IMPORTANT: Your previous response failed validation with error:",
                f"  {previous_error}",
                "Return valid JSON only. No prose. No fences.",
            ]
        return "\n".join(parts)

    def _validate(self, data: Any) -> None:
        if not isinstance(data, (dict, list)):
            raise ValueError(f"Expected object or array, got {type(data).__name__}.")
        if isinstance(data, dict):
            missing = [k for k in self.required if k not in data]
            if missing:
                raise ValueError(f"Missing required keys: {missing}")


def as_str_list(value: Any) -> List[str]:
    """Coerce a value into a clean list of strings (defensive parser)."""
    if value is None:
        return []
    if isinstance(value, str):
        return [value.strip()]
    if isinstance(value, Iterable):
        return [str(x).strip() for x in value if str(x).strip()]
    return [str(value)]
