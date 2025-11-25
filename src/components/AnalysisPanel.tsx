import { Activity, AlertTriangle, Users, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface AnalysisEvent {
  id: string;
  timestamp: string;
  streamId: number;
  type: "detection" | "alert" | "info";
  description: string;
}

const AnalysisPanel = () => {
  // Mock data - will be replaced with real AI analysis
  const mockEvents: AnalysisEvent[] = [
    {
      id: "1",
      timestamp: new Date().toLocaleTimeString(),
      streamId: 3,
      type: "detection",
      description: "Vehicle detected entering restricted area",
    },
    {
      id: "2",
      timestamp: new Date().toLocaleTimeString(),
      streamId: 1,
      type: "info",
      description: "Normal activity - 5 pedestrians detected",
    },
    {
      id: "3",
      timestamp: new Date().toLocaleTimeString(),
      streamId: 5,
      type: "alert",
      description: "Unusual gathering detected - 15+ people",
    },
  ];

  const stats = [
    { label: "Active Streams", value: "8/8", icon: Video, color: "text-primary" },
    { label: "Detections", value: "127", icon: Activity, color: "text-primary" },
    { label: "People Count", value: "43", icon: Users, color: "text-foreground" },
    { label: "Alerts", value: "2", icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Real-Time Analysis</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-3 bg-secondary border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-3 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">Activity Feed</h3>
        </div>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-3">
            {mockEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 rounded-lg bg-secondary border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge
                    variant={
                      event.type === "alert"
                        ? "destructive"
                        : event.type === "detection"
                        ? "default"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    Stream {event.streamId}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                </div>
                <p className="text-sm text-foreground">{event.description}</p>
              </div>
            ))}

            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground">
                Connect AI to see real-time analysis
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AnalysisPanel;
