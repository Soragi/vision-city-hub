const NvHero = () => {
  return (
    <section className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <div className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[hsl(var(--nv-green))] mb-5">
            Partner Expert Program · 2026
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
            Elevate your expertise.
            <br />
            <span className="text-[hsl(var(--nv-green))]">Unlock what's next.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/75 mb-10 leading-relaxed max-w-2xl">
            Upload an NVIDIA Masterclass recording and let the Video Search and Summarization
            blueprint generate timestamped summaries, retrieve key moments, and surface real-time
            alerts — all from a single source of truth.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#masterclass"
              className="inline-flex items-center gap-2 bg-[hsl(var(--nv-green))] hover:bg-[hsl(var(--nv-green))]/90 text-black font-semibold px-6 py-3 rounded-sm transition-colors"
            >
              Upload Masterclass
              <span aria-hidden>→</span>
            </a>
            <a
              href="#schedule"
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-6 py-3 rounded-sm transition-colors"
            >
              View 2026 schedule
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NvHero;
