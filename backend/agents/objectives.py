from .base import BaseAgent, as_str_list


class ObjectivesAgent(BaseAgent):
    key = "business_objectives"
    max_new_tokens = 700
    schema = (
        "Return JSON: {\"business_objectives\": [\"...\", \"...\", ...]}\n"
        "4 to 6 concrete, measurable objectives. Each is one full sentence "
        "with a clear metric and horizon."
    )
    required = ["business_objectives"]

    async def generate(self, context):
        data = await super().generate(context)
        return as_str_list(data["business_objectives"])
