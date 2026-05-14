import type { ParsedAST } from './python';
import { parseDeclarations, SimpleParsedAST } from './simpleDeclarations';

export async function parseJava(source: string): Promise<ParsedAST> {
  return new SimpleParsedAST(
    source,
    parseDeclarations(
      source,
      /^(?:final\s+)?(?:int|boolean|double|String|List<[^>]+>|Map<[^>]+>|Set<[^>]+>|var|int\[\])\s+(?<name>[A-Za-z_]\w*)\s*=\s*(?<expression>.+?);?$/,
    ),
  );
}
