from sandbox import run_sandboxed


def test_safe_lis_code_runs_and_returns_result():
    source = """
nums = [10, 9, 2, 5]
dp = [1] * len(nums)
for i in range(len(nums)):
    for j in range(i):
        if nums[j] < nums[i]:
            dp[i] = max(dp[i], dp[j] + 1)
result = max(dp)
"""

    result = run_sandboxed(source)

    assert result.error is None
    assert result.namespace["result"] == 2


def test_open_raises_sandbox_error():
    result = run_sandboxed("open('secret.txt')")

    assert result.error is not None
    assert result.error.kind == "sandbox"


def test_infinite_loop_is_killed():
    result = run_sandboxed("while True:\n    pass")

    assert result.error is not None
    assert result.error.kind == "timeout"


def test_import_os_is_blocked():
    result = run_sandboxed("import os")

    assert result.error is not None
    assert result.error.kind == "sandbox"
