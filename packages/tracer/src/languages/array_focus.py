from __future__ import annotations

import re
from numbers import Integral


def _resolve_index_expr(expr: str, locals_dict: dict) -> int | None:
    expr = expr.strip()
    if expr.isdigit() or (expr.startswith("-") and expr[1:].isdigit()):
        return int(expr)
    m_id = re.fullmatch(r"([A-Za-z_]\w*)", expr)
    if m_id:
        v = locals_dict.get(m_id.group(1))
        if isinstance(v, Integral) and not isinstance(v, bool):
            return int(v)
        return None
    compact = "".join(expr.split())
    m_bin = re.match(r"^([A-Za-z_]\w*)([+-])(\d+)$", compact)
    if m_bin:
        base = locals_dict.get(m_bin.group(1))
        if isinstance(base, Integral) and not isinstance(base, bool):
            k = int(m_bin.group(3))
            return int(base) + k if m_bin.group(2) == "+" else int(base) - k
    return None


def subscript_labels_on_line(line: str, array_name: str) -> list[str]:
    """Normalized subscript text inside array[...] on this line (discovery order); for active-label tracking."""
    labels: list[str] = []
    seen: set[str] = set()
    for match in re.finditer(rf"{re.escape(array_name)}\s*\[([^\]]+)\]", line):
        label = "".join(match.group(1).strip().split())
        if label not in seen:
            seen.add(label)
            labels.append(label)
    return labels


def resolve_persistent_pointers(
    active_labels: list[str],
    locals_dict: dict,
    line_length: int,
) -> list[tuple[str, int]]:
    """Re-resolve each known label every step; omit out-of-range or unresolvable (e.g. i out of bounds)."""
    out: list[tuple[str, int]] = []
    seen_labels: set[str] = set()
    for label in active_labels:
        if label in seen_labels:
            continue
        idx = _resolve_index_expr(label, locals_dict)
        if idx is None or not 0 <= idx < line_length:
            continue
        seen_labels.add(label)
        out.append((label, idx))
    return out


def infer_array_pointers(line: str, array_name: str, locals_dict: dict) -> list[tuple[str, int]]:
    """Collect all resolved arr[expr] subscripts on the line; labels are normalized expr (e.g. i+1)."""
    seen: set[tuple[str, int]] = set()
    out: list[tuple[str, int]] = []
    for match in re.finditer(rf"{re.escape(array_name)}\s*\[([^\]]+)\]", line):
        raw_expr = match.group(1)
        idx = _resolve_index_expr(raw_expr, locals_dict)
        if idx is None:
            continue
        label = "".join(raw_expr.strip().split())
        key = (label, idx)
        if key in seen:
            continue
        seen.add(key)
        out.append((label, idx))
    return out
