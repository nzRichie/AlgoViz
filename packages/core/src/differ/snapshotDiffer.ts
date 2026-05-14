import type { SnapshotItem, SnapshotValue, VariableSnapshot } from '../types';

export function diffSnapshots(
  prev: VariableSnapshot | null,
  curr: VariableSnapshot,
): VariableSnapshot {
  return {
    ...curr,
    changedIndices: changedIndices(prev?.value ?? null, curr.value),
  };
}

function changedIndices(prev: SnapshotValue | null, curr: SnapshotValue): number[] {
  if (!prev) {
    return allIndices(curr);
  }

  if (prev.kind !== curr.kind) {
    return allIndices(curr);
  }

  if (curr.kind === 'primitive' && prev.kind === 'primitive') {
    return prev.raw === curr.raw ? [] : [0];
  }

  if (curr.kind === 'array' && prev.kind === 'array') {
    return changedItemIndices(prev.items, curr.items);
  }

  if (curr.kind === 'matrix' && prev.kind === 'matrix') {
    return curr.rows.flatMap((row, rowIndex) =>
      row
        .map((item, columnIndex) => ({ item, columnIndex }))
        .filter(({ item, columnIndex }) => prev.rows[rowIndex]?.[columnIndex]?.raw !== item.raw)
        .map(({ columnIndex }) => rowIndex * row.length + columnIndex),
    );
  }

  return allIndices(curr);
}

function changedItemIndices(prevItems: SnapshotItem[], currItems: SnapshotItem[]): number[] {
  const maxLength = Math.max(prevItems.length, currItems.length);
  const indices: number[] = [];

  for (let index = 0; index < maxLength; index += 1) {
    if (prevItems[index]?.raw !== currItems[index]?.raw) {
      indices.push(index);
    }
  }

  return indices;
}

function allIndices(value: SnapshotValue): number[] {
  if (value.kind === 'primitive') {
    return [0];
  }

  if (value.kind === 'matrix') {
    return value.rows.flatMap((row, rowIndex) => row.map((_, columnIndex) => rowIndex * row.length + columnIndex));
  }

  if ('items' in value) {
    return value.items.map((_, index) => index);
  }

  if (value.kind === 'map') {
    return value.entries.map((_, index) => index);
  }

  if (value.kind === 'graph') {
    return value.nodes.map((_, index) => index);
  }

  return value.root ? [0] : [];
}
