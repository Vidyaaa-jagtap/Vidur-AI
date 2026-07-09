from .base import BaseAgent


class RiskAgent(BaseAgent):
    key = "risk_analysis"
    max_new_tokens = 1100
    schema = (
        "Return JSON with a single key \"risks\" whose value is a list of at "
        "least FIVE risk objects:\n"
        "{ \"risks\": [ {\"risk\": \"short name\", \"category\": "
        "\"Market|Technical|Financial|Regulatory|Team|Execution\", "
        "\"impact\": \"High|Medium|Low\", \"likelihood\": \"High|Medium|Low\", "
        "\"mitigation\": \"one concrete sentence\"}, ... ] }"
    )
    required = ["risks"]

    async def generate(self, context):
        data = await super().generate(context)
        risks = data.get("risks", []) or []
        # Normalize each risk entry
        normalized = []
        for r in risks:
            if not isinstance(r, dict):
                continue
            normalized.append({
                "risk": str(r.get("risk", "")).strip(),
                "category": str(r.get("category", "Execution")).strip() or "Execution",
                "impact": str(r.get("impact", "Medium")).strip() or "Medium",
                "likelihood": str(r.get("likelihood", "Medium")).strip() or "Medium",
                "mitigation": str(r.get("mitigation", "")).strip(),
            })
        return normalized
