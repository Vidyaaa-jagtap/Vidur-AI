from .base import BaseAgent


VIABILITY_KEYS = [
    "market_potential",
    "product_market_fit",
    "execution_feasibility",
    "monetization_strength",
    "defensibility",
]


class ViabilityAgent(BaseAgent):
    key = "viability_score"
    max_new_tokens = 900
    schema = (
        "You are grading this startup as an investor analyst. Return JSON:\n"
        "{ \"overall\": 0-100 integer, "
        "\"market_potential\": 0-100, "
        "\"product_market_fit\": 0-100, "
        "\"execution_feasibility\": 0-100, "
        "\"monetization_strength\": 0-100, "
        "\"defensibility\": 0-100, "
        "\"verdict\": \"one-line summary\", "
        "\"rationale\": \"3–4 sentence explanation covering the strongest and "
        "weakest dimensions\" }\n"
        "\"overall\" must equal the rounded average of the five sub-scores."
    )
    required = ["overall", "verdict", "rationale"] + VIABILITY_KEYS

    async def generate(self, context):
        data = await super().generate(context)

        def _int(v, default=50):
            try:
                return max(0, min(100, int(round(float(v)))))
            except (TypeError, ValueError):
                return default

        subs = {k: _int(data.get(k)) for k in VIABILITY_KEYS}
        avg = round(sum(subs.values()) / len(subs))
        return {
            "overall": _int(data.get("overall"), avg),
            **subs,
            "verdict": str(data.get("verdict", "")).strip(),
            "rationale": str(data.get("rationale", "")).strip(),
        }
