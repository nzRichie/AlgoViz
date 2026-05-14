# AlgoViz

AlgoViz is a fully local, hostable algorithm visualizer. It lets you write Python, JavaScript, Java, or C# snippets, pin variables from the editor gutter, trace execution through a local backend, and play back variable mutations in Catppuccin Mocha themed visual panels.

## Prerequisites

- Node 20+
- Python 3.11+
- Docker, optional for hosting with Compose

## Local Dev

```sh
python -m venv .venv
.venv/bin/pip install -r packages/tracer/requirements.txt
make dev
```

`make dev` starts the Vite app on `APP_PORT` and the FastAPI tracer on `TRACER_PORT`.

## Docker

```sh
cp .env.example .env
make up
```

The app is served through nginx and proxies `/api/*` to the internal tracer container.

## Pinning Variables

1. Choose or load an example above the editor.
2. Click the gutter marker beside a variable declaration.
3. Confirm the detected variable badge appears below the editor.
4. Click **Run & Visualise** to trace and play back snapshots.

Screenshot placeholder: `docs/screenshots/pinning-walkthrough.png`

## Adding A Language Plugin

1. Add a parser in `packages/core/src/parsers/` that implements `linesWithDeclarations()`.
2. Add a tracer class in `packages/tracer/src/languages/` implementing `LanguageTracer`.
3. Route the language from `packages/tracer/src/main.py`.
4. Add CodeMirror language support in `CodeEditor.tsx`.
5. Add parser, tracer, and renderer tests plus an example under `packages/app/src/examples/`.

## Theme Credit

AlgoViz uses the Catppuccin Mocha palette: https://catppuccin.com/
