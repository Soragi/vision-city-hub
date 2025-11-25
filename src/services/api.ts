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
    console.log('[API] Uploading file:', { name: file.name, size: file.size, type: file.type });
    
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
          console.log('[API] Upload response:', { status: xhr.status, statusText: xhr.statusText });
          
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log('[API] Upload successful:', response);
              resolve(response);
            } catch (error) {
              console.error('[API] Invalid JSON response:', xhr.responseText);
              reject(new Error('Invalid response from server'));
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              const errorMessage = errorResponse.detail || errorResponse.error || `Upload failed with status ${xhr.status}`;
              console.error('[API] Upload failed:', { status: xhr.status, error: errorResponse });
              reject(new Error(errorMessage));
            } catch {
              console.error('[API] Upload failed with non-JSON error:', xhr.responseText);
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          console.error('[API] Network error during upload');
          reject(new Error('Failed to connect to the video analysis backend. Please check if the backend is running.'));
        });

        xhr.addEventListener('abort', () => {
          console.warn('[API] Upload was cancelled');
          reject(new Error('Upload was cancelled'));
        });

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
        model: params.model || 'cosmos-reason1',
        chunk_duration: params.chunk_duration,
        prompt: params.prompt,
        caption_summarization_prompt: params.caption_summarization_prompt || '',
        summary_aggregation_prompt: params.summary_aggregation_prompt || '',
        enable_chat: params.enable_chat ?? true,
        enable_chat_history: params.enable_chat_history ?? true,
        enable_audio: params.enable_audio ?? false,
        stream: true,
      };

      console.log('[API] Starting summarization:', requestBody);

      const res = await fetch(`${API_BASE_URL}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('[API] Summarization response:', { status: res.status, statusText: res.statusText, headers: Object.fromEntries(res.headers.entries()) });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('[API] Summarization failed:', { status: res.status, error: errorText });
        throw new Error(`Summarize failed: ${res.status} ${res.statusText}`);
      }

      // Handle SSE streaming
      const reader = res.body?.getReader();
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
      console.log('[API] Fetching available models...');
      
      const response = await fetch(`${API_BASE_URL}/models`);

      console.log('[API] Models response:', { status: response.status, statusText: response.statusText });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[API] Get models failed:', { status: response.status, error: errorText });
        throw new Error(`Get models failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[API] Available models:', data);
      return data;
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
