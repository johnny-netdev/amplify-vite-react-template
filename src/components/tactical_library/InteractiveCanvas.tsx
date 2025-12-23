import React, { useState } from 'react';

interface DraggableItem {
  id: string;
  label: string;
}

interface DropZone {
  id: string;
  expectedItemId: string; // The ID of the item that belongs here
  label: string;
}

interface CanvasProps {
  data: {
    title: string;
    items: DraggableItem[];
    zones: DropZone[];
    successMessage: string;
  };
  accent: string;
}

const InteractiveCanvas: React.FC<CanvasProps> = ({ data, accent }) => {
  // Tracks which item is in which zone: { zoneId: itemId }
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [isVerified, setIsVerified] = useState(false);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData('itemId', itemId);
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    const itemId = e.dataTransfer.getData('itemId');
    setPlacements(prev => ({ ...prev, [zoneId]: itemId }));
    setIsVerified(false);
  };

  const checkSolution = () => {
    const allCorrect = data.zones.every(zone => placements[zone.id] === zone.expectedItemId);
    if (allCorrect) setIsVerified(true);
    else alert("CONFIGURATION_ERROR: Network topology invalid.");
  };

  return (
    <div style={c.container}>
      <h3 style={{ color: accent, fontSize: '0.8rem', marginBottom: '20px' }}>LAB_ENVIRONMENT // {data.title}</h3>

      <div style={c.workspace}>
        {/* ASSET REPOSITORY */}
        <div style={c.drawer}>
          <span style={c.label}>ASSET_REPOSITORY</span>
          {data.items.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              style={{ ...c.draggable, borderColor: accent, color: accent }}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* DROP ZONES (THE NETWORK) */}
        <div style={c.canvas}>
          {data.zones.map(zone => (
            <div
              key={zone.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, zone.id)}
              style={{
                ...c.zone,
                borderColor: placements[zone.id] ? accent : '#333',
                background: placements[zone.id] ? `${accent}10` : 'transparent'
              }}
            >
              <span style={c.zoneLabel}>{zone.label}</span>
              {placements[zone.id] && (
                <div style={{ color: accent, fontWeight: 'bold' }}>
                  {data.items.find(i => i.id === placements[zone.id])?.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={c.footer}>
        {isVerified ? (
          <div style={{ color: '#00ff41', fontWeight: 'bold' }}>{data.successMessage}</div>
        ) : (
          <button onClick={checkSolution} style={{ ...c.btn, background: accent }}>DEPLOY_CONFIGURATION</button>
        )}
      </div>
    </div>
  );
};

const c = {
  container: { height: '100%', fontFamily: 'monospace', display: 'flex', flexDirection: 'column' as const },
  workspace: { display: 'grid', gridTemplateColumns: '200px 1fr', gap: '30px', flex: 1 },
  drawer: { background: 'rgba(255,255,255,0.03)', padding: '15px', border: '1px solid #222', borderRadius: '4px' },
  label: { fontSize: '0.6rem', color: '#666', display: 'block', marginBottom: '15px' },
  draggable: { padding: '10px', border: '1px solid', marginBottom: '10px', cursor: 'grab', fontSize: '0.8rem', textAlign: 'center' as const },
  canvas: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '20px', padding: '20px', border: '1px dashed #222' },
  zone: { width: '150px', height: '100px', border: '2px dashed', borderRadius: '8px', display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', textAlign: 'center' as const },
  zoneLabel: { fontSize: '0.6rem', color: '#555', marginBottom: '5px' },
  footer: { marginTop: '20px', textAlign: 'right' as const },
  btn: { padding: '10px 20px', border: 'none', cursor: 'pointer', color: 'black', fontWeight: 'bold' as const, letterSpacing: '1px' }
};

export default InteractiveCanvas;