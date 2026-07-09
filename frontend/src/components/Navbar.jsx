import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <header
      data-testid="navbar"
      className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" data-testid="nav-logo" className="group flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 text-white transition-transform group-hover:-translate-y-0.5">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="leading-none">
            <div className="font-display text-lg font-bold tracking-tight text-slate-900">
              Vidur <span className="text-blue-600">AI</span>
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.24em] text-slate-500">
              AI Business Analyst Copilot
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            data-testid="nav-home"
            className={`text-sm font-medium transition-colors ${
              pathname === "/" ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Home
          </Link>
          <a
            href="#features"
            data-testid="nav-features"
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            Product
          </a>
          <a
            href="#how"
            data-testid="nav-how"
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            How it works
          </a>
        </nav>

        <Button
          data-testid="nav-cta"
          onClick={() => navigate("/create")}
          className="rounded-full bg-slate-900 px-5 text-white shadow-sm hover:bg-slate-800"
        >
          Start free
        </Button>
      </div>
    </header>
  );
}
