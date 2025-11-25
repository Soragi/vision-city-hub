import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitCompareArrows, Clock, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface CrossStreamEvent {
  id: string;
  timestamp: number;
  streams: number[];
  type: string;
  description: string;
  timeDiff: number;
}

interface CrossStreamEventsProps {
  events: CrossStreamEvent[];
  currentTime: number;
  onEventClick: (timestamp: number) => void;
}

const CrossStreamEvents = ({ events, currentTime, onEventClick }: CrossStreamEventsProps) => {
  const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

  const isEventActive = (timestamp: number) => {
    return Math.abs(timestamp - currentTime) < 2;
  };

  const getSeverityBadge = (timeDiff: number) => {
    if (timeDiff < 1) {
      return { variant: 'destructive' as const, label: 'Simultaneous' };
    } else if (timeDiff < 2) {
      return { variant: 'default' as const, label: 'Near-sync' };
    } else {
      return { variant: 'secondary' as const, label: 'Related' };
    }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <GitCompareArrows className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Cross-Stream Events</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Correlated events detected across multiple streams
        </p>
      </div>

      {events.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="space-y-2">
            <GitCompareArrows className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground max-w-[200px]">
              No cross-stream events detected yet. Events will appear when similar activities
              occur across multiple streams.
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {sortedEvents.map((event) => {
              const severity = getSeverityBadge(event.timeDiff);
              const isActive = isEventActive(event.timestamp);

              return (
                <Card
                  key={event.id}
                  className={cn(
                    "p-3 bg-secondary border transition-all cursor-pointer hover:border-primary/50",
                    isActive && "border-primary ring-2 ring-primary/20"
                  )}
                  onClick={() => onEventClick(event.timestamp)}
                >
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <Badge variant={severity.variant} className="text-[10px] h-4">
                        {severity.label}
                      </Badge>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTime(event.timestamp)}
                      </div>
                    </div>

                    {/* Event Type */}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-xs font-semibold text-foreground capitalize">
                        {event.type}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-snug">
                      {event.description}
                    </p>

                    {/* Streams */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">Streams:</span>
                      <div className="flex gap-1">
                        {event.streams.map((streamId) => (
                          <Badge
                            key={streamId}
                            variant="outline"
                            className="text-[10px] h-4 px-1.5"
                          >
                            {streamId}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Time Difference */}
                    {event.timeDiff > 0 && (
                      <div className="text-[10px] text-muted-foreground">
                        Time difference: {event.timeDiff.toFixed(1)}s
                      </div>
                    )}

                    {/* Action Button */}
                    {!isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-6 text-xs mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event.timestamp);
                        }}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Jump to Event
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* Statistics */}
      {events.length > 0 && (
        <div className="p-4 border-t border-border">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-foreground">{events.length}</div>
              <div className="text-[10px] text-muted-foreground">Total Events</div>
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">
                {events.filter((e) => e.timeDiff < 1).length}
              </div>
              <div className="text-[10px] text-muted-foreground">Simultaneous</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default CrossStreamEvents;
