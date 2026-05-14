import { EditorState } from '@codemirror/state';
import { describe, expect, it } from 'vitest';

import {
  declarationLineField,
  getPinnedVariables,
  pinnedLineField,
  setDeclarations,
  togglePin,
} from '../src/components';

describe('editorGutter state', () => {
  it('toggles a pinned line on and off', () => {
    let state = createState();

    state = state.update({ effects: togglePin.of(1) }).state;
    expect(state.field(pinnedLineField).has(1)).toBe(true);

    state = state.update({ effects: togglePin.of(1) }).state;
    expect(state.field(pinnedLineField).has(1)).toBe(false);
  });

  it('clears pins when a declaration line disappears', () => {
    let state = createState();

    state = state.update({ effects: [setDeclarations.of(declarations([[1, 'x']])), togglePin.of(1)] }).state;
    expect(state.field(pinnedLineField).has(1)).toBe(true);

    state = state.update({ effects: setDeclarations.of(declarations([])) }).state;
    expect(state.field(pinnedLineField).has(1)).toBe(false);
  });

  it('returns pinned variable names and line numbers', () => {
    let state = createState();

    state = state.update({ effects: [setDeclarations.of(declarations([[2, 'dp']])), togglePin.of(2)] }).state;

    expect(getPinnedVariables(state)).toEqual([
      {
        name: 'dp',
        lineNumber: 2,
        inferredType: 'array',
      },
    ]);
  });
});

function createState(): EditorState {
  return EditorState.create({
    doc: 'x = 5\ndp = []',
    extensions: [pinnedLineField, declarationLineField],
  });
}

function declarations(lines: Array<[number, string]>) {
  return new Map(
    lines.map(([lineNumber, name]) => [
      lineNumber,
      {
        name,
        inferredType: name === 'dp' ? 'array' : 'primitive',
      } as const,
    ]),
  );
}
