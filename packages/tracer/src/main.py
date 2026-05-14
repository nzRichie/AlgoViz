import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from languages.csharp_tracer import CSharpTraceError, CSharpTracer
from languages.java_tracer import JavaTraceError, JavaTracer
from languages.js_tracer import JavaScriptTraceError, JavaScriptTracer
from languages.python_tracer import PythonTracer, TraceRuntimeError
from models import DetectedVariable, TraceError, TraceRequest, TraceResult, VariableSnapshot


class RawTraceRequest(BaseModel):
    language: str
    source: str
    trackedVariables: list[str]


app = FastAPI(title="AlgoViz Tracer")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/trace")
def trace(raw_request: RawTraceRequest) -> TraceResult:
    if raw_request.language not in {"python", "javascript", "java", "csharp"}:
        raise HTTPException(status_code=400, detail="Unsupported language")

    request = TraceRequest.model_validate(raw_request.model_dump())

    tracer = tracer_for_language(request.language)
    syntax_error = tracer.validate_syntax(request.source)

    if syntax_error:
        return empty_result(request, syntax_error)

    try:
        steps = tracer.trace(request.source, request.trackedVariables)
    except (TraceRuntimeError, JavaScriptTraceError, JavaTraceError, CSharpTraceError) as exc:
        return empty_result(request, exc.error)
    except Exception as exc:
        return empty_result(request, TraceError(message=str(exc), line=None, kind="runtime"))

    snapshots = [
        [
            VariableSnapshot(
                name=name,
                type=value.kind,
                value=value,
                changedIndices=[],
                step=step.step,
                lineNumber=step.line_number,
            )
            for name, value in step.variables.items()
        ]
        for step in steps
    ]

    return TraceResult(
        language=request.language,
        variables=[
            DetectedVariable(name=name, type="primitive", role="unknown", declarationLine=1)
            for name in request.trackedVariables
        ],
        snapshots=snapshots,
        totalSteps=len(snapshots),
        error=None,
    )


def empty_result(request: TraceRequest, error: TraceError) -> TraceResult:
    return TraceResult(
        language=request.language,
        variables=[],
        snapshots=[],
        totalSteps=0,
        error=error,
    )


def tracer_for_language(language: str):
    if language == "javascript":
        return JavaScriptTracer()

    if language == "java":
        return JavaTracer()

    if language == "csharp":
        return CSharpTracer()

    return PythonTracer()
