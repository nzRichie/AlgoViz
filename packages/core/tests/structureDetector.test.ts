import { describe, expect, it } from 'vitest';

import { detectStructures } from '../src/detectors';
import { parsePython } from '../src/parsers';
import type { DataStructureType } from '../src/types';

describe('detectStructures', () => {
  it.each([
    ['items = []', 'items', 'array'],
    ['items = list()', 'items', 'array'],
    ['items = [0] * n', 'items', 'array'],
    ['items = [value for value in values]', 'items', 'array'],
    ['grid = [[1, 2], [3, 4]]', 'grid', 'matrix'],
    ['seen = set()', 'seen', 'set'],
    ['seen = {1, 2, 3}', 'seen', 'set'],
    ['lookup = {"a": 1, "b": 2}', 'lookup', 'map'],
    ['lookup = dict()', 'lookup', 'map'],
    ['class Node:\n    left = None\nroot = Node()', 'root', 'tree'],
    ['graph = {"a": ["b"]}', 'graph', 'graph'],
    ['stack = []\nstack.append(1)\nstack.pop()', 'stack', 'stack'],
    ['count = 5', 'count', 'primitive'],
  ] satisfies Array<[string, string, DataStructureType]>)(
    'classifies %s as %s',
    async (source, name, expectedType) => {
      const ast = await parsePython(source);
      const [variable] = detectStructures(ast, [name]);

      expect(variable?.type).toBe(expectedType);
    },
  );

  it('only returns pinned variables that exist in the parsed source', async () => {
    const ast = await parsePython('x = 5');

    expect(detectStructures(ast, ['x', 'missing']).map((variable) => variable.name)).toEqual(['x']);
  });
});
