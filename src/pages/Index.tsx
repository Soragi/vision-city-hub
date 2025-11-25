import { useState } from "react";
import VideoUploadCard from "@/components/VideoUploadCard";
import ChatInterface from "@/components/ChatInterface";
import AnalysisPanel from "@/components/AnalysisPanel";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [uploadedVideos, setUploadedVideos] = useState<Map<number, File>>(new Map());

  const handleVideoUpload = (streamId: number, file: File) => {
    setUploadedVideos((prev) => new Map(prev).set(streamId, file));
    toast({
      title: "Video Uploaded",
      description: `Stream ${streamId}: ${file.name}`,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary-foreground">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-foreground">Municipal Video Surveillance</h1>
          </div>
          <div className="h-6 w-px bg-border mx-2" />
          <span className="text-sm text-muted-foreground">AI Video Analysis Agent</span>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Side - Video Grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4">
            <div className="h-full">
              <div className="mb-3">
                <h2 className="text-base font-semibold text-foreground mb-0.5">Video Streams</h2>
                <p className="text-xs text-muted-foreground">
                  Upload video files for each surveillance stream
                </p>
              </div>

              <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((streamId) => (
                  <VideoUploadCard
                    key={streamId}
                    streamId={streamId}
                    onVideoUpload={handleVideoUpload}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Chat Interface */}
          <div className="h-[240px] border-t border-border">
            <ChatInterface />
          </div>
        </div>

        {/* Right Side - Analysis Panel */}
        <div className="w-[320px] hidden xl:block">
          <AnalysisPanel />
        </div>
      </main>
    </div>
  );
};

export default Index;
