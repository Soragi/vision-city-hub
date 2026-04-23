const NAV = [
  { label: "Overview", href: "#overview" },
  { label: "Masterclass", href: "#masterclass" },
  { label: "Workflows", href: "#workflows" },
  
];

const NvHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2">
            <span className="text-[hsl(var(--nv-green))] font-bold tracking-tight text-lg leading-none">
              NVIDIA
            </span>
            <span className="hidden sm:inline text-xs uppercase tracking-[0.18em] text-white/70 border-l border-white/20 pl-3">
              Partner Expert Program
            </span>
          </a>
        </div>
        <nav className="hidden md:flex items-center gap-7">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm text-white/80 hover:text-[hsl(var(--nv-green))] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default NvHeader;
