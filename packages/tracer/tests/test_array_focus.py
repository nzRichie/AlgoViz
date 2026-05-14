from languages.array_focus import (
    infer_array_pointers,
    resolve_persistent_pointers,
    subscript_labels_on_line,
)


def test_infer_two_subscripts_on_comparison_line():
    assert infer_array_pointers("if nums[j] < nums[i]:", "nums", {"i": 3, "j": 1}) == [("j", 1), ("i", 3)]


def test_infer_plus_one_label():
    assert infer_array_pointers("arr[i + 1] = tmp", "arr", {"i": 0}) == [("i+1", 1)]


def test_infer_numeric_literal():
    assert infer_array_pointers("x = dp[0]", "dp", {}) == [("0", 0)]


def test_dedupes_same_label_and_index():
    assert infer_array_pointers("nums[i] + nums[i]", "nums", {"i": 2}) == [("i", 2)]


def test_resolve_index_accept_i_plus_one_without_spaces():
    assert resolve_persistent_pointers(["i+1"], {"i": 2}, 10) == [("i+1", 3)]


def test_subscript_labels_registers_before_resolve_needed():
    assert subscript_labels_on_line("y = 1", "nums") == []
    assert subscript_labels_on_line("nums[i] < 1", "nums") == ["i"]


def test_resolve_persistent_reuses_locals_on_blank_line():
    active = ["i", "j"]
    assert resolve_persistent_pointers(active, {"i": 0, "j": 1}, 3) == [("i", 0), ("j", 1)]
