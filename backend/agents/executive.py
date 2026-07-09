from .base import BaseAgent


class ExecutiveAgent(BaseAgent):
    key = "executive_summary"
    max_new_tokens = 700
    temperature = 0.3
    schema = (
        "Return JSON:\n"
        "{ \"headline\": \"one crisp sentence that would open an investor deck\", "
        "\"thesis\": \"2–3 sentence paragraph on WHY this business wins now\", "
        "\"key_metrics\": [ {\"label\": \"e.g. TAM\", \"value\": \"e.g. $18B\"}, "
        "{\"label\": \"e.g. Target CAGR\", \"value\": \"e.g. 22%\"}, ... at least 4 items ], "
        "\"call_to_action\": \"one-sentence next step for the founder\" }\n"
        "The tone is confident, plain-English, and free of buzzwords."
    )
    required = ["headline", "thesis", "call_to_action"]

    async def generate(self, context):
        data = await super().generate(context)
        metrics = []
        for m in data.get("key_metrics", []) or []:
            if isinstance(m, dict):
                metrics.append({
                    "label": str(m.get("label", "")).strip(),
                    "value": str(m.get("value", "")).strip(),
                })
        return {
            "headline": str(data.get("headline", "")).strip(),
            "thesis": str(data.get("thesis", "")).strip(),
            "key_metrics": metrics,
            "call_to_action": str(data.get("call_to_action", "")).strip(),
        }
