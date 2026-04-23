import { useState, useRef, useEffect } from "react";
import { Upload, Trash2, Film, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MasterclassUploadProps {
  fileId?: string | null;
  status?: 'idle' | 'uploading' | 'uploaded' | 'summarizing' | 'summarized' | 'error';
  uploadProgress?: number;
  error?: string | null;
  onUpload: (file: File) => void;
  onDelete: () => void;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const formatDuration = (s: number) => {
  if (!isFinite(s)) return "—";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

const MasterclassUpload = ({
  fileId,
  status = "idle",
  uploadProgress = 0,
  error,
  onUpload,
  onDelete,
}: MasterclassUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("video/")) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setVideoUrl(url);
    onUpload(f);
  };

  const handleRemove = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setFile(null);
    setVideoUrl(null);
    setDuration(0);
    if (inputRef.current) inputRef.current.value = "";
    onDelete();
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => setDuration(v.duration);
    v.addEventListener("loadedmetadata", onMeta);
    return () => v.removeEventListener("loadedmetadata", onMeta);
  }, [videoUrl]);

  useEffect(() => {
    if (status === "error" && videoUrl && !fileId) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
      setFile(null);
    }
  }, [status, fileId, videoUrl]);

  const StatusPill = () => {
    const base = "inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-sm";
    switch (status) {
      case "uploading":
        return <span className={cn(base, "bg-secondary text-foreground")}><Loader2 className="w-3 h-3 animate-spin" />Uploading</span>;
      case "uploaded":
        return <span className={cn(base, "bg-[hsl(var(--nv-green))]/15 text-[hsl(var(--nv-green))]")}><CheckCircle2 className="w-3 h-3" />Ready</span>;
      case "summarizing":
        return <span className={cn(base, "bg-secondary text-foreground")}><Loader2 className="w-3 h-3 animate-spin" />Analysing</span>;
      case "summarized":
        return <span className={cn(base, "bg-[hsl(var(--nv-green))]/15 text-[hsl(var(--nv-green))]")}><CheckCircle2 className="w-3 h-3" />Summarised</span>;
      case "error":
        return <span className={cn(base, "bg-destructive/15 text-destructive")}><AlertCircle className="w-3 h-3" />Error</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-black flex items-center justify-center">
            <Film className="w-4 h-4 text-[hsl(var(--nv-green))]" />
          </div>
          <div>
            <div className="font-bold text-foreground tracking-tight">Masterclass VSS Review</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Single recording · up to ~1 hour
            </div>
          </div>
        </div>
        <StatusPill />
      </div>

      <div
        className={cn(
          "relative w-full bg-[hsl(var(--video-bg))] aspect-video flex items-center justify-center transition-colors",
          isDragging && !videoUrl && "ring-2 ring-[hsl(var(--nv-green))]"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
      >
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <div className="text-center px-6 py-12">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
              <Upload className="w-7 h-7 text-[hsl(var(--nv-green))]" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">Drop your Masterclass video</h3>
            <p className="text-white/60 text-sm mb-5">
              Drag and drop a long-form recording (~1 h). MP4 or MOV, up to ~5 GB.
            </p>
            <Button
              onClick={() => inputRef.current?.click()}
              className="bg-[hsl(var(--nv-green))] hover:bg-[hsl(var(--nv-green))]/90 text-black font-semibold rounded-sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Browse files
            </Button>
          </div>
        )}

        {status === "uploading" && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/85 backdrop-blur-sm p-3">
            <div className="flex justify-between text-[11px] text-white mb-1.5">
              <span>Uploading…</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-1" />
          </div>
        )}

        {status === "error" && error && (
          <div className="absolute bottom-0 left-0 right-0 bg-destructive/90 backdrop-blur-sm p-3">
            <p className="text-xs text-destructive-foreground text-center">{error}</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {file && (
        <div className="px-5 py-3 border-t border-border flex flex-wrap items-center justify-between gap-3 bg-secondary/40">
          <div className="flex items-center gap-4 text-xs text-foreground min-w-0">
            <span className="font-medium truncate max-w-[280px]">{file.name}</span>
            <span className="text-muted-foreground">{formatBytes(file.size)}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{formatDuration(duration)}</span>
          </div>
          {fileId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive h-7 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Remove
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MasterclassUpload;
