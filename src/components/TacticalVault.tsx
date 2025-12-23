import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

interface VaultProps {
  title: string;
  domainMap: Record<string, string> | any[]; 
  domainColors: Record<string, string>;
  accentColor?: string;
  // Dynamic Hooks for different Certifications
  model: 'CisspVisual' | 'AwsVisual' | 'SecPlusVisual';
}

const TacticalVault: React.FC<VaultProps> = ({ title, domainMap, domainColors, accentColor = '#00ff41', model }) => {
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);
  const [activeIntel, setActiveIntel] = useState<string | null>(null);
  const [visuals, setVisuals] = useState<any[]>([]);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Records from the correct table when sector changes
  useEffect(() => {
    if (activeIntel) {
      const fetchVisuals = async () => {
        setLoading(true);
        try {
          // Dynamically access the model table based on the 'model' prop
          const { data } = await (client.models[model] as any).list({
            filter: { domain: { eq: activeIntel } }
          });
          setVisuals(data);
          setActiveUrl(null); // Reset view when switching sectors
        } catch (err) {
          console.error("Vault retrieval error:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchVisuals();
    }
  }, [activeIntel, model]);

  // 2. Generate secure S3 URL for the specific HTML file
  const loadModule = async (path: string) => {
    try {
      const result = await getUrl({ path });
      setActiveUrl(result.url.toString());
    } catch (err) {
      console.error("S3 Link Generation Error:", err);
    }
  };

  const domains = Array.isArray(domainMap) ? domainMap : Object.entries(domainMap);

  const selectSector = (domainKey: string) => {
    setExpandedDomains([domainKey]); // Focus on one at a time for tactical clarity
    setActiveIntel(domainKey); 
  };

  return (
    <div style={styles.vaultWrapper}>
      {/* --- LEFT SIDEBAR: SECTORS --- */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3 style={{...styles.sidebarTitle, color: accentColor}}>{title}</h3>
        </div>

        <div style={styles.sectorList}>
          {domains.map((d: any) => {
            const key = d.id || d[0];
            const label = d.name || d[1];
            const isExpanded = expandedDomains.includes(key);
            const sectorColor = domainColors[key] || accentColor;

            return (
              <div key={key} style={{...styles.sectorWrapper, borderColor: isExpanded ? sectorColor : '#1a1a1a'}}>
                <div onClick={() => selectSector(key)} style={styles.sectorHeader}>
                  <span style={{color: isExpanded ? sectorColor : '#444', marginRight: '10px'}}>{isExpanded ? '▼' : '▶'}</span>
                  <span style={{color: isExpanded ? '#fff' : '#888', fontSize: '0.75rem', fontFamily: 'monospace'}}>
                    {label.toUpperCase()}
                  </span>
                </div>
                
                {isExpanded && (
                   <div style={styles.intelTray}>
                      {loading ? (
                        <div style={styles.statusText}>QUERYING_DATABASE...</div>
                      ) : visuals.length > 0 ? (
                        visuals.map((v) => (
                          <div key={v.id} onClick={() => loadModule(v.s3Path)} style={styles.intelItem}>
                            {"> "} {v.title.toUpperCase()}
                          </div>
                        ))
                      ) : (
                        <div style={styles.statusText}>NO_INTEL_RECORDS_FOUND</div>
                      )}
                   </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA: DISPLAY --- */}
      <main style={styles.mainDisplay}>
        {activeUrl ? (
          <iframe src={activeUrl} style={styles.iframe} title="Tactical Visual" />
        ) : (
          <div style={styles.idleState}>
             <div style={styles.glitchText}>{loading ? 'DECRYPTING...' : 'AWAITING_DATA_SELECTION...'}</div>
             <div style={styles.subText}>SYSTEM_IDLE // SELECT_MODULE_FROM_SIDEBAR</div>
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  vaultWrapper: { display: 'flex', gap: '20px', height: '82vh', marginTop: '10px' },
  sidebar: { width: '380px', background: 'rgba(5, 5, 5, 0.9)', border: '1px solid #222', borderRadius: '8px', display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' },
  sidebarHeader: { padding: '15px', borderBottom: '1px solid #222', background: 'rgba(255,255,255,0.02)' },
  sidebarTitle: { margin: 0, fontSize: '0.7rem', letterSpacing: '2px', fontFamily: 'monospace' },
  sectorList: { flex: 1, overflowY: 'auto' as const, padding: '10px' },
  sectorWrapper: { borderLeft: '3px solid', marginBottom: '4px', background: '#0a0a0a' },
  sectorHeader: { padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  intelTray: { padding: '0 12px 12px 30px', background: 'rgba(0,0,0,0.3)' },
  intelItem: { color: '#00ff41', fontSize: '0.65rem', padding: '6px 0', cursor: 'pointer', fontFamily: 'monospace', opacity: 0.8, ':hover': { opacity: 1 } },
  statusText: { color: '#444', fontSize: '0.6rem', fontFamily: 'monospace', fontStyle: 'italic' },
  mainDisplay: { flex: 1, background: '#000', borderRadius: '8px', border: '1px solid #222', overflow: 'hidden', position: 'relative' as const },
  iframe: { width: '100%', height: '100%', border: 'none', background: '#fff' },
  idleState: { height: '100%', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center' },
  glitchText: { color: '#222', letterSpacing: '5px', fontSize: '1.2rem', marginBottom: '10px', fontFamily: 'monospace' },
  subText: { color: '#111', fontSize: '0.7rem', letterSpacing: '2px', fontFamily: 'monospace' },
};

export default TacticalVault;