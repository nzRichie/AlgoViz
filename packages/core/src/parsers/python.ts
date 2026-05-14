import type Parser from 'web-tree-sitter';

import type { TraceError } from '../types';

export interface ParsedNode {
  type: string;
  text: string;
}

export interface ParsedAST {
  readonly source: string;
  readonly rootNode: ParsedNode;
  linesWithDeclarations(): Map<number, string>;
  assignmentFor(name: string): PythonAssignment | null;
}

export interface PythonAssignment {
  name: string;
  expression: string;
  lineNumber: number;
}

let parserRuntime: Promise<typeof Parser> | null = null;

async function initialiseParserRuntime(): Promise<typeof Parser> {
  if (!parserRuntime) {
    parserRuntime = import('web-tree-sitter').then((module) => module.default);
  }

  return parserRuntime;
}

class PythonParsedAST implements ParsedAST {
  readonly rootNode: ParsedNode;

  private readonly assignments: PythonAssignment[];

  constructor(readonly source: string) {
    this.rootNode = {
      type: 'module',
      text: source,
    };
    this.assignments = [...extractAssignments(source), ...extractSingleParameterDefNames(source)];
  }

  linesWithDeclarations(): Map<number, string> {
    return new Map(this.assignments.map((assignment) => [assignment.lineNumber, assignment.name]));
  }

  assignmentFor(name: string): PythonAssignment | null {
    return this.assignments.find((assignment) => assignment.name === name) ?? null;
  }
}

export async function parsePython(source: string): Promise<ParsedAST> {
  await initialiseParserRuntime();
  const syntaxError = validatePythonSyntax(source);

  if (syntaxError) {
    throw syntaxError;
  }

  return new PythonParsedAST(source);
}

function validatePythonSyntax(source: string): TraceError | null {
  const stack: Array<{ char: string; line: number }> = [];
  const pairs: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{',
  };

  for (const [index, line] of source.split(/\r?\n/).entries()) {
    for (const char of stripComment(line)) {
      if (char === '(' || char === '[' || char === '{') {
        stack.push({ char, line: index + 1 });
      }

      if ((char === ')' || char === ']' || char === '}') && stack.pop()?.char !== pairs[char]) {
        return {
          message: `Unmatched closing bracket '${char}'`,
          line: index + 1,
          kind: 'syntax',
        };
      }
    }
  }

  const unmatched = stack.at(-1);

  if (unmatched) {
    return {
      message: `Unmatched opening bracket '${unmatched.char}'`,
      line: unmatched.line,
      kind: 'syntax',
    };
  }

  return null;
}

/** Declares one gutter pin per `def name(single):` line; multi-parameter defs are skipped. */
function extractSingleParameterDefNames(source: string): PythonAssignment[] {
  return source
    .split(/\r?\n/)
    .map((line, index) => {
      const stripped = stripComment(line);
      const match = /^\s*def\s+[A-Za-z_][\w]*\s*\(\s*([A-Za-z_][\w]*)\s*\)\s*:\s*$/.exec(stripped);

      if (!match?.[1]) {
        return null;
      }

      return {
        name: match[1],
        expression: '',
        lineNumber: index + 1,
      } satisfies PythonAssignment;
    })
    .filter((assignment): assignment is PythonAssignment => assignment !== null);
}

function extractAssignments(source: string): PythonAssignment[] {
  return source
    .split(/\r?\n/)
    .map((line, index) => {
      const match = /^(?<indent>\s*)(?<name>[A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?<expression>.+)$/.exec(
        stripComment(line),
      );

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

function stripComment(line: string): string {
  const commentIndex = line.indexOf('#');
  return commentIndex >= 0 ? line.slice(0, commentIndex) : line;
}
