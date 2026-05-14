import type { ArrayPointer, DetectedVariable, VariableSnapshot } from '@algoviz/core/types';
import { motion } from 'framer-motion';

interface ArrayPanelProps {
  snapshot: VariableSnapshot;
  variable?: DetectedVariable;
}

const POINTER_PALETTE = [
  'var(--ctp-green)',
  'var(--ctp-sapphire)',
  'var(--ctp-peach)',
  'var(--ctp-yellow)',
  'var(--ctp-lavender)',
] as const;

/** First-appearance order → stable palette index per variable name. */
function buildPaletteIndex(pointers: ArrayPointer[]): Map<string, number> {
  const order: string[] = [];
  for (const p of pointers) {
    if (!order.includes(p.variable)) {
      order.push(p.variable);
    }
  }
  return new Map(order.map((v, i) => [v, i]));
}

function paletteColor(paletteIndex: number): string {
  return POINTER_PALETTE[paletteIndex % POINTER_PALETTE.length]!;
}

export default function ArrayPanel({ snapshot, variable }: ArrayPanelProps) {
  const items =
    snapshot.value.kind === 'array' || snapshot.value.kind === 'stack' ? snapshot.value.items : [];
  const pointers: ArrayPointer[] =
    snapshot.value.kind === 'array' ? (snapshot.value.pointers ?? []) : [];
  const paletteMap = buildPaletteIndex(pointers);

  const legendEntries = [...pointers].sort(
    (a, b) => a.variable.localeCompare(b.variable) || a.index - b.index,
  );

  return (
    <article className="viz-panel">
      <header className="viz-panel__header">
        <h3>{snapshot.name}</h3>
        <span>{variable?.role ?? 'unknown'}</span>
      </header>
      {legendEntries.length > 0 ? (
        <div className="array-panel__legend" aria-label="Index pointer key">
          {legendEntries.map((p) => {
            const pi = paletteMap.get(p.variable) ?? 0;
            return (
              <span className="pointer-legend__item" key={`${p.variable}-${p.index}`}>
                <span
                  className="pointer-legend__swatch"
                  style={{ background: paletteColor(pi) }}
                />
                <span className="pointer-legend__name">{p.variable}</span>
                <span className="pointer-legend__idx">→ {p.index}</span>
              </span>
            );
          })}
        </div>
      ) : null}
      <div className="array-panel">
        {items.map((item, index) => {
          const atIdx = pointers.filter((p) => p.index === index);
          atIdx.sort(
            (a, b) => (paletteMap.get(a.variable) ?? 0) - (paletteMap.get(b.variable) ?? 0),
          );

          const hasPointer = atIdx.length > 0;
          const changed = snapshot.changedIndices.includes(index);

          let backgroundColor = 'var(--ctp-surface0)';
          let color = 'var(--ctp-text)';
          let boxShadow = 'none';
          let outline: string | undefined;

          if (hasPointer) {
            backgroundColor = paletteColor(paletteMap.get(atIdx[0]!.variable) ?? 0);
            color = 'var(--ctp-base)';
            if (atIdx.length > 1) {
              const c2 = paletteColor(paletteMap.get(atIdx[1]!.variable) ?? 0);
              boxShadow = `inset 0 3px 0 0 ${c2}`;
            }
            if (atIdx.length > 2) {
              const c3 = paletteColor(paletteMap.get(atIdx[2]!.variable) ?? 0);
              boxShadow = `${boxShadow}, inset 0 -3px 0 0 ${c3}`;
            }
            // Pointers win for fill; mauve outline marks diff vs previous step.
            if (changed) {
              outline = '2px solid var(--ctp-mauve)';
            }
          } else if (changed) {
            backgroundColor = 'var(--ctp-mauve)';
            color = 'var(--ctp-base)';
          }

          let cellClass = 'array-cell';
          if (hasPointer) {
            cellClass += ' array-cell--pointer';
          }
          if (changed && !hasPointer) {
            cellClass += ' array-cell--changed';
          }
          if (changed && hasPointer) {
            cellClass += ' array-cell--pointer-changed';
          }

          return (
            <div className="array-cell-wrap" key={`${index}-${item.raw}`}>
              <motion.div
                animate={{
                  backgroundColor,
                  color,
                  boxShadow,
                  outline: outline ?? 'none',
                }}
                className={cellClass}
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
