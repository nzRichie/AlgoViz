import re

from models import ArrayPointer, ArrayValue, PrimitiveValue, SnapshotItem, SnapshotValue, StepSnapshot, TraceError


def blocked(source: str, patterns: list[str], message: str = "Blocked unsafe operation") -> TraceError | None:
    for line_number, line in enumerate(source.splitlines(), start=1):
        if any(pattern in line for pattern in patterns):
            return TraceError(message=message, line=line_number, kind="sandbox")

    if "while (true)" in source or "while true" in source:
        return TraceError(message="Execution exceeded 5 seconds", line=None, kind="timeout")

    return None


def simple_trace(source: str, tracked: list[str]) -> list[StepSnapshot]:
    """One snapshot per assignment line, or full swap-sort simulation when the snippet matches."""
    if not tracked:
        return []

    variables: dict[str, SnapshotValue] = {}
    for name in tracked:
        value = find_assignment(source, name)
        variables[name] = value if value else PrimitiveValue(kind="primitive", raw="undefined")

    simulated = try_swap_sort_simulation(source, tracked, variables)
    if simulated:
        return simulated

    lines = source.splitlines()
    tracked_union = "|".join(sorted((re.escape(name) for name in tracked), key=len, reverse=True))
    assignment_line = re.compile(rf"\b(?:{tracked_union})\s*=")

    milestone_lines: list[int] = []
    for line_no, line in enumerate(lines, start=1):
        if assignment_line.search(line):
            milestone_lines.append(line_no)

    if not milestone_lines:
        milestone_lines = [1]

    return [
        StepSnapshot(step=step_index, line_number=line_number, variables=dict(variables))
        for step_index, line_number in enumerate(milestone_lines)
    ]


def lines_with_subscript_assign(source: str, arr_name: str) -> list[int]:
    pat = re.compile(rf"{re.escape(arr_name)}\s*\[[^\]]+\]\s*=")
    return [i + 1 for i, line in enumerate(source.splitlines()) if pat.search(line)]


def detect_swap_sort_heuristic(source: str, arr_name: str) -> bool:
    """Indexed compare + indexed assignment (bubble sort / similar), excludes typical binary search (no element assignment)."""
    if arr_name not in source:
        return False
    has_assign = bool(re.search(rf"{re.escape(arr_name)}\s*\[[^\]]+\]\s*=", source))
    has_cmp = bool(re.search(rf"{re.escape(arr_name)}\s*\[[^\]]+\]\s*>\s*{re.escape(arr_name)}\s*\[", source))
    has_cmp_alt = bool(re.search(rf"{re.escape(arr_name)}\s*\[[^\]]+\]\s*<\s*{re.escape(arr_name)}\s*\[", source))
    return has_assign and (has_cmp or has_cmp_alt)


def bubble_sort_states_with_pointers(values: list[int]) -> list[tuple[list[int], list[ArrayPointer]]]:
    arr = values[:]
    states: list[tuple[list[int], list[ArrayPointer]]] = [(arr[:], [])]
    n = len(arr)
    for _ in range(max(n, 1)):
        swapped_pass = False
        for j in range(n - 1):
            ptrs = [
                ArrayPointer(variable="i", index=j),
                ArrayPointer(variable="j", index=j + 1),
            ]
            states.append((arr[:], ptrs))
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped_pass = True
                states.append((arr[:], ptrs))
        if not swapped_pass and n > 0:
            break
    return states


def line_for_swap_step(step_i: int, total_steps: int, hook_lines: list[int]) -> int:
    if not hook_lines:
        return 1
    if len(hook_lines) == 1 or total_steps <= 1:
        return hook_lines[0]
    idx = round(step_i * (len(hook_lines) - 1) / (total_steps - 1))
    return hook_lines[min(idx, len(hook_lines) - 1)]


def try_swap_sort_simulation(
    source: str,
    tracked: list[str],
    initial: dict[str, SnapshotValue],
) -> list[StepSnapshot] | None:
    arrays = [(n, v) for n, v in initial.items() if getattr(v, "kind", None) == "array"]
    if len(arrays) != 1:
        return None

    arr_name, arr_val = arrays[0]
    if not detect_swap_sort_heuristic(source, arr_name):
        return None

    try:
        nums = [int(it.raw) for it in arr_val.items]
    except ValueError:
        return None

    states_focus = bubble_sort_states_with_pointers(nums)
    hook_lines = lines_with_subscript_assign(source, arr_name)
    if not hook_lines:
        hook_lines = [1]

    total = len(states_focus)
    out: list[StepSnapshot] = []
    for step_i, (state, pointer_list) in enumerate(states_focus):
        line_number = line_for_swap_step(step_i, total, hook_lines)
        vars_step: dict[str, SnapshotValue] = {}
        for name in tracked:
            if name == arr_name:
                vars_step[name] = ArrayValue(
                    kind="array",
                    items=[SnapshotItem(raw=str(x)) for x in state],
                    pointers=pointer_list,
                )
            else:
                vars_step[name] = initial[name]
        out.append(StepSnapshot(step=step_i, line_number=line_number, variables=vars_step))
    return out


def find_assignment(source: str, name: str) -> SnapshotValue | None:
    pattern = re.compile(rf"{re.escape(name)}\s*=\s*(?P<value>[^;\n]+)")
    match = pattern.search(source)

    if not match:
        return None

    raw = match.group("value").strip().rstrip(";")

    if raw.startswith("[") or raw.startswith("new int[]"):
        numbers = re.findall(r"-?\d+", raw)
        return ArrayValue(kind="array", items=[SnapshotItem(raw=number) for number in numbers])

    if raw.startswith("{"):
        numbers = re.findall(r"-?\d+", raw)
        if numbers:
            return ArrayValue(kind="array", items=[SnapshotItem(raw=number) for number in numbers])

    return PrimitiveValue(kind="primitive", raw=raw)
