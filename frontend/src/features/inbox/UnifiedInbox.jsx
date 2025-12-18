import React, { useEffect, useMemo, useState } from 'react';
import {
  Inbox,
  MessageCircle,
  Mail,
  CheckSquare,
  Bell,
  Search,
  Filter,
  Star,
  Clock,
  ChevronRight,
  ExternalLink,
  Settings,
  RefreshCw,
  Tag,
  User,
  Hash,
} from 'lucide-react';

import { createTask } from '../../services/taskService';
import {
  listInboxItems,
  markAllInboxRead,
  setInboxItemPinned,
  setInboxItemRead,
} from '../../services/inboxService';

const SOURCE_META = {
  chat: { label: 'Chat', icon: MessageCircle, color: 'from-primary-500 to-primary-600' },
  email: { label: 'Email', icon: Mail, color: 'from-secondary-500 to-secondary-700' },
  task: { label: 'Tasks', icon: CheckSquare, color: 'from-success-500 to-success-600' },
  notification: { label: 'Alerts', icon: Bell, color: 'from-accent-500 to-accent-600' },
};

function Pill({ children, tone = 'neutral' }) {
  const cls =
    tone === 'primary'
      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
      : tone === 'danger'
        ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
        : tone === 'success'
          ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
          : 'bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-200';

  return <span className={`text-xs px-2 py-1 rounded-full ${cls}`}>{children}</span>;
}

export default function UnifiedInbox({ currentUser, onOpenTab }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const counts = useMemo(() => {
    const base = { all: items.length, chat: 0, email: 0, task: 0, notification: 0 };
    for (const i of items) base[i.source]++;
    return base;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => (activeFilter === 'all' ? true : i.source === activeFilter))
      .filter((i) => (onlyUnread ? i.unread : true))
      .filter((i) => (!q ? true : (i.title + ' ' + i.preview).toLowerCase().includes(q)))
      .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));
  }, [items, activeFilter, onlyUnread, query]);

  const selected = useMemo(
    () => filtered.find((i) => i.id === selectedId) || filtered[0] || null,
    [filtered, selectedId]
  );

  useEffect(() => {
    if (!filtered.length) {
      if (selectedId !== null) setSelectedId(null);
      return;
    }
    const stillVisible = selectedId && filtered.some((i) => i.id === selectedId);
    if (!stillVisible) setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  const parseInboxId = (id) => {
    const parts = String(id || '').split(':');
    if (parts.length !== 2) return null;
    const source = parts[0];
    const sourceId = Number(parts[1]);
    if (!source || Number.isNaN(sourceId)) return null;
    return { source, sourceId };
  };

  const loadInbox = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await listInboxItems({
        source: activeFilter,
        q: query,
        unread: onlyUnread,
        skip: 0,
        limit: 200,
      });
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e) {
      console.error('Failed to load inbox', e);
      setError('Failed to load inbox.');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, onlyUnread]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadInbox();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const markRead = (id, unread) => {
    const parsed = parseInboxId(id);
    if (!parsed) return;

    const nextUnread = Boolean(unread);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, unread: nextUnread } : i)));
    setInboxItemRead(parsed.source, parsed.sourceId, !nextUnread)
      .then(() => loadInbox())
      .catch((e) => {
        console.error('Failed to update read state', e);
        loadInbox().catch(() => {});
      });
  };

  const togglePin = (id) => {
    const parsed = parseInboxId(id);
    if (!parsed) return;

    const current = items.find((i) => i.id === id);
    const nextPinned = !Boolean(current?.pinned);

    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, pinned: nextPinned } : i)));
    setInboxItemPinned(parsed.source, parsed.sourceId, nextPinned)
      .then(() => loadInbox())
      .catch((e) => {
        console.error('Failed to update pin', e);
        loadInbox().catch(() => {});
      });
  };

  const markAllRead = () => {
    markAllInboxRead({ source: activeFilter === 'all' ? 'all' : activeFilter })
      .then(() => loadInbox())
      .catch((e) => {
        console.error('Failed to mark all read', e);
        setError('Failed to mark all as read.');
      });
  };

  const clearFilters = () => {
    setActiveFilter('all');
    setOnlyUnread(false);
    setQuery('');
  };

  const refresh = () => {
    loadInbox();
  };

  const openItem = (item) => {
    if (!item) return;
    if (typeof onOpenTab !== 'function') return;
    if (item.source === 'email') onOpenTab('email');
    if (item.source === 'task') onOpenTab('tasks');
    if (item.source === 'chat') onOpenTab('chats');
    if (item.source === 'notification') onOpenTab('workspace');
  };

  const Filters = [
    { id: 'all', label: 'All', icon: Inbox },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'task', label: 'Tasks', icon: CheckSquare },
    { id: 'notification', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="flex h-full bg-secondary-50 dark:bg-secondary-900 overflow-hidden">
      {/* Left: Filters */}
      <div className="w-72 shrink-0 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 flex flex-col">
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-primary text-white flex items-center justify-center shadow-soft ring-1 ring-black/5 dark:ring-white/10">
                <div className="absolute inset-0 rounded-xl bg-white/10" />
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-secondary-900 dark:text-white tracking-tight">Unified Inbox</div>
                <div className="text-xs text-secondary-500 dark:text-secondary-400">
                  {currentUser?.username ? `Welcome, ${currentUser.username}` : 'All activity in one place'}
                </div>
              </div>
            </div>
            <button
              className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-600 dark:text-secondary-200"
              title="Settings"
              onClick={() => {
                if (typeof onOpenTab === 'function') onOpenTab('settings');
              }}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search inbox..."
              className="w-full pl-9 pr-3 py-2 rounded-2xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50/80 dark:bg-secondary-700/60 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => setOnlyUnread((v) => !v)}
              className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                onlyUnread
                  ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-300'
                  : 'bg-white border-secondary-200 text-secondary-600 dark:bg-secondary-800 dark:border-secondary-700 dark:text-secondary-300'
              }`}
            >
              Unread only
            </button>

            <button
              onClick={refresh}
              className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-600 dark:text-secondary-200"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="px-4 py-2 text-xs text-red-600 dark:text-red-300 border-b border-secondary-200 dark:border-secondary-700">
            {error}
          </div>
        )}

        <div className="p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="card p-3">
              <div className="text-xs text-secondary-500 dark:text-secondary-400">Unread</div>
              <div className="text-xl font-bold text-secondary-900 dark:text-white">
                {items.filter((i) => i.unread).length}
              </div>
            </div>
            <div className="card p-3">
              <div className="text-xs text-secondary-500 dark:text-secondary-400">Pinned</div>
              <div className="text-xl font-bold text-secondary-900 dark:text-white">
                {items.filter((i) => i.pinned).length}
              </div>
            </div>
          </div>
        </div>

        <div className="px-3 pb-3">
          <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-2">
            Filters
          </div>
          <div className="space-y-1">
            {Filters.map((f) => {
              const Icon = f.icon;
              const isActive = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                      : 'text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{f.label}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${isActive ? 'bg-white/70 dark:bg-secondary-800' : 'bg-secondary-100 dark:bg-secondary-700'}`}>
                    {counts[f.id] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Middle: Feed */}
      <div className="w-[520px] shrink-0 border-r border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 flex flex-col">
        <div className="px-5 py-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-secondary-900 dark:text-white tracking-tight">Feed</div>
            <div className="text-xs text-secondary-500 dark:text-secondary-400">Chat, email, tasks, and alerts</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="text-xs px-3 py-2 rounded-2xl border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-200"
              title="Mark all as read"
            >
              Mark all read
            </button>
            <button
              onClick={clearFilters}
              className="p-2 rounded-2xl hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-600 dark:text-secondary-200"
              title="Clear filters"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-secondary-500 dark:text-secondary-400">
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-full flex items-center justify-center text-secondary-500 dark:text-secondary-400">
              <div className="text-center">
                <Inbox className="w-10 h-10 mx-auto mb-3 text-secondary-300 dark:text-secondary-600" />
                <div className="font-medium">No items match your filters</div>
                <div className="text-xs">Try clearing search or switching source</div>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <button
                    className="inline-flex items-center rounded-2xl px-3 py-2 text-sm font-medium bg-secondary-50/80 dark:bg-secondary-700/60 border border-secondary-200 dark:border-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    onClick={() => setQuery('')}
                  >
                    Clear search
                  </button>
                  <button
                    className="inline-flex items-center rounded-2xl px-3 py-2 text-sm font-medium bg-secondary-50/80 dark:bg-secondary-700/60 border border-secondary-200 dark:border-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    onClick={() => setOnlyUnread(false)}
                  >
                    Show all
                  </button>
                  <button
                    className="inline-flex items-center rounded-2xl px-3 py-2 text-sm font-medium bg-secondary-50/80 dark:bg-secondary-700/60 border border-secondary-200 dark:border-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    onClick={() => setActiveFilter('all')}
                  >
                    All sources
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-secondary-100 dark:divide-secondary-700">
              {filtered.map((it) => {
                const meta = SOURCE_META[it.source];
                const Icon = meta.icon;
                const isSelected = selected?.id === it.id;
                return (
                  <button
                    key={it.id}
                    onClick={() => setSelectedId(it.id)}
                    className={`w-full text-left px-4 py-3 transition-colors hover:bg-secondary-50 dark:hover:bg-secondary-700/60 ${
                      isSelected ? 'bg-secondary-50 dark:bg-secondary-700/60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${meta.color} text-white flex items-center justify-center shrink-0 ring-1 ring-black/5 dark:ring-white/10`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className={`text-sm ${it.unread ? 'font-semibold text-secondary-900 dark:text-white' : 'font-medium text-secondary-800 dark:text-secondary-100'} truncate`}>
                                {it.title}
                              </div>
                              {it.unread && <Pill tone="primary">Unread</Pill>}
                              {it.pinned && <Pill>Pin</Pill>}
                            </div>
                          </div>
                          <div className="text-xs text-secondary-500 dark:text-secondary-400 shrink-0 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {it.meta?.at}
                          </div>
                        </div>

                        <div className="mt-1 text-sm text-secondary-600 dark:text-secondary-300 line-clamp-2">
                          {it.preview}
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <Pill>{meta.label}</Pill>

                          {it.source === 'chat' && it.meta?.channel && (
                            <Pill>
                              <span className="inline-flex items-center gap-1">
                                <Hash className="w-3.5 h-3.5" />
                                {it.meta.channel}
                              </span>
                            </Pill>
                          )}

                          {it.meta?.by && (
                            <Pill>
                              <span className="inline-flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {it.meta.by}
                              </span>
                            </Pill>
                          )}

                          {(it.tags || []).slice(0, 2).map((t) => (
                            <Pill key={t}>
                              <span className="inline-flex items-center gap-1">
                                <Tag className="w-3.5 h-3.5" />
                                {t}
                              </span>
                            </Pill>
                          ))}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePin(it.id);
                          }}
                          className="p-1.5 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-600 text-secondary-500 dark:text-secondary-200"
                          title="Pin"
                        >
                          <Star className={`w-4 h-4 ${it.pinned ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                        </button>
                        <ChevronRight className="w-4 h-4 text-secondary-300 dark:text-secondary-600" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Detail */}
      <div className="flex-1 bg-secondary-50 dark:bg-secondary-900">
        {!selected ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center card max-w-md">
              <Inbox className="w-14 h-14 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
              <div className="text-xl font-bold text-secondary-900 dark:text-white mb-2">Select an item</div>
              <div className="text-secondary-600 dark:text-secondary-400">
                Choose an email, message, task, or notification to see details.
              </div>
            </div>
          </div>
        ) : (
          <DetailPanel item={selected} onMarkRead={markRead} onOpen={openItem} onConvertToTask={async (it) => {
            try {
              const title = it?.title ? String(it.title).slice(0, 140) : 'From Inbox';
              const description = it?.preview ? String(it.preview) : '';
              await createTask({ title, description, status: 'TODO' });
              if (typeof onOpenTab === 'function') onOpenTab('tasks');
            } catch (e) {
              console.error('Failed to convert to task', e);
              setError('Failed to convert to task.');
            }
          }} />
        )}
      </div>
    </div>
  );
}

function DetailPanel({ item, onMarkRead, onOpen, onConvertToTask }) {
  const meta = SOURCE_META[item.source];
  const Icon = meta.icon;

  const primaryAction = () => {
    if (item.source === 'email') return 'Reply';
    if (item.source === 'chat') return 'Go to channel';
    if (item.source === 'task') return 'Open task';
    return 'View';
  };

  const secondaryAction = () => {
    if (item.source === 'email') return 'Convert to ticket';
    if (item.source === 'chat') return 'Create task';
    if (item.source === 'task') return 'Assign';
    return 'Snooze';
  };

  const runAction = (label) => {
    if (label === 'Convert to task' && typeof onConvertToTask === 'function') {
      onConvertToTask(item);
      return;
    }
    if (typeof onOpen === 'function') {
      onOpen(item);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white/85 dark:bg-secondary-800/85 backdrop-blur border-b border-secondary-200 dark:border-secondary-700 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${meta.color} text-white flex items-center justify-center shrink-0 ring-1 ring-black/5 dark:ring-white/10`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold text-secondary-900 dark:text-white truncate tracking-tight">{item.title}</div>
              <div className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                {meta.label} • {item.meta?.at || '—'}
              </div>
              <div className="mt-2 flex items-center gap-2">
                {item.unread ? <Pill tone="primary">Unread</Pill> : <Pill>Read</Pill>}
                {item.pinned && <Pill>Pin</Pill>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onMarkRead(item.id, !item.unread)}
              className={`btn px-4 py-2 ${item.unread ? 'btn-primary' : 'btn-secondary'}`}
            >
              {item.unread ? 'Mark read' : 'Mark unread'}
            </button>
            <button
              className="btn btn-secondary px-3 py-2"
              title="Open"
              onClick={() => {
                if (typeof onOpen === 'function') onOpen(item);
              }}
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="card p-5">
          <div className="text-sm text-secondary-700 dark:text-secondary-200 whitespace-pre-wrap">{item.preview}</div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="p-4 rounded-lg bg-secondary-50 dark:bg-secondary-700">
              <div className="text-xs text-secondary-500 dark:text-secondary-400">Source</div>
              <div className="mt-1 font-semibold text-secondary-900 dark:text-white">{meta.label}</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary-50 dark:bg-secondary-700">
              <div className="text-xs text-secondary-500 dark:text-secondary-400">Actor</div>
              <div className="mt-1 font-semibold text-secondary-900 dark:text-white">{item.meta?.by || '—'}</div>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Actions</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button className="btn btn-secondary px-4 py-2" onClick={() => runAction(primaryAction())}>{primaryAction()}</button>
              <button className="btn btn-secondary px-4 py-2" onClick={() => runAction(secondaryAction())}>{secondaryAction()}</button>
              <button className="btn btn-secondary px-4 py-2" onClick={() => runAction('Convert to task')}>Convert to task</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
