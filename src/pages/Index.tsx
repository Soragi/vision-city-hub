import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VideoUploadCard from "@/components/VideoUploadCard";
import ChatInterface from "@/components/ChatInterface";
import ResponsePanel from "@/components/ResponsePanel";
import SummarizationSettings from "@/components/SummarizationSettings";
import { Button } from "@/components/ui/button";
import { GitCompareArrows, Shield, Eye, Camera, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVideoState } from "@/hooks/useVideoState";
import { fileAPI, summarizationAPI } from "@/services/api";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    videos,
    updateVideo,
    removeVideo,
    summarizationSettings,
    setSummarizationSettings,
    selectedStreamId,
    setSelectedStreamId,
  } = useVideoState();
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleVideoUpload = async (streamId: number, file: File) => {
    updateVideo(streamId, {
      file,
      status: 'uploading',
      uploadProgress: 0,
      error: null,
    });

    try {
      const fileInfo = await fileAPI.uploadFile(file, (progress) => {
        updateVideo(streamId, { uploadProgress: progress });
      });

      updateVideo(streamId, {
        fileId: fileInfo.id,
        status: 'uploaded',
        uploadProgress: 100,
        error: null,
      });

      toast({
        title: "✓ Footage Uploaded",
        description: `Unit ${streamId}: ${file.name} ready for security analysis`,
      });

      setSelectedStreamId(streamId);
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      updateVideo(streamId, {
        status: 'error',
        error: errorMessage,
        fileId: null,
      });
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleVideoDelete = async (streamId: number) => {
    const video = videos.get(streamId);
    if (!video?.fileId) return;

    try {
      await fileAPI.deleteFile(video.fileId);
      removeVideo(streamId);
      if (selectedStreamId === streamId) {
        setSelectedStreamId(null);
      }
      toast({
        title: "Footage Removed",
        description: `Unit ${streamId} footage cleared`,
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  const handleSummarize = async () => {
    if (!selectedStreamId) {
      toast({
        title: "No Video Selected",
        description: "Please select a video to summarize",
        variant: "destructive",
      });
      return;
    }

    const video = videos.get(selectedStreamId);
    if (!video?.fileId) {
      toast({
        title: "No Video Uploaded",
        description: "Please upload a video first",
        variant: "destructive",
      });
      return;
    }

    updateVideo(selectedStreamId, {
      status: 'summarizing',
      summary: '',
    });

    try {
      let accumulatedSummary = '';

      await summarizationAPI.summarizeVideo(
        {
          id: video.fileId,
          model: summarizationSettings.model,
          chunk_duration: summarizationSettings.chunkDuration,
          prompt: summarizationSettings.prompt,
          caption_summarization_prompt: summarizationSettings.captionSummarizationPrompt || undefined,
          summary_aggregation_prompt: summarizationSettings.summaryAggregationPrompt || undefined,
          enable_chat: summarizationSettings.enableChat,
          enable_chat_history: summarizationSettings.enableChatHistory,
          enable_audio: summarizationSettings.enableAudio,
        },
        (chunk) => {
          accumulatedSummary += chunk;
          updateVideo(selectedStreamId, {
            summary: accumulatedSummary,
          });
        }
      );

      updateVideo(selectedStreamId, {
        status: 'summarized',
        summary: accumulatedSummary,
      });

      toast({
        title: "Security Analysis Complete",
        description: "Surveillance scan completed successfully",
      });
    } catch (error) {
      console.error('Summarization failed:', error);
      updateVideo(selectedStreamId, {
        status: 'error',
        error: 'Summarization failed',
      });
      toast({
        title: "Summarization Failed",
        description: "Failed to analyze video",
        variant: "destructive",
      });
    }
  };

  const selectedVideo = selectedStreamId ? videos.get(selectedStreamId) : undefined;

  const handleCompareSelected = () => {
    const videosToCompare = selectedForComparison
      .map((streamId) => {
        const video = videos.get(streamId);
        if (!video?.file) return null;
        return {
          streamId,
          file: video.file,
          fileId: video.fileId,
        };
      })
      .filter(Boolean);

    if (videosToCompare.length < 2) {
      toast({
        title: "Not Enough Videos",
        description: "Please select at least 2 videos to compare",
        variant: "destructive",
      });
      return;
    }

    navigate('/comparison', { state: { videos: videosToCompare } });
  };

  const toggleComparisonSelection = (streamId: number) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(streamId)) {
        return prev.filter((id) => id !== streamId);
      } else {
        if (prev.length >= 4) {
          toast({
            title: "Maximum Reached",
            description: "You can compare up to 4 videos at once",
            variant: "destructive",
          });
          return prev;
        }
        return [...prev, streamId];
      }
    });
  };

  if (!showDashboard) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl text-primary">Parcel AI</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">Log In</Button>
              <Button size="sm" className="shadow-button" onClick={() => setShowDashboard(true)}>
                Open Dashboard
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="gradient-hero pt-32 pb-20 px-6">
          <div className="container mx-auto max-w-5xl text-center">
            <h1 className="font-display font-extrabold text-4xl md:text-6xl lg:text-7xl tracking-tight mb-6 animate-fade-in">
              Never miss a security event{" "}
              <span className="text-gradient">ever again.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Parcel AI Vision Protection monitors your storage facility 24/7 with AI-powered surveillance—detecting intrusions, tracking packages, and alerting you instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Button size="lg" className="shadow-button px-8" onClick={() => setShowDashboard(true)}>
                Open Dashboard
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                Watch Demo
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              {["Built for Self-Storage", "<1s Alert Time", "24/7 Monitoring"].map((badge) => (
                <span
                  key={badge}
                  className="px-4 py-2 bg-background border border-border rounded-full text-sm font-medium text-foreground"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">Core Benefits</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                AI-powered security designed specifically for storage facilities.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Shield, title: "24/7 Protection", desc: "Always watching—never miss a break-in or suspicious activity." },
                { icon: Eye, title: "Smart Detection", desc: "AI distinguishes between customers and potential threats instantly." },
                { icon: Camera, title: "Multi-Camera Sync", desc: "Correlate events across all your cameras in real-time." },
              ].map((feature, i) => (
                <div
                  key={feature.title}
                  className="p-8 rounded-2xl border border-border bg-card hover:shadow-soft transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${0.1 * i}s` }}
                >
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-5">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-xl mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 gradient-hero">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
              Ready to secure your facility?
            </h2>
            <p className="text-muted-foreground mb-8">
              Start monitoring your storage units with AI-powered vision protection today.
            </p>
            <Button size="lg" className="shadow-button px-10" onClick={() => setShowDashboard(true)}>
              Get Started Free
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-border">
          <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="font-display font-bold text-lg text-primary">Parcel AI</span>
            <p className="text-sm text-muted-foreground">© 2024 Parcel AI. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowDashboard(false)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="font-display font-bold text-xl text-primary">Parcel AI</span>
            <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Vision</span>
          </button>
          <div className="h-6 w-px bg-border mx-2" />
          <span className="text-sm text-muted-foreground">Storage Security Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-600">System Active</span>
          </div>
          {selectedForComparison.length > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={handleCompareSelected}
              disabled={selectedForComparison.length < 2}
              className="shadow-button"
            >
              <GitCompareArrows className="w-4 h-4 mr-2" />
              Compare {selectedForComparison.length} Feeds
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Side - Video Grid and Settings */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Video Grid */}
          <div className="flex-1 overflow-auto p-5">
            <div className="h-full">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display font-semibold text-lg text-foreground mb-1">Storage Unit Cameras</h2>
                  <p className="text-sm text-muted-foreground">
                    Monitor entry points, hallways, and individual units with AI-powered surveillance.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((streamId) => {
                  const video = videos.get(streamId);
                  return (
                    <div key={streamId} className="relative">
                      {video?.file && (
                        <input
                          type="checkbox"
                          checked={selectedForComparison.includes(streamId)}
                          onChange={() => toggleComparisonSelection(streamId)}
                          className="absolute top-3 right-3 z-10 w-4 h-4 cursor-pointer accent-primary"
                        />
                      )}
                      <VideoUploadCard
                        streamId={streamId}
                        onVideoUpload={handleVideoUpload}
                        onVideoDelete={handleVideoDelete}
                        fileId={video?.fileId}
                        uploadProgress={video?.uploadProgress}
                        status={video?.status}
                        error={video?.error}
                        isSelected={selectedStreamId === streamId}
                        onSelect={setSelectedStreamId}
                        isPrimary={streamId === 1}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Section - Settings and Chat */}
          <div className="border-t border-border flex h-[320px]">
            {/* Summarization Settings */}
            <div className="w-[320px] border-r border-border overflow-auto">
              <SummarizationSettings
                settings={summarizationSettings}
                onSettingsChange={setSummarizationSettings}
                onSummarize={handleSummarize}
                canSummarize={!!selectedVideo?.fileId}
                isProcessing={selectedVideo?.status === 'summarizing'}
              />
            </div>

            {/* Chat Interface */}
            <div className="flex-1">
              <ChatInterface
                fileId={selectedVideo?.fileId}
                summary={selectedVideo?.summary}
                onResetChat={() => {
                  if (selectedStreamId) {
                    updateVideo(selectedStreamId, { summary: null });
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Side - Response Panel */}
        <div className="w-[360px] hidden xl:block border-l border-border">
          <ResponsePanel
            summary={selectedVideo?.summary || null}
            fileId={selectedVideo?.fileId || null}
            isProcessing={selectedVideo?.status === 'summarizing'}
            onResetChat={() => {
              if (selectedStreamId) {
                updateVideo(selectedStreamId, { summary: null });
              }
            }}
            onGenerateHighlight={() => {
              toast({
                title: "Generate Security Report",
                description: "Security incident report generation coming soon",
              });
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;