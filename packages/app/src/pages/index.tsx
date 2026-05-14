import React from 'react';
import { createRoot } from 'react-dom/client';

import '../styles/globals.css';

function App() {
  return (
    <main>
      <h1>AlgoViz</h1>
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
