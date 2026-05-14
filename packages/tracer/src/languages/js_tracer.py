from models import StepSnapshot, TraceError

from languages.simple_serialization import blocked, simple_trace


class JavaScriptTracer:
    def trace(self, source: str, tracked: list[str]) -> list[StepSnapshot]:
        error = self.validate_syntax(source)
        if error:
            raise JavaScriptTraceError(error)

        return simple_trace(source, tracked)

    def validate_syntax(self, source: str) -> TraceError | None:
        return blocked(source, ["require(", "process", "fs"], "Blocked unsafe JavaScript API")


class JavaScriptTraceError(Exception):
    def __init__(self, error: TraceError) -> None:
        super().__init__(error.message)
        self.error = error
