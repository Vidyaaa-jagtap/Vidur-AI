export default function Footer() {
  return (
    <footer data-testid="footer" className="border-t border-neutral-900 bg-black/60">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 py-10 md:flex-row md:items-center lg:px-10">
        <div>
          <div className="font-display text-lg font-bold text-neutral-50">
            Vidur <span className="gold-text">AI</span>
          </div>
          <div className="text-xs text-neutral-500">
            The AI Business Analyst Copilot for founders, operators, and investors.
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-[0.28em] text-neutral-600">
          © {new Date().getFullYear()} · Made for builders
        </div>
      </div>
    </footer>
  );
}
