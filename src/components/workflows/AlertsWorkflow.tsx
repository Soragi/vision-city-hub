import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Play, Square, ShieldCheck, Radio, AlertTriangle } from "lucide-react";
import { alertsAPI, type Alert } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Props {
  fileId: string | null;
}

const SeverityBadge = ({ severity }: { severity: Alert["severity"] }) => {
  const map = {
    high: "bg-destructive text-destructive-foreground",
    medium: "bg-amber-500 text-black",
    low: "bg-secondary text-foreground",
  } as const;
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm ${map[severity] ?? map.low}`}>
      {severity}
    </span>
  );
};

const AlertList = ({ alerts, empty }: { alerts: Alert[]; empty: string }) => (
  <div className="border border-border rounded-md">
    <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
      <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">
        Live feed · {alerts.length}
      </span>
    </div>
    {alerts.length === 0 ? (
      <div className="p-8 text-center text-sm text-muted-foreground">{empty}</div>
    ) : (
      <ul className="divide-y divide-border max-h-[420px] overflow-auto">
        {alerts.map((a) => (
          <li key={a.id} className="px-4 py-3 hover:bg-secondary/50">
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--nv-green))]" />
                <span className="text-sm font-semibold text-foreground">{a.type}</span>
                <SeverityBadge severity={a.severity} />
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">{a.timestamp}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pl-5">{a.description}</p>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const AlertsPanel = ({ fileId, mode }: { fileId: string | null; mode: "verification" | "realtime" }) => {
  const { toast } = useToast();
  const [rules, setRules] = useState(
    mode === "verification"
      ? "off-topic content, missing slide reference, technical error in demo"
      : "speaker change, new demo started, code on screen, audience question"
  );
  const [running, setRunning] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const intervalRef = useRef<number | null>(null);

  const poll = async () => {
    try {
      const data = await alertsAPI.getAlerts();
      setAlerts(data);
    } catch (e) {
      console.error("Alerts poll failed", e);
    }
  };

  const start = () => {
    if (!fileId) return;
    setRunning(true);
    poll();
    intervalRef.current = window.setInterval(poll, 5000);
    toast({
      title: mode === "verification" ? "Verification started" : "Real-time alerts started",
      description: "Polling /api/alerts/recent every 5s.",
    });
  };

  const stop = () => {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-semibold mb-2">
          {mode === "verification" ? "Verification rules" : "Event triggers"}
        </label>
        <Textarea
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          placeholder="Comma-separated events…"
          className="min-h-[88px] rounded-sm font-mono text-xs"
          disabled={running}
        />
        <p className="text-[11px] text-muted-foreground mt-2">
          Rules are sent to the VLM through the configured <span className="font-mono">events</span> list in <span className="font-mono">nvidia-vss/config.yaml</span>.
        </p>
      </div>
      <div className="flex gap-2">
        {!running ? (
          <Button
            onClick={start}
            disabled={!fileId}
            className="bg-[hsl(var(--nv-green))] hover:bg-[hsl(var(--nv-green))]/90 text-black font-semibold rounded-sm"
          >
            <Play className="w-4 h-4 mr-2" />Start {mode === "verification" ? "verification" : "monitoring"}
          </Button>
        ) : (
          <Button onClick={stop} variant="outline" className="rounded-sm">
            <Square className="w-4 h-4 mr-2" />Stop
          </Button>
        )}
      </div>
      <AlertList
        alerts={alerts}
        empty={running ? "Waiting for the VLM to flag events…" : "Press Start to begin polling."}
      />
    </div>
  );
};

const AlertsWorkflow = ({ fileId }: Props) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h3 className="font-bold text-lg tracking-tight">VLM-powered alerts</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Two agent workflows: verify upstream computer-vision alerts, or run continuous real-time alerting on the recording.
        </p>
      </div>
      <Tabs defaultValue="verification">
        <TabsList className="bg-secondary rounded-sm">
          <TabsTrigger value="verification" className="rounded-sm data-[state=active]:bg-black data-[state=active]:text-white">
            <ShieldCheck className="w-4 h-4 mr-2" />Verification
          </TabsTrigger>
          <TabsTrigger value="realtime" className="rounded-sm data-[state=active]:bg-black data-[state=active]:text-white">
            <Radio className="w-4 h-4 mr-2" />Real-time
          </TabsTrigger>
        </TabsList>
        <TabsContent value="verification" className="mt-6">
          <AlertsPanel fileId={fileId} mode="verification" />
        </TabsContent>
        <TabsContent value="realtime" className="mt-6">
          <AlertsPanel fileId={fileId} mode="realtime" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertsWorkflow;
