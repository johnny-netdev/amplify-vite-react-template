import React, { useState, useEffect, useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '../../../amplify/data/resource';
import VisualRenderer from '../tactical_library/VisualRenderer';

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
    const targetModel = (client.models as any)[model];
    if (!targetModel) return;

    const sub = targetModel.observeQuery().subscribe({
      next: ({ items }: { items: any[] }) => setVisuals([...items]),
      error: (err: any) => console.error("Subscription error:", err)
    });

    return () => sub.unsubscribe();
  }, [model]);

  // Handle S3 URL Generation for LEGACY types
  useEffect(() => {
    if (selectedVisual?.type === 'LEGACY' && selectedVisual?.s3Path) {
      getUrl({ path: selectedVisual.s3Path })
        .then(res => setActiveUrl(res.url.toString()))
        .catch(err => console.error("S3 Link Error:", err));
    } else {
      setActiveUrl(null);
    }
  }, [selectedVisual]);

  // ⭐️ CRITICAL FIX: Safe Content Parsing
  // This prevents the "Blank Screen" by catching parse errors before they hit the renderer
  const safeContent = useMemo(() => {
    if (!selectedVisual) return null;

    if (selectedVisual.type === 'LEGACY') {
      return activeUrl; // Returns the signed S3 URL
    }

    try {
      if (!selectedVisual.config) {
        return { questions: [], error: "MISSING_CONFIG" };
      }
      return JSON.parse(selectedVisual.config);
    } catch (e) {
      console.error("VAULT_JSON_PARSE_ERROR:", e);
      // Return a structural fallback instead of crashing
      return { 
        questions: [{ id: 'err', text: "CORRUPT_JSON_DATA_MODEL", options: [], correctAnswer: '' }], 
        isError: true 
      };
    }
  }, [selectedVisual, activeUrl]);

  // Normalized Domains Safety Check
  const getNormalizedDomains = (): [string, string][] => {
    if (!domainMap) return [];
    if (Array.isArray(domainMap)) {
      return domainMap.map(d => [String(d.id || d.key || ""), String(d.name || d.label || "Unknown Sector")]);
    }
    return Object.entries(domainMap);
  };

  const domains = getNormalizedDomains();

  return (
    <div style={s.layout}>
      {/* SIDEBAR */}
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
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#666' }}>{selectedVisual.type} // {selectedVisual.domain}</p>
              </div>
              <span style={{ ...s.domainTag, background: domainColors[selectedVisual.domain] || accentColor }}>
                {selectedVisual.domain}
              </span>
            </div>
            
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              {/* Only render if we have parsed content or a URL */}
              {safeContent ? (
                <VisualRenderer 
                  key={`${selectedVisual.id}`}
                  type={selectedVisual.type}
                  content={safeContent}
                  accentColor={accentColor}
                />
              ) : (
                <div style={s.loading}>DECRYPTING_INTEL...</div>
              )}
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
  layout: { display: 'flex', gap: '2rem', height: '82vh', marginTop: '1rem', width: '100%' },
  sidebar: { 
    width: '380px', background: 'rgba(10, 10, 10, 0.7)', backdropFilter: 'blur(12px)',
    padding: '1.5rem', borderRadius: '12px', overflowY: 'auto' as const, border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  sidebarHeader: { fontSize: '0.7rem', letterSpacing: '2px', color: '#666', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem', fontFamily: 'monospace' },
  details: { marginBottom: '0.8rem', cursor: 'pointer' },
  summary: { listStyle: 'none', padding: '12px', background: 'rgba(34, 34, 34, 0.4)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: '#eee' },
  badge: { fontSize: '0.6rem', background: '#000', padding: '2px 8px', borderRadius: '10px', color: '#00ff41', border: '1px solid #222' },
  itemContainer: { padding: '8px 0 8px 12px' },
  intelItem: { padding: '12px', marginBottom: '4px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'monospace' },
  main: { flex: 1, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.1)', position: 'relative' as const, overflow: 'hidden' },
  intelHeader: { marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  domainTag: { color: 'black', padding: '4px 14px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' as const },
  idle: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#444', letterSpacing: '4px', fontFamily: 'monospace' },
  idlePulse: { animation: 'pulse 2s infinite' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#00ff41', fontFamily: 'monospace', fontSize: '0.8rem'}
};

export default TacticalVault;