import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GraphPanel, MapPanel, MatrixPanel, SetPanel, StackPanel, TreePanel } from '../src/components';
import type { VariableSnapshot } from '@algoviz/core/types';

describe('additional structure panels', () => {
  it('renders matrix cells', () => {
    const { container } = render(<MatrixPanel snapshot={matrixSnapshot()} />);
    expect(container.querySelectorAll('.array-cell')).toHaveLength(4);
  });

  it('renders stack items newest first', () => {
    const { container } = render(<StackPanel snapshot={stackSnapshot()} />);
    expect(container.querySelectorAll('.stack-item')).toHaveLength(2);
  });

  it('renders set pills', () => {
    const { container } = render(<SetPanel snapshot={setSnapshot()} />);
    expect(container.querySelectorAll('.set-pill')).toHaveLength(2);
  });

  it('renders map rows', () => {
    const { container } = render(<MapPanel snapshot={mapSnapshot()} />);
    expect(container.querySelectorAll('.map-row')).toHaveLength(1);
  });

  it('renders tree nodes as svg circles', () => {
    const { container } = render(<TreePanel snapshot={treeSnapshot()} />);
    expect(container.querySelectorAll('.graph-node')).toHaveLength(2);
  });

  it('renders graph nodes as svg circles', () => {
    const { container } = render(<GraphPanel snapshot={graphSnapshot()} />);
    expect(container.querySelectorAll('.graph-node')).toHaveLength(2);
  });
});

function baseSnapshot(value: VariableSnapshot['value'], type: VariableSnapshot['type']): VariableSnapshot {
  return { name: type, type, value, changedIndices: [0], step: 0, lineNumber: 1 };
}

function matrixSnapshot() {
  return baseSnapshot(
    {
      kind: 'matrix',
      rows: [
        [{ raw: '1' }, { raw: '2' }],
        [{ raw: '3' }, { raw: '4' }],
      ],
    },
    'matrix',
  );
}

function stackSnapshot() {
  return baseSnapshot({ kind: 'stack', items: [{ raw: '1' }, { raw: '2' }] }, 'stack');
}

function setSnapshot() {
  return baseSnapshot({ kind: 'set', items: [{ raw: '1' }, { raw: '2' }] }, 'set');
}

function mapSnapshot() {
  return baseSnapshot({ kind: 'map', entries: [[{ raw: "'a'" }, { raw: '1' }]] }, 'map');
}

function treeSnapshot() {
  return baseSnapshot(
    {
      kind: 'tree',
      root: { id: 'root', label: '1', children: [{ id: 'left', label: '2', children: [] }] },
    },
    'tree',
  );
}

function graphSnapshot() {
  return baseSnapshot(
    {
      kind: 'graph',
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      edges: [{ source: 'a', target: 'b' }],
    },
    'graph',
  );
}
