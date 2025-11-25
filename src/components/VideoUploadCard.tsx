import { useState, useRef, useEffect } from "react";
import { Upload, X, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface VideoUploadCardProps {
  streamId: number;
  onVideoUpload: (streamId: number, file: File) => void;
}

const VideoUploadCard = ({ streamId, onVideoUpload }: VideoUploadCardProps) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      handleVideoFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoFile(file);
    }
  };

  const handleVideoFile = (file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    onVideoUpload(streamId, file);
  };

  const handleRemoveVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl(null);
    setCurrentTime(0);
    setDuration(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const recordingDate = videoFile ? format(new Date(videoFile.lastModified), 'MMM dd, yyyy HH:mm') : '';

  return (
    <div className="bg-card border border-video-border rounded-lg overflow-hidden h-full">
      <div className="px-3 py-1.5 bg-secondary border-b border-video-border flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Video className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">Stream {streamId}</span>
        </div>
        {videoFile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveVideo}
            className="h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      <div
        className={cn(
          "relative w-full bg-video-bg flex items-center justify-center transition-all duration-200",
          "aspect-[16/9]",
          isDragging && "bg-secondary/50 border-2 border-primary border-dashed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full h-full object-cover"
              style={{ aspectRatio: '16/9' }}
            />
            {/* Timestamp Overlay */}
            <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono text-white space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-primary">●</span>
                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              {recordingDate && (
                <div className="text-[10px] text-gray-300">{recordingDate}</div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-4">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-medium text-foreground">Drop video here</p>
              <p className="text-[10px] text-muted-foreground">or</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-border hover:bg-secondary hover:border-primary h-7 text-xs"
              >
                <Upload className="w-3 h-3 mr-1.5" />
                Browse
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">MP4, AVI, MOV</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default VideoUploadCard;
