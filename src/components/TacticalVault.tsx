import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '../../amplify/data/resource';
import VisualRenderer from './tactical_library/VisualRenderer';

const client = generateClient<Schema>();

interface VaultProps {
  title: string;
  domainMap: Record<string, string> | any[]; 
  domainColors: Record<string, string>;
  accentColor?: string;
  model: 'CisspVisual' | 'AwsVisual' | 'SecPlusVisual';
}

const TacticalVault: React.FC<VaultProps> = ({ title, domainMap, domainColors, accentColor = '#00ff41', model }) => {
  const [visuals, setVisuals] = useState<any[]>([]);
  const [selectedVisual, setSelectedVisual] = useState<any | null>(null);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  // ⭐️ Safe Live Observer
  useEffect(() => {
    // Dynamically access the model with a safety check
    const targetModel = (client.models as any)[model];

    if (!targetModel) {
      console.warn(`Target model "${model}" is not yet available on the client.`);
      return;
    }

    const sub = targetModel.observeQuery().subscribe({
      next: ({ items }: { items: any[] }) => setVisuals([...items]),
      error: (err: any) => console.error("Subscription error:", err)
    });

    return () => sub.unsubscribe();
  }, [model]);

  // Handle S3 URL Generation
  useEffect(() => {
    if (selectedVisual?.s3Path) {
      getUrl({ path: selectedVisual.s3Path })
        .then(res => setActiveUrl(res.url.toString()))
        .catch(err => console.error("S3 Link Error:", err));
    } else {
      setActiveUrl(null);
    }
  }, [selectedVisual]);

  // ⭐️ Normalized Domains Safety Check
  const getNormalizedDomains = (): [string, string][] => {
    if (!domainMap) return [];
    if (Array.isArray(domainMap)) {
      return domainMap.map(d => [
        String(d.id || d.key || ""), 
        String(d.name || d.label || "Unknown Sector")
      ]);
    }
    return Object.entries(domainMap);
  };

  const domains = getNormalizedDomains();

  return (
    <div style={s.layout}>
      {/* SIDEBAR: GLASSMORPHISM STYLE */}
      <aside style={s.sidebar}>
        <h3 style={s.sidebarHeader}>{title}</h3>
        {domains.map(([key, label]) => {
          const domainModules = visuals.filter(v => v.domain === key);
          if (domainModules.length === 0) return null;

          return (
            <details key={key} open={selectedVisual?.domain === key} style={s.details}>
              <summary style={{...s.summary, borderLeft: `4px solid ${domainColors[key] || accentColor}`}}>
                <span style={{ fontFamily: 'monospace' }}>{label.split(':')[0]}</span>
                <span style={s.badge}>{domainModules.length}</span>
              </summary>
              <div style={s.itemContainer}>
                {domainModules.map(v => (
                  <div 
                    key={v.id} 
                    onClick={() => setSelectedVisual(v)}
                    style={{
                      ...s.intelItem,
                      background: selectedVisual?.id === v.id ? `${accentColor}33` : 'transparent',
                      border: selectedVisual?.id === v.id ? `1px solid ${accentColor}` : '1px solid transparent',
                      color: selectedVisual?.id === v.id ? accentColor : '#aaa'
                    }}
                  >
                    {v.title}
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </aside>

      {/* MAIN VIEWPORT */}
      <main style={s.main}>
        {selectedVisual ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={s.intelHeader}>
              <div>
                <h2 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>{selectedVisual.title}</h2>
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#666' }}>{selectedVisual.description || 'No description provided.'}</p>
              </div>
              <span style={{ ...s.domainTag, background: domainColors[selectedVisual.domain] || accentColor }}>
                {selectedVisual.domain}
              </span>
            </div>
            
            {/* ⭐️ Use VisualRenderer instead of raw <iframe> */}
            <div style={{ flex: 1, position: 'relative' }}>
              <VisualRenderer 
                key={`${selectedVisual.id}`}
                type={selectedVisual.type}
                content={(() => {
                  try {
                    return selectedVisual.type === 'LEGACY' 
                      ? activeUrl 
                      : JSON.parse(selectedVisual.config || '{"questions":[]}');
                  } catch (e) {
                    console.error("JSON Parse Error:", e);
                    return { questions: [] };
                  }
                })()}
                accentColor={accentColor}
              />
            </div>
          </div>
        ) : (
          <div style={s.idle}>
            <div style={s.idlePulse}>AWAITING_INTEL_SELECTION...</div>
          </div>
        )}
      </main>
    </div>
  );
};

const s = {
  layout: { display: 'flex', gap: '2rem', height: '80vh', marginTop: '1rem', width: '100%' },
  sidebar: { 
    width: '380px', background: 'rgba(10, 10, 10, 0.7)', backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)', padding: '1.5rem', borderRadius: '12px', 
    overflowY: 'auto' as const, border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
  },
  sidebarHeader: { fontSize: '0.7rem', letterSpacing: '2px', color: '#666', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem', fontFamily: 'monospace' },
  details: { marginBottom: '0.8rem', cursor: 'pointer' },
  summary: { listStyle: 'none', padding: '12px', background: 'rgba(34, 34, 34, 0.4)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: '#eee', transition: '0.2s' },
  badge: { fontSize: '0.6rem', background: '#000', padding: '2px 8px', borderRadius: '10px', color: '#00ff41', border: '1px solid #222' },
  itemContainer: { padding: '8px 0 8px 12px' },
  intelItem: { padding: '12px', marginBottom: '4px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'monospace', transition: 'all 0.2s ease' },
  main: { flex: 1, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.1)', position: 'relative' as const, overflow: 'hidden' },
  intelHeader: { marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  domainTag: { color: 'black', padding: '4px 14px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' as const },
  iframe: { flex: 1, width: '100%', border: 'none', borderRadius: '8px', background: '#fff', boxShadow: '0 0 40px rgba(0,0,0,0.5)' },
  idle: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#333', letterSpacing: '4px', fontFamily: 'monospace' },
  idlePulse: { animation: 'pulse 2s infinite' }
};

export default TacticalVault;