import { detectStructures } from '@algoviz/core/detectors';
import { parseCSharp, parseJava, parseJavaScript, parsePython } from '@algoviz/core/parsers';
import type { DataStructureType, PinnedVariable, SupportedLanguage } from '@algoviz/core/types';
import type { Extension } from '@codemirror/state';
import { EditorState, StateEffect, StateField } from '@codemirror/state';
import { EditorView, gutter, GutterMarker, ViewPlugin } from '@codemirror/view';

interface DeclarationInfo {
  name: string;
  inferredType: DataStructureType;
}

interface VariableGutterOptions {
  onPinsChange?: (pins: PinnedVariable[]) => void;
  getLanguage?: () => SupportedLanguage;
}

export const togglePin = StateEffect.define<number>();
export const setDeclarations = StateEffect.define<Map<number, DeclarationInfo>>();

export const pinnedLineField = StateField.define<ReadonlySet<number>>({
  create() {
    return new Set<number>();
  },
  update(value, transaction) {
    let next = new Set(value);

    for (const effect of transaction.effects) {
      if (effect.is(togglePin)) {
        if (next.has(effect.value)) {
          next.delete(effect.value);
        } else {
          next.add(effect.value);
        }
      }

      if (effect.is(setDeclarations)) {
        next = new Set([...next].filter((lineNumber) => effect.value.has(lineNumber)));
      }
    }

    return next;
  },
});

export const declarationLineField = StateField.define<ReadonlyMap<number, DeclarationInfo>>({
  create() {
    return new Map<number, DeclarationInfo>();
  },
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(setDeclarations)) {
        return effect.value;
      }
    }

    return value;
  },
});

class VariableGutterMarker extends GutterMarker {
  constructor(
    private readonly lineNumber: number,
    private readonly pinned: boolean,
  ) {
    super();
  }

  toDOM(view: EditorView): HTMLElement {
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = this.pinned ? 'cm-variable-marker cm-variable-marker-pinned' : 'cm-variable-marker';
    marker.setAttribute('aria-label', this.pinned ? 'Unpin variable' : 'Pin variable');
    marker.addEventListener('click', (event) => {
      event.preventDefault();
      view.dispatch({
        effects: togglePin.of(this.lineNumber),
      });
    });
    return marker;
  }
}

export function variableGutter(options: VariableGutterOptions = {}): Extension {
  const parserPlugin = ViewPlugin.fromClass(
    class {
      private timer: number | null = null;

      constructor(private readonly view: EditorView) {
        this.scheduleParse();
      }

      update(update: { docChanged: boolean }) {
        if (update.docChanged) {
          this.scheduleParse();
        }
      }

      destroy() {
        if (this.timer) {
          window.clearTimeout(this.timer);
        }
      }

      private scheduleParse() {
        if (this.timer) {
          window.clearTimeout(this.timer);
        }

        this.timer = window.setTimeout(() => {
          void this.refreshDeclarations();
        }, 300);
      }

      private async refreshDeclarations() {
        const declarations = await buildDeclarationInfo(
          this.view.state.doc.toString(),
          options.getLanguage?.() ?? 'python',
        );
        this.view.dispatch({
          effects: setDeclarations.of(declarations),
        });
      }
    },
  );

  return [
    pinnedLineField,
    declarationLineField,
    parserPlugin,
    gutter({
      class: 'cm-variable-gutter',
      lineMarker(view, line) {
        const lineNumber = view.state.doc.lineAt(line.from).number;
        const declarations = view.state.field(declarationLineField);

        if (!declarations.has(lineNumber)) {
          return null;
        }

        return new VariableGutterMarker(lineNumber, view.state.field(pinnedLineField).has(lineNumber));
      },
    }),
    EditorView.updateListener.of((update) => {
      if (update.transactions.length > 0) {
        options.onPinsChange?.(getPinnedVariables(update.state));
      }
    }),
    EditorView.theme({
      '.cm-variable-gutter': {
        width: '1.5rem',
      },
      '.cm-variable-marker': {
        width: '0.72rem',
        height: '0.72rem',
        borderRadius: '999px',
        border: '1px solid var(--ctp-overlay0)',
        background: 'transparent',
        padding: '0',
        cursor: 'pointer',
      },
      '.cm-variable-marker-pinned': {
        borderColor: 'var(--ctp-blue)',
        background: 'var(--ctp-blue)',
      },
    }),
  ];
}

export function getPinnedVariables(state: EditorState): PinnedVariable[] {
  const pinnedLines = state.field(pinnedLineField, false) ?? new Set<number>();
  const declarations = state.field(declarationLineField, false) ?? new Map<number, DeclarationInfo>();

  return [...pinnedLines]
    .sort((left, right) => left - right)
    .map((lineNumber) => {
      const declaration = declarations.get(lineNumber);

      if (!declaration) {
        return null;
      }

      return {
        name: declaration.name,
        lineNumber,
        inferredType: declaration.inferredType,
      } satisfies PinnedVariable;
    })
    .filter((pin): pin is PinnedVariable => pin !== null);
}

async function buildDeclarationInfo(
  source: string,
  language: SupportedLanguage,
): Promise<Map<number, DeclarationInfo>> {
  const ast = await parseForLanguage(language, source);
  const declaredNames = [...ast.linesWithDeclarations().values()];
  const detected = detectStructures(ast, declaredNames);
  const byName = new Map(detected.map((variable) => [variable.name, variable.type]));

  return new Map(
    [...ast.linesWithDeclarations()].map(([lineNumber, name]) => [
      lineNumber,
      {
        name,
        inferredType: byName.get(name) ?? 'primitive',
      },
    ]),
  );
}

function parseForLanguage(language: SupportedLanguage, source: string) {
  if (language === 'javascript') {
    return parseJavaScript(source);
  }

  if (language === 'java') {
    return parseJava(source);
  }

  if (language === 'csharp') {
    return parseCSharp(source);
  }

  return parsePython(source);
}
