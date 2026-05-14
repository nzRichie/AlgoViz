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


def test_blocklist_ignores_from_in_comments():
    source = """# transforming to/from an empty string
x = 1
"""
    result = run_sandboxed(source)

    assert result.error is None
    assert result.namespace["x"] == 1


def test_blocklist_still_blocks_inline_from_import():
    result = run_sandboxed("from os import path")

    assert result.error is not None
    assert result.error.kind == "sandbox"


def test_hash_inside_string_does_not_start_comment():
    result = run_sandboxed('x = "a#b"\ny = 1')

    assert result.error is None
    assert result.namespace["x"] == "a#b"


def test_inline_end_of_line_comment_ignored_for_blocklist():
    result = run_sandboxed("x = 1  # import os would be bad")

    assert result.error is None
