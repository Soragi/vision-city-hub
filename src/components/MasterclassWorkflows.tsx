import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Search, Bell } from "lucide-react";
import SummaryWorkflow from "./workflows/SummaryWorkflow";
import SearchWorkflow from "./workflows/SearchWorkflow";
import AlertsWorkflow from "./workflows/AlertsWorkflow";
import type { SummarizationSettings } from "@/hooks/useVideoState";

interface Props {
  fileId: string | null;
  fileName?: string;
  summary: string | null;
  isProcessing: boolean;
  settings: SummarizationSettings;
  onSummaryUpdate: (s: string) => void;
  onStatusChange: (s: 'summarizing' | 'summarized' | 'error') => void;
  onChunkDurationChange: (v: number) => void;
}

const MasterclassWorkflows = ({
  fileId,
  fileName,
  summary,
  isProcessing,
  settings,
  onSummaryUpdate,
  onStatusChange,
  onChunkDurationChange,
}: Props) => {
  const enabled = !!fileId;
  return (
    <div className="bg-card border border-border rounded-md">
      <Tabs defaultValue="summary" className="w-full">
        <div className="border-b border-border px-2">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            {[
              { value: "summary", label: "Summary", Icon: FileText },
              { value: "search", label: "Search", Icon: Search },
              { value: "alerts", label: "Alerts", Icon: Bell },
            ].map(({ value, label, Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                disabled={!enabled}
                className="relative rounded-none bg-transparent px-5 py-4 text-sm font-semibold text-muted-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-[3px] data-[state=active]:after:bg-[hsl(var(--nv-green))]"
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="p-6">
          <TabsContent value="summary" className="m-0">
            <SummaryWorkflow
              fileId={fileId}
              fileName={fileName}
              summary={summary}
              isProcessing={isProcessing}
              settings={settings}
              onSummaryUpdate={onSummaryUpdate}
              onStatusChange={onStatusChange}
              onChunkDurationChange={onChunkDurationChange}
            />
          </TabsContent>
          <TabsContent value="search" className="m-0">
            <SearchWorkflow fileId={fileId} />
          </TabsContent>
          <TabsContent value="alerts" className="m-0">
            <AlertsWorkflow fileId={fileId} />
          </TabsContent>
        </div>
      </Tabs>
      {!enabled && (
        <div className="px-6 pb-6 -mt-2">
          <p className="text-xs text-muted-foreground">
            Upload a Masterclass recording above to enable Summary, Search, and Alerts workflows.
          </p>
        </div>
      )}
    </div>
  );
};

export default MasterclassWorkflows;
