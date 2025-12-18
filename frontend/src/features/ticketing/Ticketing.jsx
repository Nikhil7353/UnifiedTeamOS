import React, { useMemo, useState } from 'react';
import {
  Ticket,
  Inbox,
  Search,
  Filter,
  Plus,
  Tag,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Mail,
  Paperclip,
} from 'lucide-react';

const STATUS_META = {
  open: { label: 'Open', cls: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' },
  triage: { label: 'Triage', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' },
  in_progress: { label: 'In Progress', cls: 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' },
  resolved: { label: 'Resolved', cls: 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300' },
};

function Pill({ children, cls }) {
  return <span className={`text-xs px-2 py-1 rounded-full ${cls}`}>{children}</span>;
}

export default function Ticketing({ currentUser }) {
  const [view, setView] = useState('tickets'); // tickets | sources
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(1);

  const [tickets, setTickets] = useState([
    {
      id: 1,
      title: 'Login issue: token expired loop',
      description: 'User reports being logged out repeatedly when switching tabs.',
      status: 'triage',
      priority: 'high',
      source: 'chat',
      reporter: 'Sarah',
      assignee: 'You',
      tags: ['auth', 'bug'],
      createdAt: '2h ago',
      updatedAt: '35m ago',
      messages: [
        { id: 1, by: 'Sarah', at: '2h ago', text: 'I keep getting logged out when I click around.' },
        { id: 2, by: 'You', at: '1h ago', text: 'Got it — we will review token handling.' },
      ],
    },
    {
      id: 2,
      title: 'Client request: add client-only channel',
      description: 'Need isolated client communication mode for ACME project.',
      status: 'open',
      priority: 'medium',
      source: 'email',
      reporter: 'ACME (Sarah)',
      assignee: '—',
      tags: ['client', 'channels'],
      createdAt: '1d ago',
      updatedAt: '1d ago',
      messages: [{ id: 1, by: 'ACME (Sarah)', at: '1d ago', text: 'Can we have a client-only space?'}],
    },
    {
      id: 3,
      title: 'UI polish: Inbox badges alignment',
      description: 'Badges overlap on small screens in the sidebar.',
      status: 'in_progress',
      priority: 'low',
      source: 'chat',
      reporter: 'Rahul',
      assignee: 'Asha',
      tags: ['ui'],
      createdAt: '3d ago',
      updatedAt: 'today',
      messages: [],
    },
    {
      id: 4,
      title: 'Docs: add realtime presence',
      description: 'Show cursors and online users while editing documents.',
      status: 'resolved',
      priority: 'medium',
      source: 'task',
      reporter: 'System',
      assignee: 'Nikhil',
      tags: ['docs', 'realtime'],
      createdAt: '1w ago',
      updatedAt: '2d ago',
      messages: [],
    },
  ]);

  const sources = [
    {
      id: 's1',
      type: 'chat',
      title: 'Message in #support',
      preview: '@team user cannot login after password reset',
      by: 'Support Bot',
      at: '20m ago',
      tags: ['support'],
      attachments: false,
    },
    {
      id: 's2',
      type: 'email',
      title: 'Email: Refund request',
      preview: 'We were double charged for 3 seats. Please assist.',
      by: 'billing@client.com',
      at: '3h ago',
      tags: ['billing'],
      attachments: true,
    },
  ];

  const filteredTickets = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets
      .filter((t) => (statusFilter === 'all' ? true : t.status === statusFilter))
      .filter((t) => (!q ? true : (t.title + ' ' + t.description).toLowerCase().includes(q)))
      .sort((a, b) => (a.status === 'open' && b.status !== 'open' ? -1 : 0));
  }, [tickets, query, statusFilter]);

  const selected = useMemo(
    () => filteredTickets.find((t) => t.id === selectedId) || filteredTickets[0] || null,
    [filteredTickets, selectedId]
  );

  const updateTicket = (id, patch) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: 'just now' } : t)));
  };

  const createTicket = () => {
    const title = prompt('Ticket title');
    if (!title) return;
    const id = Math.max(...tickets.map((t) => t.id)) + 1;
    const next = {
      id,
      title,
      description: 'New ticket',
      status: 'open',
      priority: 'low',
      source: 'chat',
      reporter: currentUser?.username || 'You',
      assignee: '—',
      tags: [],
      createdAt: 'just now',
      updatedAt: 'just now',
      messages: [],
    };
    setTickets((prev) => [next, ...prev]);
    setSelectedId(id);
  };

  const convertSourceToTicket = (source) => {
    const id = Math.max(...tickets.map((t) => t.id)) + 1;
    const next = {
      id,
      title: source.title,
      description: source.preview,
      status: 'triage',
      priority: 'medium',
      source: source.type,
      reporter: source.by,
      assignee: currentUser?.username || 'You',
      tags: source.tags || [],
      createdAt: source.at,
      updatedAt: 'just now',
      messages: [{ id: 1, by: source.by, at: source.at, text: source.preview }],
    };
    setTickets((prev) => [next, ...prev]);
    setView('tickets');
    setSelectedId(id);
  };

  return (
    <div className="flex h-full bg-secondary-50 dark:bg-secondary-900">
      {/* Left nav */}
      <div className="w-80 shrink-0 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 flex flex-col">
        <div className="p-5 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-accent-500 to-primary-600 text-white flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-secondary-900 dark:text-white">Ticketing</div>
                <div className="text-xs text-secondary-500 dark:text-secondary-400">UI-first (backend later)</div>
              </div>
            </div>
            <button onClick={createTicket} className="btn btn-primary px-3 py-2" title="New ticket">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tickets..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
            />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setView('tickets')}
              className={`btn px-4 py-2 ${view === 'tickets' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Tickets
            </button>
            <button
              onClick={() => setView('sources')}
              className={`btn px-4 py-2 ${view === 'sources' ? 'btn-primary' : 'btn-secondary'}`}
              title="Convert emails/messages to tickets"
            >
              Sources
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider inline-flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Status
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="triage">Triage</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {view === 'sources' ? (
            <div className="p-4 space-y-3">
              {sources.map((s) => (
                <div key={s.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {s.type === 'chat' ? <MessageCircle className="w-4 h-4 text-secondary-500" /> : <Mail className="w-4 h-4 text-secondary-500" />}
                        <div className="font-semibold text-secondary-900 dark:text-white truncate">{s.title}</div>
                      </div>
                      <div className="mt-1 text-sm text-secondary-600 dark:text-secondary-300">{s.preview}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Pill cls="bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-200">
                          <span className="inline-flex items-center gap-1"><User className="w-3.5 h-3.5" />{s.by}</span>
                        </Pill>
                        <Pill cls="bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-200">
                          <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{s.at}</span>
                        </Pill>
                        {s.attachments && (
                          <Pill cls="bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-200">
                            <span className="inline-flex items-center gap-1"><Paperclip className="w-3.5 h-3.5" />Attachment</span>
                          </Pill>
                        )}
                        {(s.tags || []).slice(0, 2).map((t) => (
                          <Pill key={t} cls="bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-200">
                            <span className="inline-flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{t}</span>
                          </Pill>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => convertSourceToTicket(s)}
                      className="btn btn-primary px-3 py-2"
                      title="Convert to ticket"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="text-xs text-secondary-500 dark:text-secondary-400">
                UI-only: sources will come from unified inbox (email/chat) later.
              </div>
            </div>
          ) : (
            <div className="divide-y divide-secondary-100 dark:divide-secondary-700">
              {filteredTickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full text-left p-4 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors ${
                    selected?.id === t.id ? 'bg-secondary-50 dark:bg-secondary-700' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-700 text-white flex items-center justify-center shrink-0">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-secondary-900 dark:text-white truncate">{t.title}</div>
                        <span className="text-xs text-secondary-500 dark:text-secondary-400">{t.updatedAt}</span>
                      </div>
                      <div className="mt-1 text-sm text-secondary-600 dark:text-secondary-300 line-clamp-2">{t.description}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Pill cls={STATUS_META[t.status].cls}>{STATUS_META[t.status].label}</Pill>
                        <Pill cls="bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-200">
                          <span className="inline-flex items-center gap-1"><User className="w-3.5 h-3.5" />{t.assignee}</span>
                        </Pill>
                        {(t.tags || []).slice(0, 2).map((tag) => (
                          <Pill key={tag} cls="bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-200">
                            <span className="inline-flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{tag}</span>
                          </Pill>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {filteredTickets.length === 0 && (
                <div className="p-6 text-sm text-secondary-500 dark:text-secondary-400">No tickets match filters.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: detail */}
      <div className="flex-1 min-w-0">
        {!selected ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center card max-w-md p-6">
              <Inbox className="w-14 h-14 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
              <div className="text-xl font-bold text-secondary-900 dark:text-white">Select a ticket</div>
              <div className="mt-2 text-secondary-600 dark:text-secondary-400">Choose an item on the left to view details.</div>
            </div>
          </div>
        ) : (
          <TicketDetail ticket={selected} onUpdate={updateTicket} />
        )}
      </div>
    </div>
  );
}

function TicketDetail({ ticket, onUpdate }) {
  const status = STATUS_META[ticket.status];

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-2xl font-bold text-secondary-900 dark:text-white truncate">{ticket.title}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Pill cls={status.cls}>{status.label}</Pill>
              <Pill cls="bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-200">
                <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{ticket.createdAt}</span>
              </Pill>
              <Pill cls="bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-200">
                <span className="inline-flex items-center gap-1"><User className="w-3.5 h-3.5" />{ticket.assignee}</span>
              </Pill>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={ticket.status}
              onChange={(e) => onUpdate(ticket.id, { status: e.target.value })}
              className="text-sm px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
              title="Change status"
            >
              <option value="open">Open</option>
              <option value="triage">Triage</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="card p-5">
          <div className="text-sm text-secondary-700 dark:text-secondary-200 whitespace-pre-wrap">{ticket.description}</div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <MetaCard icon={AlertCircle} label="Priority" value={ticket.priority} />
            <MetaCard icon={User} label="Reporter" value={ticket.reporter} />
            <MetaCard icon={Clock} label="Updated" value={ticket.updatedAt} />
          </div>

          <div className="mt-6">
            <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Timeline</div>
            <div className="mt-3 space-y-3">
              {(ticket.messages || []).length === 0 ? (
                <div className="text-sm text-secondary-500 dark:text-secondary-400">No messages yet.</div>
              ) : (
                ticket.messages.map((m) => (
                  <div key={m.id} className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-secondary-900 dark:text-white">{m.by}</div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-300">{m.at}</div>
                    </div>
                    <div className="mt-2 text-sm text-secondary-700 dark:text-secondary-200">{m.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 text-xs text-secondary-500 dark:text-secondary-400">
            UI-only: backend later will support assignments, SLA, comments, attachments, and event linking from inbox.
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaCard({ icon: Icon, label, value }) {
  return (
    <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700">
      <div className="text-xs text-secondary-500 dark:text-secondary-400 inline-flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <div className="mt-1 font-semibold text-secondary-900 dark:text-white">{value}</div>
    </div>
  );
}
