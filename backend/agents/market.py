from .base import BaseAgent, as_str_list


class MarketAgent(BaseAgent):
    key = "market_analysis"
    max_new_tokens = 1000
    schema = (
        "Return JSON:\n"
        "{ \"tam\": \"Total Addressable Market — one sentence with a number "
        "range, e.g. '$120B global by 2028'\", "
        "\"sam\": \"Serviceable Available Market — one sentence with number\", "
        "\"som\": \"Serviceable Obtainable Market for a 3-year horizon — one "
        "sentence with number\", "
        "\"growth_rate\": \"e.g. 'CAGR ~18% (2024-2029)'\", "
        "\"trends\": [\"3–5 short market trend bullets\"], "
        "\"growth_drivers\": [\"3–5 short driver bullets\"] }\n"
        "Ground the numbers plausibly in the founder's industry."
    )
    required = ["tam", "sam", "som", "trends", "growth_drivers"]

    async def generate(self, context):
        data = await super().generate(context)
        return {
            "tam": str(data.get("tam", "")).strip(),
            "sam": str(data.get("sam", "")).strip(),
            "som": str(data.get("som", "")).strip(),
            "growth_rate": str(data.get("growth_rate", "")).strip(),
            "trends": as_str_list(data.get("trends", [])),
            "growth_drivers": as_str_list(data.get("growth_drivers", [])),
        }
