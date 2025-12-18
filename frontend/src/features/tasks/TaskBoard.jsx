import { useState, useEffect, useMemo } from 'react';
import { getAllTasks, createTask, updateTaskStatus } from '../../services/taskService';
import {
  CheckSquare,
  Plus,
  User,
  ArrowRight,
  Play,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Filter,
  Search,
} from 'lucide-react';

export default function TaskBoard({ currentUser }) {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks", error);
      setError('Failed to load tasks. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsCreating(true);

    const newTask = {
      title: newTaskTitle,
      description: '',
      status: 'TODO',
      assignedUser: currentUser // Auto-assign to self
    };

    try {
      await createTask(newTask);
      setNewTaskTitle('');
      loadTasks(); // Refresh board
    } catch (error) {
      console.error("Failed to create task", error);
      setError('Failed to create task.');
    } finally {
      setIsCreating(false);
    }
  };

  const moveTask = async (taskId, newStatus) => {
    // Optimistic update
    const updatedTasks = tasks.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error("Failed to move task", error);
      loadTasks(); // Revert on error
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesStatus = filterStatus === 'ALL' ? true : t.status === filterStatus;
      const matchesSearch = search
        ? t.title.toLowerCase().includes(search.toLowerCase()) ||
          (t.description || '').toLowerCase().includes(search.toLowerCase())
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [tasks, filterStatus, search]);

  const statusCounts = useMemo(() => {
    return {
      ALL: tasks.length,
      TODO: tasks.filter((t) => t.status === 'TODO').length,
      IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      DONE: tasks.filter((t) => t.status === 'DONE').length,
    };
  }, [tasks]);

  // Helper to render a column
  const TaskColumn = ({ title, status, bgColor, accentColor, icon: Icon }) => {
    const columnTasks = filteredTasks.filter(t => t.status === status);

    return (
      <div className={`flex-1 ${bgColor} rounded-2xl p-4 min-h-[520px] border border-secondary-200 dark:border-secondary-700`}>
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 ${accentColor} rounded-xl flex items-center justify-center shadow-soft ring-1 ring-black/5 dark:ring-white/10`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-secondary-900 dark:text-white text-sm uppercase tracking-wide">
                {title}
              </h3>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                {columnTasks.length} {columnTasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-3">
          {columnTasks.map(task => (
            <div key={task.id} className="task-card animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-secondary-900 dark:text-white text-sm leading-tight">
                  {task.title}
                </h4>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-secondary-500 dark:text-secondary-400">
                  <User className="w-3 h-3" />
                  <span className="truncate max-w-20">
                    {task.assignedUser?.username ||
                      (task.assigned_user_id === currentUser?.id ? currentUser?.username : 'Unassigned')}
                  </span>
                </div>

                {/* Move Buttons */}
                <div className="flex gap-1">
                  {status !== 'TODO' && (
                    <button
                      onClick={() => moveTask(task.id, 'TODO')}
                      className="p-1.5 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-600 dark:text-secondary-200 transition-colors"
                      title="Move to To Do"
                    >
                      <ArrowRight className="w-3 h-3 rotate-180 text-secondary-400" />
                    </button>
                  )}
                  {status === 'TODO' && (
                    <button
                      onClick={() => moveTask(task.id, 'IN_PROGRESS')}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-800 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-200 font-medium transition-colors"
                      title="Start task"
                    >
                      <Play className="w-3 h-3" />
                      Start
                    </button>
                  )}
                  {status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => moveTask(task.id, 'DONE')}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium transition-colors"
                      title="Mark as done"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Done
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {columnTasks.length === 0 && (
            <div className="text-center py-8 text-secondary-400 dark:text-secondary-500">
              <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No {title.toLowerCase()} tasks</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-4 lg:p-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-secondary-900 dark:text-white mb-1 tracking-tight">
            Task Management
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400">
            Organize and track your team's work with our Kanban board
          </p>
        </div>
        <button
          onClick={loadTasks}
          className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium bg-secondary-50/80 dark:bg-secondary-700/60 border border-secondary-200 dark:border-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4 p-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-72 pl-9 pr-3 py-2 rounded-2xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50/80 dark:bg-secondary-700/60 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-secondary-400" />
          {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`text-xs px-3 py-2 rounded-2xl border transition-colors ${
                filterStatus === status
                  ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-700 dark:text-primary-200'
                  : 'bg-secondary-50/80 border-secondary-200 text-secondary-700 dark:bg-secondary-800/60 dark:border-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700'
              }`}
            >
              {status.replace('_', ' ')} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="card mb-4 text-sm text-danger-700 bg-danger-50 border border-danger-200">
          {error}
        </div>
      )}

      {/* Create Task Form */}
      <div className="card mb-6 p-4">
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="What needs to be done?"
              className="input-modern"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isCreating || !newTaskTitle.trim()}
            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <div className="spinner"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Task
              </>
            )}
          </button>
        </form>
      </div>

      {/* Kanban Board */}
      <div className="flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          <TaskColumn
            title="To Do"
            status="TODO"
            bgColor="bg-secondary-50 dark:bg-secondary-800/50"
            accentColor="bg-secondary-500"
            icon={AlertCircle}
          />
          <TaskColumn
            title="In Progress"
            status="IN_PROGRESS"
            bgColor="bg-primary-50 dark:bg-primary-900/10"
            accentColor="bg-primary-500"
            icon={Play}
          />
          <TaskColumn
            title="Done"
            status="DONE"
            bgColor="bg-success-50 dark:bg-success-900/10"
            accentColor="bg-success-500"
            icon={CheckCircle2}
          />
        </div>
      </div>
    </div>
  );
}