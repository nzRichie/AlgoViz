import { render } from '@testing-library/react';
import type { EditorView } from '@codemirror/view';
import { act } from 'react-dom/test-utils';
import { describe, expect, it, vi } from 'vitest';

import { CodeEditor, setDeclarations, togglePin } from '../src/components';

describe('CodeEditor', () => {
  it('renders without error', () => {
    const { container } = render(<CodeEditor language="python" onPinsChange={() => undefined} />);

    expect(container.querySelector('.code-editor')).not.toBeNull();
  });

  it('calls onPinsChange when pins change', () => {
    const onPinsChange = vi.fn();
    let editorView: EditorView | null = null;

    render(
      <CodeEditor
        defaultValue="x = 5"
        language="python"
        onEditorReady={(view) => {
          editorView = view;
        }}
        onPinsChange={onPinsChange}
      />,
    );

    expect(editorView).not.toBeNull();

    act(() => {
      editorView?.dispatch({
        effects: [
          setDeclarations.of(
            new Map([
              [
                1,
                {
                  name: 'x',
                  inferredType: 'primitive',
                },
              ],
            ]),
          ),
          togglePin.of(1),
        ],
      });
    });

    expect(onPinsChange).toHaveBeenCalledWith([
      {
        name: 'x',
        lineNumber: 1,
        inferredType: 'primitive',
      },
    ]);
  });
});
