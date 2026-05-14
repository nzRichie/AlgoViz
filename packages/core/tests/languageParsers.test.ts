import { describe, expect, it } from 'vitest';

import { parseCSharp, parseJava, parseJavaScript } from '../src/parsers';

describe('multi-language declaration parsers', () => {
  it('finds JavaScript declarations', async () => {
    expect((await parseJavaScript('let left = 0;')).linesWithDeclarations().get(1)).toBe('left');
  });

  it('finds Java declarations', async () => {
    expect((await parseJava('int[] arr = new int[] {3, 2, 1};')).linesWithDeclarations().get(1)).toBe('arr');
  });

  it('finds C# declarations', async () => {
    expect((await parseCSharp('var memo = new Dictionary<int, int>();')).linesWithDeclarations().get(1)).toBe('memo');
  });
});
