import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';

export const editorThemeSpec = {
  '&': {
    backgroundColor: 'var(--ctp-crust)',
    color: 'var(--ctp-text)',
    minHeight: '400px',
    fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, monospace',
  },
  '.cm-scroller': {
    fontFamily: 'inherit',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--ctp-crust)',
    color: 'var(--ctp-overlay0)',
    borderRight: '1px solid var(--ctp-surface1)',
  },
  '.cm-content': {
    caretColor: 'var(--ctp-rosewater)',
    padding: '1rem 0',
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--ctp-rosewater)',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'color-mix(in srgb, var(--ctp-surface2) 65%, transparent)',
  },
  '.cm-activeLine': {
    backgroundColor: 'color-mix(in srgb, var(--ctp-surface0) 42%, transparent)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'color-mix(in srgb, var(--ctp-surface0) 42%, transparent)',
    color: 'var(--ctp-lavender)',
  },
  '.cm-lineHighlight': {
    backgroundColor: 'var(--ctp-surface1)',
  },
};

export const editorHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: 'var(--ctp-mauve)' },
  { tag: tags.string, color: 'var(--ctp-green)' },
  { tag: tags.number, color: 'var(--ctp-peach)' },
  { tag: tags.comment, color: 'var(--ctp-overlay1)', fontStyle: 'italic' },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: 'var(--ctp-blue)' },
  { tag: [tags.className, tags.typeName], color: 'var(--ctp-yellow)' },
  { tag: tags.operator, color: 'var(--ctp-sky)' },
]);

export const editorTheme = [EditorView.theme(editorThemeSpec), syntaxHighlighting(editorHighlightStyle)];
