import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Sparkles } from "lucide-react";
import { chatAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Props {
  fileId: string | null;
}

interface SearchResult {
  query: string;
  rationale: string;
  raw: string;
}

const SUGGESTIONS = [
  "When does the speaker introduce NIM microservices?",
  "Find every demo of a multimodal model",
  "Show moments where the speaker talks about agentic AI",
];

const SearchWorkflow = ({ fileId }: Props) => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  const handleSearch = async (q?: string) => {
    const finalQuery = (q ?? query).trim();
    if (!finalQuery || !fileId) return;
    setLoading(true);
    setResult(null);
    try {
      const prompt = `You are the NVIDIA VSS Search agent. The user is querying the uploaded Masterclass video.

User query: "${finalQuery}"

Use multi-embedding retrieval and result fusion to identify the most relevant clips. Then critique each candidate clip against the user query before producing a final response.

Respond in this exact format:
RANKED CLIPS:
1. [hh:mm:ss-hh:mm:ss] One-line description of the clip and why it matches.
2. [hh:mm:ss-hh:mm:ss] ...
3. [hh:mm:ss-hh:mm:ss] ...

CRITIQUE:
A short paragraph explaining how you ranked the clips and which is the best answer.

FINAL ANSWER:
A concise direct answer to the user's query, citing timestamps.`;

      const content = await chatAPI.sendMessage(
        [{ role: "user", content: prompt }],
        fileId
      );
      setResult({ query: finalQuery, rationale: content, raw: content });
    } catch (e) {
      console.error(e);
      toast({ title: "Search failed", description: "Backend did not return a response.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h3 className="font-bold text-lg tracking-tight">Natural-language search</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Multi-embedding retrieval, fusion, and an agentic critique step locate exact moments in the Masterclass.
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="What do you want to find in the Masterclass?"
            className="pl-9 h-11 rounded-sm"
            disabled={!fileId || loading}
          />
        </div>
        <Button
          onClick={() => handleSearch()}
          disabled={!fileId || !query.trim() || loading}
          className="bg-[hsl(var(--nv-green))] hover:bg-[hsl(var(--nv-green))]/90 text-black font-semibold rounded-sm h-11 px-5"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Search</>}
        </Button>
      </div>

      {!fileId && (
        <p className="text-xs text-muted-foreground">Upload a Masterclass to enable search.</p>
      )}

      {fileId && !result && !loading && (
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
            Try a suggestion
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => { setQuery(s); handleSearch(s); }}
                className="text-xs border border-border hover:border-[hsl(var(--nv-green))] hover:text-[hsl(var(--nv-green))] rounded-sm px-3 py-2 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="border border-border rounded-md p-8">
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Retrieving clips and running agent critique…
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-secondary rounded-sm w-3/4 animate-pulse" />
            <div className="h-2 bg-secondary rounded-sm w-2/3 animate-pulse" />
            <div className="h-2 bg-secondary rounded-sm w-1/2 animate-pulse" />
          </div>
        </div>
      )}

      {result && (
        <div className="border border-border rounded-md overflow-hidden">
          <div className="bg-black text-white px-5 py-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[hsl(var(--nv-green))]" />
            <span className="text-sm font-semibold">Agent response · "{result.query}"</span>
          </div>
          <pre className="p-5 whitespace-pre-wrap text-sm text-foreground leading-relaxed font-mono">
{result.rationale}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SearchWorkflow;
