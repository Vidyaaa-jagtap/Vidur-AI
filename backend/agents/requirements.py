from .base import BaseAgent, as_str_list


class RequirementsAgent(BaseAgent):
    key = "functional_requirements"
    max_new_tokens = 900
    schema = (
        "Return JSON: {\"functional_requirements\": [\"...\", \"...\", ...]}\n"
        "6 to 10 concise, testable requirement statements. Each begins with "
        "\"The system shall ...\" and states a measurable behaviour."
    )
    required = ["functional_requirements"]

    async def generate(self, context):
        data = await super().generate(context)
        return as_str_list(data["functional_requirements"])
