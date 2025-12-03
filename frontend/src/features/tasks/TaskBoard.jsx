import { useState, useEffect } from 'react';
import { getAllTasks, createTask, updateTaskStatus } from '../../services/taskService';

export default function TaskBoard({ currentUser }) {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks", error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      title: newTaskTitle,
      description: '',
      status: 'TODO',
      assignedUser: currentUser // Auto-assign to self
    };

    await createTask(newTask);
    setNewTaskTitle('');
    loadTasks(); // Refresh board
  };

  const moveTask = async (taskId, newStatus) => {
    // Optimistic update (update UI immediately so it feels fast)
    const updatedTasks = tasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    // Send to backend
    await updateTaskStatus(taskId, newStatus);
  };

  // Helper to render a column
  const TaskColumn = ({ title, status, bgColor }) => (
    <div className={`flex-1 ${bgColor} rounded-lg p-4 min-h-[500px]`}>
      <h3 className="font-bold text-slate-700 mb-4 uppercase tracking-wide text-sm">
        {title} <span className="text-slate-400 ml-2">({tasks.filter(t => t.status === status).length})</span>
      </h3>
      
      <div className="space-y-3">
        {tasks.filter(t => t.status === status).map(task => (
          <div key={task.id} className="bg-white p-4 rounded shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-slate-800">{task.title}</h4>
            <div className="text-xs text-slate-400 mt-2 flex justify-between items-center">
               <span>👤 {task.assignedUser?.username}</span>
               
               {/* Move Buttons */}
               <div className="flex gap-1">
                 {status !== 'TODO' && (
                   <button onClick={() => moveTask(task.id, 'TODO')} className="text-xs bg-slate-100 hover:bg-slate-200 p-1 rounded">
                     ⬅️
                   </button>
                 )}
                 {status === 'TODO' && (
                   <button onClick={() => moveTask(task.id, 'IN_PROGRESS')} className="text-xs bg-blue-100 hover:bg-blue-200 p-1 rounded text-blue-700">
                     Start ▶
                   </button>
                 )}
                 {status === 'IN_PROGRESS' && (
                   <button onClick={() => moveTask(task.id, 'DONE')} className="text-xs bg-green-100 hover:bg-green-200 p-1 rounded text-green-700">
                     Done ✅
                   </button>
                 )}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Input Bar */}
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input 
          type="text" 
          placeholder="Add a new task..." 
          className="flex-1 p-3 border rounded-lg shadow-sm focus:outline-indigo-500"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <button type="submit" className="bg-indigo-600 text-white px-6 font-bold rounded-lg hover:bg-indigo-700">
          Add +
        </button>
      </form>

      {/* Columns */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        <TaskColumn title="To Do" status="TODO" bgColor="bg-slate-100" />
        <TaskColumn title="In Progress" status="IN_PROGRESS" bgColor="bg-blue-50" />
        <TaskColumn title="Done" status="DONE" bgColor="bg-green-50" />
      </div>
    </div>
  );
}