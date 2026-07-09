from .base import BaseAgent, as_str_list


class CompetitiveAgent(BaseAgent):
    key = "competitive_analysis"
    max_new_tokens = 1100
    schema = (
        "Return JSON:\n"
        "{ \"direct_competitors\": [ {\"name\": \"...\", "
        "\"strength\": \"one sentence\", \"weakness\": \"one sentence\"}, ... ], "
        "\"indirect_competitors\": [\"...\", \"...\"], "
        "\"differentiators\": [\"3–5 short bullets on how the startup wins\"], "
        "\"moats\": [\"2–4 short bullets on long-term defensibility\"] }\n"
        "Provide at least 3 direct_competitors. Use plausible real companies "
        "when possible."
    )
    required = ["direct_competitors", "differentiators"]

    async def generate(self, context):
        data = await super().generate(context)
        competitors = []
        for c in data.get("direct_competitors", []) or []:
            if not isinstance(c, dict):
                continue
            competitors.append({
                "name": str(c.get("name", "")).strip(),
                "strength": str(c.get("strength", "")).strip(),
                "weakness": str(c.get("weakness", "")).strip(),
            })
        return {
            "direct_competitors": competitors,
            "indirect_competitors": as_str_list(data.get("indirect_competitors", [])),
            "differentiators": as_str_list(data.get("differentiators", [])),
            "moats": as_str_list(data.get("moats", [])),
        }
