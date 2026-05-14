import { useVizStore, type PlaybackSpeed } from '../store/vizStore';

const speeds: Array<{ label: string; value: PlaybackSpeed }> = [
  { label: 'Slow', value: 1200 },
  { label: 'Normal', value: 600 },
  { label: 'Fast', value: 200 },
];

export default function ControlBar() {
  const currentStep = useVizStore((state) => state.currentStep);
  const isPlaying = useVizStore((state) => state.isPlaying);
  const playbackSpeed = useVizStore((state) => state.playbackSpeed);
  const totalSteps = useVizStore((state) => state.traceResult?.totalSteps ?? 0);
  const actions = useVizStore((state) => state.actions);

  return (
    <div className="control-bar">
      <span>
        Step {totalSteps === 0 ? 0 : currentStep + 1} / {totalSteps}
      </span>
      <button onClick={actions.prevStep} type="button">
        Prev
      </button>
      <button onClick={isPlaying ? actions.pause : actions.play} type="button">
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button onClick={actions.nextStep} type="button">
        Next
      </button>
      <div className="speed-control">
        {speeds.map((speed) => (
          <button
            className={playbackSpeed === speed.value ? 'speed-control__item speed-control__item--active' : 'speed-control__item'}
            key={speed.value}
            onClick={() => actions.setSpeed(speed.value)}
            type="button"
          >
            {speed.label}
          </button>
        ))}
      </div>
      <input
        max={Math.max(totalSteps - 1, 0)}
        min={0}
        onChange={(event) => actions.goToStep(Number(event.target.value))}
        type="range"
        value={currentStep}
      />
    </div>
  );
}
