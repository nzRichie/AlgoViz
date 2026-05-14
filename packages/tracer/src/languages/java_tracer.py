from models import StepSnapshot, TraceError

from languages.simple_serialization import blocked, simple_trace


class JavaTracer:
    def trace(self, source: str, tracked: list[str]) -> list[StepSnapshot]:
        error = self.validate_syntax(source)
        if error:
            raise JavaTraceError(error)

        return simple_trace(source, tracked)

    def validate_syntax(self, source: str) -> TraceError | None:
        return blocked(source, ["System.exit", "java.io", "Files."], "Blocked unsafe Java API")


class JavaTraceError(Exception):
    def __init__(self, error: TraceError) -> None:
        super().__init__(error.message)
        self.error = error
