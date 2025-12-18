import React, { useMemo, useState } from 'react';
import {
  Wand2,
  Plus,
  Search,
  Filter,
  Zap,
  Mail,
  MessageCircle,
  Ticket,
  CheckSquare,
  Tag,
  ArrowRight,
  Play,
  Pause,
  Settings,
  Trash2,
  Copy,
} from 'lucide-react';

const TRIGGERS = [
  { id: 'message_contains', label: 'Chat: message contains…', icon: MessageCircle },
  { id: 'mention', label: 'Chat: you are mentioned', icon: MessageCircle },
  { id: 'email_received', label: 'Email: received from…', icon: Mail },
  { id: 'ticket_created', label: 'Ticket: created', icon: Ticket },
  { id: 'task_assigned', label: 'Task: assigned to user', icon: CheckSquare },
];

const ACTIONS = [
  { id: 'create_task', label: 'Create task', icon: CheckSquare },
  { id: 'create_ticket', label: 'Create ticket', icon: Ticket },
  { id: 'send_email', label: 'Send email', icon: Mail },
  { id: 'post_message', label: 'Post chat message', icon: MessageCircle },
  { id: 'auto_tag', label: 'Apply tags', icon: Tag },
];

function Pill({ children }) {
  return (
    <span className="text-xs px-2 py-1 rounded-full bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200">
      {children}
    </span>
  );
}

export default function WorkflowAutomation({ currentUser }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(1);

  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      name: 'Support → Ticket',
      enabled: true,
      trigger: { id: 'message_contains', config: { channel: '#support', phrase: 'cannot' } },
      actions: [
        { id: 'create_ticket', config: { priority: 'high', assignTo: 'You' } },
        { id: 'post_message', config: { channel: '#support', text: 'Created a ticket. We will respond soon.' } },
      ],
      updatedAt: '1h ago',
    },
    {
      id: 2,
      name: 'Mentions → Task',
      enabled: false,
      trigger: { id: 'mention', config: { inAnyChannel: true } },
      actions: [{ id: 'create_task', config: { titlePrefix: '[Mention]' } }],
      updatedAt: '2d ago',
    },
    {
      id: 3,
      name: 'Email → Follow-up Task',
      enabled: true,
      trigger: { id: 'email_received', config: { from: '@client.com' } },
      actions: [
        { id: 'create_task', config: { titlePrefix: '[Client Email]' } },
        { id: 'auto_tag', config: { tags: ['client', 'email'] } },
      ],
      updatedAt: '4d ago',
    },
  ]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return workflows;
    return workflows.filter((w) => w.name.toLowerCase().includes(q));
  }, [workflows, query]);

  const selected = useMemo(
    () => filtered.find((w) => w.id === selectedId) || filtered[0] || null,
    [filtered, selectedId]
  );

  const meta = (list, id) => list.find((x) => x.id === id);

  const createWorkflow = () => {
    const name = prompt('Workflow name');
    if (!name) return;
    const id = Math.max(...workflows.map((w) => w.id)) + 1;
    const next = {
      id,
      name,
      enabled: false,
      trigger: { id: 'message_contains', config: { channel: '#general', phrase: 'todo' } },
      actions: [{ id: 'create_task', config: { titlePrefix: '[Auto]' } }],
      updatedAt: 'just now',
    };
    setWorkflows((prev) => [next, ...prev]);
    setSelectedId(id);
  };

  const toggleEnabled = (id) => {
    setWorkflows((prev) => prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled, updatedAt: 'just now' } : w)));
  };

  const removeWorkflow = (id) => {
    if (!confirm('Delete this workflow?')) return;
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
    if (selectedId === id) setSelectedId(workflows.filter((w) => w.id !== id)[0]?.id || 0);
  };

  const duplicateWorkflow = (id) => {
    const src = workflows.find((w) => w.id === id);
    if (!src) return;
    const nextId = Math.max(...workflows.map((w) => w.id)) + 1;
    const copy = { ...src, id: nextId, name: `${src.name} (Copy)`, enabled: false, updatedAt: 'just now' };
    setWorkflows((prev) => [copy, ...prev]);
    setSelectedId(nextId);
  };

  return (
    <div className="flex h-full bg-secondary-50 dark:bg-secondary-900">
      {/* Left: list */}
      <div className="w-80 shrink-0 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 flex flex-col">
        <div className="p-5 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white flex items-center justify-center">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-secondary-900 dark:text-white">Automations</div>
                <div className="text-xs text-secondary-500 dark:text-secondary-400">UI-first (engine later)</div>
              </div>
            </div>
            <button onClick={createWorkflow} className="btn btn-primary px-3 py-2" title="New automation">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search automations..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider inline-flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Status
            </div>
            <div className="text-xs text-secondary-500 dark:text-secondary-400">
              {filtered.filter((w) => w.enabled).length} enabled
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="divide-y divide-secondary-100 dark:divide-secondary-700">
            {filtered.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedId(w.id)}
                className={`w-full text-left p-4 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors ${
                  selected?.id === w.id ? 'bg-secondary-50 dark:bg-secondary-700' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${w.enabled ? 'from-success-500 to-success-600' : 'from-secondary-500 to-secondary-700'} text-white flex items-center justify-center shrink-0`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-secondary-900 dark:text-white truncate">{w.name}</div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400">{w.updatedAt}</div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Pill>{w.enabled ? 'Enabled' : 'Disabled'}</Pill>
                      <Pill>{meta(TRIGGERS, w.trigger.id)?.label || w.trigger.id}</Pill>
                      <Pill>{w.actions.length} actions</Pill>
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="p-6 text-sm text-secondary-500 dark:text-secondary-400">No automations found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Right: builder */}
      <div className="flex-1 min-w-0">
        {!selected ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center card max-w-md p-6">
              <Wand2 className="w-14 h-14 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
              <div className="text-xl font-bold text-secondary-900 dark:text-white">Select an automation</div>
              <div className="mt-2 text-secondary-600 dark:text-secondary-400">Pick an item on the left to edit.</div>
            </div>
          </div>
        ) : (
          <Builder
            currentUser={currentUser}
            workflow={selected}
            triggerMeta={meta(TRIGGERS, selected.trigger.id)}
            actionsMeta={selected.actions.map((a) => meta(ACTIONS, a.id))}
            onToggle={() => toggleEnabled(selected.id)}
            onDelete={() => removeWorkflow(selected.id)}
            onDuplicate={() => duplicateWorkflow(selected.id)}
          />
        )}
      </div>
    </div>
  );
}

function Builder({ workflow, triggerMeta, actionsMeta, onToggle, onDelete, onDuplicate }) {
  const TriggerIcon = triggerMeta?.icon || Zap;

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-2xl font-bold text-secondary-900 dark:text-white truncate">{workflow.name}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Pill>{workflow.enabled ? 'Enabled' : 'Disabled'}</Pill>
              <Pill>{workflow.actions.length} actions</Pill>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onToggle} className={`btn px-4 py-2 ${workflow.enabled ? 'btn-secondary' : 'btn-primary'}`}>
              {workflow.enabled ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span className="ml-2 hidden sm:inline">Disable</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span className="ml-2 hidden sm:inline">Enable</span>
                </>
              )}
            </button>
            <button onClick={onDuplicate} className="btn btn-secondary px-3 py-2" title="Duplicate">
              <Copy className="w-4 h-4" />
            </button>
            <button className="btn btn-secondary px-3 py-2" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={onDelete} className="btn btn-secondary px-3 py-2" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="card p-5 xl:col-span-1">
            <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-2">
              Trigger
            </div>
            <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-700 text-white flex items-center justify-center">
                  <TriggerIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-secondary-900 dark:text-white">{triggerMeta?.label || workflow.trigger.id}</div>
                  <div className="text-xs text-secondary-500 dark:text-secondary-400">Mock configuration</div>
                </div>
              </div>

              <div className="mt-3 text-sm text-secondary-700 dark:text-secondary-200">
                <pre className="whitespace-pre-wrap text-xs bg-secondary-50 dark:bg-secondary-700 p-3 rounded-lg border border-secondary-200 dark:border-secondary-600">
{JSON.stringify(workflow.trigger.config, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          <div className="card p-5 xl:col-span-2">
            <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-2">
              Actions
            </div>

            <div className="space-y-3">
              {workflow.actions.map((a, idx) => {
                const meta = ACTIONS.find((x) => x.id === a.id);
                const Icon = meta?.icon || Zap;
                return (
                  <div key={`${a.id}-${idx}`} className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-accent-500 to-primary-600 text-white flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-secondary-900 dark:text-white">{meta?.label || a.id}</div>
                          <div className="text-xs text-secondary-500 dark:text-secondary-400">Mock configuration</div>
                        </div>
                      </div>

                      <div className="text-xs text-secondary-500 dark:text-secondary-400">Step {idx + 1}</div>
                    </div>

                    <div className="mt-3">
                      <pre className="whitespace-pre-wrap text-xs bg-secondary-50 dark:bg-secondary-700 p-3 rounded-lg border border-secondary-200 dark:border-secondary-600">
{JSON.stringify(a.config, null, 2)}
                      </pre>
                    </div>

                    {idx < workflow.actions.length - 1 && (
                      <div className="mt-3 text-secondary-400 dark:text-secondary-500 flex items-center justify-center">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="text-xs text-secondary-500 dark:text-secondary-400">
                UI-only builder. Backend later will store workflows and execute them via an automation engine.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
