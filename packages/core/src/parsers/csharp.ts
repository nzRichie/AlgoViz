import type { ParsedAST } from './python';
import { parseDeclarations, SimpleParsedAST } from './simpleDeclarations';

export async function parseCSharp(source: string): Promise<ParsedAST> {
  return new SimpleParsedAST(
    source,
    parseDeclarations(
      source,
      /^(?:var|int|bool|double|string|List<[^>]+>|Dictionary<[^>]+>|HashSet<[^>]+>|int\[\])\s+(?<name>[A-Za-z_]\w*)\s*=\s*(?<expression>.+?);?$/,
    ),
  );
}
