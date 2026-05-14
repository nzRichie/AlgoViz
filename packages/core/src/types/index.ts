export type DataStructureType =
  | 'primitive'
  | 'array'
  | 'matrix'
  | 'stack'
  | 'set'
  | 'map'
  | 'graph'
  | 'tree';

export interface PrimitiveValue {
  kind: 'primitive';
  raw: string;
}

export interface SnapshotItem {
  raw: string;
}

export interface ArrayValue {
  kind: 'array';
  items: SnapshotItem[];
}

export interface MatrixValue {
  kind: 'matrix';
  rows: SnapshotItem[][];
}

export interface StackValue {
  kind: 'stack';
  items: SnapshotItem[];
}

export interface SetValue {
  kind: 'set';
  items: SnapshotItem[];
}

export interface MapValue {
  kind: 'map';
  entries: [SnapshotItem, SnapshotItem][];
}

export interface GraphNode {
  id: string;
  label: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
}

export interface GraphValue {
  kind: 'graph';
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface TreeNode {
  id: string;
  label: string;
  children: TreeNode[];
}

export interface TreeValue {
  kind: 'tree';
  root: TreeNode | null;
}

export type SnapshotValue =
  | PrimitiveValue
  | ArrayValue
  | MatrixValue
  | StackValue
  | SetValue
  | MapValue
  | GraphValue
  | TreeValue;

export interface VariableSnapshot {
  name: string;
  type: DataStructureType;
  value: SnapshotValue;
  changedIndices: number[];
  step: number;
  lineNumber: number;
}

export type SupportedLanguage = 'python' | 'javascript' | 'java' | 'csharp';

export interface TraceRequest {
  language: SupportedLanguage;
  source: string;
  trackedVariables: string[];
}

export type VariableRole =
  | 'dp_table'
  | 'result'
  | 'auxiliary'
  | 'input'
  | 'pointer'
  | 'unknown';

export interface DetectedVariable {
  name: string;
  type: DataStructureType;
  role: VariableRole;
  declarationLine: number;
}

export interface TraceError {
  message: string;
  line: number | null;
  kind: 'syntax' | 'runtime' | 'timeout' | 'sandbox';
}

export interface TraceResult {
  language: SupportedLanguage;
  variables: DetectedVariable[];
  snapshots: VariableSnapshot[][];
  totalSteps: number;
  error: TraceError | null;
}

export interface PinnedVariable {
  name: string;
  lineNumber: number;
  inferredType: DataStructureType;
}

export interface GutterPinState {
  pinnedVariables: PinnedVariable[];
}
