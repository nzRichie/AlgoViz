from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field


DataStructureType = Literal["primitive", "array", "matrix", "stack", "set", "map", "graph", "tree"]
SupportedLanguage = Literal["python", "javascript", "java", "csharp"]
VariableRole = Literal["dp_table", "result", "auxiliary", "input", "pointer", "unknown"]
TraceErrorKind = Literal["syntax", "runtime", "timeout", "sandbox"]


class PrimitiveValue(BaseModel):
    kind: Literal["primitive"]
    raw: str


class SnapshotItem(BaseModel):
    raw: str


class ArrayPointer(BaseModel):
    """Legend label (e.g. i, j, i+1) and resolved index into the array."""

    variable: str
    index: int


class ArrayValue(BaseModel):
    kind: Literal["array"]
    items: list[SnapshotItem]
    pointers: list[ArrayPointer] = Field(default_factory=list)


class MatrixValue(BaseModel):
    kind: Literal["matrix"]
    rows: list[list[SnapshotItem]]


class StackValue(BaseModel):
    kind: Literal["stack"]
    items: list[SnapshotItem]


class SetValue(BaseModel):
    kind: Literal["set"]
    items: list[SnapshotItem]


class MapValue(BaseModel):
    kind: Literal["map"]
    entries: list[tuple[SnapshotItem, SnapshotItem]]


class GraphNode(BaseModel):
    id: str
    label: str


class GraphEdge(BaseModel):
    source: str
    target: str
    label: str | None = None


class GraphValue(BaseModel):
    kind: Literal["graph"]
    nodes: list[GraphNode]
    edges: list[GraphEdge]


class TreeNode(BaseModel):
    id: str
    label: str
    children: list["TreeNode"]


class TreeValue(BaseModel):
    kind: Literal["tree"]
    root: TreeNode | None


SnapshotValue = Annotated[
    Union[PrimitiveValue, ArrayValue, MatrixValue, StackValue, SetValue, MapValue, GraphValue, TreeValue],
    Field(discriminator="kind"),
]


class VariableSnapshot(BaseModel):
    name: str
    type: DataStructureType
    value: SnapshotValue
    changedIndices: list[int]
    step: int
    lineNumber: int


class TraceRequest(BaseModel):
    language: SupportedLanguage
    source: str
    trackedVariables: list[str]


class DetectedVariable(BaseModel):
    name: str
    type: DataStructureType
    role: VariableRole
    declarationLine: int


class TraceError(BaseModel):
    message: str
    line: int | None
    kind: TraceErrorKind


class TraceResult(BaseModel):
    language: SupportedLanguage
    variables: list[DetectedVariable]
    snapshots: list[list[VariableSnapshot]]
    totalSteps: int
    error: TraceError | None


class GutterPinState(BaseModel):
    pinnedVariables: list["PinnedVariable"]


class PinnedVariable(BaseModel):
    name: str
    lineNumber: int
    inferredType: DataStructureType


class StepSnapshot(BaseModel):
    step: int
    line_number: int
    variables: dict[str, SnapshotValue]
