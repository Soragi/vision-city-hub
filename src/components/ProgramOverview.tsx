import { Calendar, GraduationCap, Wrench, Mic, ChevronRight } from "lucide-react";

type EventType = "Masterclass" | "Workshop" | "Tech Talk" | "Deep Dive";

interface ProgEvent {
  date: string;
  month: string;
  type: EventType;
  title: string;
  description: string;
}

const EVENTS: ProgEvent[] = [
  { date: "Apr 8-10", month: "Apr", type: "Deep Dive", title: "AI Factory Training", description: "Three-day deep dive on building production AI factories with NVIDIA reference architectures." },
  { date: "Apr 22-23", month: "Apr", type: "Masterclass", title: "Industry Solutions", description: "Vertical-specific blueprints across manufacturing, retail, healthcare and telco." },
  { date: "Apr 30", month: "Apr", type: "Tech Talk", title: "Physics NeMo", description: "Inside NVIDIA Physics NeMo for physics-informed AI and simulation workflows." },
  { date: "Jun 2-4", month: "Jun", type: "Workshop", title: "AI Factory Training", description: "Hands-on workshop covering Base Command, Run:ai, NIM and observability." },
  { date: "Jun 9-10", month: "Jun", type: "Masterclass", title: "Agentic AI", description: "Designing, evaluating and deploying agentic systems with NVIDIA NIM and NeMo." },
  { date: "Jun 25", month: "Jun", type: "Tech Talk", title: "Quarterly Update", description: "What's new across the NVIDIA partner stack." },
  { date: "Jul 7-9", month: "Jul", type: "Workshop", title: "AI Factory Training", description: "Operationalising the AI factory: storage, networking, scheduling and SLOs." },
  { date: "Sep 8-10", month: "Sep", type: "Workshop", title: "AI Factory Training", description: "Advanced operations and capacity planning for partner-built AI factories." },
  { date: "Sep 16-17", month: "Sep", type: "Masterclass", title: "Physical AI", description: "Robotics, Isaac, Cosmos world foundation models, and digital twins with Omniverse." },
  { date: "Sep 30", month: "Sep", type: "Tech Talk", title: "Quarterly Update", description: "Roadmap and partner spotlights." },
  { date: "Nov 3-5", month: "Nov", type: "Workshop", title: "AI Factory Training", description: "End-of-year intensive on the latest stack updates." },
  { date: "Nov 11-12", month: "Nov", type: "Masterclass", title: "AI Factory", description: "Reference architectures and customer case studies for AI factories at scale." },
  { date: "Nov 26", month: "Nov", type: "Tech Talk", title: "Quarterly Update", description: "Year-in-review and 2027 preview." },
];

const TYPE_META: Record<EventType, { Icon: typeof Calendar; color: string }> = {
  Masterclass: { Icon: GraduationCap, color: "bg-[hsl(var(--nv-green))] text-black" },
  Workshop: { Icon: Wrench, color: "bg-black text-white" },
  "Tech Talk": { Icon: Mic, color: "bg-white text-black border border-border" },
  "Deep Dive": { Icon: GraduationCap, color: "bg-foreground text-background" },
};

const MONTHS = ["Apr", "Jun", "Jul", "Sep", "Nov"];

const ProgramOverview = () => {
  return (
    <section id="schedule" className="bg-[hsl(var(--nv-offwhite))] border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[hsl(var(--nv-green))] font-semibold mb-3">
              Program overview · 2026
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight max-w-2xl">
              Year-round masterclasses, workshops and tech talks for NVIDIA partners.
            </h2>
          </div>
          <a
            href="https://www.nvidia.com/en-gb/about-nvidia/partners/partner-expert-program/"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-foreground hover:text-[hsl(var(--nv-green))] inline-flex items-center gap-1"
          >
            Full program details <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Month strip */}
        <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2">
          {MONTHS.map((m) => (
            <div
              key={m}
              className="flex-shrink-0 px-5 py-2 rounded-sm border border-border bg-card text-sm font-semibold tracking-wide"
            >
              {m} 2026
            </div>
          ))}
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {EVENTS.map((e) => {
            const meta = TYPE_META[e.type];
            const Icon = meta.Icon;
            return (
              <article
                key={e.date + e.title}
                className="group bg-card border border-border rounded-md overflow-hidden hover:border-foreground transition-colors flex flex-col"
              >
                <div className="aspect-[16/9] bg-black relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--nv-green))]/30 via-black to-black" />
                  <Icon className="absolute right-4 bottom-4 w-10 h-10 text-white/70" strokeWidth={1.25} />
                  <div className="absolute top-4 left-4 text-white">
                    <div className="text-[11px] uppercase tracking-[0.22em] opacity-70">{e.month} 2026</div>
                    <div className="text-2xl font-bold mt-1">{e.date.replace(/^[A-Za-z]+\s/, "")}</div>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <span className={`inline-flex items-center gap-1.5 self-start text-[10px] uppercase tracking-[0.18em] font-semibold px-2 py-1 rounded-sm mb-3 ${meta.color}`}>
                    <Icon className="w-3 h-3" />
                    {e.type}
                  </span>
                  <h3 className="font-bold text-lg leading-tight tracking-tight mb-2">{e.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{e.description}</p>
                  <a
                    href="https://www.nvidia.com/en-gb/about-nvidia/partners/partner-expert-program/"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 text-sm font-semibold text-foreground group-hover:text-[hsl(var(--nv-green))] inline-flex items-center gap-1"
                  >
                    Register <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProgramOverview;
