import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { summarizationAPI } from '@/services/api';

export const BackendHealthCheck = () => {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await summarizationAPI.getModels();
        setStatus('healthy');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };
    checkHealth();
  }, []);

  const baseClass = "inline-flex items-center gap-2 text-[11px] font-medium px-2.5 py-1 rounded-sm";

  if (status === 'checking') {
    return (
      <span className={`${baseClass} bg-secondary text-muted-foreground`}>
        <Loader2 className="w-3 h-3 animate-spin" />
        Connecting to VSS backend…
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className={`${baseClass} bg-destructive/15 text-destructive`} title={error}>
        <XCircle className="w-3 h-3" />
        VSS backend unreachable
      </span>
    );
  }
  return (
    <span className={`${baseClass} bg-[hsl(var(--nv-green))]/15 text-[hsl(var(--nv-green))]`}>
      <CheckCircle2 className="w-3 h-3" />
      VSS backend connected
    </span>
  );
};
