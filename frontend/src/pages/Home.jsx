import { Link } from "react-router-dom";
import { ArrowRight, Compass, FileText, Layers, Rocket, ShieldCheck, Sparkles, Target, Zap } from "lucide-react";
import { Button } from "../components/ui/button";

const FEATURES = [
  { icon: Compass, title: "Business Model Canvas", body: "A complete 9-block canvas that maps your value chain from partners to revenue streams." },
  { icon: ShieldCheck, title: "SWOT & Risk Analysis", body: "Investor-grade SWOT plus a ranked risk register with mitigation for every threat." },
  { icon: Layers, title: "Requirements & Backlog", body: "Functional requirements, prioritized backlog and user stories ready for your first sprint." },
  { icon: Rocket, title: "Development Roadmap", body: "Phased milestones with realistic timelines — from discovery to go-to-market." },
];

const STEPS = [
  { n: "01", title: "Describe your idea", body: "Share the startup name, industry, target audience and the core idea in your own words." },
  { n: "02", title: "AI drafts your blueprint", body: "Vidur AI synthesizes nine strategic sections tuned to your context in under a minute." },
  { n: "03", title: "Export & pitch", body: "Review the dashboard, then download a polished PDF report for investors and your team." },
];

export default function Home() {
  return (
    <main data-testid="home-page" className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="grid-bg absolute inset-0 opacity-70" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-24 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-32">
          <div className="fade-up lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                Founder / Pitch-Deck Ready
              </span>
            </div>
            <h1 className="font-display text-5xl font-black leading-[1.02] tracking-tighter text-slate-900 sm:text-6xl lg:text-7xl">
              Turn a startup idea<br />into an investor-ready<br />
              <span className="relative inline-block">
                <span className="relative z-10">blueprint.</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-blue-100" aria-hidden />
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Vidur AI converts a paragraph of vision into a nine-section business
              blueprint — canvas, SWOT, risks, roadmap and more. Built for founders,
              consultants and incubators who move fast.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/create">
                <Button
                  data-testid="hero-cta-primary"
                  className="group h-12 rounded-full bg-slate-900 px-7 text-base text-white hover:bg-slate-800"
                >
                  Generate my blueprint
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a
                href="#how"
                data-testid="hero-cta-secondary"
                className="text-sm font-semibold text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline"
              >
                See how it works →
              </a>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-6 border-t border-slate-200 pt-8">
              <Stat value="9" label="Strategic sections" />
              <Stat value="< 60s" label="Time to blueprint" />
              <Stat value="PDF" label="Investor export" />
            </div>
          </div>

          <div className="fade-up delay-2 lg:col-span-5">
            <div className="relative">
              <div className="absolute -inset-3 -z-10 rounded-2xl bg-gradient-to-tr from-blue-50 via-white to-slate-100" aria-hidden />
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1559223694-98ed5e272fef?auto=format&fit=crop&w=1200&q=80"
                  alt="Startup founder on stage"
                  className="h-[420px] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 hidden max-w-xs rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:block">
                <div className="eyebrow">Section preview</div>
                <div className="mt-1 font-display text-base font-semibold text-slate-900">
                  Business Model Canvas
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-6 rounded-sm border border-slate-200 bg-slate-50"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="max-w-3xl">
            <div className="eyebrow">What you get</div>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Nine strategic sections. One coherent blueprint.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Every generation includes the frameworks investors expect — from the
              Business Model Canvas to a phased development roadmap.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                data-testid={`feature-${i}`}
                className="card-hover fade-up rounded-lg border border-slate-200 bg-white p-6"
                style={{ animationDelay: `${i * 0.06}s` }}
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
              We do the heavy strategy lift — you refine, edit and present. Every
              output is structured, editable and export-ready.
            </p>
            <div className="mt-8 overflow-hidden rounded-xl border border-slate-200">
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
                  className="card-hover flex gap-6 rounded-lg border border-slate-200 bg-white p-6"
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
                  className="h-11 rounded-full bg-blue-600 px-6 text-white hover:bg-blue-700"
                >
                  Start now
                  <Zap className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-16 md:flex-row md:items-center lg:px-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">
              Ready when you are
            </div>
            <h3 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Pitch smarter. Build faster.
            </h3>
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
