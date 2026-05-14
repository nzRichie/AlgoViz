from __future__ import annotations

import ast
import copy
from types import FrameType

from languages.array_focus import resolve_persistent_pointers, subscript_labels_on_line
from models import ArrayPointer, ArrayValue, MapValue, PrimitiveValue, SetValue, SnapshotItem, SnapshotValue, StepSnapshot, TraceError
from sandbox import run_sandboxed, syntax_error


class PythonTracer:
    def trace(self, source: str, tracked: list[str]) -> list[StepSnapshot]:
        snapshots: list[StepSnapshot] = []
        source_lines = source.splitlines()
        active_labels: dict[str, list[str]] = {name: [] for name in tracked}

        def capture(frame: FrameType, event: str, arg: object):
            if event == "line" and frame.f_code.co_filename == "<algoviz-user-code>":
                variables: dict[str, SnapshotValue] = {}
                line_text = ""
                lineno = frame.f_lineno
                if 0 < lineno <= len(source_lines):
                    line_text = source_lines[lineno - 1]

                for name in tracked:
                    if name in frame.f_locals:
                        snapshot_value = serialise_value(copy.deepcopy(frame.f_locals[name]))
                        if isinstance(snapshot_value, ArrayValue):
                            for label in subscript_labels_on_line(line_text, name):
                                if label not in active_labels[name]:
                                    active_labels[name].append(label)
                            arr_len = len(snapshot_value.items)
                            ptrs = resolve_persistent_pointers(active_labels[name], frame.f_locals, arr_len)
                            snapshot_value = ArrayValue(
                                kind="array",
                                items=snapshot_value.items,
                                pointers=[ArrayPointer(variable=lab, index=i) for lab, i in ptrs],
                            )
                        variables[name] = snapshot_value

                if variables:
                    snapshots.append(
                        StepSnapshot(step=len(snapshots), line_number=frame.f_lineno, variables=variables)
                    )

            return capture

        result = run_sandboxed(source, capture)

        if result.error:
            raise TraceRuntimeError(result.error)

        return snapshots

    def validate_syntax(self, source: str) -> TraceError | None:
        try:
            ast.parse(source)
        except SyntaxError as exc:
            return syntax_error(exc)

        return None


class TraceRuntimeError(Exception):
    def __init__(self, error: TraceError) -> None:
        super().__init__(error.message)
        self.error = error


def serialise_value(value: object) -> SnapshotValue:
    if isinstance(value, list):
        return ArrayValue(kind="array", items=[SnapshotItem(raw=repr(item)) for item in value])

    if isinstance(value, dict):
        return MapValue(
            kind="map",
            entries=[(SnapshotItem(raw=repr(key)), SnapshotItem(raw=repr(item))) for key, item in value.items()],
        )

    if isinstance(value, set):
        return SetValue(kind="set", items=[SnapshotItem(raw=repr(item)) for item in sorted(value, key=repr)])

    return PrimitiveValue(kind="primitive", raw=repr(value))
