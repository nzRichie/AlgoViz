import { describe, expect, it } from 'vitest';

import type {
  GutterPinState,
  TraceRequest,
  TraceResult,
  VariableSnapshot,
} from '../src/types';

describe('shared types', () => {
  it('models trace requests and results across package boundaries', () => {
    const request = {
      language: 'python',
      source: 'x = 5',
      trackedVariables: ['x'],
    } satisfies TraceRequest;

    const snapshot = {
      name: 'x',
      type: 'primitive',
      value: {
        kind: 'primitive',
        raw: '5',
      },
      changedIndices: [0],
      step: 0,
      lineNumber: 1,
    } satisfies VariableSnapshot;

    const result = {
      language: request.language,
      variables: [
        {
          name: 'x',
          type: 'primitive',
          role: 'unknown',
          declarationLine: 1,
        },
      ],
      snapshots: [[snapshot]],
      totalSteps: 1,
      error: null,
    } satisfies TraceResult;

    expect(result.snapshots[0]?.[0]?.value.kind).toBe('primitive');
  });

  it('models CodeMirror gutter pin state', () => {
    const state = {
      pinnedVariables: [
        {
          name: 'dp',
          lineNumber: 3,
          inferredType: 'array',
        },
      ],
    } satisfies GutterPinState;

    expect(state.pinnedVariables[0]?.name).toBe('dp');
  });
});
