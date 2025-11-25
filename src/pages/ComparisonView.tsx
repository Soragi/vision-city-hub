import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Maximize2, Grid3x3 } from "lucide-react";
import SyncedVideoPlayer from "@/components/SyncedVideoPlayer";
import VideoTimeline from "@/components/VideoTimeline";
import CrossStreamEvents from "@/components/CrossStreamEvents";
import { useToast } from "@/hooks/use-toast";

interface ComparisonVideo {
  streamId: number;
  file: File;
  fileId?: string;
  events?: VideoEvent[];
}

interface VideoEvent {
  id: string;
  timestamp: number;
  type: string;
  description: string;
  confidence: number;
}

const ComparisonView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [videos, setVideos] = useState<ComparisonVideo[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [layout, setLayout] = useState<'2-up' | '3-up' | '4-up'>('2-up');
  const [crossStreamEvents, setCrossStreamEvents] = useState<any[]>([]);
  
  const videoRefs = useRef<HTMLVideoElement[]>([]);

  useEffect(() => {
    // Get selected videos from location state
    const selectedVideos = location.state?.videos as ComparisonVideo[];
    if (!selectedVideos || selectedVideos.length < 2) {
      toast({
        title: "No Videos Selected",
        description: "Please select at least 2 videos to compare",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    setVideos(selectedVideos);
    
    // Mock events - in production, these would come from AI analysis
    const mockEvents = selectedVideos.map((video, idx) => ({
      ...video,
      events: generateMockEvents(idx),
    }));
    setVideos(mockEvents);
  }, [location.state, navigate, toast]);

  useEffect(() => {
    // Detect cross-stream events
    if (videos.length >= 2) {
      const correlatedEvents = detectCrossStreamEvents(videos);
      setCrossStreamEvents(correlatedEvents);
    }
  }, [videos, currentTime]);

  const generateMockEvents = (streamIdx: number): VideoEvent[] => {
    return [
      {
        id: `event-${streamIdx}-1`,
        timestamp: 5 + streamIdx * 2,
        type: 'motion',
        description: 'Motion detected',
        confidence: 0.85,
      },
      {
        id: `event-${streamIdx}-2`,
        timestamp: 15 + streamIdx * 3,
        type: 'person',
        description: 'Person detected',
        confidence: 0.92,
      },
      {
        id: `event-${streamIdx}-3`,
        timestamp: 30 + streamIdx * 2,
        type: 'vehicle',
        description: 'Vehicle detected',
        confidence: 0.78,
      },
    ];
  };

  const detectCrossStreamEvents = (videos: ComparisonVideo[]) => {
    const correlations: any[] = [];
    const timeWindow = 3; // 3 second window for correlation

    videos.forEach((video1, idx1) => {
      videos.forEach((video2, idx2) => {
        if (idx1 >= idx2) return;

        video1.events?.forEach((event1) => {
          video2.events?.forEach((event2) => {
            if (
              Math.abs(event1.timestamp - event2.timestamp) <= timeWindow &&
              event1.type === event2.type
            ) {
              correlations.push({
                id: `corr-${event1.id}-${event2.id}`,
                timestamp: (event1.timestamp + event2.timestamp) / 2,
                streams: [video1.streamId, video2.streamId],
                type: event1.type,
                description: `${event1.type} detected in multiple streams`,
                timeDiff: Math.abs(event1.timestamp - event2.timestamp),
              });
            }
          });
        });
      });
    });

    return correlations;
  };

  const handlePlayPause = () => {
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    
    videoRefs.current.forEach((video) => {
      if (video) {
        if (newIsPlaying) {
          video.play();
        } else {
          video.pause();
        }
      }
    });
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    videoRefs.current.forEach((video) => {
      if (video) {
        video.currentTime = time;
      }
    });
  };

  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    handleSeek(newTime);
  };

  const handlePlaybackRateChange = (rate: string) => {
    const newRate = parseFloat(rate);
    setPlaybackRate(newRate);
    videoRefs.current.forEach((video) => {
      if (video) {
        video.playbackRate = newRate;
      }
    });
  };

  const getLayoutCols = () => {
    switch (layout) {
      case '2-up':
        return 'grid-cols-2';
      case '3-up':
        return 'grid-cols-3';
      case '4-up':
        return 'grid-cols-2';
      default:
        return 'grid-cols-2';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="h-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-lg font-bold text-foreground">Video Comparison</h1>
            <Badge variant="secondary" className="text-xs">
              {videos.length} Streams
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Select value={layout} onValueChange={(val: any) => setLayout(val)}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <Grid3x3 className="w-3 h-3 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2-up">2-up</SelectItem>
                <SelectItem value="3-up">3-up</SelectItem>
                <SelectItem value="4-up">4-up</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="h-8">
              <Maximize2 className="w-3 h-3 mr-2" />
              Fullscreen
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className={`grid ${getLayoutCols()} gap-3 flex-1 overflow-hidden mb-3`}>
            {videos.slice(0, layout === '2-up' ? 2 : layout === '3-up' ? 3 : 4).map((video, idx) => (
              <SyncedVideoPlayer
                key={video.streamId}
                video={video}
                ref={(el) => {
                  if (el) videoRefs.current[idx] = el;
                }}
                currentTime={currentTime}
                onTimeUpdate={(time) => {
                  if (idx === 0) setCurrentTime(time);
                }}
                onDurationChange={(dur) => {
                  if (idx === 0) setDuration(dur);
                }}
                events={video.events || []}
              />
            ))}
          </div>

          {/* Timeline */}
          <VideoTimeline
            currentTime={currentTime}
            duration={duration}
            events={videos.flatMap((v) => v.events || [])}
            crossStreamEvents={crossStreamEvents}
            onSeek={handleSeek}
          />

          {/* Playback Controls */}
          <Card className="p-3 bg-card border-border mt-3">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSkip(-10)}
                className="h-8 w-8 p-0"
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={handlePlayPause}
                className="h-8 w-8 p-0"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSkip(10)}
                className="h-8 w-8 p-0"
              >
                <SkipForward className="w-4 h-4" />
              </Button>

              <div className="flex-1 flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={(val) => handleSeek(val[0])}
                  className="flex-1"
                />
              </div>

              <Select value={playbackRate.toString()} onValueChange={handlePlaybackRateChange}>
                <SelectTrigger className="w-[80px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>

        {/* Right Panel - Cross-Stream Events */}
        <div className="w-[320px] border-l border-border">
          <CrossStreamEvents
            events={crossStreamEvents}
            currentTime={currentTime}
            onEventClick={(timestamp) => handleSeek(timestamp)}
          />
        </div>
      </div>
    </div>
  );
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default ComparisonView;
