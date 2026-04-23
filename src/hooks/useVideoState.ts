import { useState } from 'react';

export interface VideoState {
  streamId: number;
  file: File | null;
  fileId: string | null;
  status: 'idle' | 'uploading' | 'uploaded' | 'summarizing' | 'summarized' | 'error';
  summary: string | null;
  uploadProgress: number;
  error: string | null;
}

export interface SummarizationSettings {
  chunkDuration: number;
  prompt: string;
  captionSummarizationPrompt: string;
  summaryAggregationPrompt: string;
  enableChat: boolean;
  enableChatHistory: boolean;
  enableAudio: boolean;
  model: string;
}

export const DEFAULT_SUMMARIZATION_SETTINGS: SummarizationSettings = {
  chunkDuration: 60,
  prompt: 'You are analysing an NVIDIA Masterclass recording. Watch this segment of the video and describe clearly what is happening: the speaker, the topic being presented, any technical concepts, demos, slides, code, or product references shown. Capture the key takeaways and any noteworthy quotes. Keep it factual, structured, and easy to follow.',
  captionSummarizationPrompt: 'Summarise the following NVIDIA Masterclass captions. For each time segment, write one bullet in the format start_time:end_time: short description of the topic, speaker, demo, or key point covered.',
  summaryAggregationPrompt: 'Combine the bullet points below into a clear NVIDIA Masterclass summary. Start with a section titled "TL;DR" containing 3 to 5 bold one-line highlights of the most important takeaways. Then add a section titled "Full Summary" with timestamped chapters in the format [hh:mm:ss] Chapter title — short description of what is covered. Group related segments into chapters. Be concise, technical, and accurate.',
  enableChat: true,
  enableChatHistory: true,
  enableAudio: false,
  model: '',
};

export const useVideoState = () => {
  const [videos, setVideos] = useState<Map<number, VideoState>>(new Map());
  const [summarizationSettings, setSummarizationSettings] = useState<SummarizationSettings>(
    DEFAULT_SUMMARIZATION_SETTINGS
  );
  const [selectedStreamId, setSelectedStreamId] = useState<number | null>(null);

  const updateVideo = (streamId: number, updates: Partial<VideoState>) => {
    setVideos((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(streamId) || {
        streamId,
        file: null,
        fileId: null,
        status: 'idle' as const,
        summary: null,
        uploadProgress: 0,
        error: null,
      };
      newMap.set(streamId, { ...current, ...updates });
      return newMap;
    });
  };

  const getVideo = (streamId: number): VideoState | undefined => {
    return videos.get(streamId);
  };

  const removeVideo = (streamId: number) => {
    setVideos((prev) => {
      const newMap = new Map(prev);
      newMap.delete(streamId);
      return newMap;
    });
  };

  return {
    videos,
    updateVideo,
    getVideo,
    removeVideo,
    summarizationSettings,
    setSummarizationSettings,
    selectedStreamId,
    setSelectedStreamId,
  };
};
