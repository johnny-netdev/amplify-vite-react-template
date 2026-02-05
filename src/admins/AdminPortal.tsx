import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { StorageManager } from '@aws-amplify/ui-react-storage';
import { remove } from 'aws-amplify/storage';
import { useNavigate } from 'react-router-dom';
import type { Schema } from '../../amplify/data/resource';

// Import Constants
import { SEC_PLUS_RAW_DATA } from '../securityplus/constant';
import { AWS_SAP_RAW_DATA } from '../aws/constant';
import { CISSP_DOMAIN_MAP } from '../cissp/constant'; 

const client = generateClient<Schema>();

type CertType = 'SECPLUS' | 'CISSP' | 'AWSSAP';

const AdminPortal: React.FC = () => {
  const navigate = useNavigate();
  const [activeCert, setActiveCert] = useState<CertType>('SECPLUS');
  const [items, setItems] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    domain: '', 
    type: 'LEGACY' as 'QUIZ' | 'DIAGRAM' | 'INTERACTIVE' | 'LEGACY', 
    config: '' 
  });

  // Map types to models for the "Visual" metadata
  const models: any = {
    SECPLUS: client.models.SecPlusVisual,
    CISSP: client.models.CisspVisual,
    AWSSAP: client.models.AwsVisual
  };

  const rawData: any = {
    SECPLUS: Array.isArray(SEC_PLUS_RAW_DATA) ? SEC_PLUS_RAW_DATA : [],
    AWSSAP: Array.isArray(AWS_SAP_RAW_DATA) ? AWS_SAP_RAW_DATA : [],
    CISSP: Object.entries(CISSP_DOMAIN_MAP).map(([key, value]) => ({
      id: key,
      name: value 
    }))
  };

  useEffect(() => {
    if (!models[activeCert]) return;

    const sub = models[activeCert].observeQuery().subscribe({
      next: ({ items }: any) => setItems([...items]),
      error: (err: any) => console.error("VAULT_SYNC_ERROR:", err)
    });
    return () => sub.unsubscribe();
  }, [activeCert]);

  // ⭐️ ENFORCED DYNAMIC INJECTION FOR ARIES
  const handleBankInjection = async () => {
    if (!formData.domain || !formData.config) {
      alert("CRITICAL_ERROR: DOMAIN_AND_JSON_REQUIRED_FOR_BANK_INJECTION");
      return;
    }

    try {
      const questions = JSON.parse(formData.config);
      if (!Array.isArray(questions)) throw new Error("JSON_MUST_BE_ARRAY");

      setIsUploading(true);
      let successCount = 0;

      for (const q of questions) {
        // Validation Gate: Ensure ARIES has the conceptTag it needs
        if (!q.conceptTag || !q.questionText || !q.correctAnswer) {
          console.warn("SKIPPING_INVALID_QUESTION_DATA:", q);
          continue;
        }

        await client.models.QuestionBank.create({
          certID: activeCert,
          domain: formData.domain,
          conceptTag: q.conceptTag,
          questionText: q.questionText,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          difficulty: q.difficulty || 'MEDIUM'
        });
        successCount++;
      }

      alert(`SUCCESS: ${successCount} QUESTIONS_INJECTED_TO_DYNAMIC_BANK`);
      setFormData({ ...formData, config: '' });
    } catch (err) {
      alert("INVALID_JSON_FORMAT: Ensure data matches QuestionBank schema.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveLegacy = async (s3Path?: string) => {
    if (!formData.domain) {
        alert("CRITICAL_ERROR: SELECT_DOMAIN_BEFORE_INJECTION");
        return;
    }

    try {
      await models[activeCert].create({
        title: formData.title || "UNTITLED_MODULE",
        domain: formData.domain,
        type: formData.type,
        config: formData.config,
        s3Path: s3Path || ''
      });

      setFormData({ ...formData, title: '', config: '' });
      alert(`${activeCert}_VAULT_SYNCHRONIZED_SUCCESSFULLY`);
    } catch (err) {
      console.error("Injection failed:", err);
      alert("CRITICAL_ERROR: Database rejection.");
    }
  };

  // ⭐️ THE "NUKE" OPTION: Clear Domain for testing ARIES
  const handleNukeSector = async () => {
    if (!formData.domain) return alert("SELECT_DOMAIN_TO_PURGE");
    
    const confirm = window.confirm(`DANGER: Purge ALL dynamic questions in ${activeCert} -> ${formData.domain}?`);
    if (!confirm) return;

    try {
      const { data: records } = await client.models.QuestionBank.list({
        filter: { 
          certID: { eq: activeCert },
          domain: { eq: formData.domain }
        }
      });

      await Promise.all(records.map(r => client.models.QuestionBank.delete({ id: r.id })));
      alert("SECTOR_PURGED_CLEAN: Data field is now open for fresh injection.");
    } catch (err) {
      console.error("PURGE_FAILURE:", err);
    }
  };

  const handlePurgeMetadata = async (item: any) => {
    if (!window.confirm(`Permanently purge visual metadata "${item.title}"?`)) return;
    try {
      if (item.s3Path) {
        await remove({ path: item.s3Path });
      }
      await models[activeCert].delete({ id: item.id });
    } catch (err) {
      console.error("Purge failure:", err);
    }
  };

  const dynamicPath = `media/${activeCert.toLowerCase()}/${formData.domain}/`;

  return (
    <div style={s.container}>
      <div style={s.topBar}>
        <div>
          <h2 style={s.title}>[ SYSTEM_ADMIN_CORE ]</h2>
          <p style={s.subtitle}>DYNAMIC_BANK_MANAGEMENT // MODE: {isUploading ? 'SYNCING...' : 'IDLE'}</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={handleNukeSector} style={s.nukeBtn}>[ NUKE_DOMAIN_BANK ]</button>
          <button onClick={() => navigate(-1)} style={s.secondaryBtn}>[ GO_BACK ]</button>
          <button onClick={() => navigate('/')} style={s.exitBtn}>[ EXIT ]</button>
        </div>
      </div>
      
      <div style={s.tabs}>
        {(['SECPLUS', 'CISSP', 'AWSSAP'] as CertType[]).map(cert => (
          <button 
            key={cert} 
            onClick={() => {
                setActiveCert(cert);
                setFormData({...formData, domain: '', title: '', config: ''}); 
            }}
            style={activeCert === cert ? s.activeTab : s.tab}
          >
            {cert}
          </button>
        ))}
      </div>

      <div style={s.grid}>
        <div style={s.panel}>
          <h3 style={s.label}>INTEL_INJECTION_INTERFACE ({activeCert})</h3>
          
          <div style={s.formGroup}>
            <input 
              style={s.input} placeholder="Module Title (For Visuals)" value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
            
            <select 
              style={s.input} value={formData.domain}
              onChange={e => setFormData({...formData, domain: e.target.value})}
            >
              <option value="">-- SELECT_DOMAIN --</option>
              {rawData[activeCert]?.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <select 
              style={{...s.input, borderColor: '#00ff41'}} 
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value as any})}
            >
              <option value="LEGACY">LEGACY (HTML_UPLOAD)</option>
              <option value="QUIZ">DYNAMIC_BANK_INJECTION</option>
              <option value="DIAGRAM">INFOGRAPHIC_METADATA</option>
              <option value="INTERACTIVE">LAB_CANVAS_METADATA</option>
            </select>
          </div>

          {formData.type === 'LEGACY' ? (
            <div style={{...s.uploadBox, borderColor: formData.domain ? '#00ff41' : '#333'}}>
              <p style={{...s.label, color: formData.domain ? '#00ff41' : '#444'}}>
                S3_PATH: {formData.domain ? dynamicPath : 'AWAITING_DOMAIN'}
              </p>
              {formData.domain && (
                <StorageManager
                  acceptedFileTypes={['text/html']}
                  path={dynamicPath} 
                  maxFileCount={1}
                  onUploadSuccess={(event) => handleSaveLegacy(event.key)}
                />
              )}
            </div>
          ) : (
            <>
              <textarea 
                style={s.textarea} 
                placeholder='[ { "conceptTag": "TAG", "questionText": "...", "options": [...], "correctAnswer": "...", "explanation": "..." } ]'
                value={formData.config}
                onChange={e => setFormData({...formData, config: e.target.value})}
              />
              <button 
                style={s.saveBtn} 
                onClick={formData.type === 'QUIZ' ? handleBankInjection : () => handleSaveLegacy()}
                disabled={isUploading}
              >
                {isUploading ? 'SYNCHRONIZING...' : 'INJECT_INTO_SYSTEM'}
              </button>
            </>
          )}
        </div>

        <div style={s.panel}>
          <h3 style={s.label}>VISUAL_VAULT_INVENTORY ({items.length})</h3>
          <div style={s.list}>
            {items.map(item => (
              <div key={item.id} style={s.listItem}>
                  <div>
                      <div style={{color: '#fff', fontSize: '0.85rem'}}>{item.title}</div>
                      <div style={{color: '#666', fontSize: '0.6rem'}}>DOMAIN: {item.domain} | {item.type}</div>
                  </div>
                  <button style={s.purgeBtn} onClick={() => handlePurgeMetadata(item)}>[ PURGE ]</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const s = {
  container: { padding: '40px', color: '#00ff41', fontFamily: 'monospace', minHeight: '100vh', backgroundColor: '#050505' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #333', paddingBottom: '20px', marginBottom: '30px' },
  title: { letterSpacing: '4px', margin: 0, color: '#00ff41' },
  subtitle: { fontSize: '0.7rem', color: '#444', marginTop: '5px' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  tab: { background: 'transparent', color: '#666', border: '1px solid #222', padding: '10px 25px', cursor: 'pointer', fontSize: '0.8rem' },
  activeTab: { background: '#00ff41', color: 'black', border: '1px solid #00ff41', padding: '10px 25px', fontWeight: 'bold' as const, fontSize: '0.8rem' },
  grid: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' },
  panel: { background: 'rgba(10,10,10,0.8)', border: '1px solid #222', padding: '25px', borderRadius: '4px' },
  label: { fontSize: '0.7rem', color: '#00ff41', marginBottom: '20px', letterSpacing: '2px' },
  formGroup: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' },
  input: { width: '100%', padding: '12px', background: '#000', color: '#fff', border: '1px solid #333', outline: 'none', fontSize: '0.8rem' },
  textarea: { width: '100%', height: '300px', background: '#000', color: '#00ff41', border: '1px solid #333', padding: '15px', marginBottom: '15px', outline: 'none', fontFamily: 'monospace', fontSize: '0.75rem' },
  uploadBox: { padding: '20px', border: '1px dashed #333', background: 'rgba(0,255,65,0.02)' },
  saveBtn: { width: '100%', padding: '15px', background: '#00ff41', color: 'black', border: 'none', fontWeight: 'bold' as const, cursor: 'pointer' },
  exitBtn: { background: 'transparent', color: '#ff4b2b', border: '1px solid #ff4b2b', padding: '8px 20px', cursor: 'pointer', fontSize: '0.7rem' },
  nukeBtn: { background: 'rgba(255, 75, 43, 0.1)', color: '#ff4b2b', border: '1px solid #ff4b2b', padding: '8px 20px', cursor: 'pointer', fontSize: '0.7rem' },
  secondaryBtn: { background: 'transparent', color: '#aaa', border: '1px solid #333', padding: '8px 20px', cursor: 'pointer', fontSize: '0.7rem' },
  list: { maxHeight: '600px', overflowY: 'auto' as const },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #1a1a1a', background: 'rgba(255,255,255,0.01)' },
  purgeBtn: { background: 'transparent', color: '#ff4b2b', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }
};

export default AdminPortal;