import { useState, useRef } from "react";
import { Upload, X, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoUploadCardProps {
  streamId: number;
  onVideoUpload: (streamId: number, file: File) => void;
}

const VideoUploadCard = ({ streamId, onVideoUpload }: VideoUploadCardProps) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-card border border-video-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 bg-secondary border-b border-video-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Stream {streamId}</span>
        </div>
        {videoFile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveVideo}
            className="h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div
        className={cn(
          "relative aspect-video bg-video-bg flex items-center justify-center transition-colors",
          isDragging && "bg-secondary/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {videoUrl ? (
          <video
            src={videoUrl}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 p-6">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm text-foreground">Drop video here</p>
              <p className="text-xs text-muted-foreground">or</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-border hover:bg-secondary"
              >
                Click to Upload
              </Button>
            </div>
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
