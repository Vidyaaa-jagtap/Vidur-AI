from .base import BaseAgent


class ProblemAgent(BaseAgent):
    key = "problem_statement"
    max_new_tokens = 500
    schema = (
        "Return JSON: {\"problem_statement\": \"...\"}\n"
        "The value is a crisp 3–5 sentence paragraph describing the concrete "
        "pain point this startup solves, who feels it today, and why it "
        "matters now."
    )
    required = ["problem_statement"]

    async def generate(self, context):
        data = await super().generate(context)
        return data["problem_statement"]
