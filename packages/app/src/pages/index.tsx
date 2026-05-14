import { detectStructures, inferRoles } from '@algoviz/core/detectors';
import { parsePython } from '@algoviz/core/parsers';
import type { DetectedVariable, PinnedVariable, SupportedLanguage } from '@algoviz/core/types';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { CodeEditor, LanguageSelector } from '../components';
import '../styles/globals.css';

const defaultSource = `def lis(nums):
    dp = [1] * len(nums)
    result = 1
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
        result = max(result, dp[i])
    return result
`;

function App() {
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [source, setSource] = useState(defaultSource);
  const [pins, setPins] = useState<PinnedVariable[]>([]);
  const [variables, setVariables] = useState<DetectedVariable[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function refreshVariables() {
      if (language !== 'python' || pins.length === 0) {
        setVariables([]);
        return;
      }

      try {
        const ast = await parsePython(source);
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
        <LanguageSelector value={language} onChange={setLanguage} />
      </header>

      <section className="editor-panel" aria-label="Code editor">
        <CodeEditor
          defaultValue={defaultSource}
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
        title={pins.length === 0 ? 'Pin at least one variable' : 'Run & Visualise'}
        type="button"
      >
        Run &amp; Visualise
      </button>

      <section className="visualisation-panel" aria-label="Visualisation panel">
        <p>Visualisation panels will appear here after tracing is implemented.</p>
      </section>
    </main>
  );
}

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
