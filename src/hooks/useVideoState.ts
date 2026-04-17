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
  prompt: 'Watch this truck dashcam footage and describe clearly what you see. Note the road and weather conditions, surrounding vehicles and road users, the truck driver behaviour, and any traffic signs or signals. Flag any incidents, near-misses, harsh braking, lane departures, collisions or unsafe driving relevant to an insurance claim. Keep the description factual, concise and time-aware.',
  captionSummarizationPrompt: 'Summarise the following truck dashcam captions. For each time segment, write one bullet in the format start_time:end_time: short description of road conditions, traffic, driver actions, and any incidents or unsafe events.',
  summaryAggregationPrompt: 'Combine the bullet points below into a clear, concise dashcam incident report for an insurance claim. Merge overlapping segments. Group findings under: Route and conditions, Driver behaviour, and Incidents or claim-relevant events (with timestamps).',
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
