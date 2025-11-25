import { forwardRef, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Video } from "lucide-react";

interface VideoEvent {
  id: string;
  timestamp: number;
  type: string;
  description: string;
  confidence: number;
}

interface SyncedVideoPlayerProps {
  video: {
    streamId: number;
    file: File;
    fileId?: string;
  };
  currentTime: number;
  events: VideoEvent[];
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
}

const SyncedVideoPlayer = forwardRef<HTMLVideoElement, SyncedVideoPlayerProps>(
  ({ video, currentTime, events, onTimeUpdate, onDurationChange }, ref) => {
    const videoUrl = useRef<string | null>(null);
    const internalRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      videoUrl.current = URL.createObjectURL(video.file);
      return () => {
        if (videoUrl.current) {
          URL.revokeObjectURL(videoUrl.current);
        }
      };
    }, [video.file]);

    useEffect(() => {
      const videoElement = internalRef.current;
      if (!videoElement) return;

      const handleTimeUpdate = () => {
        onTimeUpdate(videoElement.currentTime);
      };

      const handleLoadedMetadata = () => {
        onDurationChange(videoElement.duration);
      };

      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }, [onTimeUpdate, onDurationChange]);

    // Get events near current time (within 2 seconds)
    const activeEvents = events.filter(
      (event) => Math.abs(event.timestamp - currentTime) < 2
    );

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

    return (
      <div className="relative bg-card border border-video-border rounded-lg overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="px-3 py-1.5 bg-secondary border-b border-video-border flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              Stream {video.streamId}
            </span>
          </div>
          <Badge variant="secondary" className="text-[10px] h-4">
            Synced
          </Badge>
        </div>

        {/* Video Container */}
        <div className="relative flex-1 bg-video-bg">
          <video
            ref={(el) => {
              internalRef.current = el;
              if (typeof ref === 'function') {
                ref(el);
              } else if (ref) {
                ref.current = el;
              }
            }}
            src={videoUrl.current || undefined}
            className="w-full h-full object-contain"
            style={{ aspectRatio: '16/9' }}
          />

          {/* Active Events Overlay */}
          {activeEvents.length > 0 && (
            <div className="absolute top-2 right-2 space-y-1">
              {activeEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "px-2 py-1 rounded text-white text-[10px] font-medium flex items-center gap-1",
                    getEventColor(event.type)
                  )}
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  {event.type.toUpperCase()}
                </div>
              ))}
            </div>
          )}

          {/* Timestamp Overlay */}
          <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm px-2 py-1 rounded">
            <span className="text-xs font-mono text-white">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>

        {/* Event Summary */}
        <div className="px-3 py-2 bg-secondary border-t border-video-border">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">
              {events.length} events detected
            </span>
            {activeEvents.length > 0 && (
              <span className="text-primary font-medium">
                {activeEvents.length} active
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

SyncedVideoPlayer.displayName = 'SyncedVideoPlayer';

export default SyncedVideoPlayer;
