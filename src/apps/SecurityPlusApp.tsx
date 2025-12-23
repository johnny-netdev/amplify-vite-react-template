import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { StorageManager } from '@aws-amplify/ui-react-storage'; 
import '@aws-amplify/ui-react/styles.css'; 
import type { Schema } from '../../amplify/data/resource';

// Import local components and constants
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
  
  // Initialize with the first domain ID from Sec+ raw data
  const [formData, setFormData] = useState({ 
    title: '', 
    domain: SEC_PLUS_RAW_DATA[0]?.id || '' 
  });

  const handleUploadSuccess = async (event: { key?: string }) => {
    if (!event.key) return;
    try {
      await client.models.SecPlusVisual.create({
        title: formData.title || "New Security Intelligence Module",
        domain: formData.domain as any,
        s3Path: event.key,
      });
      setShowAdmin(false); 
      alert("Security+ Intelligence Module Synced and Secured.");
    } catch (err) {
      console.error("Security+ Database save failed:", err);
      alert("Critical Error: Database Sync Failed.");
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

        {/* FUNCTIONAL ADMIN PANEL */}
        {showAdmin && (
          <div style={v.adminPanel}>
            <h3 style={{ color: '#00ff41', marginTop: 0, fontSize: '0.9rem' }}>SEC_INGEST_PROTOCOL</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <input 
                placeholder="Intelligence Module Name" 
                onChange={e => setFormData({...formData, title: e.target.value})}
                style={v.input}
              />
              <select 
                value={formData.domain}
                onChange={e => setFormData({...formData, domain: e.target.value})}
                style={v.input}
              >
                {SEC_PLUS_RAW_DATA.map((domainObj: any) => (
                  <option key={domainObj.id} value={domainObj.id}>
                    {domainObj.name}
                  </option>
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
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          {viewMode === 'STRATEGIC' ? (
            <SecurityPlusDashboard />
          ) : (
            <SecurityPlusVaultPage />
          )}
        </div>
      </div>
    </div>
  );
};

const v = {
  container: { position: 'relative' as const, minHeight: '100vh', color: 'white', backgroundColor: '#000' },
  video: { position: 'fixed' as const, top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' as const, zIndex: -1, opacity: 0.4 },
  vignette: { position: 'fixed' as const, top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 100%)', zIndex: -1, pointerEvents: 'none' as const },
  content: { padding: '2rem', paddingTop: '80px', maxWidth: '1600px', margin: '0 auto', position: 'relative' as const, zIndex: 1 },
  header: { position: 'relative' as const, textAlign: 'center' as const, marginBottom: '2rem' },
  title: { color: '#00ff41', letterSpacing: '4px', fontSize: '1.5rem', textShadow: '0 0 10px rgba(0, 255, 65, 0.3)' },
  adminBtn: { position: 'absolute' as const, right: 0, top: 0, background: 'transparent', color: '#00ff41', border: '1px solid #00ff41', cursor: 'pointer', padding: '5px 10px', fontSize: '0.8rem', fontFamily: 'monospace' },
  adminPanel: { 
    background: 'rgba(0, 20, 0, 0.95)', 
    backdropFilter: 'blur(10px)',
    border: '1px solid #00ff41', 
    padding: '2rem', 
    marginBottom: '2rem', 
    borderRadius: '12px' 
  },
  input: { 
    padding: '12px', 
    background: '#000', 
    color: '#00ff41', 
    border: '1px solid #00ff41', 
    fontFamily: 'monospace',
    outline: 'none'
  }
};

export default SecurityPlusApp;