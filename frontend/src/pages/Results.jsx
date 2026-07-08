import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Download, ArrowLeft, Loader2, AlertTriangle,
  ShieldCheck, Target, Layers, ListChecks, Users2, ClipboardList, Route, Building2,
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
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
        <span className="text-slate-600">Loading blueprint…</span>
      </main>
    );
  }

  const bp = record.blueprint || {};

  return (
    <main data-testid="results-page" className="bg-white">
      {/* Report header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
          <Link
            to="/create"
            data-testid="back-link"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> New blueprint
          </Link>
          <div className="mt-6 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="eyebrow">Vidur AI · Startup Blueprint</div>
              <h1 className="mt-3 font-display text-4xl font-black tracking-tighter text-slate-900 sm:text-6xl">
                {record.startup_name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <Tag>{record.industry}</Tag>
                <span>·</span>
                <span>Target: <span className="text-slate-700">{record.target_audience}</span></span>
              </div>
            </div>
            <Button
              onClick={download}
              data-testid="download-pdf"
              className="h-11 rounded-full bg-slate-900 px-6 text-white hover:bg-slate-800"
            >
              <Download className="mr-2 h-4 w-4" /> Download PDF Report
            </Button>
          </div>
          <p className="mt-6 max-w-3xl text-slate-600">{record.startup_idea}</p>
        </div>
      </section>

      {/* Report body */}
      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 lg:px-10 lg:py-20">
          <Section icon={Target} title="Problem Statement" testid="section-problem">
            <p className="text-base leading-relaxed text-slate-700">{bp.problem_statement}</p>
          </Section>

          <Section icon={ListChecks} title="Business Objectives" testid="section-objectives">
            <BulletList items={bp.business_objectives} />
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
                <div key={i} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                    {us.persona}
                  </div>
                  <div className="mt-1 font-display text-base font-medium text-slate-900">{us.story}</div>
                  {us.acceptance_criteria?.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
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

          <div className="mt-4 flex justify-end">
            <Button
              onClick={download}
              data-testid="download-pdf-bottom"
              className="h-11 rounded-full bg-blue-600 px-6 text-white hover:bg-blue-700"
            >
              <Download className="mr-2 h-4 w-4" /> Download Full PDF Report
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
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-700">
      {children}
    </span>
  );
}

function Section({ icon: Icon, title, children, testid }) {
  return (
    <article data-testid={testid} className="rounded-xl border border-slate-200 bg-white p-6 lg:p-8">
      <header className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
      </header>
      {children}
    </article>
  );
}

function BulletList({ items }) {
  if (!items?.length) return <p className="text-sm text-slate-500">No data.</p>;
  return (
    <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
          <span className="text-sm leading-relaxed text-slate-700">{t}</span>
        </li>
      ))}
    </ul>
  );
}

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
        <div key={c.key} className={`rounded-md border border-slate-200 bg-slate-50 p-4 ${c.span}`}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-600">{c.label}</div>
          <ul className="mt-2 space-y-1.5">
            {(canvas[c.key] || []).map((t, i) => (
              <li key={i} className="text-sm leading-snug text-slate-700">• {t}</li>
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
  { key: "opportunities", label: "Opportunities", color: "text-blue-700 bg-blue-50 border-blue-200" },
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
  return "bg-slate-100 text-slate-700";
}

function RiskTable({ risks }) {
  if (!risks.length) return <p className="text-sm text-slate-500">No risks identified.</p>;
  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900 text-white">
          <tr>
            <th className="px-4 py-3 font-semibold">Risk</th>
            <th className="px-4 py-3 font-semibold">Impact</th>
            <th className="px-4 py-3 font-semibold">Likelihood</th>
            <th className="px-4 py-3 font-semibold">Mitigation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {risks.map((r, i) => (
            <tr key={i} className="align-top">
              <td className="px-4 py-3 font-medium text-slate-900">{r.risk}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${levelClass(r.impact)}`}>{r.impact}</span>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${levelClass(r.likelihood)}`}>{r.likelihood}</span>
              </td>
              <td className="px-4 py-3 text-slate-700">{r.mitigation}</td>
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
  if (p === "P2") return "bg-slate-100 text-slate-700";
  return "bg-slate-100 text-slate-700";
}

function BacklogTable({ items }) {
  if (!items.length) return <p className="text-sm text-slate-500">No backlog items.</p>;
  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900 text-white">
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
              <td className="px-4 py-3 font-mono-alt text-xs text-slate-500">{b.id}</td>
              <td className="px-4 py-3 font-medium text-slate-900">{b.title}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${priorityClass(b.priority)}`}>{b.priority}</span>
              </td>
              <td className="px-4 py-3 text-slate-700">{b.effort}</td>
              <td className="px-4 py-3 text-slate-700">{b.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Roadmap({ phases }) {
  if (!phases.length) return <p className="text-sm text-slate-500">No roadmap yet.</p>;
  return (
    <ol className="relative space-y-6 border-l-2 border-slate-200 pl-6">
      {phases.map((p, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[31px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
            {i + 1}
          </span>
          <div className="flex flex-wrap items-baseline gap-3">
            <h4 className="font-display text-lg font-semibold tracking-tight text-slate-900">{p.phase}</h4>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">{p.timeline}</span>
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {(p.milestones || []).map((m, j) => <li key={j}>{m}</li>)}
          </ul>
        </li>
      ))}
    </ol>
  );
}
