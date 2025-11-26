import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { chatAPI, type ChatMessage as APIChatMessage } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  fileId?: string | null;
  summary?: string | null;
  onResetChat?: () => void;
}

const ChatInterface = ({ fileId, summary, onResetChat }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  const resetChat = () => {
    setMessages([]);
    setInput("");
    if (onResetChat) {
      onResetChat();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Convert messages to API format
      const apiMessages: APIChatMessage[] = [];
      
      // Add previous messages
      messages.forEach(msg => {
        apiMessages.push({
          role: msg.role,
          content: msg.content,
        });
      });
      
      // Build the user message - include summary context directly in the message
      // because the backend only uses the last message's content and ignores system messages
      let userContent = input;
      if (summary) {
        userContent = `Based on this video summary:\n\n${summary}\n\nUser question: ${input}`;
      }
      
      // Add current user message with embedded context
      apiMessages.push({
        role: "user",
        content: userContent,
      });

      // Call NVIDIA VSS backend with file context if available
      const responseContent = await chatAPI.sendMessage(apiMessages, fileId || undefined);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      toast({
        title: "Error",
        description: "Failed to connect to the video analysis backend. Please check if the backend is running.",
        variant: "destructive",
      });
      
      // Remove the user message on error
      setMessages((prev) => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-chat-bg border-t border-border flex flex-col h-full">
      <div className="px-4 py-2 border-b border-border">
        <h2 className="text-xs font-semibold text-foreground">Video Analysis AI Assistant</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {messages.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-xs">
                Ask questions about the video streams to get AI-powered insights
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-1.5",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  )}
                >
                  <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="bg-secondary text-foreground rounded-lg px-3 py-1.5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse delay-100" />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about the video streams..."
            className="min-h-[50px] resize-none bg-chat-input border-border text-xs text-foreground placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-[50px] w-[50px] p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
