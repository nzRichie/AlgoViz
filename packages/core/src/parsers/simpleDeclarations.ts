import type { ParsedAST, ParsedNode, PythonAssignment } from './python';

export class SimpleParsedAST implements ParsedAST {
  readonly rootNode: ParsedNode;

  constructor(
    readonly source: string,
    private readonly assignments: PythonAssignment[],
  ) {
    this.rootNode = { type: 'program', text: source };
  }

  linesWithDeclarations(): Map<number, string> {
    return new Map(this.assignments.map((assignment) => [assignment.lineNumber, assignment.name]));
  }

  assignmentFor(name: string): PythonAssignment | null {
    return this.assignments.find((assignment) => assignment.name === name) ?? null;
  }
}

export function parseDeclarations(source: string, pattern: RegExp): PythonAssignment[] {
  return source
    .split(/\r?\n/)
    .map((line, index) => {
      const match = pattern.exec(line.trim());

      if (!match?.groups) {
        return null;
      }

      return {
        name: match.groups.name,
        expression: match.groups.expression.trim(),
        lineNumber: index + 1,
      };
    })
    .filter((assignment): assignment is PythonAssignment => assignment !== null);
}
