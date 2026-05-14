import { renderHook, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useTrace } from '../src/hooks';
import { useVizStore } from '../src/store/vizStore';

describe('useTrace', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useVizStore.getState().actions.reset();
  });

  it('populates the store on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ language: 'python', variables: [], snapshots: [], totalSteps: 0, error: null }),
      }),
    );

    const { result } = renderHook(() => useTrace());

    await act(async () => {
      await result.current.trace({ language: 'python', source: 'x = 5', trackedVariables: ['x'] });
    });

    expect(useVizStore.getState().traceResult?.language).toBe('python');
  });

  it('sets error on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const { result } = renderHook(() => useTrace());

    await act(async () => {
      await result.current.trace({ language: 'python', source: 'x = 5', trackedVariables: ['x'] });
    });

    expect(result.current.error?.message).toBe('offline');
  });

  it('sets error when TraceResult contains one', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            language: 'python',
            variables: [],
            snapshots: [],
            totalSteps: 0,
            error: { message: 'bad', line: null, kind: 'runtime' },
          }),
      }),
    );
    const { result } = renderHook(() => useTrace());

    await act(async () => {
      await result.current.trace({ language: 'python', source: 'x = 5', trackedVariables: ['x'] });
    });

    expect(result.current.error?.message).toBe('bad');
  });

  it('sets error when response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: 'server boom' }),
      }),
    );
    const { result } = renderHook(() => useTrace());

    await act(async () => {
      await result.current.trace({ language: 'python', source: 'x = 5', trackedVariables: ['x'] });
    });

    expect(result.current.error?.message).toBe('server boom');
    expect(useVizStore.getState().traceResult).toBeNull();
  });
});
