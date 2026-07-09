import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import {
  ArrowRight, Compass, FileText, Layers, Rocket, ShieldCheck, Sparkles, Zap,
  LineChart, Users, MessageSquare, Star, CheckCircle2, PlayCircle,
} from "lucide-react";
import { api, humanizeError } from "../lib/api";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  { icon: LineChart, title: "Startup Viability Score", body: "0–100 investor-grade score across five dimensions." },
  { icon: Compass, title: "Business Model Canvas", body: "All 9 canvas blocks — partners, value, channels, revenue." },
  { icon: Users, title: "Market & Competitor Intel", body: "TAM · SAM · SOM with a direct-competitor teardown." },
  { icon: ShieldCheck, title: "Risk Register", body: "Ranked risks with concrete mitigation plans." },
  { icon: Layers, title: "Requirements & Backlog", body: "Requirements, user stories, and a prioritized backlog." },
  { icon: Rocket, title: "Phased Roadmap", body: "A realistic development plan from discovery to go-to-market." },
  { icon: MessageSquare, title: "Copilot Chat", body: "Ask questions grounded in your generated blueprint." },
  { icon: FileText, title: "Investor PDF", body: "Boardroom-quality PDF ready to attach to a warm intro." },
];

const STEPS = [
  { n: "01", title: "Describe your idea", body: "Startup name, industry, target audience, and the idea." },
  { n: "02", title: "AI agents synthesize", body: "Fourteen analyst agents produce every section in parallel." },
  { n: "03", title: "Review, chat, export", body: "Explore the dashboard, chat with the Copilot, export a PDF." },
];

const TESTIMONIALS = [
  { quote: "The blueprint reads like a $10k McKinsey deliverable. In 90 seconds.", who: "Solo founder, Fintech" },
  { quote: "The Copilot pushed back on my pricing assumption. That saved us runway.", who: "CEO, HealthTech" },
  { quote: "We use it to screen ideas for our accelerator cohort now.", who: "Program Director, Incubator" },
];

export default function Home() {
  const navigate = useNavigate();
  const [demoBusy, setDemoBusy] = useState(false);

  const launchDemo = async () => {
    setDemoBusy(true);
    try {
      const { data } = await api.post("/blueprint/demo");
      toast.success("Demo blueprint loaded");
      navigate(`/results/${data.id}`);
    } catch (e) {
      toast.error(humanizeError(e));
    } finally {
      setDemoBusy(false);
    }
  };

  return (
    <main data-testid="home-page" className="text-neutral-100">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="grid-bg-dark absolute inset-0 opacity-60" aria-hidden />
        <div className="absolute -top-40 left-1/2 -z-10 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-500/15 via-transparent to-transparent blur-3xl" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-24 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-32">
          <div className="fade-up lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/5 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300/90">
                AI Business Analyst · Public beta
              </span>
            </div>
            <h1 className="font-display text-5xl font-black leading-[1.02] tracking-tighter text-neutral-50 sm:text-6xl lg:text-7xl">
              Turn a startup idea<br />into an investor-ready<br />
              <span className="gold-text">business blueprint.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-400">
              Vidur AI is the <b className="text-neutral-100">AI Business Analyst Copilot</b> for
              founders, operators, and investors. Describe an idea → get a full
              14-section blueprint, a viability score, competitor intel, and a
              live chat copilot that already knows your plan.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/create">
                <button
                  data-testid="hero-cta-primary"
                  className="gold-btn group inline-flex h-12 items-center rounded-full px-7 text-base"
                >
                  Generate my blueprint
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <button
                data-testid="hero-cta-demo"
                onClick={launchDemo}
                disabled={demoBusy}
                className="inline-flex h-12 items-center rounded-full border border-neutral-800 bg-neutral-900/60 px-6 text-sm font-medium text-neutral-200 backdrop-blur transition-colors hover:border-amber-400/40 hover:text-amber-300"
              >
                <PlayCircle className="mr-2 h-4 w-4 text-amber-400" />
                {demoBusy ? "Loading demo…" : "See a live demo blueprint"}
              </button>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-6 border-t border-neutral-900 pt-8">
              <Stat value="14" label="Sections" />
              <Stat value="0–100" label="Viability" />
              <Stat value="Copilot" label="Live chat" />
            </div>
          </div>

          <div className="fade-up delay-2 lg:col-span-5">
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-amber-500/10 via-transparent to-amber-300/5 blur-2xl" aria-hidden />
              <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-black shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between border-b border-neutral-900 bg-neutral-950/70 px-4 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-neutral-700" />
                    <span className="h-2 w-2 rounded-full bg-neutral-700" />
                    <span className="h-2 w-2 rounded-full bg-neutral-700" />
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                    Blueprint · Preview
                  </div>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1559223694-98ed5e272fef?auto=format&fit=crop&w=1200&q=80"
                  alt="Founder pitching on stage"
                  className="h-[380px] w-full object-cover opacity-90"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 hidden max-w-xs rounded-xl border border-amber-500/25 bg-neutral-950/90 p-4 shadow-2xl shadow-black/50 backdrop-blur md:block">
                <div className="eyebrow">Viability Score</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <div className="font-display text-5xl font-black gold-text">87</div>
                  <div className="text-sm font-semibold text-neutral-500">/100</div>
                </div>
                <div className="mt-1 text-xs text-neutral-400">
                  Strong PMF · Defensible moat · High market growth
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Investor-ready
                </div>
              </div>
              <div className="absolute -top-4 -right-4 hidden rounded-xl border border-neutral-800 bg-neutral-950/90 p-3 shadow-2xl shadow-black/50 backdrop-blur md:block">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
                  <div className="text-xs font-semibold text-neutral-100">Copilot</div>
                </div>
                <div className="mt-1 max-w-[160px] text-[11px] text-neutral-500">
                  "Which competitor should I worry about most?"
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by band */}
      <section className="border-b border-neutral-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row lg:px-10">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
            Built for founders, operators, incubators, and investors
          </div>
          <div className="flex items-center gap-6 text-neutral-600">
            {["Solo Founders", "Accelerators", "SMEs", "Consultants", "VCs"].map(t => (
              <span key={t} className="font-display text-sm font-semibold tracking-tight">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="max-w-3xl">
            <div className="eyebrow">The product</div>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-neutral-50 sm:text-5xl">
              A boardroom-quality analysis,<br />in the time it takes to grab a coffee.
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              Every blueprint includes the frameworks investors expect — plus a
              proprietary viability score, market sizing, competitor teardown,
              and a live Copilot chat that already knows your plan.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <div key={f.title} data-testid={`feature-${i}`}
                   className="surface surface-hover fade-up p-6" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-amber-300 to-amber-600 text-black">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold tracking-tight text-neutral-100">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-b border-neutral-900">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-24 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-32">
          <div className="lg:col-span-5">
            <div className="eyebrow">How it works</div>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-neutral-50 sm:text-5xl">
              Three steps<br />from idea to boardroom.
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              Fourteen specialised analyst agents run in parallel to produce
              your report. Every section is grounded in your inputs — no
              generic templates.
            </p>
            <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-900">
              <img
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80"
                alt="Founder working"
                className="h-64 w-full object-cover opacity-80"
              />
            </div>
          </div>
          <div className="lg:col-span-7">
            <ol className="space-y-4">
              {STEPS.map((s, i) => (
                <li key={s.n} data-testid={`step-${i}`}
                    className="surface surface-hover flex gap-6 p-6">
                  <div className="font-display text-4xl font-black tracking-tight text-neutral-800">
                    {s.n}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight text-neutral-100">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-neutral-400">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <Link to="/create">
                <button data-testid="how-cta" className="gold-btn inline-flex h-11 items-center rounded-full px-6 text-sm">
                  Start now <Zap className="ml-2 h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <div className="mb-10 max-w-2xl">
            <div className="eyebrow">Loved by builders</div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-neutral-50 sm:text-4xl">
              Not another AI toy.<br />A working analyst on your team.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <blockquote key={i} className="surface p-6">
                <div className="mb-3 flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-base font-medium leading-relaxed text-neutral-100">"{t.quote}"</p>
                <div className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                  {t.who}
                </div>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-500/10 via-black to-black" aria-hidden />
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-16 md:flex-row md:items-center lg:px-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/90">
              Ready when you are
            </div>
            <h3 className="mt-2 font-display text-3xl font-bold tracking-tight text-neutral-50 sm:text-4xl">
              Pitch smarter. Build faster.
            </h3>
            <p className="mt-2 max-w-lg text-neutral-400">
              Your first blueprint is free. No card. No fluff.
            </p>
          </div>
          <Link to="/create">
            <button data-testid="footer-cta" className="gold-btn inline-flex h-12 items-center rounded-full px-7 text-base">
              Generate my blueprint
              <FileText className="ml-2 h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="font-display text-3xl font-bold tracking-tight text-neutral-50">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">{label}</div>
    </div>
  );
}
