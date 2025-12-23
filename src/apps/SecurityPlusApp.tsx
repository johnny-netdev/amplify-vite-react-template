import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { StorageManager } from '@aws-amplify/ui-react-storage'; 
import { remove } from 'aws-amplify/storage';
import '@aws-amplify/ui-react/styles.css'; 
import type { Schema } from '../../amplify/data/resource';

// Corrected Import Paths
import { SEC_PLUS_RAW_DATA } from '../securityplus/constant';
import SecurityPlusDashboard from './SecurityPlus_Dashboard';
import SecurityPlusVaultPage from '../securityplus/TacticalVaultPage';

const client = generateClient<Schema>();

interface VaultAppProps {
  viewMode: 'LOBBY' | 'STRATEGIC' | 'TACTICAL';
  setViewMode: (val: 'LOBBY' | 'STRATEGIC' | 'TACTICAL') => void;
}

const SecurityPlusApp: React.FC<VaultAppProps> = ({ viewMode }) => {
  const [showAdmin, setShowAdmin] = useState(false);
  const [existingVisuals, setExistingVisuals] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({ 
    title: '', 
    domain: SEC_PLUS_RAW_DATA[0]?.id || '' 
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

  const handlePurge = async (visual: any) => {
    const confirmDelete = window.confirm(`Permanently delete "${visual.title}"?`);
    if (!confirmDelete) return;

    try {
      if (visual.s3Path) {
        try { await remove({ path: visual.s3Path }); } catch (e) { console.warn("S3 missing"); }
      }
      await client.models.SecPlusVisual.delete({ id: visual.id });
      alert("Purge successful.");
    } catch (err) {
      console.error("Critical Failure during purge:", err);
    }
  };

  const handleUploadSuccess = async (event: { key?: string }) => {
    const path = event.key; 
    if (!path) return;
    try {
      await client.models.SecPlusVisual.create({
        title: formData.title || "Untitled Security Module",
        domain: formData.domain as any,
        s3Path: path,
      });
      setShowAdmin(false); 
      alert("Decryption successful: Module added to vault.");
    } catch (err) {
      console.error("Database save failed:", err);
    }
  };

  return (
    <div style={v.container}>
      <video autoPlay loop muted playsInline style={v.video}>
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
                <h3 style={{ color: '#00ff41', marginTop: 0, fontSize: '0.9rem', fontFamily: 'monospace' }}>INPUT_NEW_DATA_MODULE</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <input 
                        placeholder="Module Title" 
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        style={v.input}
                    />
                    <select 
                        value={formData.domain} 
                        onChange={e => setFormData({...formData, domain: e.target.value})}
                        style={v.input}
                    >
                        {SEC_PLUS_RAW_DATA.map((domainObj: any) => (
                            <option key={domainObj.id} value={domainObj.id}>{domainObj.name}</option>
                        ))}
                    </select>
                </div>
                <StorageManager
                    acceptedFileTypes={['text/html']}
                    path={`media/secplus/${formData.domain}/`} 
                    maxFileCount={1}
                    onUploadSuccess={handleUploadSuccess}
                />
            </div>

            {/* --- MANAGEMENT SECTION --- */}
            <div>
                <h3 style={{ color: '#666', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '1rem' }}>ACTIVE_MODULE_INVENTORY</h3>
                <div style={v.purgeList}>
                    {existingVisuals.map((vis) => (
                        <div key={vis.id} style={v.purgeItem}>
                            <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                <b style={{ color: '#00ff41', marginRight: '10px' }}>[{vis.domain}]</b> {vis.title}
                            </span>
                            <button 
                                onClick={() => handlePurge(vis)} 
                                style={v.purgeBtn}
                            >
                                PURGE MODULE
                            </button>
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
  container: { position: 'relative' as const, minHeight: '100vh', color: 'white', overflowX: 'hidden' as const },
  video: { position: 'fixed' as const, top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' as const,  zIndex: -2, opacity: 0.5, backgroundColor: '#000' },
  vignette: { position: 'fixed' as const, top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 100%)', zIndex: -1, pointerEvents: 'none' as const },
  content: { padding: '1rem', maxWidth: '1600px', margin: '0 auto', position: 'relative' as const, zIndex: 1 },
  header: { position: 'relative' as const, textAlign: 'center' as const, marginBottom: '1rem' },
  title: { color: '#00ff41', letterSpacing: '4px', fontSize: '1.5rem', textShadow: '0 0 10px rgba(0, 255, 65, 0.3)', opacity: 0.8 },
  adminBtn: { position: 'absolute' as const, right: 0, top: 0, background: 'transparent', color: '#00ff41', border: '1px solid #00ff41', cursor: 'pointer', padding: '5px 10px', fontSize: '0.8rem', fontFamily: 'monospace' },
  adminPanel: { 
    background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)', border: '2px solid #00ff41', 
    padding: '2rem', marginBottom: '2rem', borderRadius: '12px' 
  },
  input: { padding: '10px', background: '#000', color: '#00ff41', border: '1px solid #333', fontFamily: 'monospace' },
  purgeList: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  purgeItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(34,34,34,0.5)', borderRadius: '4px' },
  purgeBtn: { 
    background: '#ff4b2b', color: 'white', border: 'none', 
    padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', 
    fontSize: '0.7rem', fontWeight: 'bold' 
  }
};

export default SecurityPlusApp;