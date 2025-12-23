import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

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

  // 1. Subscribe to Real-time Data
  useEffect(() => {
    // 1. Initial Fetch (Standard Request - usually avoids the filter bug)
    const fetchInitialTasks = async () => {
      try {
        const { data } = await client.models.Task.list({ authMode: 'userPool' });
        setTasks([...data]);
        console.log("Initial fetch successful:", data);
      } catch (err) {
        console.error("Manual fetch failed:", err);
      }
    };

    fetchInitialTasks();

    // 2. Real-time Subscription (Minimalist approach)
    // We remove the {} and undefined entirely. Just pass the options.
    const sub = client.models.Task.observeQuery({
      authMode: 'userPool'
    } as any).subscribe({
      next: ({ items }) => setTasks([...items]),
      error: (err) => console.warn("Live sync issue, but initial fetch worked:", err)
    });

    return () => sub.unsubscribe();
  }, []);

  // 2. Persistent Add
  const handleAddTask = async () => {
    if (!newTask.trim()) return;

    try {
      const { data: newEntry, errors } = await client.models.Task.create(
        {
          title: newTask,
          status: 'TODO', 
        },
        { authMode: 'userPool' }
      );

      if (errors) {
        console.error("Database rejected task:", JSON.stringify(errors, null, 2));
      } else if (newEntry) {
        // 🚀 MANUALLY update the UI so you don't have to refresh
        setTasks((prev) => [...prev, newEntry]);
        setNewTask('');
      }
    } catch (err) {
      console.error("System Error during add:", err);
    }
  };

  // 3. Persistent Move (Drop)
  const handleDrop = async (newStatus: any) => {
    if (!draggedTaskId) return;

    // 1. Save the current state in case we need to roll back
    const previousTasks = [...tasks];
    
    // 2. Immediately update the UI
    setTasks(prev => prev.map(t => 
      t.id === draggedTaskId ? { ...t, status: newStatus } : t
    ));

    try {
      await client.models.Task.update(
        { id: draggedTaskId, status: newStatus },
        { authMode: 'userPool' }
      );
    } catch (err) {
      console.error("Move failed, rolling back:", err);
      setTasks(previousTasks); // Rollback on error
    }
    setDraggedTaskId(null);
  };

  // 4. Persistent Delete
  const handleDelete = async (id: string) => {
    const previousTasks = [...tasks];
    
    // 1. Immediately remove from UI
    setTasks(prev => prev.filter(t => t.id !== id));

    try {
      await client.models.Task.delete(
        { id },
        { authMode: 'userPool' }
      );
    } catch (err) {
      console.error("Delete failed, rolling back:", err);
      setTasks(previousTasks); // Rollback on error
    }
  };

  return (
    <div style={{ display: 'flex', gap: 20, padding: 20, background: '#0a0a0a', borderRadius: 8, overflowX: 'auto' }}>
      {lanes.map(lane => (
        <div 
          key={lane.key} 
          onDragOver={e => e.preventDefault()}
          onDrop={() => handleDrop(lane.key)}
          style={{ 
            flex: 1, 
            minWidth: 250, 
            background: '#111', 
            borderRadius: 6, 
            padding: 12, 
            border: '1px solid #333',
            minHeight: '450px'
          }}
        >
          <h3 style={{ color: '#00ff41', fontSize: '0.8rem', fontFamily: 'monospace', borderBottom: '1px solid #333', paddingBottom: 8, letterSpacing: '1px' }}>
            {lane.label}
          </h3>
          
          {lane.key === 'TODO' && (
            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                placeholder="NEW_OBJECTIVE..."
                onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); }}
                style={{ 
                  width: '100%', padding: 10, background: '#000', color: '#00ff41', 
                  border: '1px solid #00ff41', marginBottom: 6, fontFamily: 'monospace',
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
              <button
                onClick={handleAddTask}
                style={{ 
                  width: '100%', padding: 8, background: '#00ff41', color: '#000', 
                  border: 'none', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' 
                }}
              >
                + DEPLOY_TASK
              </button>
            </div>
          )}

          <div style={{ minHeight: '300px' }}>
            {tasks
              .filter(t => t.status === lane.key)
              .map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggedTaskId(task.id)}
                  style={{
                    background: '#1a1a1a',
                    color: '#ccc',
                    marginBottom: 10,
                    padding: 12,
                    borderRadius: 4,
                    border: '1px solid #333',
                    cursor: 'grab',
                    fontSize: '0.85rem',
                    opacity: draggedTaskId === task.id ? 0.4 : 1,
                    transition: 'transform 0.1s ease, opacity 0.1s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace' }}>{task.title}</span>
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(task.id);
                      }} 
                      style={{ 
                        cursor: 'pointer', color: '#ff4b2b', fontSize: '1.2rem', 
                        padding: '0 4px', lineHeight: 1 
                      }}
                      title="TERMINATE_TASK"
                    >
                      ×
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;