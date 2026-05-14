from languages.csharp_tracer import CSharpTracer, CSharpTraceError
from languages.java_tracer import JavaTracer, JavaTraceError
from languages.js_tracer import JavaScriptTraceError, JavaScriptTracer


def test_javascript_tracer_returns_snapshots():
    snapshots = JavaScriptTracer().trace("let dp = [1, 2, 3];", ["dp"])

    assert snapshots[0].variables["dp"].kind == "array"


def test_javascript_simple_trace_has_step_per_assignment_line():
    snapshots = JavaScriptTracer().trace("let a = 1;\nlet b = 2;", ["a", "b"])
    assert len(snapshots) == 2
    assert snapshots[0].line_number == 1
    assert snapshots[1].line_number == 2


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

    snapshots = CSharpTracer().trace("int[] arr = {1, 2, 3};", ["arr"])
    assert snapshots[0].variables["arr"].kind == "array"

    try:
        CSharpTracer().trace("System.IO.File.ReadAllText(\"x\");", ["arr"])
    except CSharpTraceError as exc:
        assert exc.error.kind == "sandbox"


JAVA_BUBBLE_SORT = """int[] arr = new int[] {5, 1, 4, 2};
boolean swapped = true;

while (swapped) {
  swapped = false;
  for (int i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) {
      int tmp = arr[i];
      arr[i] = arr[i + 1];
      arr[i + 1] = tmp;
      swapped = true;
    }
  }
}
"""

JS_BUBBLE_SORT = """let arr = [5, 1, 4, 2];
let swapped = true;

while (swapped) {
  swapped = false;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) {
      const tmp = arr[i];
      arr[i] = arr[i + 1];
      arr[i + 1] = tmp;
      swapped = true;
    }
  }
}
"""

CS_BUBBLE_SORT = """int[] arr = {5, 1, 4, 2};
bool swapped = true;

while (swapped) {
  swapped = false;
  for (int i = 0; i < arr.Length - 1; i++) {
    if (arr[i] > arr[i + 1]) {
      int tmp = arr[i];
      arr[i] = arr[i + 1];
      arr[i + 1] = tmp;
      swapped = true;
    }
  }
}
"""


def test_java_bubble_sort_simulation_reaches_sorted_state():
    steps = JavaTracer().trace(JAVA_BUBBLE_SORT, ["arr"])
    assert len(steps) > 1
    assert [int(x.raw) for x in steps[-1].variables["arr"].items] == [1, 2, 4, 5]
    with_ptrs = next(s for s in steps if len(s.variables["arr"].pointers) >= 2)
    assert {p.variable for p in with_ptrs.variables["arr"].pointers} == {"i", "j"}


def test_javascript_bubble_sort_simulation_reaches_sorted_state():
    steps = JavaScriptTracer().trace(JS_BUBBLE_SORT, ["arr"])
    assert len(steps) > 1
    assert [int(x.raw) for x in steps[-1].variables["arr"].items] == [1, 2, 4, 5]
    with_ptrs = next(s for s in steps if len(s.variables["arr"].pointers) >= 2)
    assert {p.variable for p in with_ptrs.variables["arr"].pointers} == {"i", "j"}


def test_csharp_bubble_sort_simulation_reaches_sorted_state():
    steps = CSharpTracer().trace(CS_BUBBLE_SORT, ["arr"])
    assert len(steps) > 1
    assert [int(x.raw) for x in steps[-1].variables["arr"].items] == [1, 2, 4, 5]
    with_ptrs = next(s for s in steps if len(s.variables["arr"].pointers) >= 2)
    assert {p.variable for p in with_ptrs.variables["arr"].pointers} == {"i", "j"}
