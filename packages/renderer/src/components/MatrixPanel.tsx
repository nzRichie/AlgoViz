import type { VariableSnapshot } from '@algoviz/core/types';
import { motion } from 'framer-motion';

interface MatrixPanelProps {
  snapshot: VariableSnapshot;
}

export default function MatrixPanel({ snapshot }: MatrixPanelProps) {
  const rows = snapshot.value.kind === 'matrix' ? snapshot.value.rows : [];
  const columnCount = Math.max(...rows.map((row) => row.length), 0);

  return (
    <article className="viz-panel">
      <h3>{snapshot.name}</h3>
      <div className="matrix-panel" style={{ gridTemplateColumns: `2rem repeat(${columnCount}, 3rem)` }}>
        <span />
        {Array.from({ length: columnCount }, (_, columnIndex) => (
          <span className="matrix-index" key={`column-${columnIndex}`}>
            {columnIndex}
          </span>
        ))}
        {rows.map((row, rowIndex) => [
          <span className="matrix-index" key={`row-${rowIndex}`}>
            {rowIndex}
          </span>,
          ...row.map((item, columnIndex) => {
            const flatIndex = rowIndex * row.length + columnIndex;
            const changed = snapshot.changedIndices.includes(flatIndex);

            return (
              <motion.div
                animate={{ backgroundColor: changed ? 'var(--ctp-mauve)' : 'var(--ctp-surface0)' }}
                className={changed ? 'array-cell array-cell--changed' : 'array-cell'}
                key={`${rowIndex}-${columnIndex}`}
                transition={{ duration: 0.25 }}
              >
                {item.raw}
              </motion.div>
            );
          }),
        ])}
      </div>
    </article>
  );
}
