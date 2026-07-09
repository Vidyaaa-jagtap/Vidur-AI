from .base import BaseAgent


class BacklogAgent(BaseAgent):
    key = "product_backlog"
    max_new_tokens = 1300
    schema = (
        "Return JSON with a single key \"items\" whose value is a list of at "
        "least EIGHT backlog objects:\n"
        "{ \"items\": [ {\"id\": \"VDR-1\", \"title\": \"...\", "
        "\"priority\": \"P0|P1|P2\", \"effort\": \"S|M|L|XL\", "
        "\"description\": \"one sentence\"}, ... ] }\n"
        "IDs are sequential starting at VDR-1."
    )
    required = ["items"]

    async def generate(self, context):
        data = await super().generate(context)
        items = data.get("items", []) or []
        normalized = []
        for i, b in enumerate(items, start=1):
            if not isinstance(b, dict):
                continue
            normalized.append({
                "id": str(b.get("id") or f"VDR-{i}").strip(),
                "title": str(b.get("title", "")).strip(),
                "priority": str(b.get("priority", "P1")).strip() or "P1",
                "effort": str(b.get("effort", "M")).strip() or "M",
                "description": str(b.get("description", "")).strip(),
            })
        return normalized
