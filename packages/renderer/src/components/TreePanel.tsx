import type { TreeNode, VariableSnapshot } from '@algoviz/core/types';
import { hierarchy, tree } from 'd3-hierarchy';

interface TreePanelProps {
  snapshot: VariableSnapshot;
}

export default function TreePanel({ snapshot }: TreePanelProps) {
  const root = snapshot.value.kind === 'tree' ? snapshot.value.root : null;
  const layout = root ? tree<TreeNode>().size([360, 180])(hierarchy(root)) : null;

  return (
    <article className="viz-panel">
      <h3>{snapshot.name}</h3>
      <svg className="graph-svg" role="img" viewBox="0 0 420 240">
        {layout?.links().map((link) => (
          <line
            className="graph-edge"
            key={`${link.source.data.id}-${link.target.data.id}`}
            x1={link.source.x + 30}
            x2={link.target.x + 30}
            y1={link.source.y + 20}
            y2={link.target.y + 20}
          />
        ))}
        {layout?.descendants().map((node, index) => (
          <g key={node.data.id} transform={`translate(${node.x + 30}, ${node.y + 20})`}>
            <circle className={index === 0 ? 'graph-node graph-node--active' : 'graph-node'} r="18" />
            <text className="graph-label" dy="4" textAnchor="middle">
              {node.data.label}
            </text>
          </g>
        ))}
      </svg>
    </article>
  );
}
