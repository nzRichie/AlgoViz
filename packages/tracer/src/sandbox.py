from __future__ import annotations

import builtins
import sys
import threading
from dataclasses import dataclass
from types import FrameType
from typing import Callable

from RestrictedPython import compile_restricted
from RestrictedPython.Eval import default_guarded_getiter
from RestrictedPython.Guards import guarded_iter_unpack_sequence, safer_getattr, safe_builtins

from models import TraceError


TraceCallback = Callable[[FrameType, str, object], Callable[[FrameType, str, object], object] | None]

ALLOWED_BUILTINS = {
    name: safe_builtins.get(name, getattr(builtins, name))
    for name in (
        "abs",
        "bool",
        "dict",
        "enumerate",
        "filter",
        "float",
        "int",
        "len",
        "list",
        "map",
        "max",
        "min",
        "range",
        "reversed",
        "set",
        "sorted",
        "str",
        "sum",
        "tuple",
        "zip",
    )
}
ALLOWED_BUILTINS["print"] = print

BLOCKED_TOKENS = ("__", "eval(", "exec(", "compile(", "open(", "import ", "from ")


def strip_python_line_comments(line: str) -> str:
    """Remove ``#`` comments outside string literals (so blocklist ignores English in comments)."""
    i = 0
    n = len(line)
    in_single = in_double = False

    while i < n:
        c = line[i]

        if not in_single and not in_double:
            if c == "#":
                return line[:i]
            if c == "'":
                in_single = True
                i += 1
                continue
            if c == '"':
                in_double = True
                i += 1
                continue
        else:
            if in_single:
                if c == "\\" and i + 1 < n:
                    i += 2
                    continue
                if c == "'":
                    in_single = False
            elif in_double:
                if c == "\\" and i + 1 < n:
                    i += 2
                    continue
                if c == '"':
                    in_double = False
        i += 1

    return line


def validate_source(source: str) -> TraceError | None:
    for line_number, line in enumerate(source.splitlines(), start=1):
        code_only = strip_python_line_comments(line)
        stripped = code_only.strip()

        if any(token in stripped for token in BLOCKED_TOKENS):
            return TraceError(message="Blocked unsafe operation", line=line_number, kind="sandbox")

        if stripped.startswith(("os.", "sys.", "subprocess.")):
            return TraceError(message="Blocked unsafe module access", line=line_number, kind="sandbox")

    return None


@dataclass(frozen=True)
class SandboxResult:
    namespace: dict[str, object]
    error: TraceError | None


def run_sandboxed(source: str, trace_callback: TraceCallback | None = None) -> SandboxResult:
    blocked_error = validate_source(source)

    if blocked_error:
        return SandboxResult(namespace={}, error=blocked_error)

    namespace: dict[str, object] = {
        "__builtins__": ALLOWED_BUILTINS,
        "_getattr_": safer_getattr,
        "_getitem_": guarded_getitem,
        "_getiter_": default_guarded_getiter,
        "_iter_unpack_sequence_": guarded_iter_unpack_sequence,
        "_write_": guarded_write,
    }

    try:
        byte_code = compile_restricted(source, "<algoviz-user-code>", "exec")
    except SyntaxError as exc:
        return SandboxResult(namespace={}, error=syntax_error(exc))

    error: TraceError | None = None

    def execute() -> None:
        nonlocal error
        if trace_callback:
            previous_trace = sys.gettrace()
            sys.settrace(trace_callback)
        else:
            previous_trace = None

        try:
            exec(byte_code, namespace, namespace)
        except NameError as exc:
            error = TraceError(message=str(exc), line=None, kind="sandbox")
        except Exception as exc:
            error = TraceError(message=str(exc), line=None, kind="runtime")
        finally:
            if trace_callback:
                sys.settrace(previous_trace)

    worker = threading.Thread(target=execute, daemon=True)
    worker.start()
    worker.join(timeout=5)

    if worker.is_alive():
        return SandboxResult(
            namespace=namespace,
            error=TraceError(message="Execution exceeded 5 seconds", line=None, kind="timeout"),
        )

    return SandboxResult(namespace=namespace, error=error)


def syntax_error(exc: SyntaxError) -> TraceError:
    return TraceError(message=exc.msg, line=exc.lineno, kind="syntax")


def guarded_getitem(value: object, index: object) -> object:
    return value[index]  # type: ignore[index]


def guarded_write(value: object) -> object:
    return value
