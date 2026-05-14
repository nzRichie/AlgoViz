import { afterEach, describe, expect, it, vi } from 'vitest';

import { useVizStore } from '../src/store/vizStore';
import type { TraceResult } from '@algoviz/core/types';

describe('vizStore', () => {
  afterEach(() => {
    vi.useRealTimers();
    useVizStore.getState().actions.reset();
  });

  it('sets trace and navigates steps', () => {
    useVizStore.getState().actions.setTrace(traceResult(3));
    useVizStore.getState().actions.nextStep();
    useVizStore.getState().actions.nextStep();
    useVizStore.getState().actions.nextStep();

    expect(useVizStore.getState().currentStep).toBe(2);

    useVizStore.getState().actions.prevStep();
    expect(useVizStore.getState().currentStep).toBe(1);

    useVizStore.getState().actions.goToStep(0);
    expect(useVizStore.getState().currentStep).toBe(0);
  });

  it('plays and pauses with interval timing', () => {
    vi.useFakeTimers();
    useVizStore.getState().actions.setTrace(traceResult(3));
    useVizStore.getState().actions.play();

    vi.advanceTimersByTime(600);
    expect(useVizStore.getState().currentStep).toBe(1);

    useVizStore.getState().actions.pause();
    vi.advanceTimersByTime(600);
    expect(useVizStore.getState().currentStep).toBe(1);
  });

  it('sets speed and resets state', () => {
    useVizStore.getState().actions.setSpeed(200);
    expect(useVizStore.getState().playbackSpeed).toBe(200);

    useVizStore.getState().actions.reset();
    expect(useVizStore.getState().traceResult).toBeNull();
  });
});

function traceResult(totalSteps: number): TraceResult {
  return {
    language: 'python',
    variables: [],
    snapshots: Array.from({ length: totalSteps }, () => []),
    totalSteps,
    error: null,
  };
}
