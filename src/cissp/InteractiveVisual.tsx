// src/apps/InteractiveVisual.tsx
import { useState, useEffect } from 'react';
import { getUrl } from 'aws-amplify/storage';

interface Props {
  s3Path: string;
  title: string;
}

export const InteractiveVisual = ({ s3Path, title }: Props) => {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUrl() {
      setLoading(true);
      try {
        const res = await getUrl({ 
          path: s3Path,
          options: { validateObjectExistence: true } 
        });
        setUrl(res.url.toString());
      } catch (err) {
        console.error("Error fetching visual:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUrl();
  }, [s3Path]);

  if (loading) return <div style={{ color: '#00ff41', padding: '20px' }}>Decrypting Module...</div>;

  return (
    <div style={{ width: '100%', height: '75vh', background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
      <iframe
        src={url}
        title={title}
        style={{ width: '100%', height: '100%', border: 'none' }}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};