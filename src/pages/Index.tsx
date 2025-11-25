import { useState } from "react";
import VideoUploadCard from "@/components/VideoUploadCard";
import ChatInterface from "@/components/ChatInterface";
import ResponsePanel from "@/components/ResponsePanel";
import SummarizationSettings from "@/components/SummarizationSettings";
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
    });

    try {
      const fileInfo = await fileAPI.uploadFile(file, (progress) => {
        updateVideo(streamId, { uploadProgress: progress });
      });

      updateVideo(streamId, {
        fileId: fileInfo.id,
        status: 'uploaded',
        uploadProgress: 100,
      });

      toast({
        title: "Video Uploaded",
        description: `Stream ${streamId}: ${file.name}`,
      });

      // Auto-select the uploaded video
      setSelectedStreamId(streamId);
    } catch (error) {
      console.error('Upload failed:', error);
      updateVideo(streamId, {
        status: 'error',
        error: 'Upload failed',
      });
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${file.name}`,
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
        title: "Video Deleted",
        description: `Stream ${streamId} video removed`,
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
          system_prompt: summarizationSettings.systemPrompt,
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
        title: "Summarization Complete",
        description: "Video analysis finished successfully",
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
        {/* Left Side - Video Grid and Settings */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Video Grid */}
          <div className="flex-1 overflow-auto p-4">
            <div className="h-full">
              <div className="mb-3">
                <h2 className="text-base font-semibold text-foreground mb-0.5">Video Streams</h2>
                <p className="text-xs text-muted-foreground">
                  Upload video files and select one to analyze
                </p>
              </div>

              <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((streamId) => {
                  const video = videos.get(streamId);
                  return (
                    <VideoUploadCard
                      key={streamId}
                      streamId={streamId}
                      onVideoUpload={handleVideoUpload}
                      onVideoDelete={handleVideoDelete}
                      fileId={video?.fileId}
                      uploadProgress={video?.uploadProgress}
                      status={video?.status}
                      isSelected={selectedStreamId === streamId}
                      onSelect={setSelectedStreamId}
                    />
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
                disabled={!selectedVideo?.fileId}
                isProcessing={selectedVideo?.status === 'summarizing'}
              />
            </div>

            {/* Chat Interface */}
            <div className="flex-1">
              <ChatInterface
                fileId={selectedVideo?.fileId}
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
                title: "Generate Highlight",
                description: "Highlight generation feature coming soon",
              });
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
