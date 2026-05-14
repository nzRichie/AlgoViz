import type { DetectedVariable, VariableSnapshot } from '@algoviz/core/types';
import { motion } from 'framer-motion';

interface ArrayPanelProps {
  snapshot: VariableSnapshot;
  variable?: DetectedVariable;
}

export default function ArrayPanel({ snapshot, variable }: ArrayPanelProps) {
  const items = snapshot.value.kind === 'array' || snapshot.value.kind === 'stack' ? snapshot.value.items : [];

  return (
    <article className="viz-panel">
      <header className="viz-panel__header">
        <h3>{snapshot.name}</h3>
        <span>{variable?.role ?? 'unknown'}</span>
      </header>
      <div className="array-panel">
        {items.map((item, index) => {
          const changed = snapshot.changedIndices.includes(index);

          return (
            <div className="array-cell-wrap" key={`${index}-${item.raw}`}>
              <motion.div
                animate={{ backgroundColor: changed ? 'var(--ctp-mauve)' : 'var(--ctp-surface0)' }}
                className={changed ? 'array-cell array-cell--changed' : 'array-cell'}
                layout
                transition={{ duration: 0.25 }}
              >
                {item.raw}
              </motion.div>
              <span>{index}</span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
