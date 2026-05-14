from languages.python_tracer import PythonTracer


def test_lis_source_produces_snapshots_with_dp_state():
    source = """
nums = [3, 1, 2]
dp = [1] * len(nums)
for i in range(len(nums)):
    for j in range(i):
        if nums[j] < nums[i]:
            dp[i] = max(dp[i], dp[j] + 1)
"""

    snapshots = PythonTracer().trace(source, ["dp"])
    dp_snapshots = [step.variables["dp"] for step in snapshots if "dp" in step.variables]

    assert len(snapshots) > 0
    assert dp_snapshots[-1].kind == "array"
    assert [item.raw for item in dp_snapshots[-1].items] == ["1", "1", "2"]


def test_primitive_variable_is_captured():
    snapshots = PythonTracer().trace("x = 5\ny = x + 1", ["x"])

    primitive_values = [step.variables["x"].raw for step in snapshots if "x" in step.variables]
    assert "5" in primitive_values


def test_array_pointer_labels_persist_on_lines_without_subscripts():
    source = """nums = [3, 1, 2]
for i in range(len(nums)):
    for j in range(i):
        if nums[j] < nums[i]:
            pass
        side = 1
"""

    snapshots = PythonTracer().trace(source, ["nums"])
    lines = source.splitlines()
    on_assign = [s for s in snapshots if lines[s.line_number - 1].strip() == "side = 1"]
    assert on_assign, "expected a step on side = 1 line"
    ptrs = on_assign[0].variables["nums"].pointers
    labels = {p.variable for p in ptrs}
    assert "i" in labels and "j" in labels
