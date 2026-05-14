import type { VariableSnapshot } from '@algoviz/core/types';
import { forceCenter, forceLink, forceManyBody, forceSimulation } from 'd3-force';

interface GraphPanelProps {
  snapshot: VariableSnapshot;
}

interface PositionedNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
}

export default function GraphPanel({ snapshot }: GraphPanelProps) {
  const graph = snapshot.value.kind === 'graph' ? snapshot.value : { nodes: [], edges: [] };
  const nodes: PositionedNode[] = graph.nodes.map((node) => ({ ...node }));

  forceSimulation(nodes)
    .force(
      'link',
      forceLink<PositionedNode, { source: string; target: string }>(graph.edges).id((node) => node.id).distance(72),
    )
    .force('charge', forceManyBody().strength(-120))
    .force('center', forceCenter(210, 120))
    .stop()
    .tick(80);

  const byId = new Map(nodes.map((node) => [node.id, node]));

  return (
    <article className="viz-panel">
      <h3>{snapshot.name}</h3>
      <svg className="graph-svg" role="img" viewBox="0 0 420 240">
        {graph.edges.map((edge) => {
          const source = byId.get(edge.source);
          const target = byId.get(edge.target);

          if (!source || !target) {
            return null;
          }

          return (
            <line
              className="graph-edge"
              key={`${edge.source}-${edge.target}`}
              x1={source.x}
              x2={target.x}
              y1={source.y}
              y2={target.y}
            />
          );
        })}
        {nodes.map((node, index) => (
          <g key={node.id} transform={`translate(${node.x ?? 0}, ${node.y ?? 0})`}>
            <circle className={index === 0 ? 'graph-node graph-node--active' : 'graph-node'} r="18" />
            <text className="graph-label" dy="4" textAnchor="middle">
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </article>
  );
}
