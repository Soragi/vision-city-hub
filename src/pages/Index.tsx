import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VideoUploadCard from "@/components/VideoUploadCard";
import ChatInterface from "@/components/ChatInterface";
import ResponsePanel from "@/components/ResponsePanel";
import SummarizationSettings from "@/components/SummarizationSettings";
import { BackendHealthCheck } from "@/components/BackendHealthCheck";
import { Button } from "@/components/ui/button";
import { GitCompareArrows } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {/* Google Logo */}
            <svg viewBox="0 0 24 24" className="w-8 h-8">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <h1 className="text-xl font-bold text-foreground">GooglyEyes AI</h1>
          </div>
          <div className="h-6 w-px bg-border mx-2" />
          <span className="text-sm text-muted-foreground">Because We're Always Watching 👀</span>
        </div>
        <div className="flex items-center gap-2">
          {selectedForComparison.length > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={handleCompareSelected}
              disabled={selectedForComparison.length < 2}
            >
              <GitCompareArrows className="w-4 h-4 mr-2" />
              Compare {selectedForComparison.length} Videos
            </Button>
          )}
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
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground mb-0.5">Production Line Cameras</h2>
                  <p className="text-xs text-muted-foreground">
                    Upload to Camera 1 (Primary) first. Other cameras monitor different production stages.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((streamId) => {
                  const video = videos.get(streamId);
                  return (
                    <div key={streamId} className="relative">
                      {video?.file && (
                        <input
                          type="checkbox"
                          checked={selectedForComparison.includes(streamId)}
                          onChange={() => toggleComparisonSelection(streamId)}
                          className="absolute top-2 right-2 z-10 w-4 h-4 cursor-pointer"
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
            onGenerateHighlight={() => {
              toast({
                title: "Generate Defect Report",
                description: "Defect report generation feature coming soon",
              });
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
