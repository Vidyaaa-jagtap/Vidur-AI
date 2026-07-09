"""Vidur AI Watsonx agents package.

Each agent generates ONE section of the blueprint using its own focused prompt.
"""
from .base import BaseAgent, AgentContext  # noqa: F401
from .executive import ExecutiveAgent  # noqa: F401
from .problem import ProblemAgent  # noqa: F401
from .objectives import ObjectivesAgent  # noqa: F401
from .canvas import CanvasAgent  # noqa: F401
from .swot import SwotAgent  # noqa: F401
from .risk import RiskAgent  # noqa: F401
from .requirements import RequirementsAgent  # noqa: F401
from .stories import StoriesAgent  # noqa: F401
from .backlog import BacklogAgent  # noqa: F401
from .roadmap import RoadmapAgent  # noqa: F401
from .viability import ViabilityAgent  # noqa: F401
from .market import MarketAgent  # noqa: F401
from .competitive import CompetitiveAgent  # noqa: F401
from .recommendations import RecommendationsAgent  # noqa: F401

ALL_AGENTS = [
    ExecutiveAgent,
    ProblemAgent,
    ObjectivesAgent,
    ViabilityAgent,
    MarketAgent,
    CompetitiveAgent,
    RecommendationsAgent,
    CanvasAgent,
    SwotAgent,
    RiskAgent,
    RequirementsAgent,
    StoriesAgent,
    BacklogAgent,
    RoadmapAgent,
]
