import type { VariableSnapshot } from '@algoviz/core/types';
import { AnimatePresence, motion } from 'framer-motion';

interface StackPanelProps {
  snapshot: VariableSnapshot;
}

export default function StackPanel({ snapshot }: StackPanelProps) {
  const items = snapshot.value.kind === 'stack' || snapshot.value.kind === 'array' ? [...snapshot.value.items].reverse() : [];

  return (
    <article className="viz-panel">
      <h3>{snapshot.name}</h3>
      <div className="stack-panel">
        <AnimatePresence initial={false}>
          {items.map((item, index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="stack-item"
              exit={{ opacity: 0, y: -12 }}
              initial={{ opacity: 0, y: 12 }}
              key={`${item.raw}-${index}`}
            >
              {item.raw}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </article>
  );
}
