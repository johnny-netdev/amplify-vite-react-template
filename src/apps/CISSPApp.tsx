import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { StorageManager } from '@aws-amplify/ui-react-storage'; 
import { remove } from 'aws-amplify/storage';
import '@aws-amplify/ui-react/styles.css'; 
import type { Schema } from '../../amplify/data/resource';

// Import Constants and Sub-Pages
import { CISSP_DOMAIN_MAP, CISSP_TERMINAL } from '../cissp/constant';
import CISSPDashboard from './CISSP_Dashboard';
import CISSPVault from '../cissp/TacticalVaultPage';

const client = generateClient<Schema>();

// 🟢 Updated Interface to receive isAdmin from App.tsx
interface VaultAppProps {
  isAdmin: boolean; 
  viewMode: 'LOBBY' | 'STRATEGIC' | 'TACTICAL';
  setViewMode: (val: 'LOBBY' | 'STRATEGIC' | 'TACTICAL') => void;
  preLoadedDrillId?: string | null;
  onDrillStarted?: () => void;
}

const CISSPApp: React.FC<VaultAppProps> = ({ viewMode, isAdmin }) => {
  const [showAdmin, setShowAdmin] = useState(false);
  const [existingVisuals, setExistingVisuals] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({ 
    title: '', 
    domain: 'RISK_MGMT',
    type: 'LEGACY' as 'QUIZ' | 'DIAGRAM' | 'INTERACTIVE' | 'LEGACY',
    config: ''
  });

  // Sync existing modules only if user is confirmed Admin
  useEffect(() => {
    if (showAdmin && isAdmin) {
      const sub = client.models.CisspVisual.observeQuery().subscribe({
        next: ({ items }) => setExistingVisuals([...items]),
      });
      return () => sub.unsubscribe();
    }
  }, [showAdmin, isAdmin]);

  const handleSaveModule = async (s3Path?: string) => {
    if (!isAdmin) return; // 🟢 Hard block for non-admins
    try {
      await client.models.CisspVisual.create({
        title: formData.title || "Untitled CISSP Intel",
        domain: formData.domain as any,
        type: formData.type,
        config: formData.config,
        s3Path: s3Path || '', 
      });
      setShowAdmin(false); 
      setFormData({ ...formData, title: '', config: '' });
      alert("VAULT_SYNCHRONIZED");
    } catch (err) {
      console.error("CISSP Save failed:", err);
    }
  };

  const handlePurge = async (visual: any) => {
    if (!isAdmin) return; // 🟢 Hard block for non-admins
    if (!window.confirm(`Permanently purge "${visual.title}"?`)) return;
    try {
      if (visual.s3Path) await remove({ path: visual.s3Path });
      await client.models.CisspVisual.delete({ id: visual.id });
    } catch (err) {
      console.error("Purge failed:", err);
    }
  };

  return (
    <div className='theme-cissp' style={v.container}>
      <video key="cissp-bg-video" autoPlay loop muted playsInline style={v.video}>
        <source src="/backgrounds/3d_moving_hex_background.mp4" type="video/mp4" />
      </video>
      <div style={v.vignette} />
      
      <div style={v.content}>
        <header style={v.header}>
          <h1 style={v.title}>VAULT_ACCESS // CISSP</h1>
          
          {/* 🟢 Admin Button Gate */}
          {isAdmin && (
            <button onClick={() => setShowAdmin(!showAdmin)} style={v.adminBtn}>
              {showAdmin ? '[ CLOSE_TERMINAL ]' : '[ ADMIN_ACCESS ]'}
            </button>
          )}
        </header>

        {/* 🟢 Admin Panel Gate */}
        {showAdmin && isAdmin && (
          <div style={v.adminPanel}>
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '2rem' }}>
              <h3 style={{ color: '#00ff41', marginTop: 0, fontSize: '0.9rem', fontFamily: 'monospace' }}>INTEL_INGESTION_INTERFACE</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <input placeholder="Intel Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={v.input} />
                <select value={formData.domain} onChange={e => setFormData({...formData, domain: e.target.value})} style={v.input}>
                  {Object.entries(CISSP_DOMAIN_MAP).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} style={{...v.input, borderColor: '#00ff41'}}>
                  <option value="LEGACY">LEGACY (HTML)</option>
                  <option value="QUIZ">QUIZ (JSON)</option>
                  <option value="DIAGRAM">DIAGRAM (JSON)</option>
                </select>
              </div>

              {formData.type === 'LEGACY' ? (
                <div style={v.protocolBox}>
                  <p style={v.label}>S3_STORAGE_PROTOCOL_ACTIVE</p>
                  <StorageManager acceptedFileTypes={['text/html']} path={`media/cissp/${formData.domain}/`} maxFileCount={1} onUploadSuccess={(event) => handleSaveModule(event.key)} />
                </div>
              ) : (
                <div style={v.protocolBox}>
                  <p style={v.label}>JSON_CONFIG_INJECTION_ACTIVE</p>
                  <textarea placeholder='Paste JSON...' value={formData.config} onChange={e => setFormData({...formData, config: e.target.value})} style={v.textarea} />
                  <button onClick={() => handleSaveModule()} style={v.saveBtn}>INJECT TO VAULT</button>
                </div>
              )}
            </div>

            <div>
              <h3 style={{ color: '#666', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '1rem' }}>ACTIVE_VAULT_INVENTORY</h3>
              <div style={v.purgeList}>
                {existingVisuals.map((vis) => (
                  <div key={vis.id} style={v.purgeItem}>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                      <b style={{ color: '#00ff41', marginRight: '10px' }}>[{vis.type}]</b> {vis.title}
                    </span>
                    <button onClick={() => handlePurge(vis)} style={v.purgeBtn}>PURGE</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          {viewMode === 'STRATEGIC' ? <CISSPDashboard /> : <CISSPVault accentColor={CISSP_TERMINAL.accent} />}
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
  title: { color: '#00ff41', letterSpacing: '4px', fontSize: '1.5rem', textShadow: '0 0 10px rgba(0,255,65,0.3)', opacity: 0.8 },
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

export default CISSPApp;