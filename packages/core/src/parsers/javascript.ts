import type { ParsedAST } from './python';
import { parseDeclarations, SimpleParsedAST } from './simpleDeclarations';

export async function parseJavaScript(source: string): Promise<ParsedAST> {
  return new SimpleParsedAST(
    source,
    parseDeclarations(source, /^(?:const|let|var)\s+(?<name>[A-Za-z_$][\w$]*)\s*=\s*(?<expression>.+?);?$/),
  );
}
