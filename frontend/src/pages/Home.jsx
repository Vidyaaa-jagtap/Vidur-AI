import { Link } from "react-router-dom";
import {
  ArrowRight, Compass, FileText, Layers, Rocket, ShieldCheck, Sparkles, Zap,
  LineChart, Users, MessageSquare, Star, CheckCircle2,
} from "lucide-react";
import { Button } from "../components/ui/button";

const FEATURES = [
  { icon: LineChart, title: "Startup Viability Score", body: "0–100 investor-grade score across market potential, PMF, execution, monetization and defensibility." },
  { icon: Compass, title: "Business Model Canvas", body: "The complete 9-block canvas mapping partners, value, channels and revenue." },
  { icon: Users, title: "Market & Competitor Intel", body: "TAM · SAM · SOM, growth drivers and a direct-competitor teardown." },
  { icon: ShieldCheck, title: "Risk Register", body: "Ranked risks across market, tech, financial, regulatory — each with a mitigation plan." },
  { icon: Layers, title: "Requirements & Backlog", body: "Functional requirements, prioritized backlog and user stories your team can start on Monday." },
  { icon: Rocket, title: "Phased Roadmap", body: "A realistic development roadmap from discovery to go-to-market — with milestones." },
  { icon: MessageSquare, title: "Copilot Chat", body: "Ask questions about your blueprint. The Copilot has full context — no re-explaining." },
  { icon: FileText, title: "Investor PDF Export", body: "Boardroom-quality PDF report ready to attach to a warm intro." },
];

const STEPS = [
  { n: "01", title: "Describe your idea", body: "Startup name, industry, target audience and the idea in your own words." },
  { n: "02", title: "AI agents synthesize", body: "Specialised business-analyst agents produce every section in parallel." },
  { n: "03", title: "Review, chat, export", body: "Explore the dashboard, ask follow-ups to the Copilot, and export a polished PDF." },
];

const TESTIMONIALS = [
  { quote: "The blueprint reads like a $10k McKinsey deliverable. In 90 seconds.", who: "Solo founder, Fintech" },
  { quote: "The Copilot pushed back on my pricing assumption. That saved us a runway.", who: "CEO, HealthTech" },
  { quote: "I use it to screen ideas for our accelerator cohort now.", who: "Program Director, Incubator" },
];

export default function Home() {
  return (
    <main data-testid="home-page" className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="grid-bg absolute inset-0 opacity-60" aria-hidden />
        <div className="absolute -top-40 left-1/2 -z-10 h-[540px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-100/60 via-white to-emerald-50/40 blur-3xl" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-24 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-32">
          <div className="fade-up lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                AI Business Analyst · Now in public beta
              </span>
            </div>
            <h1 className="font-display text-5xl font-black leading-[1.02] tracking-tighter text-slate-900 sm:text-6xl lg:text-7xl">
              Turn a startup idea<br />into an investor-ready<br />
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-blue-600 to-slate-900 bg-clip-text text-transparent">
                  business blueprint.
                </span>
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Vidur AI is an <b>AI Business Analyst Copilot</b> for founders,
              operators, and investors. Describe an idea → get a complete
              14-section business blueprint, a viability score, competitor
              intel, and a live chat copilot that already knows your plan.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/create">
                <Button
                  data-testid="hero-cta-primary"
                  className="group h-12 rounded-full bg-slate-900 px-7 text-base text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800"
                >
                  Generate my blueprint
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a
                href="#features"
                data-testid="hero-cta-secondary"
                className="text-sm font-semibold text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline"
              >
                See what's inside →
              </a>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-6 border-t border-slate-200 pt-8">
              <Stat value="14" label="Sections" />
              <Stat value="0–100" label="Viability score" />
              <Stat value="Copilot" label="Live chat" />
            </div>
          </div>

          <div className="fade-up delay-2 lg:col-span-5">
            <div className="relative">
              <div className="absolute -inset-3 -z-10 rounded-2xl bg-gradient-to-tr from-blue-100/60 via-white to-emerald-50/40 blur-2xl" aria-hidden />
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Blueprint · Preview
                </div>
                <img
                  src="https://images.unsplash.com/photo-1559223694-98ed5e272fef?auto=format&fit=crop&w=1200&q=80"
                  alt="Founder pitching on stage"
                  className="h-[380px] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 hidden max-w-xs rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur md:block">
                <div className="eyebrow">Viability Score</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <div className="font-display text-5xl font-black text-blue-600">87</div>
                  <div className="text-sm font-semibold text-slate-400">/100</div>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Strong PMF · Defensible moat · High market growth
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" /> Investor-ready
                </div>
              </div>
              <div className="absolute -top-4 -right-4 hidden rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur md:block">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                  <div className="text-xs font-semibold text-slate-900">Copilot</div>
                </div>
                <div className="mt-1 max-w-[160px] text-[11px] text-slate-500">
                  "Which competitor should I worry about most?"
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted-by band */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row lg:px-10">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Built for founders, operators, incubators, and investors
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            {["Solo Founders", "Accelerators", "SMEs", "Consultants", "VCs"].map(t => (
              <span key={t} className="font-display text-sm font-semibold tracking-tight">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="max-w-3xl">
            <div className="eyebrow">The product</div>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              A boardroom-quality analysis, in the time it takes to grab a coffee.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Every blueprint includes the frameworks investors expect — plus a
              proprietary viability score, market sizing, competitor teardown,
              and a live Copilot chat that already knows your plan.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                data-testid={`feature-${i}`}
                className="card-hover fade-up rounded-xl border border-slate-200 bg-white p-6"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-white">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold tracking-tight text-slate-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-24 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-32">
          <div className="lg:col-span-5">
            <div className="eyebrow">How it works</div>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Three steps from idea to boardroom.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Fourteen specialised analyst agents run in parallel to produce
              your report. Every section is grounded in your inputs — no
              generic templates.
            </p>
            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80"
                alt="Founder working"
                className="h-64 w-full object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-7">
            <ol className="space-y-4">
              {STEPS.map((s, i) => (
                <li
                  key={s.n}
                  data-testid={`step-${i}`}
                  className="card-hover flex gap-6 rounded-xl border border-slate-200 bg-white p-6"
                >
                  <div className="font-display text-4xl font-black tracking-tight text-slate-200">
                    {s.n}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight text-slate-900">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-slate-600">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <Link to="/create">
                <Button
                  data-testid="how-cta"
                  className="h-11 rounded-full bg-blue-600 px-6 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
                >
                  Start now
                  <Zap className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <div className="mb-10 max-w-2xl">
            <div className="eyebrow">Loved by builders</div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Not another AI toy. A working analyst on your team.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <blockquote key={i} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-3 flex gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-base font-medium leading-relaxed text-slate-900">"{t.quote}"</p>
                <div className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {t.who}
                </div>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950" aria-hidden />
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-16 md:flex-row md:items-center lg:px-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">
              Ready when you are
            </div>
            <h3 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Pitch smarter. Build faster.
            </h3>
            <p className="mt-2 max-w-lg text-slate-300">
              Your first blueprint is free. No card. No fluff.
            </p>
          </div>
          <Link to="/create">
            <Button
              data-testid="footer-cta"
              className="h-12 rounded-full bg-white px-7 text-base text-slate-900 hover:bg-slate-100"
            >
              Generate my blueprint
              <FileText className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="font-display text-3xl font-bold tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
    </div>
  );
}
