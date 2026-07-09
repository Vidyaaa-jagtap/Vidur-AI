from .base import BaseAgent, as_str_list


CANVAS_KEYS = [
    "key_partners", "key_activities", "key_resources", "value_propositions",
    "customer_relationships", "channels", "customer_segments",
    "cost_structure", "revenue_streams",
]


class CanvasAgent(BaseAgent):
    key = "business_model_canvas"
    max_new_tokens = 1400
    schema = (
        "Return JSON with EXACTLY these nine keys, each a list of 3–5 short "
        "bullet strings (<= 20 words each):\n"
        "{ \"key_partners\": [...], \"key_activities\": [...], "
        "\"key_resources\": [...], \"value_propositions\": [...], "
        "\"customer_relationships\": [...], \"channels\": [...], "
        "\"customer_segments\": [...], \"cost_structure\": [...], "
        "\"revenue_streams\": [...] }"
    )
    required = CANVAS_KEYS

    async def generate(self, context):
        data = await super().generate(context)
        return {k: as_str_list(data.get(k, [])) for k in CANVAS_KEYS}
