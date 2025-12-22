import React, { useState } from 'react';
import { StorageManager } from '@aws-amplify/ui-react-storage'; 
import SecPlusDashboard from './SecurityPlus_Dashboard';

type Props = {
  viewMode: 'LOBBY' | 'STRATEGIC' | 'TACTICAL';
};

const SecurityPlusApp: React.FC<Props> = ({ viewMode }) => {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div style={v.container}>
      <video autoPlay loop muted playsInline style={v.video}><source src="/backgrounds/3d_moving_hex_background.mp4" type="video/mp4" /></video>
      
      <div style={v.content}>
        <div style={v.header}>
          <h1 style={v.title}>VAULT_ACCESS // SECURITY+</h1>
          <button onClick={() => setShowAdmin(!showAdmin)} style={v.adminBtn}>{showAdmin ? '[ CLOSE ]' : '[ ADMIN ]'}</button>
        </div>

        {showAdmin && (
          <div style={v.uploadPanel}>
            <StorageManager path="media/secplus/" maxFileCount={1} onUploadSuccess={() => setShowAdmin(false)} />
          </div>
        )}

        {viewMode === 'STRATEGIC' ? <SecPlusDashboard /> : (
          <div style={v.tactical}>
             <aside style={v.sidebar}><h3>INTEL_SECTORS</h3><div style={v.item}>[ SECTOR_01_GENERAL ]</div></aside>
             <main style={v.main}>AWAITING_DATA_SELECTION...</main>
          </div>
        )}
      </div>
    </div>
  );
};

const v = {
  container: { position: 'relative' as const, minHeight: '100vh', color: 'white' },
  video: { position: 'fixed' as const, top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' as const, zIndex: -1, opacity: 0.4 },
  content: { padding: '2rem', paddingTop: '80px', maxWidth: '1400px', margin: '0 auto' },
  header: { position: 'relative' as const, textAlign: 'center' as const, marginBottom: '2rem' },
  title: { color: '#00ff41', letterSpacing: '4px', fontSize: '1.5rem' },
  adminBtn: { position: 'absolute' as const, right: 0, top: 0, background: 'transparent', color: '#00ff41', border: '1px solid #00ff41', cursor: 'pointer' },
  uploadPanel: { background: 'rgba(0,20,0,0.9)', padding: '20px', border: '1px solid #00ff41', marginBottom: '20px' },
  tactical: { display: 'flex', gap: '20px', height: '70vh' },
  sidebar: { width: '300px', background: 'rgba(10,10,10,0.8)', padding: '20px', border: '1px solid #333' },
  item: { padding: '10px', color: '#00ff41', fontSize: '0.8rem' },
  main: { flex: 1, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }
};

export default SecurityPlusApp;