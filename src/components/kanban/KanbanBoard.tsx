import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

const lanes = [
  { key: 'TODO', label: 'TODO' },
  { key: 'IN_PROGRESS', label: 'In-progress' },
  { key: 'BLOCKED', label: 'Blocked' },
  { key: 'COMPLETED', label: 'Complete' },
];

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Array<Schema['Task']['type']>>([]);
  const [newTask, setNewTask] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialTasks = async () => {
      try {
        const { data } = await client.models.Task.list({ authMode: 'userPool' });
        setTasks([...data]);
      } catch (err) {
        console.error("Manual fetch failed:", err);
      }
    };

    fetchInitialTasks();

    const sub = client.models.Task.observeQuery({
      authMode: 'userPool'
    } as any).subscribe({
      next: ({ items }) => setTasks([...items]),
      error: (err) => console.warn("Live sync issue:", err)
    });

    return () => sub.unsubscribe();
  }, []);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    try {
      const { data: newEntry } = await client.models.Task.create(
        { title: newTask, status: 'TODO' },
        { authMode: 'userPool' }
      );
      if (newEntry) {
        setTasks((prev) => [...prev, newEntry]);
        setNewTask('');
      }
    } catch (err) { console.error(err); }
  };

  const handleDrop = async (newStatus: any) => {
    if (!draggedTaskId) return;
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === draggedTaskId ? { ...t, status: newStatus } : t));
    try {
      await client.models.Task.update({ id: draggedTaskId, status: newStatus }, { authMode: 'userPool' });
    } catch (err) {
      setTasks(previousTasks);
    }
    setDraggedTaskId(null);
  };

  const handleDelete = async (id: string) => {
    const previousTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await client.models.Task.delete({ id }, { authMode: 'userPool' });
    } catch (err) {
      setTasks(previousTasks);
    }
  };

  // --- REINFORCEMENT LOGIC ---
  const handleLaunchRemediation = (drillId: string | null | undefined) => {
    if (!drillId) return;
    // For now, we alert. In the next step, we'll use this to navigate to ActionTerminal
    alert(`REDIRECTING_TO_TERMINAL: Loading Protocol ${drillId}`);
    // window.location.hash = '/terminal'; // Example if using hash routing
  };

  return (
    <div style={{ display: 'flex', gap: 20, padding: 20, background: '#0a0a0a', borderRadius: 8, overflowX: 'auto' }}>
      {lanes.map(lane => (
        <div 
          key={lane.key} 
          onDragOver={e => e.preventDefault()}
          onDrop={() => handleDrop(lane.key)}
          style={s.lane}
        >
          <h3 style={s.laneHeader}>{lane.label}</h3>
          
          {lane.key === 'TODO' && (
            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                placeholder="NEW_OBJECTIVE..."
                onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); }}
                style={s.input}
              />
              <button onClick={handleAddTask} style={s.addBtn}>+ DEPLOY_TASK</button>
            </div>
          )}

          <div style={{ minHeight: '300px' }}>
            {tasks
              .filter(t => t.status === lane.key)
              .map(task => {
                const isRemediation = task.title?.includes('REMEDIATE');
                
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggedTaskId(task.id)}
                    style={{
                      ...s.card,
                      borderLeft: isRemediation ? '4px solid #ff4b2b' : '1px solid #333',
                      opacity: draggedTaskId === task.id ? 0.4 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <span style={s.cardTitle}>{task.title}</span>
                        
                        {/* THE REINFORCEMENT UI */}
                        {isRemediation && (
                          <div style={s.remediationInfo}>
                            <div style={s.scoreContainer}>
                              <div style={{ ...s.scoreBar, width: `${task.score || 0}%` }} />
                            </div>
                            <span style={s.scoreText}>SCORE: {task.score}%</span>
                            <button 
                              onClick={() => handleLaunchRemediation(task.drillId)}
                              style={s.launchBtn}
                            >
                              INITIALIZE_REMEDIATION
                            </button>
                          </div>
                        )}
                      </div>

                      <span 
                        onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }} 
                        style={s.deleteBtn}
                      >×</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};

const s = {
  lane: { flex: 1, minWidth: 280, background: '#111', borderRadius: 6, padding: 12, border: '1px solid #222', minHeight: '500px' },
  laneHeader: { color: '#00ff41', fontSize: '0.75rem', fontFamily: 'monospace', borderBottom: '1px solid #222', paddingBottom: 8, letterSpacing: '2px' },
  input: { width: '100%', padding: '10px', background: '#000', color: '#00ff41', border: '1px solid #00ff41', marginBottom: '6px', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' as const },
  addBtn: { width: '100%', padding: '8px', background: '#00ff41', color: '#000', border: 'none', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' as const },
  card: { background: '#1a1a1a', color: '#ccc', marginBottom: 10, padding: 12, borderRadius: 4, cursor: 'grab' as const, transition: '0.2s' },
  cardTitle: { fontFamily: 'monospace', fontSize: '0.85rem', display: 'block', marginBottom: '8px' },
  deleteBtn: { cursor: 'pointer', color: '#ff4b2b', fontSize: '1.2rem', paddingLeft: '8px' },
  remediationInfo: { marginTop: '10px', padding: '8px', background: 'rgba(255, 75, 43, 0.05)', borderRadius: '4px' },
  scoreContainer: { height: '4px', background: '#333', width: '100%', borderRadius: '2px', marginBottom: '4px' },
  scoreBar: { height: '100%', background: '#ff4b2b', borderRadius: '2px' },
  scoreText: { fontSize: '0.65rem', color: '#888', display: 'block', marginBottom: '8px' },
  launchBtn: { width: '100%', background: 'transparent', border: '1px solid #00ff41', color: '#00ff41', fontSize: '0.65rem', padding: '4px', cursor: 'pointer', fontFamily: 'monospace' }
};

export default KanbanBoard;