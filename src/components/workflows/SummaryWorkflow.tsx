import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, Download, Sparkles, Clock, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { summarizationAPI } from "@/services/api";
import type { SummarizationSettings } from "@/hooks/useVideoState";

interface Props {
  fileId: string | null;
  fileName?: string;
  summary: string | null;
  isProcessing: boolean;
  settings: SummarizationSettings;
  onSettingsChange: (settings: SummarizationSettings) => void;
  onSummaryUpdate: (summary: string) => void;
  onStatusChange: (status: 'summarizing' | 'summarized' | 'error') => void;
  onChunkDurationChange: (value: number) => void;
}

interface ParsedSummary {
  tldr: string[];
  chapters: { time: string; title: string }[];
  rest: string;
}

const parseSummary = (text: string): ParsedSummary => {
  if (!text) return { tldr: [], chapters: [], rest: "" };
  const tldrMatch = text.match(/TL;DR[:\s]*([\s\S]*?)(?=\n\s*(?:Full Summary|##|\[\d{2}:\d{2}:\d{2}])|$)/i);
  const tldrRaw = tldrMatch ? tldrMatch[1] : "";
  const tldr = tldrRaw
    .split(/\n+/)
    .map(l => l.replace(/^[-*•\d.\s]+/, "").replace(/\*\*/g, "").trim())
    .filter(l => l.length > 3)
    .slice(0, 6);

  const chapterRegex = /\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*([^\n]+)/g;
  const chapters: { time: string; title: string }[] = [];
  let m;
  while ((m = chapterRegex.exec(text)) !== null) {
    chapters.push({ time: m[1], title: m[2].trim() });
  }

  return { tldr, chapters, rest: text };
};

const CHUNK_OPTIONS = [30, 60, 120, 300];

const SummaryWorkflow = ({
  fileId,
  fileName,
  summary,
  isProcessing,
  settings,
  onSettingsChange,
  onSummaryUpdate,
  onStatusChange,
  onChunkDurationChange,
}: Props) => {
  const { toast } = useToast();
  const [localSummary, setLocalSummary] = useState(summary ?? "");
  const [showPrompts, setShowPrompts] = useState(false);

  const updateSetting = <K extends keyof SummarizationSettings>(key: K, value: SummarizationSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const effectiveSummary = summary ?? localSummary;
  const parsed = useMemo(() => parseSummary(effectiveSummary), [effectiveSummary]);

  const handleGenerate = async () => {
    if (!fileId) return;
    onStatusChange("summarizing");
    onSummaryUpdate("");
    setLocalSummary("");
    let acc = "";
    try {
      await summarizationAPI.summarizeVideo(
        {
          id: fileId,
          model: settings.model,
          chunk_duration: settings.chunkDuration,
          prompt: settings.prompt,
          caption_summarization_prompt: settings.captionSummarizationPrompt || undefined,
          summary_aggregation_prompt: settings.summaryAggregationPrompt || undefined,
          enable_chat: settings.enableChat,
          enable_chat_history: settings.enableChatHistory,
          enable_audio: settings.enableAudio,
        },
        (chunk) => {
          acc += chunk;
          setLocalSummary(acc);
          onSummaryUpdate(acc);
        }
      );
      onStatusChange("summarized");
      toast({ title: "Summary ready", description: "TL;DR and timestamped chapters generated." });
    } catch (e) {
      console.error(e);
      onStatusChange("error");
      toast({ title: "Summarisation failed", description: "Check the backend connection.", variant: "destructive" });
    }
  };

  const handleDownload = () => {
    if (!effectiveSummary) {
      toast({ title: "No summary yet", description: "Generate a summary first.", variant: "destructive" });
      return;
    }
    const md = `# NVIDIA Masterclass — VSS Summary

**Generated:** ${new Date().toISOString()}
**Source:** ${fileName ?? "Masterclass recording"}

---

${effectiveSummary}
`;
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nvidia-masterclass-summary-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4 justify-between border-b border-border pb-5">
        <div>
          <h3 className="font-bold text-lg tracking-tight">Generate timestamped summary</h3>
          <p className="text-sm text-muted-foreground mt-1">
            VSS chunks the recording, captions each segment, and aggregates a TL;DR plus chapter list.
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
              Chunk duration
            </label>
            <div className="flex border border-border rounded-sm overflow-hidden">
              {CHUNK_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => onChunkDurationChange(opt)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    settings.chunkDuration === opt
                      ? "bg-black text-white"
                      : "bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  {opt}s
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={!fileId || isProcessing}
            className="bg-[hsl(var(--nv-green))] hover:bg-[hsl(var(--nv-green))]/90 text-black font-semibold rounded-sm"
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" />Generate summary</>
            )}
          </Button>
        </div>
      </div>

      <Collapsible open={showPrompts} onOpenChange={setShowPrompts}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-sm">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />
            Advanced prompts
            {showPrompts ? <ChevronUp className="w-3.5 h-3.5 ml-2" /> : <ChevronDown className="w-3.5 h-3.5 ml-2" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Analysis prompt
            </Label>
            <Textarea
              id="prompt"
              value={settings.prompt}
              onChange={(e) => updateSetting('prompt', e.target.value)}
              placeholder="Describe what the VLM should look for in each chunk…"
              className="min-h-[90px] text-xs resize-y"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="caption-prompt" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Caption summarization prompt
            </Label>
            <Textarea
              id="caption-prompt"
              value={settings.captionSummarizationPrompt}
              onChange={(e) => updateSetting('captionSummarizationPrompt', e.target.value)}
              placeholder="How per-chunk captions should be summarised…"
              className="min-h-[80px] text-xs resize-y"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aggregation-prompt" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Summary aggregation prompt
            </Label>
            <Textarea
              id="aggregation-prompt"
              value={settings.summaryAggregationPrompt}
              onChange={(e) => updateSetting('summaryAggregationPrompt', e.target.value)}
              placeholder="How chunk summaries should be combined into TL;DR + chapters…"
              className="min-h-[80px] text-xs resize-y"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {!effectiveSummary && !isProcessing && (
        <div className="border border-dashed border-border rounded-md p-10 text-center text-muted-foreground text-sm">
          Upload a Masterclass and click <span className="font-semibold text-foreground">Generate summary</span> to begin.
        </div>
      )}

      {(parsed.tldr.length > 0) && (
        <div className="bg-black text-white rounded-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[hsl(var(--nv-green))]" />
            <span className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--nv-green))] font-semibold">TL;DR</span>
          </div>
          <ul className="space-y-2.5">
            {parsed.tldr.map((line, i) => (
              <li key={i} className="flex gap-3 text-base leading-relaxed">
                <span className="text-[hsl(var(--nv-green))] font-bold flex-shrink-0">→</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {parsed.chapters.length > 0 && (
        <div className="border border-border rounded-md">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">
              Full Summary · {parsed.chapters.length} chapters
            </span>
          </div>
          <ol className="divide-y divide-border">
            {parsed.chapters.map((ch, i) => (
              <li key={i} className="flex gap-5 px-5 py-3.5 hover:bg-secondary/50">
                <span className="font-mono text-xs text-[hsl(var(--nv-green))] font-semibold pt-0.5 w-20 flex-shrink-0">
                  [{ch.time}]
                </span>
                <span className="text-sm text-foreground leading-relaxed">{ch.title}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {effectiveSummary && parsed.tldr.length === 0 && parsed.chapters.length === 0 && (
        <div className="border border-border rounded-md p-5 whitespace-pre-wrap text-sm text-foreground leading-relaxed font-mono">
          {effectiveSummary}
        </div>
      )}

      {effectiveSummary && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleDownload} className="rounded-sm">
            <Download className="w-4 h-4 mr-2" />
            Download Markdown report
          </Button>
        </div>
      )}
    </div>
  );
};

export default SummaryWorkflow;
