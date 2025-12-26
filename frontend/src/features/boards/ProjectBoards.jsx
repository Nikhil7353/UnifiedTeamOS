import React, { useMemo, useState, useEffect } from 'react';
import {
  Columns,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Flag,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

import {
  listProjects,
  createProject,
  listProjectCards,
  createProjectCard,
  updateProjectCard,
  deleteProjectCard,
} from '../../services/projectService';

const DEFAULT_COLUMNS = [
  { id: 'backlog', title: 'Backlog', tone: 'bg-secondary-100 dark:bg-secondary-700' },
  { id: 'todo', title: 'To Do', tone: 'bg-primary-50 dark:bg-primary-900/20' },
  { id: 'in_progress', title: 'In Progress', tone: 'bg-accent-50 dark:bg-accent-900/15' },
  { id: 'done', title: 'Done', tone: 'bg-success-50 dark:bg-success-900/15' },
];

export default function ProjectBoards({ currentUser }) {
  const [mode, setMode] = useState('kanban'); // kanban | sprint
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [boardName, setBoardName] = useState('TeamOS Roadmap');
  const [columns] = useState(DEFAULT_COLUMNS);
  const [cards, setCards] = useState([]);
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Load cards when project changes
  useEffect(() => {
    if (activeProject) {
      loadProjectCards();
    }
  }, [activeProject]);

  const loadProjects = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await listProjects();
      setProjects(data);
      if (data.length > 0 && !activeProject) {
        setActiveProject(data[0]);
        setBoardName(data[0].name);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      setError('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectCards = async () => {
    if (!activeProject) return;
    
    setIsLoading(true);
    setError('');
    try {
      const data = await listProjectCards(activeProject.id);
      setCards(data);
    } catch (error) {
      console.error('Failed to load project cards:', error);
      setError('Failed to load project cards');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewProject = async () => {
    const name = prompt('Project name:');
    if (!name) return;
    
    const description = prompt('Project description:');
    
    try {
      const newProject = await createProject({ name, description });
      setProjects(prev => [newProject, ...prev]);
      setActiveProject(newProject);
      setBoardName(newProject.name);
    } catch (error) {
      console.error('Failed to create project:', error);
      setError('Failed to create project');
    }
  };

  const createNewCard = async (status = 'todo') => {
    if (!newCardTitle.trim() || !activeProject) return;
    
    try {
      const newCard = await createProjectCard(activeProject.id, {
        title: newCardTitle,
        description: newCardDescription,
        status,
        priority: 'medium'
      });
      
      setCards(prev => [...prev, newCard]);
      setNewCardTitle('');
      setNewCardDescription('');
      setShowNewCardForm(false);
    } catch (error) {
      console.error('Failed to create card:', error);
      setError('Failed to create card');
    }
  };

  const moveCard = async (cardId, newStatus) => {
    // Optimistic update
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, status: newStatus } : card
    ));

    try {
      await updateProjectCard(cardId, { status: newStatus });
    } catch (error) {
      console.error('Failed to move card:', error);
      loadProjectCards(); // Revert on error
    }
  };

  const deleteCard = async (cardId) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    
    try {
      await deleteProjectCard(cardId);
      setCards(prev => prev.filter(card => card.id !== cardId));
    } catch (error) {
      console.error('Failed to delete card:', error);
      setError('Failed to delete card');
    }
  };

  const filteredCards = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter((c) => (c.title + ' ' + (c.description || '')).toLowerCase().includes(q));
  }, [cards, query]);

  const countsByStatus = useMemo(() => {
    const map = Object.fromEntries(columns.map((c) => [c.id, 0]));
    for (const c of filteredCards) map[c.status] = (map[c.status] || 0) + 1;
    return map;
  }, [filteredCards, columns]);

  return (
    <div className="flex h-full bg-secondary-50 dark:bg-secondary-900">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-secondary-900/50 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">Loading...</div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg z-50">
          {error}
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-700 text-white flex items-center justify-center">
                  <Columns className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold text-secondary-900 dark:text-white truncate">{boardName}</div>
                  <div className="text-sm text-secondary-500 dark:text-secondary-400">Real-time project management</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setMode('kanban')}
                  className={`btn px-4 py-2 ${mode === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Kanban
                </button>
                <button
                  onClick={() => setMode('sprint')}
                  className={`btn px-4 py-2 ${mode === 'sprint' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Sprint
                </button>
                
                <div className="ml-auto flex items-center gap-2">
                  <select
                    value={activeProject?.id || ''}
                    onChange={(e) => {
                      const project = projects.find(p => p.id === parseInt(e.target.value));
                      setActiveProject(project);
                      setBoardName(project?.name || 'Select Project');
                    }}
                    className="px-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                  >
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={createNewProject}
                    className="btn btn-primary px-4 py-2"
                  >
                    New Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-auto p-6">
          {mode === 'sprint' ? (
            <div className="text-center text-secondary-500 dark:text-secondary-400 mt-20">
              Sprint view coming soon
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {columns.map((col) => (
                <div key={col.id} className="card overflow-hidden">
                  <div className={`px-4 py-3 border-b border-secondary-200 dark:border-secondary-700 ${col.tone}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-secondary-900 dark:text-white">{col.title}</div>
                      <div className="text-xs text-secondary-600 dark:text-secondary-300 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-full">
                        {countsByStatus[col.id] || 0}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 space-y-2 min-h-[200px]">
                    <button
                      onClick={() => setShowNewCardForm(col.id)}
                      className="w-full p-2 border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg text-secondary-500 dark:text-secondary-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
                    >
                      <Plus className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-xs">Add card</div>
                    </button>
                    
                    {filteredCards.filter(card => card.status === col.id).map((card) => (
                      <div key={card.id} className="card card-hover p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-secondary-900 dark:text-white text-sm leading-tight">
                            {card.title}
                          </h4>
                          <button
                            onClick={() => deleteCard(card.id)}
                            className="opacity-0 hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {card.description && (
                          <p className="text-xs text-secondary-600 dark:text-secondary-400 mb-2 line-clamp-2">
                            {card.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Flag className={`w-3 h-3 ${
                              card.priority === 'high' ? 'text-red-500' :
                              card.priority === 'medium' ? 'text-yellow-500' :
                              'text-green-500'
                            }`} />
                          </div>
                          
                          <div className="flex gap-1">
                            {col.id !== 'backlog' && (
                              <button
                                onClick={() => {
                                  const prevCol = columns[columns.findIndex(c => c.id === col.id) - 1];
                                  if (prevCol) moveCard(card.id, prevCol.id);
                                }}
                                className="text-secondary-400 hover:text-secondary-600"
                              >
                                <ArrowRight className="w-3 h-3 rotate-180" />
                              </button>
                            )}
                            {col.id !== 'done' && (
                              <button
                                onClick={() => {
                                  const nextCol = columns[columns.findIndex(c => c.id === col.id) + 1];
                                  if (nextCol) moveCard(card.id, nextCol.id);
                                }}
                                className="text-secondary-400 hover:text-secondary-600"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Card Modal */}
      {showNewCardForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Create New Card
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                  placeholder="Card title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newCardDescription}
                  onChange={(e) => setNewCardDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                  rows={3}
                  placeholder="Card description..."
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => createNewCard(showNewCardForm)}
                className="btn btn-primary flex-1"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewCardForm(false);
                  setNewCardTitle('');
                  setNewCardDescription('');
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PriorityBadge({ priority }) {
  const cfg =
    priority === 'high'
      ? { icon: AlertCircle, cls: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' }
      : priority === 'medium'
        ? { icon: Flag, cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' }
        : { icon: Clock, cls: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-200' };
  const Icon = cfg.icon;
  return (
    <span className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${cfg.cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {priority}
    </span>
  );
}

function CardItem({ card, onMoveLeft, onMoveRight }) {
  return (
    <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 hover:shadow-soft transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-secondary-900 dark:text-white">{card.title}</div>
          <div className="mt-1 text-sm text-secondary-600 dark:text-secondary-300">{card.desc}</div>
        </div>
        <button className="btn-ghost p-2" title="More">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={card.priority} />
        <span className="text-xs px-2 py-1 rounded-full bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200">
          Assignee: {card.assignee}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200 inline-flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {card.due}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button className="btn btn-secondary px-3 py-2" onClick={onMoveLeft} title="Move left">
          <ArrowRight className="w-4 h-4 rotate-180" />
        </button>
        <button className="btn btn-secondary px-3 py-2" onClick={onMoveRight} title="Move right">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function SprintView({ cards }) {
  const sprint = {
    name: 'Sprint 12',
    window: 'Mon → Fri',
    goal: 'Ship UI shells for core differentiators',
  };

  const done = cards.filter((c) => c.status === 'done');
  const active = cards.filter((c) => c.status !== 'done');

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="card p-5 xl:col-span-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xl font-bold text-secondary-900 dark:text-white">{sprint.name}</div>
            <div className="text-sm text-secondary-500 dark:text-secondary-400">{sprint.window}</div>
            <div className="mt-2 text-sm text-secondary-700 dark:text-secondary-200">
              <span className="font-semibold">Goal:</span> {sprint.goal}
            </div>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {done.length} done
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {active.map((c) => (
            <div key={c.id} className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800">
              <div className="font-semibold text-secondary-900 dark:text-white">{c.title}</div>
              <div className="mt-1 text-sm text-secondary-600 dark:text-secondary-300">{c.desc}</div>
              <div className="mt-3 flex items-center gap-2">
                <PriorityBadge priority={c.priority} />
                <span className="text-xs px-2 py-1 rounded-full bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200">
                  {c.assignee}
                </span>
              </div>
            </div>
          ))}

          {active.length === 0 && (
            <div className="text-sm text-secondary-500 dark:text-secondary-400">All done 🎉</div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="text-sm font-semibold text-secondary-900 dark:text-white">Completed</div>
        <div className="mt-3 space-y-2">
          {done.map((c) => (
            <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl bg-success-50 dark:bg-success-900/10">
              <CheckCircle2 className="w-5 h-5 text-success-600 dark:text-success-300" />
              <div className="min-w-0">
                <div className="font-medium text-secondary-900 dark:text-white truncate">{c.title}</div>
                <div className="text-xs text-secondary-500 dark:text-secondary-400">{c.assignee}</div>
              </div>
            </div>
          ))}
          {done.length === 0 && (
            <div className="text-sm text-secondary-500 dark:text-secondary-400">No completed items yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
