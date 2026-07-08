import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Loader2, Sparkles, Target, Users, Building2, Lightbulb } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { startBlueprintJob, getBlueprintJob } from "../lib/api";

const INDUSTRIES = [
  "SaaS", "Fintech", "Healthtech", "Edtech", "E-commerce",
  "AI / ML", "Climate & Sustainability", "Marketplace", "Consumer Mobile",
  "Developer Tools", "Cybersecurity", "Other",
];

const EXAMPLES = [
  {
    name: "SprintDeck",
    industry: "SaaS",
    audience: "Early-stage startup founders and product managers",
    idea: "An AI copilot that turns raw startup ideas into investor-ready blueprints — canvas, SWOT, roadmap and backlog — in under a minute.",
  },
  {
    name: "GreenRoute",
    industry: "Climate & Sustainability",
    audience: "SMB logistics operators in emerging markets",
    idea: "A route optimization platform that reduces last-mile emissions by 30% using real-time traffic and carbon-aware routing.",
  },
];

export default function Create() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    startup_name: "",
    industry: "",
    target_audience: "",
    startup_idea: "",
  });
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const applyExample = (ex) => {
    setForm({
      startup_name: ex.name,
      industry: ex.industry,
      target_audience: ex.audience,
      startup_idea: ex.idea,
    });
    toast.success("Example loaded");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.startup_name || !form.industry || !form.target_audience || form.startup_idea.length < 10) {
      toast.error("Please complete all fields (idea must be at least 10 chars).");
      return;
    }
    setLoading(true);
    try {
      const record = await createBlueprint(form);
      toast.success("Blueprint generated");
      navigate(`/results/${record.id}`);
    } catch (err) {
      const msg = err?.response?.data?.detail || "Generation failed. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main data-testid="create-page" className="bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-24">
        <aside className="lg:col-span-4">
          <div className="sticky top-24">
            <div className="eyebrow">Step 01 · Inputs</div>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Tell us about your startup.
            </h1>
            <p className="mt-4 text-slate-600">
              The more specific your inputs, the sharper the blueprint. Vidur AI
              reads context — industry norms, target audience, and idea nuance.
            </p>

            <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Try an example
              </div>
              <div className="mt-3 space-y-2">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={ex.name}
                    type="button"
                    data-testid={`example-${i}`}
                    onClick={() => applyExample(ex)}
                    className="card-hover flex w-full items-start gap-3 rounded-md border border-slate-200 bg-white p-3 text-left"
                  >
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <div>
                      <div className="font-display text-sm font-semibold text-slate-900">{ex.name}</div>
                      <div className="text-xs text-slate-500">{ex.industry} · {ex.audience}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <form onSubmit={submit} className="lg:col-span-8" data-testid="blueprint-form">
          <div className="rounded-xl border border-slate-200 bg-white p-8 lg:p-10">
            <FieldRow icon={Building2} label="Startup Name" hint="A distinct, memorable name">
              <Input
                data-testid="input-startup-name"
                value={form.startup_name}
                onChange={update("startup_name")}
                placeholder="e.g. SprintDeck"
                className="h-12 text-base"
                disabled={loading}
              />
            </FieldRow>

            <FieldRow icon={Target} label="Industry" hint="Choose the closest match">
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((ind) => {
                  const active = form.industry === ind;
                  return (
                    <button
                      type="button"
                      key={ind}
                      data-testid={`industry-${ind.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      disabled={loading}
                      onClick={() => setForm((p) => ({ ...p, industry: ind }))}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                        active
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900"
                      }`}
                    >
                      {ind}
                    </button>
                  );
                })}
              </div>
              <Input
                data-testid="input-industry-custom"
                value={form.industry}
                onChange={update("industry")}
                placeholder="Or type your own industry"
                className="mt-3 h-11"
                disabled={loading}
              />
            </FieldRow>

            <FieldRow icon={Users} label="Target Audience" hint="Who feels the pain today?">
              <Input
                data-testid="input-target-audience"
                value={form.target_audience}
                onChange={update("target_audience")}
                placeholder="e.g. Early-stage startup founders and product managers"
                className="h-12 text-base"
                disabled={loading}
              />
            </FieldRow>

            <FieldRow icon={Sparkles} label="Startup Idea" hint="A short paragraph is ideal (2-4 sentences)">
              <Textarea
                data-testid="input-startup-idea"
                value={form.startup_idea}
                onChange={update("startup_idea")}
                rows={7}
                placeholder="Describe the problem, your solution, and what makes it different."
                className="text-base leading-relaxed"
                disabled={loading}
              />
              <div className="mt-1 text-xs text-slate-500">
                {form.startup_idea.length} characters
              </div>
            </FieldRow>

            <div className="mt-10 flex flex-col items-start gap-3 border-t border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <div data-testid="progress-label" className="text-sm text-slate-500">
                {loading ? progress || "Working…" : "Generation typically takes 20–60 seconds."}
              </div>
              <Button
                type="submit"
                data-testid="submit-blueprint"
                disabled={loading}
                className="group h-12 rounded-full bg-slate-900 px-7 text-base text-white hover:bg-slate-800 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating blueprint…
                  </>
                ) : (
                  <>
                    Generate blueprint
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
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
        <Icon className="h-4 w-4 text-blue-600" />
        <Label className="font-display text-sm font-semibold tracking-tight text-slate-900">
          {label}
        </Label>
      </div>
      {hint ? <div className="mb-3 text-xs text-slate-500">{hint}</div> : null}
      {children}
    </div>
  );
}
