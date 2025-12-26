import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { StorageManager } from '@aws-amplify/ui-react-storage';
import { remove } from 'aws-amplify/storage';
import { useNavigate } from 'react-router-dom';
import type { Schema } from '../../amplify/data/resource';

// Import Constants
import { SEC_PLUS_RAW_DATA } from '../securityplus/constant';
import { AWS_SAP_RAW_DATA } from '../aws/constant';
import { CISSP_DOMAIN_MAP } from '../cissp/constant'; // 🟢 Now active

const client = generateClient<Schema>();

type CertType = 'SECPLUS' | 'CISSP' | 'AWSSAP';

const AdminPortal: React.FC = () => {
  const navigate = useNavigate();
  const [activeCert, setActiveCert] = useState<CertType>('SECPLUS');
  const [items, setItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({ 
    title: '', 
    domain: '', 
    type: 'LEGACY' as 'QUIZ' | 'DIAGRAM' | 'INTERACTIVE' | 'LEGACY', 
    config: '' 
  });

  // Map types to models
  const models: any = {
    SECPLUS: client.models.SecPlusVisual,
    CISSP: client.models.CisspVisual,
    AWSSAP: client.models.AwsVisual
  };

  // 🟢 Properly mapped raw data for all three certifications
  const rawData: any = {
    SECPLUS: SEC_PLUS_RAW_DATA,
    AWSSAP: AWS_SAP_RAW_DATA,
    CISSP: CISSP_DOMAIN_MAP 
  };

  // Sync Data based on active tab
  useEffect(() => {
    const sub = models[activeCert].observeQuery().subscribe({
      next: ({ items }: any) => setItems([...items]),
    });
    return () => sub.unsubscribe();
  }, [activeCert]);

  const handleSave = async (s3Path?: string) => {
    try {
      // Fallback to the first domain if none selected
      const targetDomain = formData.domain || rawData[activeCert][0]?.id;
      
      await models[activeCert].create({
        title: formData.title || "New Intel Module",
        domain: targetDomain,
        type: formData.type,
        config: formData.config,
        s3Path: s3Path || ''
      });

      setFormData({ ...formData, title: '', config: '' });
      alert(`${activeCert}_VAULT_SYNCHRONIZED`);
    } catch (err) {
      console.error("Injection failed:", err);
      alert("CRITICAL_ERROR: Check console.");
    }
  };

  const handlePurge = async (item: any) => {
    if (!window.confirm(`Permanently purge "${item.title}"?`)) return;
    try {
      if (item.s3Path) {
        await remove({ path: item.s3Path });
      }
      await models[activeCert].delete({ id: item.id });
    } catch (err) {
      console.error("Purge failure:", err);
    }
  };

  return (
    <div style={s.container}>
      {/* Header Section */}
      <div style={s.topBar}>
        <div>
          <h2 style={s.title}>[ SYSTEM_ADMIN_CORE ]</h2>
          <p style={s.subtitle}>CENTRAL_INTEL_MANAGEMENT</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => navigate(-1)} style={s.secondaryBtn}>[ GO_BACK ]</button>
          <button onClick={() => navigate('/')} style={s.exitBtn}>[ EXIT_TO_LOBBY ]</button>
        </div>
      </div>
      
      {/* Selector Tabs */}
      <div style={s.tabs}>
        {(['SECPLUS', 'CISSP', 'AWSSAP'] as CertType[]).map(cert => (
          <button 
            key={cert} 
            onClick={() => {
                setActiveCert(cert);
                setFormData({...formData, domain: ''}); 
            }}
            style={activeCert === cert ? s.activeTab : s.tab}
          >
            {cert}
          </button>
        ))}
      </div>

      <div style={s.grid}>
        {/* Ingestion Form */}
        <div style={s.panel}>
          <h3 style={s.label}>INTEL_INJECTION_INTERFACE ({activeCert})</h3>
          
          <div style={s.formGroup}>
            <input 
              style={s.input} placeholder="Module Title" value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
            
            <select 
              style={s.input} value={formData.domain}
              onChange={e => setFormData({...formData, domain: e.target.value})}
            >
              <option value="">Select Domain...</option>
              {rawData[activeCert]?.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <select 
              style={{...s.input, borderColor: '#00ff41'}} 
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value as any})}
            >
              <option value="LEGACY">LEGACY (HTML)</option>
              <option value="QUIZ">TACTICAL_QUIZ (JSON)</option>
              <option value="DIAGRAM">INFOGRAPHIC (JSON)</option>
              <option value="INTERACTIVE">LAB_CANVAS (JSON)</option>
            </select>
          </div>

          {formData.type === 'LEGACY' ? (
            <div style={s.uploadBox}>
              <p style={s.label}>FILE_TRANSFER_PROTOCOL_ACTIVE</p>
              <StorageManager
                acceptedFileTypes={['text/html']}
                // 🟢 Path dynamically updates for cissp, securityplus, or aws
                path={`media/${activeCert.toLowerCase()}/${formData.domain}/`} 
                maxFileCount={1}
                onUploadSuccess={(event) => handleSave(event.key)}
              />
            </div>
          ) : (
            <>
              <textarea 
                style={s.textarea} placeholder="Paste JSON Configuration Data..." value={formData.config}
                onChange={e => setFormData({...formData, config: e.target.value})}
              />
              <button style={s.saveBtn} onClick={() => handleSave()}>INJECT_INTO_VAULT</button>
            </>
          )}
        </div>

        {/* Inventory List */}
        <div style={s.panel}>
          <h3 style={s.label}>ACTIVE_VAULT_INVENTORY</h3>
          <div style={s.list}>
            {items.length === 0 ? (
                <div style={s.emptyState}>NO_OBJECTS_FOUND</div>
            ) : (
                items.map(item => (
                <div key={item.id} style={s.listItem}>
                    <div>
                        <div style={{color: '#fff', fontSize: '0.85rem'}}>{item.title}</div>
                        <div style={{color: '#666', fontSize: '0.6rem'}}>{item.domain} | {item.type}</div>
                    </div>
                    <button style={s.purgeBtn} onClick={() => handlePurge(item)}>[ PURGE ]</button>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const s = {
  container: { padding: '40px', color: '#f0f', fontFamily: 'monospace', minHeight: '100vh', backgroundColor: '#050505' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f0f', paddingBottom: '20px', marginBottom: '30px' },
  title: { letterSpacing: '4px', margin: 0, color: '#f0f' },
  subtitle: { fontSize: '0.7rem', color: '#666', marginTop: '5px' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  tab: { background: 'transparent', color: '#f0f', border: '1px solid #333', padding: '10px 25px', cursor: 'pointer', fontSize: '0.8rem' },
  activeTab: { background: '#f0f', color: 'black', border: '1px solid #f0f', padding: '10px 25px', fontWeight: 'bold' as const, fontSize: '0.8rem' },
  grid: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' },
  panel: { background: 'rgba(10,10,10,0.8)', border: '1px solid #333', padding: '25px', borderRadius: '4px' },
  label: { fontSize: '0.7rem', color: '#00ff41', marginBottom: '20px', letterSpacing: '2px', textTransform: 'uppercase' as const },
  formGroup: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' },
  input: { width: '100%', padding: '12px', background: '#000', color: '#f0f', border: '1px solid #333', outline: 'none', fontSize: '0.8rem' },
  textarea: { width: '100%', height: '300px', background: '#000', color: '#00ff41', border: '1px solid #333', padding: '15px', marginBottom: '15px', outline: 'none', fontFamily: 'monospace', fontSize: '0.75rem' },
  uploadBox: { padding: '20px', border: '1px dashed #333', background: 'rgba(255,255,255,0.02)' },
  saveBtn: { width: '100%', padding: '15px', background: '#f0f', color: 'black', border: 'none', fontWeight: 'bold' as const, cursor: 'pointer', letterSpacing: '1px' },
  exitBtn: { background: 'transparent', color: '#ff4b2b', border: '1px solid #ff4b2b', padding: '8px 20px', cursor: 'pointer', fontSize: '0.7rem' },
  secondaryBtn: { background: 'transparent', color: '#aaa', border: '1px solid #333', padding: '8px 20px', cursor: 'pointer', fontSize: '0.7rem' },
  list: { maxHeight: '600px', overflowY: 'auto' as const, paddingRight: '10px' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #1a1a1a', background: 'rgba(255,255,255,0.01)', marginBottom: '5px' },
  emptyState: { color: '#444', textAlign: 'center' as const, padding: '40px' },
  purgeBtn: { background: 'transparent', color: '#ff4b2b', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'monospace' }
};

export default AdminPortal;