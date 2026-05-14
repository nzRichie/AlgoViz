import type { TraceError, TraceRequest, TraceResult } from '@algoviz/core/types';
import { useState } from 'react';

import { useVizStore } from '../store/vizStore';

interface UseTraceResult {
  trace: (request: TraceRequest) => Promise<void>;
  isLoading: boolean;
  error: TraceError | null;
}

const defaultTracerUrl = 'http://127.0.0.1:8000';

export function useTrace(): UseTraceResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TraceError | null>(null);
  const setTrace = useVizStore((state) => state.actions.setTrace);

  async function trace(request: TraceRequest) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_TRACER_URL ?? defaultTracerUrl}/api/trace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      const result = (await response.json()) as TraceResult;

      if (result.error) {
        setError(result.error);
      } else {
        setTrace(result);
      }
    } catch (exc) {
      setError({
        message: exc instanceof Error ? exc.message : 'Network request failed',
        line: null,
        kind: 'runtime',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return { trace, isLoading, error };
}
