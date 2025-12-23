import React, { useState } from 'react';

interface VaultProps {
  title: string;
  domainMap: Record<string, string> | any[]; 
  domainColors: Record<string, string>;
  accentColor?: string;
}

const TacticalVault: React.FC<VaultProps> = ({ title, domainMap, domainColors, accentColor = '#00ff41' }) => {
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);
  const [activeIntel, setActiveIntel] = useState<string | null>(null);

  const getNormalizedDomains = () => {
    if (Array.isArray(domainMap)) {
      return domainMap.map(d => [d.id || d.key || d.domain, d.name || d.label || d.title || "Unknown Sector"]);
    }
    return Object.entries(domainMap);
  };

  const domains = getNormalizedDomains();

  const toggleDomain = (domainKey: string) => {
    setExpandedDomains(prev => 
      prev.includes(domainKey) ? prev.filter(k => k !== domainKey) : [...prev, domainKey]
    );
    setActiveIntel(domainKey); 
  };

  return (
    <div style={styles.vaultWrapper}>
      {/* --- LEFT SIDEBAR: SECTORS --- */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3 style={{...styles.sidebarTitle, color: accentColor}}>{title}</h3>
          <div style={styles.controls}>
            <button onClick={() => setExpandedDomains([])} style={styles.controlBtn}>[ COLLAPSE_ALL ]</button>
          </div>
        </div>

        <div style={styles.sectorList}>
          {domains.map(([key, label]) => {
            const isExpanded = expandedDomains.includes(key);
            const sectorColor = domainColors[key] || accentColor;

            return (
              <div key={key} style={{...styles.sectorWrapper, borderColor: isExpanded ? sectorColor : '#1a1a1a'}}>
                <div onClick={() => toggleDomain(key)} style={styles.sectorHeader}>
                  <span style={{color: isExpanded ? sectorColor : '#444', marginRight: '10px'}}>
                    {isExpanded ? '▼' : '▶'}
                  </span>
                  <span style={{color: isExpanded ? '#fff' : '#888', fontSize: '0.8rem', fontFamily: 'monospace'}}>
                    {label.toUpperCase()}
                  </span>
                </div>
                {isExpanded && (
                   <div style={styles.miniIntel}>
                      <div style={{...styles.intelLine, borderLeft: `2px solid ${sectorColor}`}}>
                        SECURE_DATA_NODE_CONNECTED
                      </div>
                   </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main style={styles.mainDisplay}>
        {activeIntel ? (
          <div style={styles.intelActive}>
            <h2 style={{color: accentColor, letterSpacing: '2px', fontFamily: 'monospace'}}>
              INTEL_DECRYPTED // {activeIntel}
            </h2>
            <div style={styles.loadingPulse}>[ STREAMING_TACTICAL_SCHEMA... ]</div>
          </div>
        ) : (
          <div style={styles.idleState}>
             <div style={styles.glitchText}>AWAITING_DATA_SELECTION...</div>
             <div style={styles.subText}>SYSTEM_IDLE // SELECT_SECTOR_FOR_ANALYSIS</div>
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  vaultWrapper: { display: 'flex', gap: '20px', height: '80vh', marginTop: '20px' },
  sidebar: { width: '400px', background: 'rgba(10, 10, 10, 0.85)', border: '1px solid #222', borderRadius: '12px', display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' },
  sidebarHeader: { padding: '20px', borderBottom: '1px solid #222' },
  sidebarTitle: { margin: 0, fontSize: '0.75rem', letterSpacing: '2px', fontFamily: 'monospace' },
  controls: { marginTop: '10px' },
  controlBtn: { background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', fontSize: '0.6rem', padding: 0, fontFamily: 'monospace' },
  sectorList: { flex: 1, overflowY: 'auto' as const, padding: '10px' },
  sectorWrapper: { border: '1px solid', marginBottom: '8px', background: '#0a0a0a', transition: 'all 0.3s ease' },
  sectorHeader: { padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  miniIntel: { padding: '0 12px 12px 30px', fontSize: '0.65rem', color: '#444', fontFamily: 'monospace' },
  intelLine: { paddingLeft: '10px' },
  mainDisplay: { flex: 1, background: 'rgba(0, 0, 0, 0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const },
  idleState: { textAlign: 'center' as const },
  glitchText: { color: '#333', letterSpacing: '5px', fontSize: '1.2rem', marginBottom: '10px', fontFamily: 'monospace' },
  subText: { color: '#1a1a1a', fontSize: '0.7rem', letterSpacing: '2px', fontFamily: 'monospace' },
  intelActive: { textAlign: 'center' as const },
  loadingPulse: { color: '#666', fontSize: '0.8rem', marginTop: '20px', fontFamily: 'monospace' }
};

export default TacticalVault;