import type { PinnedVariable, SupportedLanguage } from '@algoviz/core/types';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { drawSelection, EditorView, highlightActiveLine, lineNumbers } from '@codemirror/view';
import { useEffect, useRef } from 'react';

import { editorTheme } from './editorTheme';
import { getPinnedVariables, variableGutter } from './editorGutter';
import { setHighlightedLine, sourceLineHighlightField } from './sourceLineHighlight';

export interface CodeEditorProps {
  language: SupportedLanguage;
  defaultValue?: string;
  onPinsChange: (pins: PinnedVariable[]) => void;
  onSourceChange?: (source: string) => void;
  onEditorReady?: (view: EditorView) => void;
  highlightedLineNumber?: number | null;
}

const languageCompartment = new Compartment();

export default function CodeEditor({
  language,
  defaultValue = '',
  onPinsChange,
  onSourceChange,
  onEditorReady,
  highlightedLineNumber = null,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const callbacksRef = useRef({ language, onPinsChange, onSourceChange });

  callbacksRef.current = { language, onPinsChange, onSourceChange };

  useEffect(() => {
    if (!containerRef.current || viewRef.current) {
      return undefined;
    }

    const view = new EditorView({
      parent: containerRef.current,
      state: EditorState.create({
        doc: defaultValue,
        extensions: [
          lineNumbers(),
          drawSelection(),
          highlightActiveLine(),
          editorTheme,
          languageCompartment.of(languageExtension(language)),
          variableGutter({
            getLanguage: () => callbacksRef.current.language,
            onPinsChange: (pins) => callbacksRef.current.onPinsChange(pins),
          }),
          sourceLineHighlightField,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              callbacksRef.current.onSourceChange?.(update.state.doc.toString());
              callbacksRef.current.onPinsChange(getPinnedVariables(update.state));
            }
          }),
        ],
      }),
    });

    viewRef.current = view;
    callbacksRef.current.onSourceChange?.(defaultValue);
    onEditorReady?.(view);

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: languageCompartment.reconfigure(languageExtension(language)),
    });
  }, [language]);

  useEffect(() => {
    const view = viewRef.current;

    if (!view || view.state.doc.toString() === defaultValue) {
      return;
    }

    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: defaultValue,
      },
    });
  }, [defaultValue]);

  useEffect(() => {
    const view = viewRef.current;

    if (!view) {
      return;
    }

    const maxLine = view.state.doc.lines;
    const safeLine =
      highlightedLineNumber && highlightedLineNumber > 0 ? Math.min(highlightedLineNumber, maxLine) : null;

    view.dispatch({ effects: setHighlightedLine.of(safeLine) });
  }, [highlightedLineNumber]);

  return <div className="code-editor" ref={containerRef} />;
}

function languageExtension(language: SupportedLanguage): Extension {
  if (language === 'python') {
    return python();
  }

  if (language === 'javascript' || language === 'csharp') {
    return javascript();
  }

  return java();
}
