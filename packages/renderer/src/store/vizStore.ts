import type { TraceResult } from '@algoviz/core/types';
import { create } from 'zustand';

export type PlaybackSpeed = 200 | 600 | 1200;

export interface VizStore {
  traceResult: TraceResult | null;
  currentStep: number;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  actions: {
    setTrace: (result: TraceResult) => void;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: number) => void;
    play: () => void;
    pause: () => void;
    setSpeed: (ms: PlaybackSpeed) => void;
    reset: () => void;
  };
}

let playbackTimer: ReturnType<typeof setInterval> | null = null;

export const useVizStore = create<VizStore>((set, get) => ({
  traceResult: null,
  currentStep: 0,
  isPlaying: false,
  playbackSpeed: 600,
  actions: {
    setTrace(result) {
      clearPlaybackTimer();
      set({ traceResult: result, currentStep: 0, isPlaying: false });
    },
    nextStep() {
      const { currentStep, traceResult } = get();
      const lastStep = Math.max((traceResult?.totalSteps ?? 1) - 1, 0);
      const nextStep = Math.min(currentStep + 1, lastStep);
      set({ currentStep: nextStep, isPlaying: nextStep < lastStep && get().isPlaying });

      if (nextStep >= lastStep) {
        clearPlaybackTimer();
      }
    },
    prevStep() {
      set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) }));
    },
    goToStep(step) {
      const lastStep = Math.max((get().traceResult?.totalSteps ?? 1) - 1, 0);
      set({ currentStep: Math.min(Math.max(step, 0), lastStep) });
    },
    play() {
      clearPlaybackTimer();
      set({ isPlaying: true });
      playbackTimer = setInterval(() => get().actions.nextStep(), get().playbackSpeed);
    },
    pause() {
      clearPlaybackTimer();
      set({ isPlaying: false });
    },
    setSpeed(ms) {
      const wasPlaying = get().isPlaying;
      clearPlaybackTimer();
      set({ playbackSpeed: ms, isPlaying: false });

      if (wasPlaying) {
        get().actions.play();
      }
    },
    reset() {
      clearPlaybackTimer();
      set({ traceResult: null, currentStep: 0, isPlaying: false, playbackSpeed: 600 });
    },
  },
}));

function clearPlaybackTimer() {
  if (playbackTimer) {
    clearInterval(playbackTimer);
    playbackTimer = null;
  }
}
