import type { VariableSnapshot } from '@algoviz/core/types';
import { AnimatePresence, motion } from 'framer-motion';

interface SetPanelProps {
  snapshot: VariableSnapshot;
}

export default function SetPanel({ snapshot }: SetPanelProps) {
  const items = snapshot.value.kind === 'set' ? snapshot.value.items : [];

  return (
    <article className="viz-panel">
      <h3>{snapshot.name}</h3>
      <div className="set-panel">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.span
              animate={{ opacity: 1, scale: 1 }}
              className="set-pill"
              exit={{ opacity: 0, scale: 0.92 }}
              initial={{ opacity: 0, scale: 0.92 }}
              key={item.raw}
            >
              {item.raw}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </article>
  );
}
