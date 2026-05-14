import { describe, expect, it } from 'vitest';

import { inferRoles } from '../src/detectors';
import type { DetectedVariable, VariableRole } from '../src/types';

describe('inferRoles', () => {
  it.each([
    ['dp', 'array', 'dp_table'],
    ['result', 'primitive', 'result'],
    ['current', 'primitive', 'auxiliary'],
    ['nums', 'array', 'input'],
    ['left', 'primitive', 'pointer'],
    ['window', 'array', 'unknown'],
  ] satisfies Array<[string, DetectedVariable['type'], VariableRole]>)(
    'infers %s as %s',
    (name, type, role) => {
      const [variable] = inferRoles([
        {
          name,
          type,
          role: 'unknown',
          declarationLine: 1,
        },
      ]);

      expect(variable?.role).toBe(role);
    },
  );
});
