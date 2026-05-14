import re

from models import ArrayValue, PrimitiveValue, SnapshotItem, SnapshotValue, StepSnapshot, TraceError


def blocked(source: str, patterns: list[str], message: str = "Blocked unsafe operation") -> TraceError | None:
    for line_number, line in enumerate(source.splitlines(), start=1):
        if any(pattern in line for pattern in patterns):
            return TraceError(message=message, line=line_number, kind="sandbox")

    if "while (true)" in source or "while true" in source:
        return TraceError(message="Execution exceeded 5 seconds", line=None, kind="timeout")

    return None


def simple_trace(source: str, tracked: list[str]) -> list[StepSnapshot]:
    variables: dict[str, SnapshotValue] = {}

    for name in tracked:
        value = find_assignment(source, name)
        variables[name] = value if value else PrimitiveValue(kind="primitive", raw="undefined")

    return [StepSnapshot(step=0, line_number=1, variables=variables)] if variables else []


def find_assignment(source: str, name: str) -> SnapshotValue | None:
    pattern = re.compile(rf"{re.escape(name)}\s*=\s*(?P<value>[^;\n]+)")
    match = pattern.search(source)

    if not match:
        return None

    raw = match.group("value").strip()

    if raw.startswith("[") or raw.startswith("new int[]"):
        numbers = re.findall(r"-?\d+", raw)
        return ArrayValue(kind="array", items=[SnapshotItem(raw=number) for number in numbers])

    return PrimitiveValue(kind="primitive", raw=raw)
