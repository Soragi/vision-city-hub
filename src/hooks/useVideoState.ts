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
  prompt: 'Watch this camera footage and describe clearly what you see. Identify the setting, the people, vehicles or equipment present, and the activities taking place. Note any anomalies, defects, safety issues or unusual events. Keep the summary concise, factual and easy to understand.',
  captionSummarizationPrompt: 'Summarise the following camera captions. For each time segment, write one bullet in the format start_time:end_time: short description of what is visible and what is happening. Keep it factual and concise.',
  summaryAggregationPrompt: 'Combine the bullet points below into a clear, concise summary of what the camera observed. Merge overlapping segments. Group findings under: What was seen, Activities, and Notable events or issues.',
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
