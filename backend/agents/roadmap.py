from .base import BaseAgent, as_str_list


class RoadmapAgent(BaseAgent):
    key = "development_roadmap"
    max_new_tokens = 1200
    schema = (
        "Return JSON with a single key \"phases\" whose value is a list of at "
        "least FOUR phase objects:\n"
        "{ \"phases\": [ {\"phase\": \"Phase 1 - Discovery\", "
        "\"timeline\": \"Weeks 1-2\", \"milestones\": [\"...\", \"...\"]}, ... ] }"
    )
    required = ["phases"]

    async def generate(self, context):
        data = await super().generate(context)
        phases = data.get("phases", []) or []
        normalized = []
        for p in phases:
            if not isinstance(p, dict):
                continue
            normalized.append({
                "phase": str(p.get("phase", "")).strip(),
                "timeline": str(p.get("timeline", "")).strip(),
                "milestones": as_str_list(p.get("milestones", [])),
            })
        return normalized
