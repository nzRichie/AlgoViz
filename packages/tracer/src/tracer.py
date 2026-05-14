from typing import Protocol

from models import StepSnapshot, TraceError


class LanguageTracer(Protocol):
    def trace(self, source: str, tracked: list[str]) -> list[StepSnapshot]: ...

    def validate_syntax(self, source: str) -> TraceError | None: ...
