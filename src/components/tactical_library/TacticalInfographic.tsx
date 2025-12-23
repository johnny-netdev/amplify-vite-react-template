import React, { useState } from 'react';

interface InfoNode {
  id: string;
  label: string;
  description: string;
  details: string[];
}

interface InfographicProps {
  data: {
    title: string;
    nodes: InfoNode[];
  };
  accent: string;
}

const TacticalInfographic: React.FC<InfographicProps> = ({ data, accent }) => {
  const [activeNode, setActiveNode] = useState<InfoNode | null>(null);

  return (
    <div style={i.container}>
      <h3 style={{ ...i.title, color: accent }}>{data.title} // ARCHITECTURE_VIEW</h3>
      
      <div style={i.layout}>
        {/* LEFT: The Interactive Nodes */}
        <div style={i.nodeList}>
          {data.nodes.map((node) => (
            <div 
              key={node.id}
              onMouseEnter={() => setActiveNode(node)}
              style={{
                ...i.node,
                borderColor: activeNode?.id === node.id ? accent : '#333',
                background: activeNode?.id === node.id ? `${accent}10` : 'transparent'
              }}
            >
              <div style={{ ...i.nodeLabel, color: activeNode?.id === node.id ? accent : '#666' }}>
                {node.label}
              </div>
              <p style={i.nodeDesc}>{node.description}</p>
            </div>
          ))}
        </div>

        {/* RIGHT: The Intelligence Detail Panel */}
        <div style={{ ...i.detailPanel, borderColor: accent }}>
          {activeNode ? (
            <div>
              <div style={{ ...i.tag, background: accent }}>INTEL_CORE: {activeNode.label}</div>
              <ul style={i.detailList}>
                {activeNode.details.map((detail, idx) => (
                  <li key={idx} style={i.detailItem}>
                    <span style={{ color: accent, marginRight: '8px' }}>&gt;</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div style={i.idle}>SELECT_NODE_FOR_ANALYSIS...</div>
          )}
        </div>
      </div>
    </div>
  );
};

const i = {
  container: { fontFamily: 'monospace', height: '100%' },
  title: { fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '1.5rem' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', height: 'calc(100% - 40px)' },
  nodeList: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  node: { padding: '15px', border: '1px solid', borderRadius: '4px', cursor: 'pointer', transition: '0.2s' },
  nodeLabel: { fontSize: '0.9rem', fontWeight: 'bold' as const, marginBottom: '5px' },
  nodeDesc: { fontSize: '0.7rem', color: '#888', margin: 0 },
  detailPanel: { 
    background: 'rgba(255,255,255,0.02)', border: '1px solid', borderRadius: '4px', padding: '20px',
    position: 'relative' as const, overflowY: 'auto' as const
  },
  tag: { padding: '4px 10px', fontSize: '0.6rem', color: 'black', fontWeight: 'bold' as const, marginBottom: '20px', display: 'inline-block' },
  detailList: { listStyle: 'none', padding: 0, margin: 0 },
  detailItem: { fontSize: '0.8rem', color: '#ccc', marginBottom: '12px', lineHeight: '1.4' },
  idle: { height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#333', fontSize: '0.7rem' }
};

export default TacticalInfographic;