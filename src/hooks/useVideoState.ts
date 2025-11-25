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
  systemPrompt: string;
  captionSummarizationPrompt: string;
  summaryAggregationPrompt: string;
  enableChat: boolean;
  enableChatHistory: boolean;
  enableAudio: boolean;
  model: string;
}

export const DEFAULT_SUMMARIZATION_SETTINGS: SummarizationSettings = {
  chunkDuration: 10,
  prompt: 'You are a warehouse monitoring system. Analyze the video and describe all events, activities, and any anomalies you detect. Focus on movement patterns, object interactions, and unusual behaviors.',
  systemPrompt: 'You are an AI video analysis assistant specialized in surveillance and monitoring. Provide clear, actionable insights.',
  captionSummarizationPrompt: '',
  summaryAggregationPrompt: '',
  enableChat: true,
  enableChatHistory: true,
  enableAudio: false,
  model: 'vila-1.5',
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
