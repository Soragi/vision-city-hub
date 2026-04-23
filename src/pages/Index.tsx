import NvHeader from "@/components/NvHeader";
import NvHero from "@/components/NvHero";
import NvFooter from "@/components/NvFooter";
import MasterclassUpload from "@/components/MasterclassUpload";
import MasterclassWorkflows from "@/components/MasterclassWorkflows";

import { BackendHealthCheck } from "@/components/BackendHealthCheck";
import { useToast } from "@/hooks/use-toast";
import { useVideoState } from "@/hooks/useVideoState";
import { fileAPI } from "@/services/api";

const STREAM_ID = 1;

const Index = () => {
  const { toast } = useToast();
  const {
    videos,
    updateVideo,
    removeVideo,
    summarizationSettings,
    setSummarizationSettings,
    setSelectedStreamId,
  } = useVideoState();

  const video = videos.get(STREAM_ID);

  const handleUpload = async (file: File) => {
    updateVideo(STREAM_ID, {
      file,
      status: 'uploading',
      uploadProgress: 0,
      error: null,
      summary: null,
    });
    try {
      const fileInfo = await fileAPI.uploadFile(file, (p) =>
        updateVideo(STREAM_ID, { uploadProgress: p })
      );
      updateVideo(STREAM_ID, {
        fileId: fileInfo.id,
        status: 'uploaded',
        uploadProgress: 100,
      });
      setSelectedStreamId(STREAM_ID);
      toast({
        title: "Masterclass uploaded",
        description: `${file.name} is ready for analysis.`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      updateVideo(STREAM_ID, { status: 'error', error: msg, fileId: null });
      toast({ title: "Upload failed", description: msg, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!video?.fileId) {
      removeVideo(STREAM_ID);
      return;
    }
    try {
      await fileAPI.deleteFile(video.fileId);
      removeVideo(STREAM_ID);
      toast({ title: "Recording removed" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NvHeader />
      <NvHero />

      <main id="overview" className="flex-1">
        <section id="masterclass" className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[hsl(var(--nv-green))] font-semibold mb-3">
                  Step 01 · Upload
                </p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Masterclass VSS Review
                </h2>
                <p className="text-base text-muted-foreground mt-3 max-w-2xl">
                  One long-form recording in. TL;DR, timestamped chapters, semantic search and live alerts out — all powered by the NVIDIA Video Search and Summarization blueprint.
                </p>
              </div>
              <BackendHealthCheck />
            </div>
            <MasterclassUpload
              fileId={video?.fileId}
              status={video?.status}
              uploadProgress={video?.uploadProgress}
              error={video?.error}
              onUpload={handleUpload}
              onDelete={handleDelete}
            />
          </div>
        </section>

        <section id="workflows" className="border-b border-border bg-[hsl(var(--nv-offwhite))]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[hsl(var(--nv-green))] font-semibold mb-3">
                Step 02 · Analyse
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Three agent workflows
              </h2>
              <p className="text-base text-muted-foreground mt-3 max-w-2xl">
                Move between Summary, Search and Alerts to interrogate the Masterclass from every angle.
              </p>
            </div>
            <MasterclassWorkflows
              fileId={video?.fileId ?? null}
              fileName={video?.file?.name}
              summary={video?.summary ?? null}
              isProcessing={video?.status === 'summarizing'}
              settings={summarizationSettings}
              onSettingsChange={setSummarizationSettings}
              onSummaryUpdate={(s) => updateVideo(STREAM_ID, { summary: s })}
              onStatusChange={(status) => updateVideo(STREAM_ID, { status })}
              onChunkDurationChange={(v) =>
                setSummarizationSettings({ ...summarizationSettings, chunkDuration: v })
              }
            />
          </div>
        </section>

        
      </main>

      <NvFooter />
    </div>
  );
};

export default Index;
