const NvFooter = () => {
  return (
    <footer className="bg-black text-white/70 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div className="md:col-span-2">
          <div className="text-[hsl(var(--nv-green))] font-bold text-lg tracking-tight mb-2">NVIDIA</div>
          <p className="text-white/60 leading-relaxed max-w-md">
            Partner Expert Program — Masterclass VSS Review. Powered by the NVIDIA Video Search
            and Summarization blueprint.
          </p>
        </div>
        <div>
          <div className="text-white text-xs uppercase tracking-[0.18em] mb-3">Resources</div>
          <ul className="space-y-2">
            <li><a className="hover:text-[hsl(var(--nv-green))]" href="https://github.com/NVIDIA-AI-Blueprints/video-search-and-summarization" target="_blank" rel="noreferrer">VSS Blueprint</a></li>
            <li><a className="hover:text-[hsl(var(--nv-green))]" href="https://www.nvidia.com/en-gb/about-nvidia/partners/partner-expert-program/" target="_blank" rel="noreferrer">Partner Expert Program</a></li>
          </ul>
        </div>
        <div>
          <div className="text-white text-xs uppercase tracking-[0.18em] mb-3">Workflows</div>
          <ul className="space-y-2">
            <li><a className="hover:text-[hsl(var(--nv-green))]" href="#workflows">Summary</a></li>
            <li><a className="hover:text-[hsl(var(--nv-green))]" href="#workflows">Search</a></li>
            <li><a className="hover:text-[hsl(var(--nv-green))]" href="#workflows">Alerts</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 text-xs text-white/50 flex justify-between flex-wrap gap-3">
          <span>© {new Date().getFullYear()} NVIDIA Corporation</span>
          <span>Masterclass VSS Review</span>
        </div>
      </div>
    </footer>
  );
};

export default NvFooter;
