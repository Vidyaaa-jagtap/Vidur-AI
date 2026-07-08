import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <header
      data-testid="navbar"
      className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white transition-transform group-hover:-translate-y-0.5">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="leading-none">
            <div className="font-display text-lg font-bold tracking-tight text-slate-900">Vidur AI</div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Startup Blueprint Engine</div>
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
            Features
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
          className="rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800"
        >
          Generate Blueprint
        </Button>
      </div>
    </header>
  );
}
