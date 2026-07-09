import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight, Loader2, Sparkles, Target, Users, Building2, Lightbulb,
  CheckCircle2, Circle, XCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { startBlueprintJob, getBlueprintJob, fetchHealth, humanizeError, API } from "../lib/api";

const INDUSTRIES = [
  "SaaS", "Fintech", "Healthtech", "Edtech", "E-commerce",
  "AI / ML", "Climate & Sustainability", "Marketplace", "Consumer Mobile",
  "Developer Tools", "Cybersecurity", "AgriTech", "Other",
];

const EXAMPLES = [
  { name: "SprintDeck", industry: "SaaS", audience: "Early-stage founders and PMs",
    idea: "An AI copilot that turns raw startup ideas into investor-ready blueprints — canvas, SWOT, viability score, roadmap and backlog — in under a minute." },
  { name: "GreenRoute", industry: "Climate & Sustainability", audience: "SMB logistics operators",
    idea: "A route optimization platform that reduces last-mile emissions by 30% using real-time traffic and carbon-aware routing." },
  { name: "KrishiSetu", industry: "AgriTech", audience: "Smallholder farmers and rural cooperatives",
    idea: "A mobile-first marketplace connecting smallholder farmers directly to wholesale buyers, with AI-powered price forecasts and micro-credit." },
];

const SECTION_LABELS = {
  executive_summary: "Executive Summary",
  problem_statement: "Problem Statement",
  business_objectives: "Business Objectives",
  viability_score: "Viability Score",
  market_analysis: "Market Analysis",
  competitive_analysis: "Competitive Analysis",
  ai_recommendations: "AI Recommendations",
  business_model_canvas: "Business Model Canvas",
  swot_analysis: "SWOT Analysis",
  risk_analysis: "Risk Analysis",
  functional_requirements: "Functional Requirements",
  user_stories: "User Stories",
  product_backlog: "Product Backlog",
  development_roadmap: "Development Roadmap",
};
const SECTION_ORDER = Object.keys(SECTION_LABELS);

function StatusIcon({ status }) {
  if (status === "done") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (status === "running") return <Loader2 className="h-4 w-4 animate-spin text-amber-400" />;
  if (status === "error") return <XCircle className="h-4 w-4 text-red-600" />;
  return <Circle className="h-4 w-4 text-slate-300" />;
}

export default function Create() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ startup_name: "", industry: "", target_audience: "", startup_idea: "" });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [healthOk, setHealthOk] = useState(null);
  const pollRef = useRef(null);
  const tickerRef = useRef(null);

  // Health check on mount so URL/CORS problems surface immediately.
  useEffect(() => {
    (async () => {
      try {
        const h = await fetchHealth();
        setHealthOk(true);
        // eslint-disable-next-line no-console
        console.log("[Vidur AI] backend reachable:", h);
      } catch (e) {
        setHealthOk(false);
        toast.error(`Backend unreachable: ${humanizeError(e)}`, { duration: 8000 });
      }
    })();
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, []);

  const update = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const applyExample = (ex) => {
    setForm({ startup_name: ex.name, industry: ex.industry, target_audience: ex.audience, startup_idea: ex.idea });
    toast.success("Example loaded");
  };

  const pollJob = (jobId, startedAt) => {
    pollRef.current = setTimeout(async () => {
      try {
        const job = await getBlueprintJob(jobId);
        setProgress(job.progress || {});
        if (job.status === "done" && job.blueprint_id) {
          toast.success("Blueprint ready");
          if (tickerRef.current) clearInterval(tickerRef.current);
          navigate(`/results/${job.blueprint_id}`);
          return;
        }
        if (job.status === "error") {
          setLoading(false);
          if (tickerRef.current) clearInterval(tickerRef.current);
          toast.error(job.error || "Generation failed. Try again.", { duration: 10000 });
          return;
        }
        if (Date.now() - startedAt > 300000) {
          setLoading(false);
          if (tickerRef.current) clearInterval(tickerRef.current);
          toast.error("Generation timed out after 5 minutes. Please try again.");
          return;
        }
        pollJob(jobId, startedAt);
      } catch (e) {
        setLoading(false);
        if (tickerRef.current) clearInterval(tickerRef.current);
        toast.error(`Lost connection: ${humanizeError(e)}`, { duration: 10000 });
      }
    }, 2500);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.startup_name || !form.industry || !form.target_audience || form.startup_idea.length < 10) {
      toast.error("Please complete all fields (idea must be at least 10 chars).");
      return;
    }
    if (healthOk === false) {
      toast.error(`Backend unreachable at ${API}. Fix REACT_APP_BACKEND_URL in frontend/.env.`,
        { duration: 10000 });
      return;
    }
    setLoading(true);
    setElapsed(0);
    setProgress(Object.fromEntries(SECTION_ORDER.map(k => [k, "pending"])));
    const start = Date.now();
    tickerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    try {
      const job = await startBlueprintJob(form);
      pollJob(job.id, start);
    } catch (err) {
      setLoading(false);
      if (tickerRef.current) clearInterval(tickerRef.current);
      // eslint-disable-next-line no-console
      console.error("[Vidur AI] startBlueprintJob failed:", err);
      toast.error(humanizeError(err), { duration: 10000 });
    }
  };

  const doneCount = Object.values(progress).filter(s => s === "done").length;
  const totalCount = SECTION_ORDER.length;
  const pct = Math.round((doneCount / totalCount) * 100);

  return (
    <main data-testid="create-page" className="bg-neutral-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
        <aside className="lg:col-span-4">
          <div className="sticky top-24">
            <div className="eyebrow">Step 01 · Inputs</div>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-neutral-50 sm:text-5xl">
              Tell us about your startup.
            </h1>
            <p className="mt-4 text-neutral-400">
              The more specific your inputs, the sharper the blueprint. Fourteen
              analyst agents work in parallel to produce your report.
            </p>

            {healthOk === false && (
              <div data-testid="health-error" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <div className="font-semibold">Backend unreachable</div>
                <div className="mt-1">Set <code className="rounded bg-red-100 px-1 py-0.5 font-mono-alt text-xs">REACT_APP_BACKEND_URL</code> in <code>frontend/.env</code> to your backend origin, then restart <code>yarn start</code>.</div>
                <div className="mt-2 break-all font-mono-alt text-xs text-red-700">Currently: {API}</div>
              </div>
            )}

            <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Try an example</div>
              <div className="mt-3 space-y-2">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={ex.name}
                    type="button"
                    data-testid={`example-${i}`}
                    onClick={() => applyExample(ex)}
                    className="card-hover flex w-full items-start gap-3 rounded-md border border-neutral-800 bg-neutral-950 p-3 text-left"
                  >
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <div>
                      <div className="font-display text-sm font-semibold text-neutral-50">{ex.name}</div>
                      <div className="text-xs text-neutral-500">{ex.industry} · {ex.audience}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <form onSubmit={submit} className="lg:col-span-8" data-testid="blueprint-form">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-8 shadow-sm lg:p-10">
            <FieldRow icon={Building2} label="Startup Name" hint="A distinct, memorable name">
              <Input data-testid="input-startup-name" value={form.startup_name} onChange={update("startup_name")} placeholder="e.g. SprintDeck" className="h-12 text-base" disabled={loading} />
            </FieldRow>
            <FieldRow icon={Target} label="Industry" hint="Choose the closest match">
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((ind) => {
                  const active = form.industry === ind;
                  return (
                    <button
                      type="button" key={ind}
                      data-testid={`industry-${ind.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      disabled={loading}
                      onClick={() => setForm((p) => ({ ...p, industry: ind }))}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                        active ? "border-slate-900 gold-btn text-white"
                          : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-slate-400 hover:text-neutral-50"
                      }`}>{ind}</button>
                  );
                })}
              </div>
              <Input data-testid="input-industry-custom" value={form.industry} onChange={update("industry")} placeholder="Or type your own industry" className="mt-3 h-11" disabled={loading} />
            </FieldRow>
            <FieldRow icon={Users} label="Target Audience" hint="Who feels the pain today?">
              <Input data-testid="input-target-audience" value={form.target_audience} onChange={update("target_audience")} placeholder="e.g. Early-stage founders and product managers" className="h-12 text-base" disabled={loading} />
            </FieldRow>
            <FieldRow icon={Sparkles} label="Startup Idea" hint="A short paragraph is ideal (2–4 sentences)">
              <Textarea data-testid="input-startup-idea" value={form.startup_idea} onChange={update("startup_idea")} rows={7} placeholder="Describe the problem, your solution, and what makes it different." className="text-base leading-relaxed" disabled={loading} />
              <div className="mt-1 text-xs text-neutral-500">{form.startup_idea.length} characters</div>
            </FieldRow>

            <div className="mt-10 flex flex-col items-start gap-3 border-t border-neutral-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <div data-testid="progress-label" className="text-sm text-neutral-500">
                {loading
                  ? `Analyst agents working… ${doneCount}/${totalCount} sections · ${elapsed}s`
                  : "14 agents will run in parallel. Typical time: 60–120 seconds."}
              </div>
              <Button
                type="submit" data-testid="submit-blueprint" disabled={loading}
                className="group h-12 rounded-full gold-btn px-7 text-base disabled:opacity-70">
                {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating…</>)
                  : (<>Generate blueprint<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>)}
              </Button>
            </div>

            {loading && (
              <div data-testid="progress-panel" className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                <div className="mb-3 flex items-baseline justify-between">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">Agent status</div>
                  <div className="font-mono-alt text-sm text-neutral-500">{pct}%</div>
                </div>
                <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <ul className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                  {SECTION_ORDER.map((key) => (
                    <li key={key} data-testid={`agent-${key}`} className="flex items-center gap-2 text-sm text-neutral-300">
                      <StatusIcon status={progress[key]} />
                      <span>{SECTION_LABELS[key]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

function FieldRow({ icon: Icon, label, hint, children }) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-amber-400" />
        <Label className="font-display text-sm font-semibold tracking-tight text-neutral-50">{label}</Label>
      </div>
      {hint ? <div className="mb-3 text-xs text-neutral-500">{hint}</div> : null}
      {children}
    </div>
  );
}
