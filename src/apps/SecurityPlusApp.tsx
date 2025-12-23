import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { StorageManager } from '@aws-amplify/ui-react-storage'; 
import { remove } from 'aws-amplify/storage';
import '@aws-amplify/ui-react/styles.css'; 
import type { Schema } from '../../amplify/data/resource';

// Import Constants and Sub-Pages
import { SEC_PLUS_RAW_DATA } from '../securityplus/constant';
import SecurityPlusDashboard from './SecurityPlus_Dashboard';
import SecurityPlusVaultPage from '../securityplus/TacticalVaultPage';

const client = generateClient<Schema>();

interface VaultAppProps {
  viewMode: 'LOBBY' | 'STRATEGIC' | 'TACTICAL';
  setViewMode: (val: 'LOBBY' | 'STRATEGIC' | 'TACTICAL') => void;
  preLoadedDrillId?: string | null;
  onDrillStarted?: () => void;
}

const SecurityPlusApp: React.FC<VaultAppProps> = ({ viewMode }) => {
  const [showAdmin, setShowAdmin] = useState(false);
  const [existingVisuals, setExistingVisuals] = useState<any[]>([]);
  
  // ⭐️ Expanded State for JSON Support & Schema sync
  const [formData, setFormData] = useState({ 
    title: '', 
    domain: SEC_PLUS_RAW_DATA[0]?.id || '',
    type: 'LEGACY' as 'QUIZ' | 'DIAGRAM' | 'INTERACTIVE' | 'LEGACY',
    config: ''
  });

  // Sync existing modules when Admin is open
  useEffect(() => {
    if (showAdmin) {
      const sub = client.models.SecPlusVisual.observeQuery().subscribe({
        next: ({ items }) => setExistingVisuals([...items]),
      });
      return () => sub.unsubscribe();
    }
  }, [showAdmin]);

  // ⭐️ Unified Save Function (Handles both JSON and S3 Files)
  const handleSaveModule = async (s3Path?: string) => {
    try {
      await client.models.SecPlusVisual.create({
        title: formData.title || "Untitled Security Module",
        domain: formData.domain as any,
        type: formData.type,
        config: formData.config,
        s3Path: s3Path || '', 
      });
      setShowAdmin(false); 
      setFormData({ ...formData, title: '', config: '' });
      alert("SECURITY_VAULT_UPDATED");
    } catch (err) {
      console.error("Sec+ Database save failed:", err);
      alert("CRITICAL_ERROR: Check console logs.");
    }
  };

  const handlePurge = async (visual: any) => {
    const confirmDelete = window.confirm(`Permanently purge "${visual.title}"?`);
    if (!confirmDelete) return;

    try {
      if (visual.s3Path) {
        try { await remove({ path: visual.s3Path }); } catch (e) { console.warn("S3 missing"); }
      }
      await client.models.SecPlusVisual.delete({ id: visual.id });
    } catch (err) {
      console.error("Purge failure:", err);
    }
  };

  return (
    <div className='theme-secplus' style={v.container}>
      <video key="secplus-bg-video" autoPlay loop muted playsInline style={v.video}>
        <source src="/backgrounds/3d_moving_hex_background.mp4" type="video/mp4" />
      </video>
      <div style={v.vignette} />
      
      <div style={v.content}>
        <header style={v.header}>
          <h1 style={v.title}>VAULT_ACCESS // CompTIA Security+</h1>
          <button onClick={() => setShowAdmin(!showAdmin)} style={v.adminBtn}>
            {showAdmin ? '[ CLOSE_TERMINAL ]' : '[ ADMIN_ACCESS ]'}
          </button>
        </header>

        {showAdmin && (
          <div style={v.adminPanel}>
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '2rem' }}>
              <h3 style={{ color: '#00ff41', marginTop: 0, fontSize: '0.9rem', fontFamily: 'monospace' }}>INTEL_INJECTION_INTERFACE</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <input 
                  placeholder="Module Title" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  style={v.input}
                />
                <select 
                  value={formData.domain} 
                  onChange={e => setFormData({...formData, domain: e.target.value})}
                  style={v.input}
                >
                  {SEC_PLUS_RAW_DATA.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                  style={{...v.input, borderColor: '#00ff41'}}
                >
                  <option value="LEGACY">LEGACY (HTML FILE)</option>
                  <option value="QUIZ">TACTICAL_QUIZ (JSON)</option>
                  <option value="DIAGRAM">INFOGRAPHIC (JSON)</option>
                  <option value="INTERACTIVE">LAB_CANVAS (JSON)</option>
                </select>
              </div>

              {/* ⭐️ Conditional Protocol View */}
              {formData.type === 'LEGACY' ? (
                <div style={v.protocolBox}>
                  <p style={v.label}>FILE_TRANSFER_PROTOCOL_ACTIVE</p>
                  <StorageManager
                    acceptedFileTypes={['text/html']}
                    path={`media/secplus/${formData.domain}/`} 
                    maxFileCount={1}
                    onUploadSuccess={(event) => handleSaveModule(event.key)}
                  />
                </div>
              ) : (
                <div style={v.protocolBox}>
                  <p style={v.label}>DIRECT_CONFIG_INJECTION_ACTIVE</p>
                  <textarea 
                    placeholder='Paste JSON Data Model Here...'
                    value={formData.config}
                    onChange={e => setFormData({...formData, config: e.target.value})}
                    style={v.textarea}
                  />
                  <button onClick={() => handleSaveModule()} style={v.saveBtn}>
                    INJECT INTO VAULT
                  </button>
                </div>
              )}
            </div>

            {/* MANAGEMENT LIST */}
            <div>
              <h3 style={{ color: '#666', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '1rem' }}>ACTIVE_VAULT_INVENTORY</h3>
              <div style={v.purgeList}>
                {existingVisuals.map((vis) => (
                  <div key={vis.id} style={v.purgeItem}>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                      <b style={{ color: '#00ff41', marginRight: '10px' }}>[{vis.type || 'LEGACY'}]</b> {vis.title}
                    </span>
                    <button onClick={() => handlePurge(vis)} style={v.purgeBtn}>PURGE</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          {viewMode === 'STRATEGIC' ? <SecurityPlusDashboard /> : <SecurityPlusVaultPage />}
        </div>
      </div>
    </div>
  );
};

const v = {
  container: { position: 'relative' as const, minHeight: '100vh', color: 'white', backgroundColor: 'transparent', overflowX: 'hidden' as const },
  video: { position: 'fixed' as const, top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' as const, zIndex: -2, opacity: 0.5, backgroundColor: '#000' },
  vignette: { position: 'fixed' as const, top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 100%)', zIndex: -1, pointerEvents: 'none' as const },
  content: { padding: '1rem', maxWidth: '1600px', margin: '0 auto', position: 'relative' as const, zIndex: 1 },
  header: { position: 'relative' as const, textAlign: 'center' as const, marginBottom: '1rem' },
  title: { color: '#00ff41', letterSpacing: '4px', fontSize: '1.5rem', textShadow: '0 0 10px rgba(0, 255, 65, 0.3)', opacity: 0.8 },
  adminBtn: { position: 'absolute' as const, right: 0, top: 0, background: 'transparent', color: '#00ff41', border: '1px solid #00ff41', cursor: 'pointer', padding: '5px 10px', fontSize: '0.8rem', fontFamily: 'monospace' },
  adminPanel: { background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(10px)', border: '2px solid #00ff41', padding: '2rem', marginBottom: '2rem', borderRadius: '12px' },
  input: { padding: '12px', background: '#000', color: '#00ff41', border: '1px solid #333', fontFamily: 'monospace', outline: 'none' },
  protocolBox: { border: '1px solid #222', padding: '1.5rem', background: 'rgba(255,255,255,0.02)' },
  label: { fontSize: '0.6rem', color: '#666', marginBottom: '10px', letterSpacing: '1px' },
  textarea: { height: '200px', width: '100%', background: '#050505', color: '#00ff41', border: '1px solid #333', padding: '10px', fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '10px', outline: 'none' },
  saveBtn: { width: '100%', background: '#00ff41', color: 'black', border: 'none', padding: '12px', cursor: 'pointer', fontWeight: 'bold' as const, fontFamily: 'monospace' },
  purgeList: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  purgeItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(34,34,34,0.5)', borderRadius: '4px' },
  purgeBtn: { background: '#ff4b2b', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' as const }
};

export default SecurityPlusApp;