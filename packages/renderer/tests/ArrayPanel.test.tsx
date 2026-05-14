import { render } from '@testing-library/react';
import type { VariableSnapshot } from '@algoviz/core/types';
import { describe, expect, it } from 'vitest';

import { ArrayPanel } from '../src/components';

describe('ArrayPanel', () => {
  it('renders one cell per item and marks changed cells', () => {
    const { container } = render(<ArrayPanel snapshot={arraySnapshot([1])} />);

    expect(container.querySelectorAll('.array-cell')).toHaveLength(3);
    expect(container.querySelectorAll('.array-cell--changed')).toHaveLength(1);
  });

  it('renders legend and pointer cells when pointers are set', () => {
    const { container } = render(<ArrayPanel snapshot={arraySnapshotWithPointers()} />);

    expect(container.querySelector('.array-panel__legend')).toBeTruthy();
    expect(container.querySelectorAll('.pointer-legend__item')).toHaveLength(2);
    expect(container.querySelectorAll('.array-cell--pointer')).toHaveLength(2);
  });
});

function arraySnapshot(changedIndices: number[]): VariableSnapshot {
  return {
    name: 'dp',
    type: 'array',
    value: {
      kind: 'array',
      items: [{ raw: '1' }, { raw: '2' }, { raw: '3' }],
    },
    changedIndices,
    step: 0,
    lineNumber: 1,
  };
}

function arraySnapshotWithPointers(): VariableSnapshot {
  return {
    name: 'arr',
    type: 'array',
    value: {
      kind: 'array',
      items: [{ raw: '1' }, { raw: '2' }, { raw: '3' }],
      pointers: [
        { variable: 'i', index: 0 },
        { variable: 'j', index: 2 },
      ],
    },
    changedIndices: [],
    step: 0,
    lineNumber: 1,
  };
}
