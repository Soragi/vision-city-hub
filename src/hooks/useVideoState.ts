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
  chunkDuration: 10,
  prompt: 'You are an Implement Consulting Group consultant advising clients across healthcare, transport & logistics, defence & security, and industrial goods & services. Watch this video and explain clearly what is happening: describe the setting, the people or assets involved, the activities or processes taking place, and any notable events, anomalies, risks or inefficiencies. Where relevant, highlight opportunities for operational improvement, safety, sustainability or process optimisation. Be concise, structured and pragmatic — the way an experienced consultant would brief a client.',
  captionSummarizationPrompt: '',
  summaryAggregationPrompt: '',
  enableChat: true,
  enableChatHistory: true,
  enableAudio: false,
  model: '', // Let backend use default model
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
