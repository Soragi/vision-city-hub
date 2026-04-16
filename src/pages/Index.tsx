import VideoUploadCard from "@/components/VideoUploadCard";
import ChatInterface from "@/components/ChatInterface";
import ResponsePanel from "@/components/ResponsePanel";
import SummarizationSettings from "@/components/SummarizationSettings";
import { BackendHealthCheck } from "@/components/BackendHealthCheck";
import { HeartPulse, Truck, ShieldCheck, Factory } from "lucide-react";

const STREAM_INDUSTRIES = {
  1: { title: "Healthcare", icon: HeartPulse },
  2: { title: "Transport & Logistics", icon: Truck },
  3: { title: "Defence & Security", icon: ShieldCheck },
  4: { title: "Industrial Goods & Services", icon: Factory },
} as const;
import { useToast } from "@/hooks/use-toast";
import { useVideoState } from "@/hooks/useVideoState";
import { fileAPI, summarizationAPI } from "@/services/api";

const Index = () => {
  const { toast } = useToast();
  const {
    videos,
    updateVideo,
    removeVideo,
    summarizationSettings,
    setSummarizationSettings,
    selectedStreamId,
    setSelectedStreamId,
  } = useVideoState();

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
        title: "✓ Footage Uploaded Successfully",
        description: `Camera ${streamId}: ${file.name} is ready for inspection`,
      });

      // Auto-select the uploaded video
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
        title: "Footage Deleted",
        description: `Camera ${streamId} footage removed`,
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
        title: "Analysis Complete",
        description: "Production line inspection finished successfully",
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

  const handleDownloadReport = () => {
    if (!selectedVideo?.summary) {
      toast({
        title: "No Report Available",
        description: "Run analysis on a video first to generate a report",
        variant: "destructive",
      });
      return;
    }

    const industry = selectedStreamId
      ? STREAM_INDUSTRIES[selectedStreamId as keyof typeof STREAM_INDUSTRIES]
      : undefined;
    const fileName = selectedVideo.file?.name ?? `camera-${selectedStreamId}`;
    const timestamp = new Date().toISOString();

    const markdown = `# Implement Consulting Group — Intelligence Report

**Generated:** ${timestamp}
**Industry:** ${industry?.title ?? "Unknown"}
**Camera:** ${selectedStreamId ?? "—"}
**Source footage:** ${fileName}

---

## Analysis

${selectedVideo.summary}
`;

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = (industry?.title ?? `camera-${selectedStreamId}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    a.href = url;
    a.download = `intelligence-report-${safeName}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Intelligence report saved as Markdown",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-background border-b border-border px-10 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* IMPLEMENT Consulting Group wordmark */}
            <div className="flex flex-col leading-none">
              <span className="font-serif text-2xl tracking-tight text-foreground">IMPLEMENT</span>
              <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground mt-1">
                Consulting Group_
              </span>
            </div>
            <div className="h-8 w-px bg-border" />
            <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Industrial Vision Intelligence
            </span>
          </div>
          <div className="flex items-center gap-2" />

        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Side - Video Grid and Settings */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Backend Health Check */}
          <div className="px-4 pt-4">
            <BackendHealthCheck />
          </div>
          
          {/* Video Grid */}
          <div className="flex-1 overflow-auto p-4 pt-0">{/* ... keep existing code */}
            <div className="h-full">
              <div className="mb-4 border-b border-border pb-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Hello,</p>
                <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-2 leading-tight">
                  we're Implement
                </h2>
                <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                  We help organisations succeed with their most important transformations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {[1, 2, 3, 4].map((streamId) => {
                  const video = videos.get(streamId);
                  const industry = STREAM_INDUSTRIES[streamId as keyof typeof STREAM_INDUSTRIES];
                  return (
                    <div key={streamId} className="relative">
                      <VideoUploadCard
                        streamId={streamId}
                        title={industry.title}
                        icon={industry.icon}
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
        <div className="w-[360px] hidden xl:block">
          <ResponsePanel
            summary={selectedVideo?.summary || null}
            fileId={selectedVideo?.fileId || null}
            isProcessing={selectedVideo?.status === 'summarizing'}
            onResetChat={() => {
              if (selectedStreamId) {
                updateVideo(selectedStreamId, { summary: null });
              }
            }}
            onGenerateHighlight={handleDownloadReport}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
