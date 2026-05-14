import { describe, expect, it } from 'vitest';

import { parsePython } from '../src/parsers';
import type { TraceError } from '../src/types';

describe('parsePython', () => {
  it('returns a ParsedAST with an accessible root', async () => {
    const ast = await parsePython('x = 5');

    expect(ast.rootNode.type).toBe('module');
    expect(ast.rootNode.text).toBe('x = 5');
  });

  it('throws TraceError for syntax errors', async () => {
    await expect(parsePython('x = [1, 2')).rejects.toMatchObject({
      kind: 'syntax',
      line: 1,
    } satisfies Partial<TraceError>);
  });

  it('maps dp array declarations to their 1-based line', async () => {
    const ast = await parsePython('n = 4\ndp = [0] * n');

    expect(ast.linesWithDeclarations().get(2)).toBe('dp');
  });

  it('maps a single-parameter def line as a declaration for gutter pinning', async () => {
    const ast = await parsePython(`def lis(nums):
    pass
`);

    expect(ast.linesWithDeclarations().get(1)).toBe('nums');
  });

  it('maps primitive assignments to their 1-based line', async () => {
    const ast = await parsePython('x = 5');

    expect(ast.linesWithDeclarations().get(1)).toBe('x');
  });
});
