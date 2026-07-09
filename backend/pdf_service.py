"""PDF generator for Vidur AI blueprints (ReportLab).

Renders a professional, investor-ready report covering all 13 sections:
1. Cover + Idea
2. Viability Score (with sub-scores + verdict)
3. Problem Statement
4. Business Objectives
5. Market Analysis (TAM / SAM / SOM)
6. Competitive Analysis
7. Business Model Canvas (3×3 grid)
8. SWOT Analysis (2×2)
9. Risk Analysis (table)
10. Functional Requirements
11. User Stories
12. Product Backlog (table)
13. Development Roadmap
14. AI Recommendations
"""
from __future__ import annotations

import io
from datetime import datetime
from typing import Any, Dict, List

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

INK = colors.HexColor("#0f172a")     # slate-900
ACCENT = colors.HexColor("#054ada")  # IBM blue-ish
MUTED = colors.HexColor("#475569")   # slate-600
LINE = colors.HexColor("#e2e8f0")    # slate-200
SOFT = colors.HexColor("#f8fafc")    # slate-50
GOOD = colors.HexColor("#047857")    # emerald-700
WARN = colors.HexColor("#a16207")    # amber-700
BAD = colors.HexColor("#b91c1c")     # red-700


def _styles() -> Dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "title", parent=base["Title"], fontName="Helvetica-Bold",
            fontSize=28, leading=32, textColor=INK, spaceAfter=6,
        ),
        "eyebrow": ParagraphStyle(
            "eyebrow", parent=base["Normal"], fontName="Helvetica-Bold",
            fontSize=8, textColor=ACCENT, spaceAfter=4, alignment=TA_LEFT,
        ),
        "h2": ParagraphStyle(
            "h2", parent=base["Heading2"], fontName="Helvetica-Bold",
            fontSize=16, leading=20, textColor=INK, spaceBefore=14, spaceAfter=8,
        ),
        "h3": ParagraphStyle(
            "h3", parent=base["Heading3"], fontName="Helvetica-Bold",
            fontSize=11, leading=14, textColor=INK, spaceBefore=8, spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "body", parent=base["BodyText"], fontName="Helvetica",
            fontSize=10, leading=15, textColor=INK, spaceAfter=6,
        ),
        "muted": ParagraphStyle(
            "muted", parent=base["BodyText"], fontName="Helvetica",
            fontSize=9, leading=13, textColor=MUTED,
        ),
        "bullet": ParagraphStyle(
            "bullet", parent=base["BodyText"], fontName="Helvetica",
            fontSize=10, leading=14, textColor=INK,
        ),
        "score_big": ParagraphStyle(
            "score_big", parent=base["Title"], fontName="Helvetica-Bold",
            fontSize=64, leading=64, textColor=ACCENT, alignment=TA_LEFT,
        ),
    }


def _bullets(items: List[str], style: ParagraphStyle) -> ListFlowable:
    items = items or ["—"]
    return ListFlowable(
        [ListItem(Paragraph(str(i), style), leftIndent=10) for i in items],
        bulletType="bullet", bulletFontSize=8, leftIndent=14, bulletColor=ACCENT,
    )


def _section_header(title: str, styles) -> List:
    return [
        Spacer(1, 0.15 * inch),
        Paragraph(title.upper(), styles["eyebrow"]),
        HRFlowable(width="100%", thickness=0.6, color=LINE, spaceAfter=6),
        Paragraph(title, styles["h2"]),
    ]


def _score_color(score: int) -> colors.Color:
    if score >= 75: return GOOD
    if score >= 55: return ACCENT
    if score >= 40: return WARN
    return BAD


def _viability_block(v: Dict[str, Any], styles) -> Table:
    overall = int(v.get("overall", 0))
    subs = [
        ("Market Potential", int(v.get("market_potential", 0))),
        ("Product-Market Fit", int(v.get("product_market_fit", 0))),
        ("Execution Feasibility", int(v.get("execution_feasibility", 0))),
        ("Monetization Strength", int(v.get("monetization_strength", 0))),
        ("Defensibility", int(v.get("defensibility", 0))),
    ]

    left = [
        Paragraph("<b>VIABILITY SCORE</b>", styles["eyebrow"]),
        Paragraph(
            f"<font color='{_score_color(overall).hexval()}'>{overall}</font>"
            "<font size=18 color='#94a3b8'> /100</font>",
            styles["score_big"],
        ),
        Paragraph(f"<b>{v.get('verdict', '')}</b>", styles["h3"]),
        Paragraph(v.get("rationale", ""), styles["muted"]),
    ]

    sub_rows = []
    for label, score in subs:
        c = _score_color(score)
        bar_len = max(2, int(score / 10))
        bar = "█" * bar_len + "░" * (10 - bar_len)
        sub_rows.append([
            Paragraph(label, styles["bullet"]),
            Paragraph(
                f"<font color='{c.hexval()}' name='Helvetica-Bold'>{bar}</font>",
                styles["bullet"],
            ),
            Paragraph(
                f"<b><font color='{c.hexval()}'>{score}</font></b>",
                styles["bullet"],
            ),
        ])
    right = Table(sub_rows, colWidths=[1.7 * inch, 1.5 * inch, 0.4 * inch])
    right.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))

    outer = Table([[left, right]], colWidths=[3.1 * inch, 3.7 * inch])
    outer.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("BACKGROUND", (0, 0), (-1, -1), SOFT),
    ]))
    return outer


def _market_block(m: Dict[str, Any], styles) -> Table:
    row1 = [
        [Paragraph("<b>TAM</b>", styles["eyebrow"]),
         Paragraph(m.get("tam", "—"), styles["body"])],
        [Paragraph("<b>SAM</b>", styles["eyebrow"]),
         Paragraph(m.get("sam", "—"), styles["body"])],
        [Paragraph("<b>SOM (3yr)</b>", styles["eyebrow"]),
         Paragraph(m.get("som", "—"), styles["body"])],
    ]
    top = Table([row1], colWidths=[2.23 * inch] * 3)
    top.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return top


def _competitor_table(rows: List[Dict[str, Any]], styles) -> Table:
    header = ["Competitor", "Strength", "Weakness"]
    data = [header]
    for c in rows or []:
        data.append([
            Paragraph(f"<b>{c.get('name', '')}</b>", styles["bullet"]),
            Paragraph(c.get("strength", ""), styles["bullet"]),
            Paragraph(c.get("weakness", ""), styles["bullet"]),
        ])
    if len(data) == 1:
        data.append(["—", "—", "—"])
    tbl = Table(data, colWidths=[1.8 * inch, 2.4 * inch, 2.5 * inch])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.3, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return tbl


def _canvas_cell(label: str, items: List[str], styles) -> Table:
    body = _bullets(items or [], styles["bullet"])
    inner = Table(
        [[Paragraph(f"<b>{label}</b>", styles["h3"])], [body]],
        colWidths=["*"],
    )
    inner.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return inner


def _canvas_table(cv: Dict[str, List[str]], styles) -> Table:
    def c(k: str, label: str):
        return _canvas_cell(label, cv.get(k, []), styles)

    data = [
        [c("key_partners", "Key Partners"),
         c("key_activities", "Key Activities"),
         c("value_propositions", "Value Propositions")],
        [c("key_resources", "Key Resources"),
         c("customer_relationships", "Customer Relationships"),
         c("channels", "Channels")],
        [c("customer_segments", "Customer Segments"),
         c("cost_structure", "Cost Structure"),
         c("revenue_streams", "Revenue Streams")],
    ]
    tbl = Table(data, colWidths=[2.23 * inch] * 3)
    tbl.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return tbl


def _swot_table(swot: Dict[str, List[str]], styles) -> Table:
    def q(title: str, items: List[str], color_hex: str):
        return [
            Paragraph(f"<b>{title}</b>", ParagraphStyle(
                f"swot-{title}", parent=styles["h3"], textColor=colors.HexColor(color_hex))),
            _bullets(items or [], styles["bullet"]),
        ]

    data = [
        [q("Strengths", swot.get("strengths", []), "#047857"),
         q("Weaknesses", swot.get("weaknesses", []), "#b91c1c")],
        [q("Opportunities", swot.get("opportunities", []), "#054ada"),
         q("Threats", swot.get("threats", []), "#a16207")],
    ]
    tbl = Table(data, colWidths=[3.35 * inch, 3.35 * inch])
    tbl.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return tbl


def _risk_table(risks: List[Dict[str, Any]], styles) -> Table:
    header = ["Risk", "Category", "Impact", "Likelihood", "Mitigation"]
    data = [header]
    for r in risks or []:
        data.append([
            Paragraph(str(r.get("risk", "")), styles["bullet"]),
            Paragraph(str(r.get("category", "")), styles["bullet"]),
            Paragraph(str(r.get("impact", "")), styles["bullet"]),
            Paragraph(str(r.get("likelihood", "")), styles["bullet"]),
            Paragraph(str(r.get("mitigation", "")), styles["bullet"]),
        ])
    if len(data) == 1:
        data.append(["—"] * 5)
    tbl = Table(data, colWidths=[1.5 * inch, 0.9 * inch, 0.7 * inch, 0.9 * inch, 2.7 * inch])
    tbl.setStyle(_dark_header_table_style())
    return tbl


def _backlog_table(items: List[Dict[str, Any]], styles) -> Table:
    header = ["ID", "Title", "Priority", "Effort", "Description"]
    data = [header]
    for b in items or []:
        data.append([
            Paragraph(str(b.get("id", "")), styles["bullet"]),
            Paragraph(str(b.get("title", "")), styles["bullet"]),
            Paragraph(str(b.get("priority", "")), styles["bullet"]),
            Paragraph(str(b.get("effort", "")), styles["bullet"]),
            Paragraph(str(b.get("description", "")), styles["bullet"]),
        ])
    if len(data) == 1:
        data.append(["—"] * 5)
    tbl = Table(data, colWidths=[0.7 * inch, 1.7 * inch, 0.7 * inch, 0.6 * inch, 3.0 * inch])
    tbl.setStyle(_dark_header_table_style())
    return tbl


def _dark_header_table_style() -> TableStyle:
    return TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.3, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ])


def build_pdf(blueprint: Dict[str, Any], meta: Dict[str, Any]) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=LETTER,
        leftMargin=0.6 * inch, rightMargin=0.6 * inch,
        topMargin=0.7 * inch, bottomMargin=0.7 * inch,
        title=f"Vidur AI Blueprint — {meta.get('startup_name', '')}",
    )
    styles = _styles()
    story: List = []

    # Cover
    story.append(Paragraph("VIDUR AI · STARTUP BLUEPRINT", styles["eyebrow"]))
    story.append(Paragraph(meta.get("startup_name", "Untitled Startup"), styles["title"]))
    story.append(Paragraph(
        f"{meta.get('industry', '')} &nbsp; · &nbsp; Target: {meta.get('target_audience', '')}",
        styles["muted"],
    ))
    story.append(Spacer(1, 0.06 * inch))
    story.append(Paragraph(
        "Generated with <b>IBM watsonx.ai</b> · "
        f"{datetime.utcnow().strftime('%B %d, %Y')}",
        styles["muted"],
    ))
    story.append(Spacer(1, 0.1 * inch))
    story.append(HRFlowable(width="100%", thickness=1, color=INK))
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("<b>The Idea</b>", styles["h3"]))
    story.append(Paragraph(meta.get("startup_idea", ""), styles["body"]))

    # Viability
    if blueprint.get("viability_score"):
        story += _section_header("Startup Viability Score", styles)
        story.append(_viability_block(blueprint["viability_score"], styles))

    # Problem
    story += _section_header("Problem Statement", styles)
    story.append(Paragraph(str(blueprint.get("problem_statement", "")), styles["body"]))

    # Objectives
    story += _section_header("Business Objectives", styles)
    story.append(_bullets(blueprint.get("business_objectives", []), styles["bullet"]))

    # Market Analysis
    m = blueprint.get("market_analysis") or {}
    story += _section_header("Market Opportunity Analysis", styles)
    story.append(_market_block(m, styles))
    if m.get("growth_rate"):
        story.append(Spacer(1, 0.08 * inch))
        story.append(Paragraph(f"<b>Growth Rate:</b> {m['growth_rate']}", styles["body"]))
    story.append(Spacer(1, 0.05 * inch))
    story.append(Paragraph("<b>Trends</b>", styles["h3"]))
    story.append(_bullets(m.get("trends", []), styles["bullet"]))
    story.append(Paragraph("<b>Growth Drivers</b>", styles["h3"]))
    story.append(_bullets(m.get("growth_drivers", []), styles["bullet"]))

    story.append(PageBreak())

    # Competitive
    ca = blueprint.get("competitive_analysis") or {}
    story += _section_header("Competitive Landscape", styles)
    story.append(_competitor_table(ca.get("direct_competitors", []), styles))
    if ca.get("differentiators"):
        story.append(Spacer(1, 0.08 * inch))
        story.append(Paragraph("<b>How Vidur AI Wins (Differentiators)</b>", styles["h3"]))
        story.append(_bullets(ca["differentiators"], styles["bullet"]))
    if ca.get("moats"):
        story.append(Paragraph("<b>Long-Term Moats</b>", styles["h3"]))
        story.append(_bullets(ca["moats"], styles["bullet"]))

    # BMC
    story += _section_header("Business Model Canvas", styles)
    story.append(_canvas_table(blueprint.get("business_model_canvas", {}), styles))

    story.append(PageBreak())

    # SWOT
    story += _section_header("SWOT Analysis", styles)
    story.append(_swot_table(blueprint.get("swot_analysis", {}), styles))

    # Risk
    story += _section_header("Risk Analysis", styles)
    story.append(_risk_table(blueprint.get("risk_analysis", []), styles))

    # Requirements
    story += _section_header("Functional Requirements", styles)
    story.append(_bullets(blueprint.get("functional_requirements", []), styles["bullet"]))

    story.append(PageBreak())

    # User Stories
    story += _section_header("User Stories", styles)
    for us in blueprint.get("user_stories", []) or []:
        story.append(Paragraph(
            f"<b>{us.get('persona', '')}</b> — {us.get('story', '')}",
            styles["body"]))
        ac = us.get("acceptance_criteria", []) or []
        if ac:
            story.append(_bullets(ac, styles["bullet"]))
        story.append(Spacer(1, 0.05 * inch))

    # Backlog
    story += _section_header("Product Backlog", styles)
    story.append(_backlog_table(blueprint.get("product_backlog", []), styles))

    # Roadmap
    story += _section_header("Development Roadmap", styles)
    for phase in blueprint.get("development_roadmap", []) or []:
        story.append(Paragraph(
            f"<b>{phase.get('phase', '')}</b> &nbsp; · &nbsp; "
            f"<font color='{ACCENT.hexval()}'>{phase.get('timeline', '')}</font>",
            styles["h3"]))
        story.append(_bullets(phase.get("milestones", []), styles["bullet"]))
        story.append(Spacer(1, 0.05 * inch))

    # AI Recommendations
    recs = blueprint.get("ai_recommendations", []) or []
    if recs:
        story += _section_header("AI Recommendations — Next Actions", styles)
        for r in recs:
            story.append(Paragraph(
                f"<b>{r.get('priority', 'P?')}</b> · {r.get('action', '')} "
                f"<font color='{ACCENT.hexval()}'>({r.get('timeline', '')})</font>",
                styles["body"]))
            story.append(Paragraph(f"<i>{r.get('rationale', '')}</i>", styles["muted"]))
            story.append(Spacer(1, 0.04 * inch))

    # Footer
    story.append(Spacer(1, 0.25 * inch))
    story.append(HRFlowable(width="100%", thickness=0.4, color=LINE))
    story.append(Paragraph(
        f"Generated by Vidur AI using IBM watsonx.ai · "
        f"{datetime.utcnow().strftime('%b %d, %Y')}",
        styles["muted"],
    ))

    doc.build(story)
    return buf.getvalue()
