import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { StorageManager } from '@aws-amplify/ui-react-storage'; 
import '@aws-amplify/ui-react/styles.css'; 
import type { Schema } from '../../amplify/data/resource';

// Corrected Import Paths
import { AWS_SAP_RAW_DATA } from '../aws/constant';
import AWSSAPDashboard from './AWS_SAP_Dashboard';
import AWSSAPVaultPage from '../aws/TacticalVaultPage';

const client = generateClient<Schema>();

interface VaultAppProps {
  viewMode: 'LOBBY' | 'STRATEGIC' | 'TACTICAL';
  setViewMode: (val: 'LOBBY' | 'STRATEGIC' | 'TACTICAL') => void;
}

const AWSSAPApp: React.FC<VaultAppProps> = ({ viewMode }) => {
  const [showAdmin, setShowAdmin] = useState(false);
  
  // ⭐️ Fix: Set initial domain using the first object in the RAW_DATA array
  const [formData, setFormData] = useState({ 
    title: '', 
    domain: AWS_SAP_RAW_DATA[0]?.id || '' 
  });

  const handleUploadSuccess = async (event: { key?: string }) => {
    const path = event.key; 
    if (!path) return;
    try {
      await client.models.AwsVisual.create({
        title: formData.title || "Untitled AWS Module",
        domain: formData.domain as any,
        s3Path: path,
      });
      setShowAdmin(false); 
      alert("AWS Architecture Module Decrypted and Saved to Vault.");
    } catch (err) {
      console.error("AWS Database save failed:", err);
      alert("Error saving module to database.");
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
          <h1 style={v.title}>VAULT_ACCESS // AWS Solutions Architect Pro</h1>
          <button onClick={() => setShowAdmin(!showAdmin)} style={v.adminBtn}>
            {showAdmin ? '[ CLOSE_TERMINAL ]' : '[ ADMIN_ACCESS ]'}
          </button>
        </header>

        {showAdmin && (
          <div style={v.adminPanel}>
            <h3 style={{ color: '#ff9900', marginTop: 0, fontSize: '0.9rem' }}>CLOUD_INGEST_PROTOCOL</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <input 
                placeholder="Architecture Pattern Name" 
                onChange={e => setFormData({...formData, title: e.target.value})}
                style={v.input}
              />
              <select 
                value={formData.domain} // ⭐️ Sync select value with state
                onChange={e => setFormData({...formData, domain: e.target.value})}
                style={v.input}
              >
                {/* ⭐️ Fix: Map directly over the Array of objects, not Object.entries */}
                {AWS_SAP_RAW_DATA.map((domainObj: any) => (
                  <option key={domainObj.id} value={domainObj.id}>
                    {domainObj.name}
                  </option>
                ))}
              </select>
            </div>
            <StorageManager
              acceptedFileTypes={['text/html']}
              path={`media/aws/${formData.domain}/`} 
              maxFileCount={1}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          {viewMode === 'STRATEGIC' ? (
            <AWSSAPDashboard />
          ) : (
            <AWSSAPVaultPage />
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
  title: { color: '#ff9900', letterSpacing: '4px', fontSize: '1.5rem', textShadow: '0 0 10px rgba(255, 153, 0, 0.3)' },
  adminBtn: { position: 'absolute' as const, right: 0, top: 0, background: 'transparent', color: '#ff9900', border: '1px solid #ff9900', cursor: 'pointer', padding: '5px 10px', fontSize: '0.8rem', fontFamily: 'monospace' },
  adminPanel: { 
    background: 'rgba(20, 10, 0, 0.95)', 
    backdropFilter: 'blur(10px)',
    border: '1px solid #ff9900', 
    padding: '2rem', 
    marginBottom: '2rem', 
    borderRadius: '12px',
    boxShadow: '0 0 30px rgba(255, 153, 0, 0.1)'
  },
  input: { 
    padding: '12px', 
    background: '#000', 
    color: '#ff9900', 
    border: '1px solid #333', 
    fontFamily: 'monospace',
    outline: 'none'
  }
};

export default AWSSAPApp;