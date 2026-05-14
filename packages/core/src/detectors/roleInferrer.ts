import type { DetectedVariable } from '../types';

export function inferRoles(variables: DetectedVariable[]): DetectedVariable[] {
  return variables.map((variable) => ({
    ...variable,
    role: inferRole(variable),
  }));
}

function inferRole(variable: DetectedVariable): DetectedVariable['role'] {
  const normalized = variable.name.toLowerCase();

  if (/dp|memo|cache/.test(normalized)) {
    return 'dp_table';
  }

  if (/^(result|ans|output|res)$/.test(normalized)) {
    return 'result';
  }

  if (/^(tmp|temp|current|curr|count|sum|acc)$/i.test(variable.name)) {
    return 'auxiliary';
  }

  if (/^(i|j|k|left|right|mid|index|idx)$/.test(normalized) && variable.type === 'primitive') {
    return 'pointer';
  }

  if (/^(nums|arr|input|values|items)$/.test(normalized)) {
    return 'input';
  }

  return 'unknown';
}
