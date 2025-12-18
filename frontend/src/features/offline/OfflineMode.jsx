import React, { useMemo, useState } from 'react';
import {
  Wifi,
  WifiOff,
  CloudUpload,
  RefreshCw,
  Trash2,
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  List,
} from 'lucide-react';

function Pill({ children, tone = 'neutral' }) {
  const cls =
    tone === 'success'
      ? 'bg-success-50 text-success-700 dark:bg-success-900/15 dark:text-success-300'
      : tone === 'danger'
        ? 'bg-danger-50 text-danger-700 dark:bg-danger-900/15 dark:text-danger-300'
        : tone === 'warn'
          ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/15 dark:text-amber-300'
          : 'bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-200';
  return <span className={`text-xs px-2 py-1 rounded-full ${cls}`}>{children}</span>;
}

function QueueIcon({ type }) {
  const cls = 'w-4 h-4';
  if (type === 'upload') return <CloudUpload className={cls} />;
  if (type === 'message') return <List className={cls} />;
  return <Clock className={cls} />;
}

export default function OfflineMode({
  isOnline,
  setIsOnline,
  drawerOpen,
  setDrawerOpen,
  lastSyncedAt,
  setLastSyncedAt,
}) {
  const [items, setItems] = useState([
    { id: 'q1', type: 'upload', title: 'Upload design-spec.pdf', detail: '2.3 MB • #general', status: 'queued' },
    { id: 'q2', type: 'message', title: 'Send message to #product', detail: '“I pushed the UI updates...”', status: 'queued' },
    { id: 'q3', type: 'task', title: 'Create task: “QA Security Center”', detail: 'Assignee: you', status: 'failed' },
  ]);

  const queuedCount = useMemo(() => items.filter((i) => i.status === 'queued' || i.status === 'failed').length, [items]);

  const toggleConnectivity = () => {
    setIsOnline(!isOnline);
    if (isOnline) return;
    // going online: simulate a sync timestamp update
    setLastSyncedAt(new Date().toLocaleString());
  };

  const retryItem = (id) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'queued' } : i)));
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const retryAll = () => {
    setItems((prev) => prev.map((i) => (i.status === 'failed' ? { ...i, status: 'queued' } : i)));
  };

  const clearQueue = () => {
    setItems([]);
  };

  const forceSync = () => {
    if (!isOnline) return;
    // simulate sync processing
    setItems((prev) => prev.map((i) => ({ ...i, status: 'synced' })));
    setLastSyncedAt(new Date().toLocaleString());
    setTimeout(() => {
      setItems([]);
    }, 700);
  };

  return (
    <>
      {/* Global Banner */}
      <div className={`w-full border-b backdrop-blur ${isOnline ? 'border-secondary-200 dark:border-secondary-700' : 'border-amber-200 dark:border-amber-900/40'} ${isOnline ? 'bg-white/85 dark:bg-secondary-800/85' : 'bg-amber-50/85 dark:bg-amber-900/10'}`}>
        <div className="px-4 lg:px-6 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ring-1 ring-black/5 dark:ring-white/10 ${isOnline ? 'bg-success-50 text-success-700 dark:bg-success-900/15 dark:text-success-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'}`}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-secondary-900 dark:text-white truncate leading-tight">
                {isOnline ? 'Online' : 'Offline mode'}
              </div>
              <div className="text-xs text-secondary-600 dark:text-secondary-300 truncate">
                {isOnline
                  ? `Last synced: ${lastSyncedAt || '—'} • Queue: ${queuedCount}`
                  : `You are offline. Changes will be queued • Queue: ${queuedCount}`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center rounded-2xl px-3 py-1.5 text-sm font-medium bg-secondary-50/80 dark:bg-secondary-700/60 border border-secondary-200 dark:border-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              onClick={() => setDrawerOpen(true)}
            >
              <List className="w-4 h-4" />
              <span className="ml-2 hidden sm:inline">Sync queue</span>
              {queuedCount > 0 && (
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-secondary-200/80 dark:bg-secondary-700/80">
                  {queuedCount}
                </span>
              )}
            </button>

            <button
              className="inline-flex items-center rounded-2xl px-3 py-1.5 text-sm font-medium bg-secondary-50/80 dark:bg-secondary-700/60 border border-secondary-200 dark:border-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={forceSync}
              disabled={!isOnline}
              title={!isOnline ? 'Go online to sync' : 'Sync now'}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="ml-2 hidden sm:inline">Sync</span>
            </button>

            <button
              className="inline-flex items-center rounded-2xl px-3 py-1.5 text-sm font-medium bg-secondary-50/80 dark:bg-secondary-700/60 border border-secondary-200 dark:border-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              onClick={toggleConnectivity}
            >
              <span className="hidden sm:inline">{isOnline ? 'Go offline' : 'Go online'}</span>
              <span className="sm:hidden">{isOnline ? 'Offline' : 'Online'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[520px] z-50 bg-white dark:bg-secondary-800 border-l border-secondary-200 dark:border-secondary-700 shadow-large flex flex-col">
            <div className="p-5 border-b border-secondary-200 dark:border-secondary-700 flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-secondary-900 dark:text-white">Sync queue</div>
                <div className="text-xs text-secondary-500 dark:text-secondary-400">UI-only (offline sync backend later)</div>
              </div>
              <button className="btn-ghost p-2" onClick={() => setDrawerOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 border-b border-secondary-200 dark:border-secondary-700 flex flex-wrap items-center gap-2">
              <Pill tone={isOnline ? 'success' : 'warn'}>{isOnline ? 'Online' : 'Offline'}</Pill>
              <Pill>Queued: {items.filter((i) => i.status === 'queued').length}</Pill>
              <Pill>Failed: {items.filter((i) => i.status === 'failed').length}</Pill>
              <div className="flex-1" />
              <button className="btn btn-secondary px-3 py-2" onClick={retryAll} disabled={items.every((i) => i.status !== 'failed')}>
                <RefreshCw className="w-4 h-4" />
                <span className="ml-2">Retry failed</span>
              </button>
              <button className="btn btn-secondary px-3 py-2" onClick={clearQueue} disabled={items.length === 0}>
                <Trash2 className="w-4 h-4" />
                <span className="ml-2">Clear</span>
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {items.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-secondary-900 dark:text-white font-semibold">Queue is empty</div>
                  <div className="mt-2 text-sm text-secondary-600 dark:text-secondary-300">All changes are synced.</div>
                </div>
              ) : (
                <div className="divide-y divide-secondary-100 dark:divide-secondary-700">
                  {items.map((i) => (
                    <div key={i.id} className="p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center text-secondary-700 dark:text-secondary-200">
                        <QueueIcon type={i.type} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold text-secondary-900 dark:text-white truncate">{i.title}</div>
                            <div className="text-xs text-secondary-500 dark:text-secondary-400 truncate">{i.detail}</div>
                          </div>
                          <div>
                            {i.status === 'queued' && <Pill>Queued</Pill>}
                            {i.status === 'failed' && (
                              <Pill tone="danger">
                                <span className="inline-flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Failed
                                </span>
                              </Pill>
                            )}
                            {i.status === 'synced' && (
                              <Pill tone="success">
                                <span className="inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Synced
                                </span>
                              </Pill>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button className="btn btn-secondary px-4 py-2" onClick={() => retryItem(i.id)} disabled={i.status !== 'failed'}>
                            Retry
                          </button>
                          <button className="btn btn-secondary px-4 py-2" onClick={() => removeItem(i.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-secondary-200 dark:border-secondary-700">
              <button className="btn btn-primary w-full py-3" onClick={forceSync} disabled={!isOnline || items.length === 0}>
                <RefreshCw className="w-4 h-4" />
                <span className="ml-2">Sync now</span>
              </button>
              {!isOnline && (
                <div className="mt-2 text-xs text-secondary-500 dark:text-secondary-400">
                  Go online to sync queued changes.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
