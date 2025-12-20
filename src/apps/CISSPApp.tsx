import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { StorageManager } from '@aws-amplify/ui-react-storage'; 
import '@aws-amplify/ui-react/styles.css'; 
import type { Schema } from '../../amplify/data/resource';
import { CISSP_DOMAIN_MAP, DOMAIN_COLORS } from '../cissp/constant';
import { InteractiveVisual } from '../cissp/InteractiveVisual';
import { remove } from 'aws-amplify/storage';

// 1. ADD THIS IMPORT
import SOCDashboard from './SOCDashboard';

const client = generateClient<Schema>();

const CISSPApp: React.FC = () => {
  const [visuals, setVisuals] = useState<Schema['CisspVisual']['type'][]>([]);
  const [selectedVisual, setSelectedVisual] = useState<Schema['CisspVisual']['type'] | null>(null);
  const [viewMode, setViewMode] = useState<'STRATEGIC' | 'TACTICAL'>('STRATEGIC');
  
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

    try { // ⭐️ Add a 'try' block here to wrap the entire operation
      // 1. Try to delete from S3 only if path exists
      if (visual.s3Path) {
        try {
          await remove({ path: visual.s3Path });
        } catch (s3Err) {
          console.warn("S3 file already missing or inaccessible, proceeding to DB wipe.");
        }
      }
  
      // 2. Delete from DynamoDB (the important part)
      await client.models.CisspVisual.delete({ id: visual.id });
      
      // 3. Clear selection and update UI
      setSelectedVisual(null);
      alert("Purge successful: Database record de-provisioned.");
    } catch (err) { // This 'catch' now correctly corresponds to the 'try' above
      console.error("Critical Failure during purge:", err);
      alert("Purge failed. Check console for details.");
    }
  };

  return (
    <div style={{ padding: '1rem', color: 'white', maxWidth: '1600px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
          <h1 style={{ color: '#00ff41', fontSize: '2.5rem', textShadow: '0 0 10px #00ff41' }}>CISSP VISUAL VAULT</h1>
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

        <nav style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '2rem' }}>
          <button 
              onClick={() => setViewMode('STRATEGIC')}
              style={{ 
                  background: viewMode === 'STRATEGIC' ? '#00ff41' : 'transparent', 
                  color: viewMode === 'STRATEGIC' ? 'black' : '#00ff41',
                  border: '1px solid #00ff41', padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' 
              }}
          >
              [ STRATEGIC_SOC ]
          </button>
          <button 
              onClick={() => setViewMode('TACTICAL')}
              style={{ 
                  background: viewMode === 'TACTICAL' ? '#00ff41' : 'transparent', 
                  color: viewMode === 'TACTICAL' ? 'black' : '#00ff41',
                  border: '1px solid #00ff41', padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' 
              }}
          >
              [ TACTICAL_VAULT ]
          </button>
        </nav>

        {showUpload && (
          <div style={{ background: 'rgba(0, 20, 0, 0.9)', border: '2px solid #00ff41', padding: '2rem', marginBottom: '2rem', borderRadius: '12px' }}>
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

        {viewMode === 'STRATEGIC' ? (
          <SOCDashboard />
        ) : (
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', height: '80vh' }}>
              <aside style={{ width: '300px', background: '#111', padding: '1rem', borderRadius: '12px', overflowY: 'auto', border: '1px solid #333' }}>
                <h3 style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>STUDY MODULES</h3>
                {visuals.map((v) => (
                  <div key={v.id} onClick={() => setSelectedVisual(v)} style={{ padding: '12px', marginBottom: '10px', borderRadius: '8px', cursor: 'pointer', borderLeft: `4px solid ${DOMAIN_COLORS[v.domain || 'RISK_MGMT']}`, background: selectedVisual?.id === v.id ? '#222' : 'transparent' }}>
                    <div style={{ fontSize: '0.7rem', color: DOMAIN_COLORS[v.domain || 'RISK_MGMT'] }}>{v.domain ? CISSP_DOMAIN_MAP[v.domain].split(':')[0] : 'Domain X'}</div>
                    <div style={{ fontWeight: 'bold' }}>{v.title}</div>
                  </div>
                ))}
              </aside>

              <main style={{ flex: 1, position: 'relative' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#444' }}>Select a module from the sidebar to begin decryption...</div>
                )}
              </main>
          </div>
        )}
    </div>
  );
};

export default CISSPApp;