import { useState } from "react";
import { Settings as SettingsIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SummarizationSettings as SettingsType } from "@/hooks/useVideoState";

interface SummarizationSettingsProps {
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
  onSummarize: () => void;
  canSummarize?: boolean;
  isProcessing?: boolean;
}

const SummarizationSettings = ({
  settings,
  onSettingsChange,
  onSummarize,
  canSummarize = false,
  isProcessing = false,
}: SummarizationSettingsProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateSetting = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <SettingsIcon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Summarization Settings</h3>
      </div>

      <div className="space-y-4">
        {/* Chunk Duration */}
        <div className="space-y-2">
          <Label htmlFor="chunk-duration" className="text-xs">
            Chunk Size
          </Label>
          <Select
            value={settings.chunkDuration.toString()}
            onValueChange={(val) => updateSetting('chunkDuration', parseInt(val))}
          >
            <SelectTrigger id="chunk-duration" className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 seconds</SelectItem>
              <SelectItem value="10">10 seconds</SelectItem>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">1 minute</SelectItem>
              <SelectItem value="120">2 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Analysis Prompt */}
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-xs">
            Analysis Prompt
          </Label>
          <Textarea
            id="prompt"
            value={settings.prompt}
            onChange={(e) => updateSetting('prompt', e.target.value)}
            placeholder="Describe what you want the AI to analyze..."
            className="min-h-[80px] text-xs resize-none"
          />
        </div>

        {/* File Settings */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-chat" className="text-xs">
              Enable Chat
            </Label>
            <Switch
              id="enable-chat"
              checked={settings.enableChat}
              onCheckedChange={(val) => updateSetting('enableChat', val)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="enable-chat-history" className="text-xs">
              Enable Chat History
            </Label>
            <Switch
              id="enable-chat-history"
              checked={settings.enableChatHistory}
              onCheckedChange={(val) => updateSetting('enableChatHistory', val)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="enable-audio" className="text-xs">
              Enable Audio Analysis
            </Label>
            <Switch
              id="enable-audio"
              checked={settings.enableAudio}
              onCheckedChange={(val) => updateSetting('enableAudio', val)}
            />
          </div>
        </div>

        {/* Advanced Settings */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-xs">
              <span>Advanced Settings</span>
              {showAdvanced ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="caption-prompt" className="text-xs">
                Caption Summarization Prompt (Optional)
              </Label>
              <Textarea
                id="caption-prompt"
                value={settings.captionSummarizationPrompt}
                onChange={(e) => updateSetting('captionSummarizationPrompt', e.target.value)}
                placeholder="Custom caption summarization instructions..."
                className="min-h-[60px] text-xs resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aggregation-prompt" className="text-xs">
                Summary Aggregation Prompt (Optional)
              </Label>
              <Textarea
                id="aggregation-prompt"
                value={settings.summaryAggregationPrompt}
                onChange={(e) => updateSetting('summaryAggregationPrompt', e.target.value)}
                placeholder="Custom aggregation instructions..."
                className="min-h-[60px] text-xs resize-none"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Summarize Button */}
        <Button
          onClick={onSummarize}
          disabled={!canSummarize || isProcessing}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isProcessing ? "Processing..." : "Summarize Video"}
        </Button>
      </div>
    </Card>
  );
};

export default SummarizationSettings;
