import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { summarizationAPI } from '@/services/api';

export const BackendHealthCheck = () => {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        console.log('[Health Check] Checking backend connectivity...');
        await summarizationAPI.getModels();
        console.log('[Health Check] Backend is healthy');
        setStatus('healthy');
      } catch (err) {
        console.error('[Health Check] Backend check failed:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    checkHealth();
  }, []);

  if (status === 'checking') {
    return (
      <Alert className="mb-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription className="ml-2">
          Checking NVIDIA VSS backend connection...
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'error') {
    return (
      <Alert variant="destructive" className="mb-4">
        <XCircle className="h-4 w-4" />
        <AlertDescription className="ml-2">
          Backend connection failed: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 border-green-500/50 bg-green-500/10">
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      <AlertDescription className="ml-2 text-green-500">
        Connected to NVIDIA VSS backend
      </AlertDescription>
    </Alert>
  );
};
