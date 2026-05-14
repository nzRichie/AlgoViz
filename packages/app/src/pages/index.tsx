import { detectStructures, inferRoles } from '@algoviz/core/detectors';
import { diffSnapshots } from '@algoviz/core/differ';
import { parseCSharp, parseJava, parseJavaScript, parsePython } from '@algoviz/core/parsers';
import type { ParsedAST } from '@algoviz/core/parsers';
import type { DetectedVariable, PinnedVariable, SupportedLanguage, TraceResult, VariableSnapshot } from '@algoviz/core/types';
import {
  ArrayPanel,
  ControlBar,
  GraphPanel,
  MapPanel,
  MatrixPanel,
  PrimitivePanel,
  SetPanel,
  StackPanel,
  TreePanel,
} from '@algoviz/renderer/components';
import { useTrace } from '@algoviz/renderer/hooks';
import { useVizStore } from '@algoviz/renderer/store/vizStore';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { CodeEditor, LanguageSelector } from '../components';
import '../styles/globals.css';

const examples: Record<SupportedLanguage, string> = {
  python: `def lis(nums):
    dp = [1] * len(nums)
    result = 1
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
        result = max(result, dp[i])
    return result

nums = [3, 1, 4, 1, 5, 9, 2, 6]
answer = lis(nums)
`,
  javascript: `let arr = [5, 1, 4, 2];
let swapped = true;

while (swapped) {
  swapped = false;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) {
      const tmp = arr[i];
      arr[i] = arr[i + 1];
      arr[i + 1] = tmp;
      swapped = true;
    }
  }
}
`,
  java: `int[] arr = new int[] {5, 1, 4, 2};
boolean swapped = true;

while (swapped) {
  swapped = false;
  for (int i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) {
      int tmp = arr[i];
      arr[i] = arr[i + 1];
      arr[i + 1] = tmp;
      swapped = true;
    }
  }
}
`,
  csharp: `int[] arr = {5, 1, 4, 2};
bool swapped = true;

while (swapped) {
  swapped = false;
  for (int i = 0; i < arr.Length - 1; i++) {
    if (arr[i] > arr[i + 1]) {
      int tmp = arr[i];
      arr[i] = arr[i + 1];
      arr[i + 1] = tmp;
      swapped = true;
    }
  }
}
`,
};

function App() {
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [source, setSource] = useState(examples.python);
  function changeLanguage(nextLanguage: SupportedLanguage) {
    setLanguage(nextLanguage);
    setSource(examples[nextLanguage]);
    setPins([]);
    setVariables([]);
    setTrace(emptyTraceResult(nextLanguage));
  }

  const [pins, setPins] = useState<PinnedVariable[]>([]);
  const [variables, setVariables] = useState<DetectedVariable[]>([]);
  const { trace, isLoading, error } = useTrace();
  const traceResult = useVizStore((state) => state.traceResult);
  const currentStep = useVizStore((state) => state.currentStep);
  const setTrace = useVizStore((state) => state.actions.setTrace);
  const highlightedLineNumber = traceResult?.snapshots[currentStep]?.[0]?.lineNumber ?? null;

  useEffect(() => {
    let cancelled = false;

    async function refreshVariables() {
      if (pins.length === 0) {
        setVariables([]);
        return;
      }

      try {
        const ast = await parseForLanguage(language, source);
        const detected = inferRoles(detectStructures(ast, pins.map((pin) => pin.name)));

        if (!cancelled) {
          setVariables(detected);
        }
      } catch {
        if (!cancelled) {
          setVariables([]);
        }
      }
    }

    void refreshVariables();

    return () => {
      cancelled = true;
    };
  }, [language, pins, source]);

  return (
    <main className="app-shell">
      <header className="top-bar">
        <h1>AlgoViz</h1>
        <LanguageSelector value={language} onChange={changeLanguage} />
      </header>

      <section className="editor-panel" aria-label="Code editor">
        <div className="editor-toolbar">
          <label>
            Load Example
            <select
              onChange={(event) => {
                const nextLanguage = event.target.value as SupportedLanguage;
                changeLanguage(nextLanguage);
              }}
              value={language}
            >
              <option value="python">Python: Longest Increasing Subsequence</option>
              <option value="javascript">JavaScript: Bubble sort</option>
              <option value="java">Java: Bubble Sort</option>
              <option value="csharp">C#: Bubble sort</option>
            </select>
          </label>
        </div>
        <CodeEditor
          defaultValue={examples[language]}
          highlightedLineNumber={highlightedLineNumber}
          language={language}
          onPinsChange={setPins}
          onSourceChange={setSource}
        />
      </section>

      <section className="pin-summary" aria-label="Pinned variables">
        {variables.length > 0 ? (
          variables.map((variable) => (
            <span className="variable-badge" key={variable.name}>
              <strong>{variable.name}</strong>
              <span>{variable.type}</span>
            </span>
          ))
        ) : (
          <p>Pin a variable from the editor gutter to preview detected structures.</p>
        )}
      </section>

      <button
        className="run-button"
        disabled={pins.length === 0}
        onClick={() => {
          setTrace(emptyTraceResult(language));
          void trace({
            language,
            source,
            trackedVariables: pins.map((pin) => pin.name),
          });
        }}
        title={pins.length === 0 ? 'Pin at least one variable' : 'Run & Visualise'}
        type="button"
      >
        Run &amp; Visualise
      </button>

      <section className="visualisation-panel" aria-label="Visualisation panel">
        {isLoading ? <div className="skeleton-panel" /> : null}
        {error ? (
          <div className="error-card">
            <strong>Trace failed</strong>
            <p>{error.message}</p>
          </div>
        ) : null}
        {traceResult && traceResult.totalSteps > 0 ? (
          <>
            <ControlBar />
            <div className="panel-grid">
              {snapshotsForStep(traceResult, currentStep).map((snapshot) => {
                const variable = variables.find((item) => item.name === snapshot.name);

                if (snapshot.type === 'array') {
                  return <ArrayPanel key={snapshot.name} snapshot={snapshot} variable={variable} />;
                }

                if (snapshot.type === 'matrix') {
                  return <MatrixPanel key={snapshot.name} snapshot={snapshot} />;
                }

                if (snapshot.type === 'stack') {
                  return <StackPanel key={snapshot.name} snapshot={snapshot} />;
                }

                if (snapshot.type === 'set') {
                  return <SetPanel key={snapshot.name} snapshot={snapshot} />;
                }

                if (snapshot.type === 'map') {
                  return <MapPanel key={snapshot.name} snapshot={snapshot} />;
                }

                if (snapshot.type === 'tree') {
                  return <TreePanel key={snapshot.name} snapshot={snapshot} />;
                }

                if (snapshot.type === 'graph') {
                  return <GraphPanel key={snapshot.name} snapshot={snapshot} />;
                }

                return <PrimitivePanel key={snapshot.name} snapshot={snapshot} />;
              })}
            </div>
          </>
        ) : !isLoading && !error ? (
          <p>Visualisation panels will appear here after tracing is implemented.</p>
        ) : null}
      </section>
    </main>
  );
}

function parseForLanguage(language: SupportedLanguage, source: string): Promise<ParsedAST> {
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

function snapshotsForStep(result: TraceResult, step: number): VariableSnapshot[] {
  return (result.snapshots[step] ?? []).map((snapshot) => {
    const previous = result.snapshots[step - 1]?.find((item) => item.name === snapshot.name) ?? null;
    return diffSnapshots(previous, snapshot);
  });
}

function emptyTraceResult(language: SupportedLanguage): TraceResult {
  return {
    language,
    variables: [],
    snapshots: [],
    totalSteps: 0,
    error: null,
  };
}

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
