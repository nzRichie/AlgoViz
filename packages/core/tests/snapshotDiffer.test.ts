import { describe, expect, it } from 'vitest';

import { diffSnapshots } from '../src/differ';
import type { VariableSnapshot } from '../src/types';

describe('diffSnapshots', () => {
  it('marks all array indices changed on first step', () => {
    expect(diffSnapshots(null, arraySnapshot(['1', '2'])).changedIndices).toEqual([0, 1]);
  });

  it('does not mark identical arrays changed', () => {
    expect(diffSnapshots(arraySnapshot(['1', '2']), arraySnapshot(['1', '2'])).changedIndices).toEqual([]);
  });

  it('marks a single changed array cell', () => {
    expect(diffSnapshots(arraySnapshot(['1', '2']), arraySnapshot(['1', '3'])).changedIndices).toEqual([1]);
  });

  it('handles different array lengths', () => {
    expect(diffSnapshots(arraySnapshot(['1']), arraySnapshot(['1', '2'])).changedIndices).toEqual([1]);
  });

  it('diffs primitives by raw string equality', () => {
    expect(diffSnapshots(primitiveSnapshot('5'), primitiveSnapshot('5')).changedIndices).toEqual([]);
    expect(diffSnapshots(primitiveSnapshot('5'), primitiveSnapshot('6')).changedIndices).toEqual([0]);
  });
});

function arraySnapshot(items: string[]): VariableSnapshot {
  return {
    name: 'dp',
    type: 'array',
    value: {
      kind: 'array',
      items: items.map((raw) => ({ raw })),
    },
    changedIndices: [],
    step: 0,
    lineNumber: 1,
  };
}

function primitiveSnapshot(raw: string): VariableSnapshot {
  return {
    name: 'x',
    type: 'primitive',
    value: {
      kind: 'primitive',
      raw,
    },
    changedIndices: [],
    step: 0,
    lineNumber: 1,
  };
}
