import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { StorageManager } from '@aws-amplify/ui-react-storage'; 
import '@aws-amplify/ui-react/styles.css'; 
import type { Schema } from '../../amplify/data/resource';
import { CISSP_DOMAIN_MAP, DOMAIN_COLORS } from '../cissp/constant';
import { InteractiveVisual } from '../cissp/InteractiveVisual';
import { remove } from 'aws-amplify/storage';
// ⭐️ Ensure this matches your specific dashboard file name
import SOCDashboard from './CISSP_Dashboard';

const client = generateClient<Schema>();

// 1. Updated Interface to match the Dispatch type from App.tsx
interface CISSPAppProps {
  viewMode: 'LOBBY' | 'STRATEGIC' | 'TACTICAL';
  setViewMode: React.Dispatch<React.SetStateAction<'LOBBY' | 'STRATEGIC' | 'TACTICAL'>>;
}

const CISSPApp: React.FC<CISSPAppProps> = ({ viewMode }) => {
  const [visuals, setVisuals] = useState<Schema['CisspVisual']['type'][]>([]);
  const [selectedVisual, setSelectedVisual] = useState<Schema['CisspVisual']['type'] | null>(null);
  
  const [showUpload, setShowUpload] = useState(false);
  const [formData, setFormData] = useState({ title: '', domain: 'RISK_MGMT', description: '' });

  useEffect(() => {
    const sub = client.models.CisspVisual.observeQuery().subscribe({
      next: ({ items }) => {
        setVisuals([...items]);
        if (items.length > 0 && !selectedVisual) setSelectedVisual(items[0]);
      },
    });
    return () => sub.unsubscribe();
  }, [selectedVisual]);

  const handleUploadSuccess = async (event: { key?: string }) => {
    const path = event.key; 
    if (!path) return;
    try {
      await client.models.CisspVisual.create({
        title: formData.title || "Untitled Visual",
        domain: formData.domain as any,
        description: formData.description,
        s3Path: path,
      });
      setShowUpload(false); 
      alert("Decryption successful: Module added to vault.");
    } catch (err) {
      console.error("Database save failed:", err);
    }
  };

  const handleDelete = async (visual: Schema['CisspVisual']['type']) => {
    const confirmDelete = window.confirm(`Permanently delete "${visual.title}"?`);
    if (!confirmDelete) return;

    try {
      if (visual.s3Path) {
        try {
          await remove({ path: visual.s3Path });
        } catch (s3Err) {
          console.warn("S3 file already missing, proceeding to DB wipe.");
        }
      }
      await client.models.CisspVisual.delete({ id: visual.id });
      setSelectedVisual(null);
      alert("Purge successful.");
    } catch (err) {
      console.error("Critical Failure during purge:", err);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
        {/* THE SIGNAL ONE BACKGROUND THEATER */}
        <video
          autoPlay loop muted playsInline
          style={{
              position: 'fixed',
              top: 0, left: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              zIndex: -1,
              opacity: 0.5 
          }}
        >
          <source src="/backgrounds/3d_moving_hex_background.mp4" type="video/mp4" />
        </video>

        {/* VIGNETTE OVERLAY */}
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
          zIndex: -1,
          pointerEvents: 'none'
        }} />

        {/* APP CONTENT LAYER */}
        <div style={{ padding: '1rem', color: 'white', maxWidth: '1600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            
            <header style={{ textAlign: 'center', marginBottom: '1rem', position: 'relative' }}>
              <h1 style={{ color: '#00ff41', fontSize: '1.5rem', textShadow: '0 0 10px #00ff41', opacity: 0.8 }}>
                VAULT_ACCESS // CISSP
              </h1>
              <button 
                  onClick={() => setShowUpload(!showUpload)}
                  style={{ 
                      position: 'absolute', right: 0, top: 0, 
                      background: 'transparent', color: '#00ff41', border: '1px solid #00ff41',
                      padding: '5px 10px', cursor: 'pointer', fontSize: '0.8rem'
                  }}
              >
                  {showUpload ? '[ CLOSE_TERMINAL ]' : '[ ADMIN_ACCESS ]'}
              </button>
            </header>

            {showUpload && (
              <div style={{ background: 'rgba(0, 20, 0, 0.8)', backdropFilter: 'blur(10px)', border: '2px solid #00ff41', padding: '2rem', marginBottom: '2rem', borderRadius: '12px' }}>
                  <h2 style={{ color: '#00ff41', marginTop: 0 }}>Input New Data Module</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <input 
                      placeholder="Module Title" 
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      style={{ padding: '10px', background: '#000', color: '#00ff41', border: '1px solid #333' }}
                      />
                      <select 
                      onChange={e => setFormData({...formData, domain: e.target.value})}
                      style={{ padding: '10px', background: '#000', color: '#00ff41', border: '1px solid #333' }}
                      >
                      {Object.entries(CISSP_DOMAIN_MAP).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                      ))}
                      </select>
                  </div>
                  <textarea 
                      placeholder="Description of the visual concepts..."
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      style={{ width: '100%', padding: '10px', background: '#000', color: '#00ff41', border: '1px solid #333', marginBottom: '1rem' }}
                  />
                  <StorageManager
                      acceptedFileTypes={['text/html']}
                      path={`media/${formData.domain}/`} 
                      maxFileCount={1}
                      onUploadSuccess={handleUploadSuccess}
                  />
              </div>
            )}

            {/* DYNAMIC VIEW SWITCHING */}
            {viewMode === 'STRATEGIC' ? (
              <SOCDashboard />
            ) : (
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', height: '80vh' }}>
                  <aside style={{ 
                      width: '350px', 
                      background: 'rgba(10, 10, 10, 0.7)', 
                      backdropFilter: 'blur(12px)',         
                      WebkitBackdropFilter: 'blur(12px)',
                      padding: '1.5rem', 
                      borderRadius: '12px', 
                      overflowY: 'auto', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                  }}>
                      <h3 style={{ fontSize: '0.7rem', letterSpacing: '2px', color: '#666', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                        INTEL_VAULT // SECTORS
                      </h3>

                      {Object.entries(CISSP_DOMAIN_MAP).map(([domainKey, domainLabel]) => {
                        const domainModules = visuals.filter(v => v.domain === domainKey && v.title && v.s3Path);
                        if (domainModules.length === 0) return null;

                        return (
                            <details key={domainKey} open style={{ marginBottom: '1rem', cursor: 'pointer' }}>
                            <summary style={{ 
                                listStyle: 'none', padding: '10px', 
                                background: 'rgba(34, 34, 34, 0.5)', 
                                borderRadius: '4px', 
                                borderLeft: `4px solid ${DOMAIN_COLORS[domainKey]}`,
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                fontSize: '0.8rem', fontWeight: 'bold', color: '#eee'
                            }}>
                                <span>{domainLabel.split(':')[0]}</span>
                                <span style={{ fontSize: '0.6rem', background: '#000', padding: '2px 6px', borderRadius: '10px', color: '#888' }}>
                                {domainModules.length}
                                </span>
                            </summary>

                            <div style={{ padding: '10px 0 10px 15px' }}>
                                {domainModules.map((v) => (
                                <div 
                                    key={v.id} 
                                    onClick={() => setSelectedVisual(v)} 
                                    style={{ 
                                      padding: '10px', marginBottom: '5px', borderRadius: '4px', cursor: 'pointer',
                                      fontSize: '0.85rem',
                                      background: selectedVisual?.id === v.id ? 'rgba(0, 255, 65, 0.15)' : 'transparent',
                                      border: selectedVisual?.id === v.id ? '1px solid #00ff41' : '1px solid transparent',
                                      color: selectedVisual?.id === v.id ? '#00ff41' : '#aaa'
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

                  <main style={{ 
                      flex: 1, 
                      position: 'relative', 
                      background: 'rgba(0, 0, 0, 0.5)', 
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                      {selectedVisual ? (
                        <div>
                            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                              <div>
                                  <h2 style={{ margin: 0 }}>{selectedVisual.title}</h2>
                                  <p style={{ color: '#aaa', margin: 0 }}>{selectedVisual.description}</p>
                              </div>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                  {showUpload && <button onClick={() => handleDelete(selectedVisual)} style={{ background: '#ff4b2b', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}>PURGE MODULE</button>}
                                  <span style={{ background: DOMAIN_COLORS[selectedVisual.domain || 'RISK_MGMT'], color: 'black', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>{selectedVisual.domain ? CISSP_DOMAIN_MAP[selectedVisual.domain] : 'General'}</span>
                              </div>
                            </div>
                            <InteractiveVisual key={selectedVisual.s3Path} s3Path={selectedVisual.s3Path} title={selectedVisual.title} />
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#444', letterSpacing: '2px' }}>SIGNAL IDLE // AWAITING SELECTION...</div>
                      )}
                  </main>
              </div>
            )}
        </div>
    </div>
  );
};

export default CISSPApp;