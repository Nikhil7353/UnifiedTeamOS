import React, { useMemo, useState } from 'react';
import {
  ScrollText,
  Download,
  Filter,
  Calendar,
  User,
  Tag,
  Plus,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
} from 'lucide-react';

function Pill({ children, tone = 'neutral' }) {
  const cls =
    tone === 'success'
      ? 'bg-success-50 text-success-700 dark:bg-success-900/15 dark:text-success-300'
      : tone === 'warn'
        ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/15 dark:text-amber-300'
        : tone === 'danger'
          ? 'bg-danger-50 text-danger-700 dark:bg-danger-900/15 dark:text-danger-300'
          : 'bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-200';
  return <span className={`text-xs px-2 py-1 rounded-full ${cls}`}>{children}</span>;
}

function Stat({ label, value }) {
  return (
    <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700/40">
      <div className="text-xs text-secondary-500 dark:text-secondary-400">{label}</div>
      <div className="mt-1 text-lg font-bold text-secondary-900 dark:text-white">{value}</div>
    </div>
  );
}

export default function AuditExport() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fromDate, setFromDate] = useState('2025-12-01');
  const [toDate, setToDate] = useState('2025-12-12');
  const [actor, setActor] = useState('');
  const [eventType, setEventType] = useState('all');
  const [format, setFormat] = useState('csv');

  const [jobs, setJobs] = useState([
    {
      id: 'job-104',
      createdAt: '10m ago',
      range: '2025-12-01 → 2025-12-12',
      actor: 'any',
      type: 'security',
      format: 'csv',
      status: 'ready',
      size: '1.2 MB',
    },
    {
      id: 'job-103',
      createdAt: '2h ago',
      range: '2025-11-01 → 2025-11-30',
      actor: 'asha',
      type: 'admin',
      format: 'json',
      status: 'processing',
      size: '—',
    },
    {
      id: 'job-101',
      createdAt: '5d ago',
      range: '2025-10-01 → 2025-10-31',
      actor: 'any',
      type: 'integrations',
      format: 'csv',
      status: 'expired',
      size: '3.8 MB',
    },
  ]);

  const visibleJobs = useMemo(() => {
    // UI-only filter: simplistic match
    return jobs.filter((j) => {
      if (eventType !== 'all' && j.type !== eventType) return false;
      if (actor && j.actor !== 'any' && !j.actor.toLowerCase().includes(actor.toLowerCase())) return false;
      return true;
    });
  }, [jobs, actor, eventType]);

  const createJob = () => {
    const id = `job-${Math.floor(100 + Math.random() * 900)}`;
    const next = {
      id,
      createdAt: 'just now',
      range: `${fromDate} → ${toDate}`,
      actor: actor ? actor.toLowerCase() : 'any',
      type: eventType === 'all' ? 'mixed' : eventType,
      format,
      status: 'processing',
      size: '—',
    };
    setJobs((prev) => [next, ...prev]);
    setTimeout(() => {
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: 'ready', size: '0.9 MB' } : j)));
    }, 900);
  };

  const cancelJob = (id) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: 'canceled' } : j)));
  };

  const deleteJob = (id) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const download = (id) => {
    alert(`Download ${id} (UI-only)`);
  };

  const clearFilters = () => {
    setActor('');
    setEventType('all');
    setFromDate('2025-12-01');
    setToDate('2025-12-12');
    setFormat('csv');
  };

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-secondary-700 to-primary-600 text-white flex items-center justify-center">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-secondary-900 dark:text-white">Audit export</div>
              <div className="text-sm text-secondary-600 dark:text-secondary-300">Generate export files for compliance and investigations (UI-first).</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="btn btn-secondary px-3 py-2" onClick={() => setFiltersOpen((v) => !v)}>
              <Filter className="w-4 h-4" />
              <span className="ml-2">Filters</span>
            </button>
            <button className="btn btn-primary px-4 py-2" onClick={createJob}>
              <Plus className="w-4 h-4" />
              <span className="ml-2">Create export</span>
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Stat label="Ready" value={jobs.filter((j) => j.status === 'ready').length} />
          <Stat label="Processing" value={jobs.filter((j) => j.status === 'processing').length} />
          <Stat label="Total" value={jobs.length} />
        </div>
      </div>

      {filtersOpen && (
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-secondary-900 dark:text-white">Filters</div>
              <div className="text-sm text-secondary-600 dark:text-secondary-300">UI-only filters applied to the list below.</div>
            </div>
            <button className="btn-ghost p-2" onClick={() => setFiltersOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">From</div>
              <div className="mt-2 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">To</div>
              <div className="mt-2 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Actor</div>
              <div className="mt-2 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  value={actor}
                  onChange={(e) => setActor(e.target.value)}
                  placeholder="username"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Event type</div>
              <div className="mt-2 relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                >
                  <option value="all">All</option>
                  <option value="admin">Admin</option>
                  <option value="security">Security</option>
                  <option value="integrations">Integrations</option>
                  <option value="chat">Chat</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Format</div>
            <button
              className={`px-3 py-2 rounded-xl border text-sm ${format === 'csv' ? 'border-primary-300 bg-primary-50/60 dark:border-primary-700 dark:bg-primary-900/10' : 'border-secondary-200 dark:border-secondary-700'}`}
              onClick={() => setFormat('csv')}
            >
              CSV
            </button>
            <button
              className={`px-3 py-2 rounded-xl border text-sm ${format === 'json' ? 'border-primary-300 bg-primary-50/60 dark:border-primary-700 dark:bg-primary-900/10' : 'border-secondary-200 dark:border-secondary-700'}`}
              onClick={() => setFormat('json')}
            >
              JSON
            </button>
            <div className="flex-1" />
            <button className="btn btn-secondary px-4 py-2" onClick={clearFilters}>Clear</button>
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-secondary-900 dark:text-white">Export jobs</div>
            <div className="text-sm text-secondary-600 dark:text-secondary-300">Download history and job status.</div>
          </div>
          <Pill>{visibleJobs.length} shown</Pill>
        </div>

        <div className="mt-4 divide-y divide-secondary-100 dark:divide-secondary-700 border border-secondary-200 dark:border-secondary-700 rounded-xl overflow-hidden">
          {visibleJobs.map((j) => (
            <div key={j.id} className="p-4 bg-white dark:bg-secondary-800">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold text-secondary-900 dark:text-white">{j.id}</div>
                    <Pill>{j.type}</Pill>
                    <Pill>{j.format.toUpperCase()}</Pill>
                    {j.status === 'ready' && (
                      <Pill tone="success">
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Ready
                        </span>
                      </Pill>
                    )}
                    {j.status === 'processing' && (
                      <Pill>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Processing
                        </span>
                      </Pill>
                    )}
                    {j.status === 'expired' && <Pill tone="warn">Expired</Pill>}
                    {j.status === 'canceled' && <Pill tone="danger">Canceled</Pill>}
                  </div>
                  <div className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
                    Range: {j.range} • Actor: {j.actor} • Created: {j.createdAt} • Size: {j.size}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-secondary px-3 py-2"
                    disabled={j.status !== 'ready'}
                    onClick={() => download(j.id)}
                    title={j.status !== 'ready' ? 'Not ready' : 'Download'}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    className="btn btn-secondary px-3 py-2"
                    disabled={j.status !== 'processing'}
                    onClick={() => cancelJob(j.id)}
                    title={j.status !== 'processing' ? 'Cannot cancel' : 'Cancel'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button className="btn btn-secondary px-3 py-2" onClick={() => deleteJob(j.id)} title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {visibleJobs.length === 0 && (
            <div className="p-8 text-center text-secondary-500 dark:text-secondary-400">
              No jobs match filters.
            </div>
          )}
        </div>

        <div className="mt-5 text-xs text-secondary-500 dark:text-secondary-400">
          UI-only: backend later will generate signed download URLs, store exports, and enforce retention.
        </div>
      </div>
    </div>
  );
}
