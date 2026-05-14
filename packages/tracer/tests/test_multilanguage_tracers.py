from languages.csharp_tracer import CSharpTracer, CSharpTraceError
from languages.java_tracer import JavaTracer, JavaTraceError
from languages.js_tracer import JavaScriptTraceError, JavaScriptTracer


def test_javascript_tracer_returns_snapshots():
    snapshots = JavaScriptTracer().trace("let dp = [1, 2, 3];", ["dp"])

    assert snapshots[0].variables["dp"].kind == "array"


def test_javascript_blocks_require():
    try:
        JavaScriptTracer().trace("require('fs')", ["x"])
    except JavaScriptTraceError as exc:
        assert exc.error.kind == "sandbox"


def test_javascript_timeout_is_reported():
    try:
        JavaScriptTracer().trace("while (true) {}", ["x"])
    except JavaScriptTraceError as exc:
        assert exc.error.kind == "timeout"


def test_java_tracer_returns_snapshots_and_blocks_exit():
    assert JavaTracer().trace("int[] arr = new int[] {3, 2, 1};", ["arr"])[0].variables["arr"].kind == "array"

    try:
        JavaTracer().trace("System.exit(1);", ["arr"])
    except JavaTraceError as exc:
        assert exc.error.kind == "sandbox"


def test_csharp_tracer_returns_snapshots_and_blocks_file_io():
    assert CSharpTracer().trace("int[] arr = new int[] {1, 2};", ["arr"])[0].variables["arr"].kind == "array"

    try:
        CSharpTracer().trace("System.IO.File.ReadAllText(\"x\");", ["arr"])
    except CSharpTraceError as exc:
        assert exc.error.kind == "sandbox"
