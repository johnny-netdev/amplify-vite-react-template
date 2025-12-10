import React, { useState } from 'react';

const initialTasks = [
  { id: 1, content: 'Example Task 1', status: 'TODO' },
  { id: 2, content: 'Example Task 2', status: 'In-progress' },
  { id: 3, content: 'Example Task 3', status: 'Blocked' },
  { id: 4, content: 'Example Task 4', status: 'Complete' },
];

const lanes = [
  { key: 'TODO', label: 'TODO' },
  { key: 'In-progress', label: 'In-progress' },
  { key: 'Blocked', label: 'Blocked' },
  { key: 'Complete', label: 'Complete' },
  { key: 'Done', label: 'Done 🗑️' },
];

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState('');

  // Drag state
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), content: newTask, status: 'TODO' }]);
      setNewTask('');
    }
  };

  const handleDragStart = (id: number) => setDraggedTaskId(id);
  const handleDrop = (status: string) => {
    if (draggedTaskId !== null) {
      if (status === 'Done') {
        setTasks(tasks.filter(task => task.id !== draggedTaskId));
      } else {
        setTasks(tasks.map(task =>
          task.id === draggedTaskId ? { ...task, status } : task
        ));
      }
      setDraggedTaskId(null);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 24, padding: 24, background: '#f4f6fa', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      {lanes.map(lane => (
        <div key={lane.key} style={{ flex: 1, minWidth: 220, background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          onDragOver={e => e.preventDefault()}
          onDrop={() => handleDrop(lane.key)}
        >
          <h3 style={{ textAlign: 'center', color: '#357ae8', marginBottom: 12 }}>{lane.label}</h3>
          {lane.key === 'TODO' && (
            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                placeholder="Add new task..."
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginBottom: 4 }}
                onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); }}
              />
              <button onClick={handleAddTask} style={{ width: '100%', padding: 8, borderRadius: 6, background: '#357ae8', color: '#fff', border: 'none', cursor: 'pointer' }}>Add</button>
            </div>
          )}
          <div style={{ minHeight: 40 }}>
            {tasks.filter(task => task.status === lane.key).map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(task.id)}
                style={{
                  background: '#357ae8',
                  color: '#fff',
                  marginBottom: 10,
                  padding: 10,
                  borderRadius: 8,
                  boxShadow: '0 1px 3px rgba(53,122,232,0.08)',
                  cursor: 'grab',
                  border: draggedTaskId === task.id ? '2px solid #357ae8' : '1px solid #dbeafe',
                  opacity: draggedTaskId === task.id ? 0.7 : 1,
                  transition: 'border 0.2s, opacity 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: 500,
                }}
              >
                <span>{task.content}</span>
                <span
                  title="Delete task"
                  style={{ marginLeft: 8, color: '#e53e3e', cursor: 'pointer', fontSize: '1.2em' }}
                  onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                  role="button"
                  tabIndex={0}
                >
                  🗑️
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
