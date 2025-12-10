import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MessageSquare, AlertTriangle, RotateCcw, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { alertsAPI, type Alert } from "@/services/api";

interface ResponsePanelProps {
  summary: string | null;
  fileId: string | null;
  onResetChat?: () => void;
  onGenerateHighlight?: () => void;
  isProcessing?: boolean;
}

const ResponsePanel = ({
  summary,
  fileId,
  onResetChat,
  onGenerateHighlight,
  isProcessing = false,
}: ResponsePanelProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [activeTab, setActiveTab] = useState("response");

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await alertsAPI.getAlerts();
        setAlerts(data);
      } catch (error) {
        console.error("Failed to load alerts:", error);
      }
    };

    if (fileId) {
      loadAlerts();
      const interval = setInterval(loadAlerts, 10000); // Refresh every 10s
      return () => clearInterval(interval);
    }
  }, [fileId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Quality Inspection Results
        </h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-3 border-b border-border">
          <TabsList className="w-full">
            <TabsTrigger value="response" className="flex-1 text-xs">
              <MessageSquare className="w-3 h-3 mr-1" />
              RESPONSE
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex-1 text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              ALERTS
              {alerts.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 px-1 text-[10px]">
                  {alerts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="response" className="flex-1 flex flex-col mt-0 overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground">Processing video...</p>
              </div>
            ) : summary ? (
              <div className="space-y-4">
                {/* Summary Card */}
                <Card className="p-3 bg-secondary border-border">
                  <Collapsible open={showFullSummary} onOpenChange={setShowFullSummary}>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-semibold text-foreground">Production Analysis</h4>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                            {showFullSummary ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <div className="text-xs text-foreground whitespace-pre-wrap">
                        {showFullSummary ? (
                          summary
                        ) : (
                          <div>
                            {summary.slice(0, 200)}
                            {summary.length > 200 && '...'}
                          </div>
                        )}
                      </div>
                    </div>
                  </Collapsible>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onGenerateHighlight}
                    className="w-full justify-start text-xs h-8"
                  >
                    <Sparkles className="w-3 h-3 mr-2" />
                    Generate Defect Report
                  </Button>
                  
                  {onResetChat && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onResetChat}
                      className="w-full justify-start text-xs h-8"
                    >
                      <RotateCcw className="w-3 h-3 mr-2" />
                      Reset Chat
                    </Button>
                  )}
                </div>

                {/* Video Event Summary */}
                <Card className="p-3 bg-secondary border-border">
                  <h4 className="text-xs font-semibold text-foreground mb-2">Production Events</h4>
                  <div className="space-y-2">
                    <div className="text-[10px] text-muted-foreground">
                      Detailed event timeline and defect analysis will appear here after processing
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  Upload production footage and click "Analyze" to see quality inspection results
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="alerts" className="flex-1 flex flex-col mt-0 overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            {alerts.length > 0 ? (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <Card
                    key={alert.id}
                    className="p-3 bg-secondary border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={getSeverityColor(alert.severity)} className="text-[10px] h-4">
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-foreground font-medium mb-1">{alert.type}</p>
                    <p className="text-xs text-muted-foreground">{alert.description}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  No defects detected. Alerts will appear here when quality issues are found
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResponsePanel;
