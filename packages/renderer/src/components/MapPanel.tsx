import type { VariableSnapshot } from '@algoviz/core/types';
import { motion } from 'framer-motion';

interface MapPanelProps {
  snapshot: VariableSnapshot;
}

export default function MapPanel({ snapshot }: MapPanelProps) {
  const entries = snapshot.value.kind === 'map' ? snapshot.value.entries : [];

  return (
    <article className="viz-panel">
      <h3>{snapshot.name}</h3>
      <div className="map-panel">
        {entries.map(([key, value], index) => {
          const changed = snapshot.changedIndices.includes(index);

          return (
            <div className="map-row" key={key.raw}>
              <span className="map-key">{key.raw}</span>
              <motion.span
                animate={{
                  backgroundColor: changed ? 'var(--ctp-mauve)' : 'var(--ctp-surface0)',
                  color: changed ? 'var(--ctp-base)' : 'var(--ctp-text)',
                }}
                className={changed ? 'map-value map-value--changed' : 'map-value'}
                transition={{ duration: 0.25 }}
              >
                {value.raw}
              </motion.span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
