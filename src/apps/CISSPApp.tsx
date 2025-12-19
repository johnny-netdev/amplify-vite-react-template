import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { CISSP_DOMAIN_MAP, DOMAIN_COLORS } from '../cissp/constant';
import CompetencyDashboard from './CompetencyDashboard';

// Initialize the data client
const client = generateClient<Schema>();

const CISSPApp: React.FC = () => {
  const [visuals, setVisuals] = useState<Schema['CisspVisual']['type'][]>([]);

  useEffect(() => {
    // Real-time subscription to your visuals bank
    const sub = client.models.CisspVisual.observeQuery().subscribe({
      next: ({ items }) => setVisuals([...items]),
    });
    return () => sub.unsubscribe();
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
      <h1>CISSP Learning App</h1>
      <p>Master the 8 domains through gamified learning and visuals.</p>
      
      {/* Keeping your existing dashboard */}
      <CompetencyDashboard />

      <hr style={{ margin: '3rem 0', borderColor: '#333' }} />

      <section>
        <h2 style={{ marginBottom: '1.5rem' }}>Visual Study Guides</h2>
        
        {visuals.length === 0 ? (
          <p style={{ color: '#888' }}>No visuals added yet. Add one in the Amplify Sandbox to test!</p>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '1.5rem',
            padding: '1rem' 
          }}>
            {visuals.map((visual) => (
              <div 
                key={visual.id} 
                style={{ 
                  background: '#1a1a1a', 
                  borderRadius: '12px', 
                  padding: '1.5rem', 
                  border: `1px solid ${visual.domain ? DOMAIN_COLORS[visual.domain] : '#444'}`,
                  textAlign: 'left'
                }}
              >
                {/* Domain Label Mapping */}
                <span style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  color: visual.domain ? DOMAIN_COLORS[visual.domain] : '#00ff41',
                  border: `1px solid ${visual.domain ? DOMAIN_COLORS[visual.domain] : '#00ff41'}`,
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {visual.domain ? CISSP_DOMAIN_MAP[visual.domain] : 'General'}
                </span>

                <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>{visual.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#ccc' }}>{visual.description}</p>
                
                {/* We will add the actual StorageImage here in the next step! */}
                <div style={{ 
                  marginTop: '1rem', 
                  height: '150px', 
                  background: '#222', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: '#555'
                }}>
                  Image Placeholder (S3: {visual.s3Path})
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CISSPApp;