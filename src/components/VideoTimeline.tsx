import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VideoEvent {
  id: string;
  timestamp: number;
  type: string;
  description: string;
  confidence: number;
}

interface CrossStreamEvent {
  id: string;
  timestamp: number;
  streams: number[];
  type: string;
  description: string;
  timeDiff: number;
}

interface VideoTimelineProps {
  currentTime: number;
  duration: number;
  events: VideoEvent[];
  crossStreamEvents: CrossStreamEvent[];
  onSeek: (time: number) => void;
}

const VideoTimeline = ({
  currentTime,
  duration,
  events,
  crossStreamEvents,
  onSeek,
}: VideoTimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    onSeek(newTime);
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'motion':
        return 'bg-blue-500';
      case 'person':
        return 'bg-green-500';
      case 'vehicle':
        return 'bg-orange-500';
      case 'alert':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const currentPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="p-3 bg-card border-border">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Timeline</span>
          <span>
            {crossStreamEvents.length > 0 &&
              `${crossStreamEvents.length} cross-stream events`}
          </span>
        </div>

        {/* Timeline Bar */}
        <div
          ref={timelineRef}
          className="relative h-16 bg-secondary rounded cursor-pointer group"
          onClick={handleTimelineClick}
        >
          {/* Progress Bar */}
          <div
            className="absolute top-0 left-0 h-full bg-primary/20 rounded transition-all"
            style={{ width: `${currentPercentage}%` }}
          />

          {/* Regular Events */}
          {events.map((event) => {
            const position = duration > 0 ? (event.timestamp / duration) * 100 : 0;
            return (
              <div
                key={event.id}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-1 h-8 rounded-full opacity-60 hover:opacity-100 transition-opacity",
                  getEventColor(event.type)
                )}
                style={{ left: `${position}%` }}
                title={`${event.type} at ${formatTime(event.timestamp)}`}
              />
            );
          })}

          {/* Cross-Stream Events (larger markers) */}
          {crossStreamEvents.map((event) => {
            const position = duration > 0 ? (event.timestamp / duration) * 100 : 0;
            return (
              <div
                key={event.id}
                className="absolute top-1/2 -translate-y-1/2 w-2 h-12 bg-primary rounded-full opacity-80 hover:opacity-100 transition-opacity animate-pulse"
                style={{ left: `${position}%` }}
                title={`Cross-stream: ${event.description} (streams ${event.streams.join(', ')})`}
              />
            );
          })}

          {/* Current Time Indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
            style={{ left: `${currentPercentage}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full" />
          </div>

          {/* Time Markers */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 pb-1">
            {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
              <span
                key={fraction}
                className="text-[9px] text-muted-foreground font-mono"
              >
                {formatTime(duration * fraction)}
              </span>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-muted-foreground">Motion</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-muted-foreground">Person</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span className="text-muted-foreground">Vehicle</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-muted-foreground">Cross-stream</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default VideoTimeline;
