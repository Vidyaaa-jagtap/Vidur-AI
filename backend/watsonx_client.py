"""
Central IBM watsonx.ai client for Vidur AI.

- Uses the official ibm-watsonx-ai Python SDK.
- Region: eu-gb (London), overridable via WATSONX_URL.
- Wraps the SYNCHRONOUS SDK call in asyncio.run_in_executor so FastAPI's event
  loop stays free.
- Adds tenacity-based retries with exponential backoff for rate limits and
  transient network errors.
"""
from __future__ import annotations

import asyncio
import logging
import os
from typing import Optional

from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

logger = logging.getLogger(__name__)


class WatsonxError(RuntimeError):
    """Raised when watsonx.ai fails after all retries."""


def _require_env(name: str) -> str:
    val = os.environ.get(name, "").strip()
    if not val:
        raise RuntimeError(
            f"{name} is not configured. Set it in backend/.env before starting the server."
        )
    return val


def _build_credentials() -> Credentials:
    return Credentials(
        url=_require_env("WATSONX_URL"),
        api_key=_require_env("WATSONX_API_KEY"),
    )


def _default_model_id() -> str:
    return os.environ.get("WATSONX_MODEL_ID", "meta-llama/llama-3-3-70b-instruct").strip()


def format_llama_prompt(system_prompt: str, user_prompt: str) -> str:
    """Format a single-turn prompt for Llama-3/4 instruct-tuned models."""
    return (
        "<|begin_of_text|>"
        "<|start_header_id|>system<|end_header_id|>\n\n"
        f"{system_prompt}<|eot_id|>"
        "<|start_header_id|>user<|end_header_id|>\n\n"
        f"{user_prompt}<|eot_id|>"
        "<|start_header_id|>assistant<|end_header_id|>\n\n"
    )


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=12),
    retry=retry_if_exception_type(Exception),
    reraise=True,
)
def _sync_generate(prompt: str, model_id: str, max_new_tokens: int, temperature: float) -> str:
    """Blocking call to watsonx.ai. Wrapped in run_in_executor by the async layer."""
    params = {
        "max_new_tokens": max_new_tokens,
        "temperature": temperature,
        "decoding_method": "sample" if temperature > 0 else "greedy",
        "stop_sequences": ["<|eot_id|>", "<|end_of_text|>"],
        "repetition_penalty": 1.05,
    }
    model = ModelInference(
        model_id=model_id,
        credentials=_build_credentials(),
        project_id=_require_env("WATSONX_PROJECT_ID"),
        params=params,
    )
    return model.generate_text(prompt=prompt)


async def watsonx_generate(
    *,
    system_prompt: str,
    user_prompt: str,
    max_new_tokens: int = 1200,
    temperature: float = 0.2,
    model_id: Optional[str] = None,
) -> str:
    """Async wrapper. Runs the sync SDK inside the default thread pool."""
    model_id = model_id or _default_model_id()
    prompt = format_llama_prompt(system_prompt, user_prompt)
    loop = asyncio.get_running_loop()
    try:
        return await loop.run_in_executor(
            None,
            _sync_generate,
            prompt,
            model_id,
            max_new_tokens,
            temperature,
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("watsonx generation failed")
        raise WatsonxError(str(exc)) from exc
