export function PageLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-brand-blue-deep px-6 py-16 text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20 blueprint-grid"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[min(80vw,30rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[min(64vw,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
      />
      <div className="relative flex max-w-lg flex-col items-center text-center">
        <div
          aria-hidden="true"
          className="flex size-20 items-center justify-center border border-white/25 bg-white/10 text-3xl font-extrabold tracking-tight text-white shadow-xl backdrop-blur-sm sm:size-24 sm:text-4xl"
        >
          S<span className="text-brand-orange">V</span>G
        </div>
        <p className="mt-8 text-xl font-semibold tracking-tight sm:text-2xl">
          Sree Vijeyaganapathi &amp; Co.
        </p>
        <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65 sm:text-xs">
          People. Precision. Possibilities.
        </p>
        <div aria-hidden="true" className="mt-10 flex items-center gap-2">
          <span className="size-2 rounded-full bg-brand-orange motion-safe:animate-pulse" />
          <span className="size-2 rounded-full bg-white/50 motion-safe:animate-pulse" />
          <span className="size-2 rounded-full bg-white/25 motion-safe:animate-pulse" />
        </div>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-white/65">
          Loading jobs…
        </p>
      </div>
    </div>
  );
}
