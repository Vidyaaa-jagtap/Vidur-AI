import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Download, ArrowLeft, Loader2, AlertTriangle, ShieldCheck, Target, Layers,
  ListChecks, Users2, ClipboardList, Route, Building2, LineChart, TrendingUp,
  Trophy, Lightbulb, MessageSquare, ScrollText,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { fetchBlueprint, pdfUrl } from "../lib/api";

export default function Results() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchBlueprint(id);
        if (!cancelled) setRecord(data);
      } catch (e) {
        if (!cancelled) setErr(e?.response?.data?.detail || "Failed to load blueprint.");
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const download = () => {
    window.open(pdfUrl(id), "_blank");
    toast.success("Preparing your PDF…");
  };

  if (err) {
    return (
      <main data-testid="results-error" className="mx-auto max-w-3xl px-6 py-24 lg:px-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" /> Error</div>
          <div className="mt-2 text-sm">{err}</div>
          <Link to="/create" className="mt-4 inline-block text-sm font-semibold underline">Try again</Link>
        </div>
      </main>
    );
  }

  if (!record) {
    return (
      <main data-testid="results-loading" className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-24 lg:px-10">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
        <span className="text-neutral-400">Loading blueprint…</span>
      </main>
    );
  }

  const bp = record.blueprint || {};
  const vs = bp.viability_score || {};

  return (
    <main data-testid="results-page" className="bg-neutral-950">
      {/* Report header */}
      <section className="border-b border-neutral-800 bg-neutral-950">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
          <Link
            to="/create"
            data-testid="back-link"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-50"
          >
            <ArrowLeft className="h-4 w-4" /> New blueprint
          </Link>
          <div className="mt-6 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="eyebrow">Vidur AI · IBM watsonx.ai · Startup Blueprint</div>
              <h1 className="mt-3 font-display text-4xl font-black tracking-tighter text-neutral-50 sm:text-6xl">
                {record.startup_name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                <Tag>{record.industry}</Tag>
                <span>·</span>
                <span>Target: <span className="text-neutral-300">{record.target_audience}</span></span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/copilot/${id}`}>
                <Button
                  data-testid="open-copilot"
                  className="h-11 rounded-full border border-neutral-800 bg-neutral-950 px-5 text-neutral-50 shadow-sm hover:bg-neutral-900"
                >
                  <MessageSquare className="mr-2 h-4 w-4" /> Ask Copilot
                </Button>
              </Link>
              <Button
                onClick={download}
                data-testid="download-pdf"
                className="h-11 rounded-full bg-neutral-950 px-6 text-white shadow-lg shadow-slate-900/20 hover:brightness-110"
              >
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-neutral-400">{record.startup_idea}</p>
        </div>
      </section>

      {/* Executive Summary */}
      {bp.executive_summary && (
        <section data-testid="section-executive" className="border-b border-neutral-900 bg-gradient-to-br from-neutral-950 via-black to-amber-500/[0.03]">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
            <ExecutiveSummary es={bp.executive_summary} />
          </div>
        </section>
      )}

      {/* Viability hero */}
      {vs.overall !== undefined && (
        <section data-testid="section-viability" className="border-b border-neutral-800 bg-neutral-900">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
            <ViabilityHero vs={vs} />
          </div>
        </section>
      )}

      {/* Report body */}
      <section className="bg-neutral-900">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 lg:px-10 lg:py-20">
          <Section icon={Target} title="Problem Statement" testid="section-problem">
            <p className="text-base leading-relaxed text-neutral-300">{bp.problem_statement}</p>
          </Section>

          <Section icon={ListChecks} title="Business Objectives" testid="section-objectives">
            <BulletList items={bp.business_objectives} />
          </Section>

          <Section icon={TrendingUp} title="Market Opportunity Analysis" testid="section-market">
            <MarketBlock market={bp.market_analysis || {}} />
          </Section>

          <Section icon={Trophy} title="Competitive Landscape" testid="section-competitive">
            <CompetitiveBlock ca={bp.competitive_analysis || {}} />
          </Section>

          <Section icon={Building2} title="Business Model Canvas" testid="section-canvas">
            <CanvasGrid canvas={bp.business_model_canvas || {}} />
          </Section>

          <Section icon={ShieldCheck} title="SWOT Analysis" testid="section-swot">
            <SwotGrid swot={bp.swot_analysis || {}} />
          </Section>

          <Section icon={AlertTriangle} title="Risk Analysis" testid="section-risk">
            <RiskTable risks={bp.risk_analysis || []} />
          </Section>

          <Section icon={Layers} title="Functional Requirements" testid="section-requirements">
            <BulletList items={bp.functional_requirements} />
          </Section>

          <Section icon={Users2} title="User Stories" testid="section-stories">
            <div className="space-y-4">
              {(bp.user_stories || []).map((us, i) => (
                <div key={i} className="rounded-md border border-neutral-800 bg-neutral-900 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                    {us.persona}
                  </div>
                  <div className="mt-1 font-display text-base font-medium text-neutral-50">{us.story}</div>
                  {us.acceptance_criteria?.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-400">
                      {us.acceptance_criteria.map((a, j) => <li key={j}>{a}</li>)}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </Section>

          <Section icon={ClipboardList} title="Product Backlog" testid="section-backlog">
            <BacklogTable items={bp.product_backlog || []} />
          </Section>

          <Section icon={Route} title="Development Roadmap" testid="section-roadmap">
            <Roadmap phases={bp.development_roadmap || []} />
          </Section>

          <Section icon={Lightbulb} title="AI Recommendations — Next Actions" testid="section-recommendations">
            <Recommendations recs={bp.ai_recommendations || []} />
          </Section>

          <div className="mt-4 flex justify-end gap-2">
            <Link to={`/copilot/${id}`}>
              <Button
                data-testid="open-copilot-bottom"
                className="h-11 rounded-full border border-neutral-800 bg-neutral-950 px-5 text-neutral-50 shadow-sm hover:bg-neutral-900"
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Ask the Copilot
              </Button>
            </Link>
            <Button
              onClick={download}
              data-testid="download-pdf-bottom"
              className="h-11 rounded-full bg-amber-500 px-6 text-white shadow-md shadow-amber-500/20 hover:bg-amber-600"
            >
              <Download className="mr-2 h-4 w-4" /> Download Full PDF
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------- helpers ---------- */

function Tag({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-950 px-2.5 py-0.5 text-xs font-semibold text-neutral-300">
      {children}
    </span>
  );
}

function Section({ icon: Icon, title, children, testid }) {
  return (
    <article data-testid={testid} className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 lg:p-8">
      <header className="mb-5 flex items-center gap-3 border-b border-neutral-900 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-950 text-white">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-neutral-50">{title}</h2>
      </header>
      {children}
    </article>
  );
}

function BulletList({ items }) {
  if (!items?.length) return <p className="text-sm text-neutral-500">No data.</p>;
  return (
    <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-3 rounded-md border border-neutral-800 bg-neutral-900 p-3">
          <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
          <span className="text-sm leading-relaxed text-neutral-300">{t}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Executive Summary ---------- */

function ExecutiveSummary({ es }) {
  const metrics = es.key_metrics || [];
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-8 shadow-sm backdrop-blur">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="eyebrow flex items-center gap-2">
            <ScrollText className="h-3.5 w-3.5" /> Executive Summary
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold leading-snug text-neutral-50 sm:text-3xl">
            {es.headline}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-300">{es.thesis}</p>
          {es.call_to_action && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
              <Lightbulb className="h-3.5 w-3.5" /> {es.call_to_action}
            </div>
          )}
        </div>
        <div className="lg:col-span-4">
          <div className="grid grid-cols-2 gap-3">
            {metrics.slice(0, 6).map((m, i) => (
              <div key={i} className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">{m.label}</div>
                <div className="mt-1 font-display text-lg font-bold text-neutral-50">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Viability ---------- */

function scoreColor(score) {
  if (score >= 75) return "text-emerald-600";
  if (score >= 55) return "text-amber-400";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}
function scoreBar(score) {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 55) return "bg-amber-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function ViabilityHero({ vs }) {
  const subs = [
    ["Market Potential", vs.market_potential],
    ["Product-Market Fit", vs.product_market_fit],
    ["Execution Feasibility", vs.execution_feasibility],
    ["Monetization Strength", vs.monetization_strength],
    ["Defensibility", vs.defensibility],
  ];
  return (
    <div className="grid grid-cols-1 gap-8 rounded-xl border border-neutral-800 bg-neutral-950 p-8 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="eyebrow flex items-center gap-2">
          <LineChart className="h-3.5 w-3.5" /> Startup Viability Score
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <div data-testid="viability-overall" className={`font-display text-7xl font-black tracking-tighter ${scoreColor(vs.overall)}`}>
            {vs.overall}
          </div>
          <div className="text-lg font-semibold text-neutral-600">/100</div>
        </div>
        <div className="mt-3 font-display text-xl font-semibold text-neutral-50">{vs.verdict}</div>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">{vs.rationale}</p>
      </div>
      <div className="space-y-3 lg:col-span-7">
        {subs.map(([label, s]) => (
          <div key={label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-neutral-300">{label}</span>
              <span className={`font-mono-alt font-semibold ${scoreColor(s)}`}>{s}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
              <div className={`h-full rounded-full ${scoreBar(s)}`} style={{ width: `${s}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Market ---------- */

function MarketBlock({ market }) {
  const cells = [
    ["TAM", market.tam],
    ["SAM", market.sam],
    ["SOM (3yr)", market.som],
  ];
  return (
    <div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {cells.map(([label, val]) => (
          <div key={label} className="rounded-md border border-neutral-800 bg-neutral-900 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-400">{label}</div>
            <div className="mt-1 text-sm text-neutral-100">{val || "—"}</div>
          </div>
        ))}
      </div>
      {market.growth_rate && (
        <div className="mt-4 rounded-md border border-neutral-800 bg-neutral-950 p-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Growth rate</span>
          <span className="ml-2 text-sm text-neutral-100">{market.growth_rate}</span>
        </div>
      )}
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Trends</div>
          <BulletList items={market.trends} />
        </div>
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Growth drivers</div>
          <BulletList items={market.growth_drivers} />
        </div>
      </div>
    </div>
  );
}

/* ---------- Competitive ---------- */

function CompetitiveBlock({ ca }) {
  const comps = ca.direct_competitors || [];
  return (
    <div className="space-y-6">
      {comps.length ? (
        <div className="overflow-hidden rounded-md border border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-950 text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Competitor</th>
                <th className="px-4 py-3 font-semibold">Strength</th>
                <th className="px-4 py-3 font-semibold">Weakness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comps.map((c, i) => (
                <tr key={i} className="align-top">
                  <td className="px-4 py-3 font-medium text-neutral-50">{c.name}</td>
                  <td className="px-4 py-3 text-neutral-300">{c.strength}</td>
                  <td className="px-4 py-3 text-neutral-300">{c.weakness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {ca.differentiators?.length ? (
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">How we win</div>
          <BulletList items={ca.differentiators} />
        </div>
      ) : null}
      {ca.moats?.length ? (
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">Long-term moats</div>
          <BulletList items={ca.moats} />
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Canvas ---------- */

const CANVAS_META = [
  { key: "key_partners", label: "Key Partners", span: "lg:col-span-2 lg:row-span-2" },
  { key: "key_activities", label: "Key Activities", span: "lg:col-span-2" },
  { key: "value_propositions", label: "Value Propositions", span: "lg:col-span-2 lg:row-span-2" },
  { key: "customer_relationships", label: "Customer Relationships", span: "lg:col-span-2" },
  { key: "customer_segments", label: "Customer Segments", span: "lg:col-span-2 lg:row-span-2" },
  { key: "key_resources", label: "Key Resources", span: "lg:col-span-2" },
  { key: "channels", label: "Channels", span: "lg:col-span-2" },
  { key: "cost_structure", label: "Cost Structure", span: "lg:col-span-5" },
  { key: "revenue_streams", label: "Revenue Streams", span: "lg:col-span-5" },
];

function CanvasGrid({ canvas }) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-10">
      {CANVAS_META.map((c) => (
        <div key={c.key} className={`rounded-md border border-neutral-800 bg-neutral-900 p-4 ${c.span}`}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-400">{c.label}</div>
          <ul className="mt-2 space-y-1.5">
            {(canvas[c.key] || []).map((t, i) => (
              <li key={i} className="text-sm leading-snug text-neutral-300">• {t}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const SWOT_META = [
  { key: "strengths", label: "Strengths", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { key: "weaknesses", label: "Weaknesses", color: "text-red-700 bg-red-50 border-red-200" },
  { key: "opportunities", label: "Opportunities", color: "text-amber-300 bg-amber-500/10 border-amber-500/30" },
  { key: "threats", label: "Threats", color: "text-amber-700 bg-amber-50 border-amber-200" },
];

function SwotGrid({ swot }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {SWOT_META.map((q) => (
        <div key={q.key} className={`rounded-md border p-5 ${q.color}`}>
          <div className="font-display text-lg font-semibold tracking-tight">{q.label}</div>
          <ul className="mt-3 space-y-1.5">
            {(swot[q.key] || []).map((t, i) => (
              <li key={i} className="text-sm leading-relaxed">• {t}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function levelClass(level) {
  const l = (level || "").toLowerCase();
  if (l === "high") return "bg-red-100 text-red-800";
  if (l === "medium") return "bg-amber-100 text-amber-800";
  if (l === "low") return "bg-emerald-100 text-emerald-800";
  return "bg-neutral-800 text-neutral-300";
}

function RiskTable({ risks }) {
  if (!risks.length) return <p className="text-sm text-neutral-500">No risks identified.</p>;
  return (
    <div className="overflow-hidden rounded-md border border-neutral-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-950 text-white">
          <tr>
            <th className="px-4 py-3 font-semibold">Risk</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Impact</th>
            <th className="px-4 py-3 font-semibold">Likelihood</th>
            <th className="px-4 py-3 font-semibold">Mitigation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {risks.map((r, i) => (
            <tr key={i} className="align-top">
              <td className="px-4 py-3 font-medium text-neutral-50">{r.risk}</td>
              <td className="px-4 py-3 text-neutral-300">{r.category}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${levelClass(r.impact)}`}>{r.impact}</span>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${levelClass(r.likelihood)}`}>{r.likelihood}</span>
              </td>
              <td className="px-4 py-3 text-neutral-300">{r.mitigation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function priorityClass(p) {
  if (p === "P0") return "bg-red-100 text-red-800";
  if (p === "P1") return "bg-amber-100 text-amber-800";
  if (p === "P2") return "bg-neutral-800 text-neutral-300";
  return "bg-neutral-800 text-neutral-300";
}

function BacklogTable({ items }) {
  if (!items.length) return <p className="text-sm text-neutral-500">No backlog items.</p>;
  return (
    <div className="overflow-hidden rounded-md border border-neutral-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-950 text-white">
          <tr>
            <th className="px-4 py-3 font-semibold">ID</th>
            <th className="px-4 py-3 font-semibold">Title</th>
            <th className="px-4 py-3 font-semibold">Priority</th>
            <th className="px-4 py-3 font-semibold">Effort</th>
            <th className="px-4 py-3 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((b, i) => (
            <tr key={i} className="align-top">
              <td className="px-4 py-3 font-mono-alt text-xs text-neutral-500">{b.id}</td>
              <td className="px-4 py-3 font-medium text-neutral-50">{b.title}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${priorityClass(b.priority)}`}>{b.priority}</span>
              </td>
              <td className="px-4 py-3 text-neutral-300">{b.effort}</td>
              <td className="px-4 py-3 text-neutral-300">{b.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Roadmap({ phases }) {
  if (!phases.length) return <p className="text-sm text-neutral-500">No roadmap yet.</p>;
  return (
    <ol className="relative space-y-6 border-l-2 border-neutral-800 pl-6">
      {phases.map((p, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[31px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-950 text-[10px] font-bold text-white">
            {i + 1}
          </span>
          <div className="flex flex-wrap items-baseline gap-3">
            <h4 className="font-display text-lg font-semibold tracking-tight text-neutral-50">{p.phase}</h4>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">{p.timeline}</span>
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-300">
            {(p.milestones || []).map((m, j) => <li key={j}>{m}</li>)}
          </ul>
        </li>
      ))}
    </ol>
  );
}

function Recommendations({ recs }) {
  if (!recs.length) return <p className="text-sm text-neutral-500">No recommendations yet.</p>;
  return (
    <ol className="space-y-3">
      {recs.map((r, i) => (
        <li key={i} className="flex items-start gap-4 rounded-md border border-neutral-800 bg-neutral-900 p-4">
          <span className={`mt-0.5 inline-flex h-7 min-w-[2.5rem] items-center justify-center rounded-full px-2 text-xs font-bold ${priorityClass(r.priority)}`}>
            {r.priority}
          </span>
          <div>
            <div className="font-display text-base font-semibold text-neutral-50">{r.action}</div>
            <div className="mt-0.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">{r.timeline}</div>
            <p className="mt-1 text-sm text-neutral-400">{r.rationale}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
