"""PDF generation service for Vidur AI business blueprints.

Uses ReportLab to produce a polished, investor-ready PDF report from a
generated blueprint. Kept modular so the AI layer never imports it directly.
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

ACCENT = colors.HexColor("#2563eb")   # blue-600
INK = colors.HexColor("#0f172a")      # slate-900
MUTED = colors.HexColor("#475569")    # slate-600
LINE = colors.HexColor("#e2e8f0")     # slate-200
SOFT = colors.HexColor("#f8fafc")     # slate-50


def _styles() -> Dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    styles = {
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
    }
    return styles


def _bullets(items: List[str], style: ParagraphStyle) -> ListFlowable:
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


def _canvas_cell(label: str, items: List[str], styles) -> Table:
    """A single canvas block rendered as a nested table (title + bullets)."""
    items = items or []
    body = _bullets(items, styles["bullet"]) if items else Paragraph("—", styles["muted"])
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


def _canvas_table(canvas_data: Dict[str, List[str]], styles) -> Table:
    """3x3 grid of the 9 canvas blocks — reliable pagination-friendly layout."""
    def c(key: str, label: str):
        return _canvas_cell(label, canvas_data.get(key, []), styles)

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
            _bullets(items or ["—"], styles["bullet"]),
        ]

    data = [
        [q("Strengths", swot.get("strengths", []), "#047857"),
         q("Weaknesses", swot.get("weaknesses", []), "#b91c1c")],
        [q("Opportunities", swot.get("opportunities", []), "#1d4ed8"),
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
    header = ["Risk", "Impact", "Likelihood", "Mitigation"]
    data = [header]
    for r in risks:
        data.append([
            Paragraph(str(r.get("risk", "")), styles["bullet"]),
            Paragraph(str(r.get("impact", "")), styles["bullet"]),
            Paragraph(str(r.get("likelihood", "")), styles["bullet"]),
            Paragraph(str(r.get("mitigation", "")), styles["bullet"]),
        ])
    tbl = Table(data, colWidths=[1.8 * inch, 0.9 * inch, 1.1 * inch, 2.9 * inch])
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


def _backlog_table(items: List[Dict[str, Any]], styles) -> Table:
    header = ["ID", "Title", "Priority", "Effort", "Description"]
    data = [header]
    for b in items:
        data.append([
            Paragraph(str(b.get("id", "")), styles["bullet"]),
            Paragraph(str(b.get("title", "")), styles["bullet"]),
            Paragraph(str(b.get("priority", "")), styles["bullet"]),
            Paragraph(str(b.get("effort", "")), styles["bullet"]),
            Paragraph(str(b.get("description", "")), styles["bullet"]),
        ])
    tbl = Table(data, colWidths=[0.7 * inch, 1.7 * inch, 0.7 * inch, 0.6 * inch, 3.0 * inch])
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


def build_pdf(blueprint: Dict[str, Any], meta: Dict[str, Any]) -> bytes:
    """Render a full blueprint PDF and return bytes."""
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
    story.append(Spacer(1, 0.1 * inch))
    story.append(HRFlowable(width="100%", thickness=1, color=INK))
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("<b>The Idea</b>", styles["h3"]))
    story.append(Paragraph(meta.get("startup_idea", ""), styles["body"]))

    # Problem
    story += _section_header("Problem Statement", styles)
    story.append(Paragraph(blueprint.get("problem_statement", ""), styles["body"]))

    # Objectives
    story += _section_header("Business Objectives", styles)
    story.append(_bullets(blueprint.get("business_objectives", []), styles["bullet"]))

    # Canvas
    story += _section_header("Business Model Canvas", styles)
    story.append(_canvas_table(blueprint.get("business_model_canvas", {}), styles))

    story.append(PageBreak())

    # SWOT
    story += _section_header("SWOT Analysis", styles)
    story.append(_swot_table(blueprint.get("swot_analysis", {}), styles))

    # Risk
    story += _section_header("Risk Analysis", styles)
    story.append(_risk_table(blueprint.get("risk_analysis", []), styles))

    # Functional Requirements
    story += _section_header("Functional Requirements", styles)
    story.append(_bullets(blueprint.get("functional_requirements", []), styles["bullet"]))

    story.append(PageBreak())

    # User Stories
    story += _section_header("User Stories", styles)
    for us in blueprint.get("user_stories", []):
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
    for phase in blueprint.get("development_roadmap", []):
        story.append(Paragraph(
            f"<b>{phase.get('phase', '')}</b> &nbsp; · &nbsp; <font color='#2563eb'>{phase.get('timeline', '')}</font>",
            styles["h3"]))
        story.append(_bullets(phase.get("milestones", []), styles["bullet"]))
        story.append(Spacer(1, 0.05 * inch))

    # Footer note
    story.append(Spacer(1, 0.25 * inch))
    story.append(HRFlowable(width="100%", thickness=0.4, color=LINE))
    story.append(Paragraph(
        f"Generated by Vidur AI · {datetime.utcnow().strftime('%b %d, %Y')}",
        styles["muted"],
    ))

    doc.build(story)
    return buf.getvalue()
