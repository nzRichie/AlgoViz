import type { VariableSnapshot } from '@algoviz/core/types';
import { motion } from 'framer-motion';

interface PrimitivePanelProps {
  snapshot: VariableSnapshot;
}

export default function PrimitivePanel({ snapshot }: PrimitivePanelProps) {
  const value = snapshot.value.kind === 'primitive' ? snapshot.value.raw : '';
  const changed = snapshot.changedIndices.includes(0);

  return (
    <article className="viz-panel">
      <h3>{snapshot.name}</h3>
      <motion.div
        animate={{
          backgroundColor: changed ? 'var(--ctp-mauve)' : 'var(--ctp-surface0)',
          color: changed ? 'var(--ctp-base)' : 'var(--ctp-text)',
        }}
        className={changed ? 'primitive-cell primitive-cell--changed' : 'primitive-cell'}
        transition={{ duration: 0.25 }}
      >
        {value}
      </motion.div>
    </article>
  );
}
