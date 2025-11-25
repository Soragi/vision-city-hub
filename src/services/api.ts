const API_BASE_URL = '/api';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  stream?: boolean;
  file_id?: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
}

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  upload_time: string;
  status?: 'uploading' | 'uploaded' | 'processing' | 'summarized' | 'error';
}

export interface SummarizeParams {
  id: string;
  model?: string;
  chunk_duration?: number;
  prompt?: string;
  caption_summarization_prompt?: string;
  summary_aggregation_prompt?: string;
  enable_chat?: boolean;
  enable_chat_history?: boolean;
  enable_audio?: boolean;
  stream?: boolean;
}

export interface Alert {
  id: string;
  timestamp: string;
  file_id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Model {
  id: string;
  name: string;
  description?: string;
}

export const chatAPI = {
  async sendMessage(messages: ChatMessage[], fileId?: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          stream: false,
          id: fileId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: ChatCompletionResponse = await response.json();
      return data.choices[0]?.message?.content || 'No response from AI';
    } catch (error) {
      console.error('Chat API error:', error);
      throw error;
    }
  },
};

export const fileAPI = {
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<FileInfo> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'vision');
    formData.append('media_type', 'video');

    try {
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

        xhr.open('POST', `${API_BASE_URL}/files`);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  },

  async deleteFile(fileId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('File delete error:', error);
      throw error;
    }
  },

  async listFiles(): Promise<FileInfo[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/files`);

      if (!response.ok) {
        throw new Error(`List files failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('List files error:', error);
      throw error;
    }
  },
};

export const summarizationAPI = {
  async summarizeVideo(
    params: SummarizeParams,
    onProgress?: (chunk: string) => void
  ): Promise<string> {
    try {
      const requestBody = {
        id: params.id,
        chunk_duration: params.chunk_duration,
        prompt: params.prompt,
        caption_summarization_prompt: params.caption_summarization_prompt || '',
        summary_aggregation_prompt: params.summary_aggregation_prompt || '',
        enable_chat: params.enable_chat ?? true,
        enable_chat_history: params.enable_chat_history ?? true,
        enable_audio: params.enable_audio ?? false,
        model: params.model,
        stream: true,
      };

      const response = await fetch(`${API_BASE_URL}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Summarize failed: ${response.status} ${response.statusText}`);
      }

      // Handle SSE streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let summary = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.content || parsed.chunk || '';
                summary += content;
                if (onProgress) {
                  onProgress(content);
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      return summary;
    } catch (error) {
      console.error('Summarization error:', error);
      throw error;
    }
  },

  async getModels(): Promise<Model[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/models`);

      if (!response.ok) {
        throw new Error(`Get models failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get models error:', error);
      throw error;
    }
  },
};

export const alertsAPI = {
  async getAlerts(): Promise<Alert[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts/recent`);

      if (!response.ok) {
        throw new Error(`Get alerts failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get alerts error:', error);
      throw error;
    }
  },
};
