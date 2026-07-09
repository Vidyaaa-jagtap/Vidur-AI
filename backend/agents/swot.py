from .base import BaseAgent, as_str_list


class SwotAgent(BaseAgent):
    key = "swot_analysis"
    max_new_tokens = 900
    schema = (
        "Return JSON with EXACTLY these keys, each a list of 3–5 short bullets "
        "(<= 20 words each):\n"
        "{ \"strengths\": [...], \"weaknesses\": [...], "
        "\"opportunities\": [...], \"threats\": [...] }"
    )
    required = ["strengths", "weaknesses", "opportunities", "threats"]

    async def generate(self, context):
        data = await super().generate(context)
        return {k: as_str_list(data.get(k, [])) for k in self.required}
