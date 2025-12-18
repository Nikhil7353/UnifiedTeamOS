import React, { useMemo, useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Lock,
  Hash,
  Users,
  Mail,
  Settings,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

function Pill({ children }) {
  return (
    <span className="text-xs px-2 py-1 rounded-full bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200">
      {children}
    </span>
  );
}

export default function ClientMode({ currentUser }) {
  const [query, setQuery] = useState('');
  const [activeSpaceId, setActiveSpaceId] = useState(1);
  const [activeChannelId, setActiveChannelId] = useState('c1');

  // UI-only mocked client spaces and isolated channels
  const [spaces, setSpaces] = useState([
    {
      id: 1,
      name: 'ACME (Client Space)',
      isLocked: true,
      members: [
        { id: 1, name: 'You', type: 'internal' },
        { id: 2, name: 'Nikhil', type: 'internal' },
        { id: 3, name: 'Sarah (ACME)', type: 'external' },
      ],
      channels: [
        { id: 'c1', name: 'general', isPrivate: false, description: 'Client updates and announcements' },
        { id: 'c2', name: 'deliverables', isPrivate: true, description: 'Files, timelines, and approvals' },
        { id: 'c3', name: 'support', isPrivate: false, description: 'Issues and tickets' },
      ],
    },
    {
      id: 2,
      name: 'Globex (Client Space)',
      isLocked: true,
      members: [
        { id: 1, name: 'You', type: 'internal' },
        { id: 4, name: 'Asha', type: 'internal' },
        { id: 5, name: 'Ops (Globex)', type: 'external' },
      ],
      channels: [
        { id: 'g1', name: 'general', isPrivate: false, description: 'Status + comms' },
        { id: 'g2', name: 'billing', isPrivate: true, description: 'Invoices and contracts' },
      ],
    },
  ]);

  const filteredSpaces = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return spaces;
    return spaces.filter((s) => s.name.toLowerCase().includes(q));
  }, [spaces, query]);

  const activeSpace = useMemo(
    () => spaces.find((s) => s.id === activeSpaceId) || spaces[0],
    [spaces, activeSpaceId]
  );

  const activeChannel = useMemo(
    () => activeSpace?.channels?.find((c) => c.id === activeChannelId) || activeSpace?.channels?.[0] || null,
    [activeSpace, activeChannelId]
  );

  const createSpace = () => {
    const name = prompt('Client name');
    if (!name) return;
    const id = Math.max(...spaces.map((s) => s.id)) + 1;
    const next = {
      id,
      name: `${name} (Client Space)`,
      isLocked: true,
      members: [{ id: Date.now(), name: currentUser?.username || 'You', type: 'internal' }],
      channels: [{ id: `n-${id}-1`, name: 'general', isPrivate: false, description: 'Client updates' }],
    };
    setSpaces((prev) => [next, ...prev]);
    setActiveSpaceId(id);
    setActiveChannelId(next.channels[0].id);
  };

  const inviteExternal = () => {
    const email = prompt('Invite external email');
    if (!email) return;
    const display = `${email.split('@')[0]} (External)`;
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === activeSpaceId
          ? { ...s, members: [...s.members, { id: Date.now(), name: display, type: 'external' }] }
          : s
      )
    );
  };

  const createChannel = () => {
    const name = prompt('Channel name');
    if (!name) return;
    const isPrivate = confirm('Private channel?');
    const id = `${activeSpaceId}-${Date.now()}`;
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === activeSpaceId
          ? {
              ...s,
              channels: [
                ...s.channels,
                { id, name, isPrivate, description: isPrivate ? 'Private client thread' : 'Client thread' },
              ],
            }
          : s
      )
    );
    setActiveChannelId(id);
  };

  return (
    <div className="flex h-full bg-secondary-50 dark:bg-secondary-900">
      {/* Left: spaces */}
      <div className="w-80 shrink-0 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 flex flex-col">
        <div className="p-5 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-secondary-900 dark:text-white">Client Mode</div>
                <div className="text-xs text-secondary-500 dark:text-secondary-400">Isolated client spaces (UI-first)</div>
              </div>
            </div>
            <button onClick={createSpace} className="btn btn-primary px-3 py-2" title="New client space">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search client spaces..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-2">
          {filteredSpaces.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveSpaceId(s.id);
                setActiveChannelId(s.channels?.[0]?.id);
              }}
              className={`w-full text-left p-4 rounded-xl border transition-colors ${
                s.id === activeSpaceId
                  ? 'border-primary-300 bg-primary-50/60 dark:border-primary-700 dark:bg-primary-900/10'
                  : 'border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-secondary-900 dark:text-white truncate">{s.name}</div>
                    {s.isLocked && <Lock className="w-4 h-4 text-secondary-400" title="Isolated" />}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-secondary-500 dark:text-secondary-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{s.members.length} members</span>
                    <span className="text-secondary-300 dark:text-secondary-600">•</span>
                    <span>{s.channels.length} channels</span>
                  </div>
                </div>
                <Pill>Client</Pill>
              </div>
            </button>
          ))}

          {filteredSpaces.length === 0 && (
            <div className="text-sm text-secondary-500 dark:text-secondary-400 text-center py-10">No spaces found</div>
          )}
        </div>
      </div>

      {/* Middle: channels */}
      <div className="w-[420px] shrink-0 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 flex flex-col">
        <div className="px-5 py-4 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-secondary-900 dark:text-white truncate">{activeSpace?.name}</div>
              <div className="text-xs text-secondary-500 dark:text-secondary-400">
                Only invited users can access this space (UI-first)
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={inviteExternal} className="btn btn-secondary px-3 py-2" title="Invite external">
                <Mail className="w-4 h-4" />
              </button>
              <button onClick={createChannel} className="btn btn-primary px-3 py-2" title="New channel">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Isolation enabled
              </span>
            </Pill>
            <Pill>
              <span className="inline-flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {activeSpace?.members?.filter((m) => m.type === 'external').length || 0} external
              </span>
            </Pill>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-2">
          {(activeSpace?.channels || []).map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveChannelId(c.id)}
              className={`w-full text-left p-4 rounded-xl border transition-colors ${
                c.id === activeChannelId
                  ? 'border-primary-300 bg-primary-50/60 dark:border-primary-700 dark:bg-primary-900/10'
                  : 'border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-secondary-500 dark:text-secondary-300" />
                    <div className="font-semibold text-secondary-900 dark:text-white truncate">{c.name}</div>
                    {c.isPrivate && <Lock className="w-4 h-4 text-secondary-400" title="Private" />}
                  </div>
                  <div className="mt-1 text-xs text-secondary-500 dark:text-secondary-400 truncate">{c.description}</div>
                </div>
                <Pill>{c.isPrivate ? 'Private' : 'Public'}</Pill>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: detail */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-2xl font-bold text-secondary-900 dark:text-white truncate">
                #{activeChannel?.name}
              </div>
              <div className="text-sm text-secondary-500 dark:text-secondary-400">{activeChannel?.description}</div>
            </div>
            <button className="btn btn-secondary px-3 py-2" title="Open">
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="card p-5">
            <div className="text-sm text-secondary-700 dark:text-secondary-200">
              This is a UI-only preview of **Client Communication Mode**.
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700/40">
                <div className="text-xs text-secondary-500 dark:text-secondary-400">Isolation</div>
                <div className="mt-1 font-semibold text-secondary-900 dark:text-white">Enabled</div>
              </div>
              <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700/40">
                <div className="text-xs text-secondary-500 dark:text-secondary-400">Access</div>
                <div className="mt-1 font-semibold text-secondary-900 dark:text-white">Invite-only</div>
              </div>
            </div>
            <div className="mt-5 text-xs text-secondary-500 dark:text-secondary-400">
              Backend later will enforce tenant isolation, external guest auth, and audit trails.
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800">
          <div className="text-xs text-secondary-500 dark:text-secondary-400">
            Tip: Use this area to embed tickets, deliverables, and approvals for client work.
          </div>
        </div>
      </div>
    </div>
  );
}
