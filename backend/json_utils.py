"""JSON extraction and repair utilities for Watsonx text output.

Watsonx (Llama/Mistral) frequently wraps JSON in markdown fences, adds a
preface, drops trailing braces, or emits trailing commas. This module gives us
a single robust `parse_json` that is used by every agent.
"""
from __future__ import annotations

import json
import logging
import re
from typing import Any

logger = logging.getLogger(__name__)


_FENCE_RE = re.compile(r"```(?:json|JSON)?\s*", re.MULTILINE)
_TRAILING_FENCE_RE = re.compile(r"```\s*$", re.MULTILINE)


def _strip_fences(text: str) -> str:
    text = _FENCE_RE.sub("", text)
    text = _TRAILING_FENCE_RE.sub("", text)
    return text.strip()


def _extract_json_block(text: str) -> str:
    """Return the outermost {...} or [...] block found in text."""
    # Prefer object; fall back to array.
    for opener, closer in (("{", "}"), ("[", "]")):
        start = text.find(opener)
        if start == -1:
            continue
        depth = 0
        in_string = False
        escape = False
        for i in range(start, len(text)):
            ch = text[i]
            if escape:
                escape = False
                continue
            if ch == "\\":
                escape = True
                continue
            if ch == '"':
                in_string = not in_string
                continue
            if in_string:
                continue
            if ch == opener:
                depth += 1
            elif ch == closer:
                depth -= 1
                if depth == 0:
                    return text[start : i + 1]
        # Unbalanced — try to auto-close the remaining depth.
        if depth > 0:
            return text[start:] + (closer * depth)
    return text.strip()


def _repair(text: str) -> str:
    # Remove trailing commas before } or ]
    text = re.sub(r",(\s*[}\]])", r"\1", text)
    # Convert single-quoted keys/values to double-quoted (best effort — safe on ASCII)
    if "'" in text and '"' not in text:
        text = text.replace("'", '"')
    return text


def parse_json(raw: str) -> Any:
    """Robust JSON parser: strip fences → extract block → repair → json.loads.

    Raises ValueError if all attempts fail.
    """
    if raw is None:
        raise ValueError("Empty response from LLM.")
    text = _strip_fences(str(raw))
    candidate = _extract_json_block(text)
    for attempt in (candidate, _repair(candidate), _repair(text)):
        try:
            return json.loads(attempt)
        except json.JSONDecodeError:
            continue
    logger.error("JSON parsing failed. Head=%r", text[:400])
    raise ValueError("Could not parse JSON from Watsonx response.")
