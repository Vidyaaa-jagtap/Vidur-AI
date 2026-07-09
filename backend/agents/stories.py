from .base import BaseAgent, as_str_list


class StoriesAgent(BaseAgent):
    key = "user_stories"
    max_new_tokens = 1300
    schema = (
        "Return JSON with a single key \"stories\" whose value is a list of at "
        "least FIVE user story objects:\n"
        "{ \"stories\": [ {\"persona\": \"...\", "
        "\"story\": \"As a <persona>, I want <goal> so that <benefit>.\", "
        "\"acceptance_criteria\": [\"...\", \"...\"]}, ... ] }"
    )
    required = ["stories"]

    async def generate(self, context):
        data = await super().generate(context)
        stories = data.get("stories", []) or []
        normalized = []
        for s in stories:
            if not isinstance(s, dict):
                continue
            normalized.append({
                "persona": str(s.get("persona", "")).strip() or "User",
                "story": str(s.get("story", "")).strip(),
                "acceptance_criteria": as_str_list(s.get("acceptance_criteria", [])),
            })
        return normalized
