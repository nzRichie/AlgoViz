import { describe, expect, it } from 'vitest';

import { editorThemeSpec } from '../src/components';

describe('editorTheme', () => {
  it('defines the required CodeMirror surface selectors', () => {
    expect(editorThemeSpec).toHaveProperty('&');
    expect(editorThemeSpec).toHaveProperty('.cm-gutters');
    expect(editorThemeSpec).toHaveProperty('.cm-content');
    expect(editorThemeSpec).toHaveProperty('.cm-activeLine');
  });
});
