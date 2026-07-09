from .base import BaseAgent


class RecommendationsAgent(BaseAgent):
    key = "ai_recommendations"
    max_new_tokens = 1000
    schema = (
        "You are Vidur AI's recommendation engine. Return JSON:\n"
        "{ \"recommendations\": [ {\"action\": \"specific next action\", "
        "\"priority\": \"P0|P1|P2\", \"timeline\": \"e.g. 'Weeks 1-2'\", "
        "\"rationale\": \"one sentence explaining WHY this now\"}, ... ] }\n"
        "Provide at least FIVE recommendations, ordered by priority."
    )
    required = ["recommendations"]

    async def generate(self, context):
        data = await super().generate(context)
        recs = []
        for r in data.get("recommendations", []) or []:
            if not isinstance(r, dict):
                continue
            recs.append({
                "action": str(r.get("action", "")).strip(),
                "priority": str(r.get("priority", "P1")).strip() or "P1",
                "timeline": str(r.get("timeline", "")).strip(),
                "rationale": str(r.get("rationale", "")).strip(),
            })
        # Sort by priority stability (P0 < P1 < P2)
        order = {"P0": 0, "P1": 1, "P2": 2}
        recs.sort(key=lambda x: order.get(x["priority"], 3))
        return recs
