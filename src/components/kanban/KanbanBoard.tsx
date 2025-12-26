import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth'; // 🟢 Added for secure group check
import type { Schema } from '../../../amplify/data/resource';
import { CERT_REGISTRY } from '../../utils/certRegistry'; 

const client = generateClient<Schema>();

interface KanbanBoardProps {
  onLaunchDrill: (drillId: string, certPath?: string) => void;
  addNotification: (message: string) => void;
}

type TaskStatus = "TODO" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED";

interface Lane {
  key: TaskStatus;
  label: string;
}

const lanes: Lane[] = [
  { key: 'TODO', label: 'TODO' },
  { key: 'IN_PROGRESS', label: 'In-progress' },
  { key: 'BLOCKED', label: 'Blocked' },
  { key: 'COMPLETED', label: 'Complete' },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ onLaunchDrill, addNotification }) => {
  const [tasks, setTasks] = useState<Array<Schema['Task']['type']>>([]);
  const [newTask, setNewTask] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [pendingDeletes, setPendingDeletes] = useState<Record<string, number>>({});
  
  // 🟢 Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuthenticator((context) => [context.user]);

  // 🟢 Check for 'Admins' group in the current session
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const session = await fetchAuthSession();
        const groups = (session.tokens?.accessToken?.payload['cognito:groups'] as string[]) || [];
        setIsAdmin(groups.includes('Admins'));
      } catch (err) {
        console.error("Auth Session Error:", err);
        setIsAdmin(false);
      }
    };

    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  useEffect(() => {
    const fetchInitialTasks = async () => {
      try {
        const { data } = await client.models.Task.list({ authMode: 'userPool' });
        setTasks([...data]);
      } catch (err) { 
        console.error("Manual fetch failed:", err); 
        addNotification("DATA_FETCH_ERROR: CHECK_CONNECTION");
      }
    };
    fetchInitialTasks();

    const sub = client.models.Task.observeQuery({ authMode: 'userPool' } as any).subscribe({
      next: ({ items }) => setTasks([...items]),
      error: (err) => console.warn("Live sync issue:", err)
    });
    return () => sub.unsubscribe();
  }, [addNotification]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPendingDeletes(prev => {
        const updated = { ...prev };
        let changed = false;
        Object.keys(updated).forEach(id => {
          if (updated[id] <= 1) {
            handleDelete(id); 
            delete updated[id];
            addNotification(`AUTO_PURGE_COMPLETE: TASK_ID_${id.substring(0,5)}`);
            changed = true;
          } else {
            updated[id] -= 1;
            changed = true;
          }
        });
        return changed ? updated : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [tasks, addNotification]);

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
        addNotification(`TASK_DEPLOYED: ${newTask.substring(0, 15)}...`);
      }
    } catch (err) { 
        console.error(err); 
        addNotification("DEPLOY_FAILED: DATABASE_REJECTED");
    }
  };

  const handleDrop = async (newStatus: string) => {
    if (!draggedTaskId) return;

    if (newStatus === 'COMPLETED') {
      setPendingDeletes(prev => ({ ...prev, [draggedTaskId]: 300 }));
      addNotification(`TASK_COMPLETED: CLEANUP_TIMER_STARTED`);
    } else {
      setPendingDeletes(prev => {
        const updated = { ...prev };
        delete updated[draggedTaskId];
        return updated;
      });
      addNotification(`TASK_MOVED: ${newStatus}`);
    }

    const previousTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === draggedTaskId ? { ...t, status: newStatus as any } : t));

    try {
      await client.models.Task.update({ 
        id: draggedTaskId, 
        status: newStatus as any
      }, { authMode: 'userPool' });
    } catch (err) {
      setTasks(previousTasks);
      addNotification("SYNC_ERROR: REVERTING_STATE");
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
      addNotification("DELETE_FAILED: CLOUD_SYNC_ERROR");
    }
  };

  const handlePurgeAllCompleted = async () => {
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
    if (completedTasks.length === 0) return;

    if (window.confirm(`PERMANENTLY PURGE ${completedTasks.length} COMPLETED TASKS?`)) {
      const previousTasks = [...tasks];
      setTasks(prev => prev.filter(t => t.status !== 'COMPLETED'));
      setPendingDeletes({});
      addNotification(`NUCLEAR_PURGE_INITIATED: ${completedTasks.length} ITEMS`);

      try {
        await Promise.all(completedTasks.map(t => client.models.Task.delete({ id: t.id }, { authMode: 'userPool' })));
        addNotification("PURGE_SUCCESSFUL");
      } catch (err) {
        console.error("Bulk purge failed:", err);
        setTasks(previousTasks);
        addNotification("PURGE_FAILED: PARTIAL_RECOVERY");
      }
    }
  };

  const handleLaunchRemediation = (task: Schema['Task']['type']) => {
    if (!task.drillId) return;
    const certEntry = Object.entries(CERT_REGISTRY).find(([_, config]) => config.id === task.certID);
    const targetPath = certEntry ? certEntry[0] : 'cissp';
    onLaunchDrill(task.drillId, targetPath); 
  };

  return (
    <div style={s.boardContainer}>
      {lanes.map(lane => (
        <div 
          key={lane.key} 
          onDragOver={e => e.preventDefault()}
          onDrop={() => handleDrop(lane.key)}
          style={s.lane}
        >
          <div style={s.laneHeaderContainer}>
            <h3 style={s.laneHeader}>{lane.label}</h3>
            {/* 🟢 Secure Admin Button */}
            {lane.key === 'COMPLETED' && tasks.some(t => t.status === 'COMPLETED') && isAdmin && (
              <button onClick={handlePurgeAllCompleted} style={s.purgeAllBtn}>[ NUCLEAR_PURGE ]</button>
            )}
          </div>
          
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
                const isPending = pendingDeletes[task.id];
                
                const certConfig = Object.values(CERT_REGISTRY).find(c => c.id === task.certID) 
                   || (task.title?.includes('AWS') ? CERT_REGISTRY.awssap : CERT_REGISTRY.cissp);

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggedTaskId(task.id)}
                    style={{
                      ...s.card,
                      borderLeft: isRemediation ? `4px solid ${certConfig.color}` : '1px solid #333',
                      opacity: isPending ? 0.6 : (draggedTaskId === task.id ? 0.4 : 1),
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ ...s.certBadge, color: certConfig.color, borderColor: certConfig.color + '44' }}>
                          {certConfig.name}
                        </div>

                        <span style={s.cardTitle}>{task.title}</span>
                        
                        {isRemediation && (
                          <div style={s.remediationInfo}>
                            <div style={s.scoreContainer}>
                              <div style={{ ...s.scoreBar, width: `${task.score || 0}%`, background: certConfig.color }} />
                            </div>
                            <span style={s.scoreText}>SCORE: {task.score}%</span>
                            <button 
                              onClick={() => handleLaunchRemediation(task)}
                              style={{ ...s.launchBtn, color: certConfig.color, borderColor: certConfig.color }}
                            >
                              INITIALIZE_REMEDIATION
                            </button>
                            {isPending && (
                              <div style={s.timerLabel}>AUTO-PURGE: {pendingDeletes[task.id]}s</div>
                            )}
                          </div>
                        )}
                      </div>

                      <span 
                        onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }} 
                        style={s.deleteBtn}
                      >x</span>
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
  boardContainer: { display: 'flex', gap: 20, padding: 20, background: '#0a0a0a', borderRadius: 8, overflowX: 'auto' as const },
  lane: { flex: 1, minWidth: 280, background: '#111', borderRadius: 6, padding: 12, border: '1px solid #222', minHeight: '500px' },
  laneHeaderContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottom: '1px solid #222', paddingBottom: 8 },
  laneHeader: { color: '#00ff41', fontSize: '0.75rem', fontFamily: 'monospace', letterSpacing: '2px', margin: 0 },
  purgeAllBtn: { background: 'transparent', border: 'none', color: '#ff4b2b', fontSize: '0.6rem', fontFamily: 'monospace', cursor: 'pointer', fontWeight: 'bold' as const },
  input: { width: '100%', padding: '10px', background: '#000', color: '#00ff41', border: '1px solid #00ff41', marginBottom: '6px', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' as const },
  addBtn: { width: '100%', padding: '8px', background: '#00ff41', color: '#000', border: 'none', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' as const },
  card: { background: '#1a1a1a', color: '#ccc', marginBottom: 10, padding: 12, borderRadius: 4, cursor: 'grab' as const, transition: '0.2s' },
  cardTitle: { fontFamily: 'monospace', fontSize: '0.85rem', display: 'block', marginBottom: '8px' },
  certBadge: { fontSize: '0.5rem', fontFamily: 'monospace', border: '1px solid', padding: '1px 4px', borderRadius: '3px', display: 'inline-block', marginBottom: '6px', background: 'rgba(255,255,255,0.02)' },
  deleteBtn: { cursor: 'pointer', color: '#ff4b2b', fontSize: '1.4rem', paddingLeft: '8px', fontWeight: 'bold' as const, lineHeight: '1' },
  remediationInfo: { marginTop: '10px', padding: '8px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px' },
  scoreContainer: { height: '4px', background: '#333', width: '100%', borderRadius: '2px', marginBottom: '4px' },
  scoreBar: { height: '100%', borderRadius: '2px' },
  scoreText: { fontSize: '0.65rem', color: '#888', display: 'block', marginBottom: '8px' },
  timerLabel: { color: '#ff4b2b', fontSize: '0.6rem', marginTop: '8px', textAlign: 'center' as const, fontFamily: 'monospace', fontWeight: 'bold' as const },
  launchBtn: { width: '100%', background: 'transparent', border: '1px solid', fontSize: '0.65rem', padding: '4px', cursor: 'pointer', fontFamily: 'monospace' }
};

export default KanbanBoard;