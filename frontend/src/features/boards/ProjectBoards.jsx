import React, { useMemo, useState } from 'react';
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

const DEFAULT_COLUMNS = [
  { id: 'backlog', title: 'Backlog', tone: 'bg-secondary-100 dark:bg-secondary-700' },
  { id: 'todo', title: 'To Do', tone: 'bg-primary-50 dark:bg-primary-900/20' },
  { id: 'in_progress', title: 'In Progress', tone: 'bg-accent-50 dark:bg-accent-900/15' },
  { id: 'done', title: 'Done', tone: 'bg-success-50 dark:bg-success-900/15' },
];

export default function ProjectBoards({ currentUser }) {
  const [mode, setMode] = useState('kanban'); // kanban | sprint
  const [query, setQuery] = useState('');

  const [boardName, setBoardName] = useState('TeamOS Roadmap');
  const [columns] = useState(DEFAULT_COLUMNS);
  const [cards, setCards] = useState([
    {
      id: 1,
      title: 'Polish Unified Inbox UI',
      desc: 'Group by day, improve details, quick actions',
      status: 'todo',
      priority: 'high',
      assignee: 'You',
      due: 'Fri',
    },
    {
      id: 2,
      title: 'Voice rooms UI finalize',
      desc: 'PTT hint, participant cards, create room',
      status: 'done',
      priority: 'medium',
      assignee: 'Asha',
      due: 'Thu',
    },
    {
      id: 3,
      title: 'Video calling UI shell',
      desc: 'Participants grid + controls',
      status: 'done',
      priority: 'high',
      assignee: 'Nikhil',
      due: 'Thu',
    },
    {
      id: 4,
      title: 'Whiteboard UI shell',
      desc: 'Canvas + tools + export',
      status: 'in_progress',
      priority: 'high',
      assignee: 'Rahul',
      due: 'Mon',
    },
    {
      id: 5,
      title: 'Ticketing UI skeleton',
      desc: 'Inbox → ticket conversion screens',
      status: 'backlog',
      priority: 'medium',
      assignee: '—',
      due: 'TBD',
    },
  ]);

  const filteredCards = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter((c) => (c.title + ' ' + c.desc).toLowerCase().includes(q));
  }, [cards, query]);

  const countsByStatus = useMemo(() => {
    const map = Object.fromEntries(columns.map((c) => [c.id, 0]));
    for (const c of filteredCards) map[c.status] = (map[c.status] || 0) + 1;
    return map;
  }, [filteredCards, columns]);

  const moveCard = (id, dir) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const idx = columns.findIndex((col) => col.id === c.status);
        const nextIdx = Math.min(columns.length - 1, Math.max(0, idx + dir));
        return { ...c, status: columns[nextIdx].id };
      })
    );
  };

  const createCard = () => {
    const title = prompt('Card title');
    if (!title) return;
    const id = Math.max(...cards.map((c) => c.id)) + 1;
    setCards((prev) => [
      {
        id,
        title,
        desc: 'New item',
        status: 'backlog',
        priority: 'low',
        assignee: currentUser?.username || 'You',
        due: 'TBD',
      },
      ...prev,
    ]);
  };

  return (
    <div className="flex h-full bg-secondary-50 dark:bg-secondary-900">
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
                  <div className="text-sm text-secondary-500 dark:text-secondary-400">UI-first board (drag & sync later)</div>
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

                <div className="ml-2 text-xs text-secondary-500 dark:text-secondary-400">Mocked cards + status moves</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={createCard} className="btn btn-primary px-4 py-2">
                <Plus className="w-4 h-4" />
                <span className="ml-2 hidden sm:inline">New</span>
              </button>
              <button className="btn btn-secondary px-4 py-2" title="Filter (soon)">
                <Filter className="w-4 h-4" />
              </button>
              <button className="btn btn-secondary px-4 py-2" title="More">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cards..."
                className="w-full pl-10 pr-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-300">
              <Users className="w-4 h-4" />
              <span>{currentUser?.username || 'You'}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-auto p-6">
          {mode === 'sprint' ? (
            <SprintView cards={filteredCards} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {columns.map((col) => (
                <div key={col.id} className="card overflow-hidden">
                  <div className={`px-4 py-3 border-b border-secondary-200 dark:border-secondary-700 ${col.tone}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-secondary-900 dark:text-white">{col.title}</div>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/70 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-200">
                        {countsByStatus[col.id] || 0}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {filteredCards
                      .filter((c) => c.status === col.id)
                      .map((c) => (
                        <CardItem
                          key={c.id}
                          card={c}
                          onMoveLeft={() => moveCard(c.id, -1)}
                          onMoveRight={() => moveCard(c.id, +1)}
                        />
                      ))}

                    {filteredCards.filter((c) => c.status === col.id).length === 0 && (
                      <div className="text-sm text-secondary-500 dark:text-secondary-400">No items</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 text-xs text-secondary-500 dark:text-secondary-400">
            UI-only: drag-and-drop + realtime sync will be added later. For now use arrows to move cards between columns.
          </div>
        </div>
      </div>
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
