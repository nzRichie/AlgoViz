import type { ParsedAST, PythonAssignment } from '../parsers';
import type { DataStructureType, DetectedVariable } from '../types';

export function detectStructures(ast: ParsedAST, pinnedNames: string[]): DetectedVariable[] {
  const variables: DetectedVariable[] = [];

  for (const name of pinnedNames) {
    const assignment = ast.assignmentFor(name);

    if (assignment) {
      variables.push({
        name,
        type: classifyAssignment(assignment, ast.source),
        role: 'unknown',
        declarationLine: assignment.lineNumber,
      });
    }
  }

  return variables;
}

function classifyAssignment(assignment: PythonAssignment, source: string): DataStructureType {
  const expression = assignment.expression.trim();

  if (isTreePattern(assignment.name, source)) {
    return 'tree';
  }

  if (isGraphPattern(assignment.name, expression, source)) {
    return 'graph';
  }

  if (isStackPattern(assignment.name, source)) {
    return 'stack';
  }

  if (isMatrixPattern(expression)) {
    return 'matrix';
  }

  if (isArrayPattern(expression)) {
    return 'array';
  }

  if (isSetPattern(expression)) {
    return 'set';
  }

  if (isMapPattern(expression)) {
    return 'map';
  }

  return 'primitive';
}

function isArrayPattern(expression: string): boolean {
  return (
    expression === '[]' ||
    expression === 'list()' ||
    /^\[[^\][]*\]$/.test(expression) ||
    /^\[[^\]]+\]\s*\*\s*[A-Za-z0-9_]+$/.test(expression) ||
    /^\[[^\]]+\s+for\s+.+\]$/.test(expression)
  );
}

function isMatrixPattern(expression: string): boolean {
  return /^\[\s*\[/.test(expression) || /^\[\s*\[[^\]]*\]\s+for\s+/.test(expression);
}

function isSetPattern(expression: string): boolean {
  return (
    expression === 'set()' ||
    (/^\{.+\}$/.test(expression) && !expression.includes(':') && !allSetItemsLookLikeStrings(expression))
  );
}

function isMapPattern(expression: string): boolean {
  return expression === '{}' || expression === 'dict()' || (/^\{.+:.+\}$/.test(expression) && !isGraphLiteral(expression));
}

function isTreePattern(name: string, source: string): boolean {
  const classPattern = /class\s+\w+[\s\S]*?(left|right|children)\s*=/;
  return /tree|root|node/i.test(name) || classPattern.test(source);
}

function isGraphPattern(name: string, expression: string, source: string): boolean {
  return (
    /graph|adj|edges?/i.test(name) ||
    isGraphLiteral(expression) ||
    new RegExp(`${name}\\s*\\[[^\\]]+\\]\\.append\\(`).test(source)
  );
}

function isGraphLiteral(expression: string): boolean {
  return /^\{.+:\s*\[/.test(expression) || /^\[\s*\([^)]*,[^)]*\)/.test(expression);
}

function isStackPattern(name: string, source: string): boolean {
  const appendCount = countMatches(source, `${name}.append(`);
  const popCount = countMatches(source, `${name}.pop(`);
  return /stack/i.test(name) || (appendCount + popCount > 0 && popCount <= appendCount);
}

function allSetItemsLookLikeStrings(expression: string): boolean {
  const inner = expression.slice(1, -1).trim();

  if (!inner) {
    return false;
  }

  return inner.split(',').every((item) => /^['"].+['"]$/.test(item.trim()));
}

function countMatches(source: string, needle: string): number {
  return source.split(needle).length - 1;
}
