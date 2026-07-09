import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const link = (to, testid, label) => (
    <Link
      to={to}
      data-testid={testid}
      className={`text-sm font-medium transition-colors ${
        pathname === to ? "text-amber-300" : "text-neutral-400 hover:text-neutral-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header
      data-testid="navbar"
      className="sticky top-0 z-40 w-full border-b border-neutral-900/70 bg-black/60 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" data-testid="nav-logo" className="group flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-black shadow-lg shadow-amber-500/20 transition-transform group-hover:-translate-y-0.5">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="leading-none">
            <div className="font-display text-xl font-bold tracking-tight text-neutral-50">
              Vidur <span className="gold-text">AI</span>
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-neutral-500">
              AI Business Analyst Copilot
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {link("/", "nav-home", "Home")}
          <a href="#features" data-testid="nav-features"
             className="text-sm font-medium text-neutral-400 transition-colors hover:text-neutral-100">Product</a>
          <a href="#how" data-testid="nav-how"
             className="text-sm font-medium text-neutral-400 transition-colors hover:text-neutral-100">How it works</a>
        </nav>

        <button
          data-testid="nav-cta"
          onClick={() => navigate("/create")}
          className="gold-btn h-10 rounded-full px-5 text-sm"
        >
          Start free
        </button>
      </div>
    </header>
  );
}
