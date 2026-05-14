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
