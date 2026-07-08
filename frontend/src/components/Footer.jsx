export default function Footer() {
  return (
    <footer data-testid="footer" className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 py-10 md:flex-row md:items-center lg:px-10">
        <div>
          <div className="font-display text-base font-bold text-slate-900">Vidur AI</div>
          <div className="text-xs text-slate-500">
            From idea to investor-ready blueprint in minutes.
          </div>
        </div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
          © {new Date().getFullYear()} · Built for founders
        </div>
      </div>
    </footer>
  );
}
