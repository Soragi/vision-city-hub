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
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary-foreground">
                <path d="M12 15c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2s2 .9 2 2v8c0 1.1-.9 2-2 2zm4-2V5c0-2.21-1.79-4-4-4S8 2.79 8 5v8c0 2.21 1.79 4 4 4s4-1.79 4-4zM6 13c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.05 7.44-7 7.93V23h-2v-2.07C7.05 20.44 4 17.08 4 13h2z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-foreground">Dell Norway Vision Agent</h1>
          </div>
          <div className="h-6 w-px bg-border mx-2" />
          <span className="text-sm text-muted-foreground">AI-Powered Visual Analysis</span>
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
