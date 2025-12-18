import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageCircle,
  Mail,
  FileText,
  UploadCloud,
  ShieldCheck,
  Calendar,
  Filter,
} from 'lucide-react';

function Pill({ children, tone = 'neutral' }) {
  const cls =
    tone === 'success'
      ? 'bg-success-50 text-success-700 dark:bg-success-900/15 dark:text-success-300'
      : tone === 'warn'
        ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/15 dark:text-amber-300'
        : 'bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-200';
  return <span className={`text-xs px-2 py-1 rounded-full ${cls}`}>{children}</span>;
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-secondary-500 dark:text-secondary-400">{label}</div>
          <div className="mt-1 text-2xl font-bold text-secondary-900 dark:text-white">{value}</div>
          {hint && <div className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">{hint}</div>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center">
          <Icon className="w-5 h-5 text-secondary-700 dark:text-secondary-200" />
        </div>
      </div>
    </div>
  );
}

function ProgressRow({ label, icon: Icon, used, limit, unit }) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center">
            <Icon className="w-5 h-5 text-secondary-700 dark:text-secondary-200" />
          </div>
          <div>
            <div className="font-semibold text-secondary-900 dark:text-white">{label}</div>
            <div className="text-xs text-secondary-500 dark:text-secondary-400">
              {used.toLocaleString()} / {limit.toLocaleString()} {unit}
            </div>
          </div>
        </div>
        <Pill tone={pct >= 90 ? 'warn' : 'neutral'}>{pct}%</Pill>
      </div>
      <div className="mt-3 h-2 rounded-full bg-secondary-100 dark:bg-secondary-700 overflow-hidden">
        <div className="h-full bg-primary-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Sparkline({ points }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(1, max - min);
  const d = points
    .map((p, idx) => {
      const x = (idx / (points.length - 1)) * 100;
      const y = 100 - ((p - min) / range) * 100;
      return `${idx === 0 ? 'M' : 'L'} ${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-16">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="4" className="text-primary-500" />
    </svg>
  );
}

export default function UsageAnalytics() {
  const [range, setRange] = useState('7d');
  const [segment, setSegment] = useState('all');

  const data = useMemo(() => {
    // UI-only mocked metrics
    return {
      activeUsers: range === '30d' ? 48 : 21,
      messages: range === '30d' ? 18240 : 4890,
      emails: range === '30d' ? 0 : 0,
      docs: range === '30d' ? 64 : 18,
      uploadsGb: range === '30d' ? 24 : 6,
      securityScore: 'Healthy',
      usage: {
        messages: { used: range === '30d' ? 18240 : 4890, limit: 50000 },
        docs: { used: range === '30d' ? 64 : 18, limit: 500 },
        storage: { used: range === '30d' ? 24 : 6, limit: 100 },
      },
      sparklines: {
        messages: range === '30d' ? [220, 260, 300, 280, 340, 410, 390, 420, 460, 440, 480, 520] : [40, 55, 62, 58, 70, 84, 79],
        docs: range === '30d' ? [2, 4, 3, 6, 7, 9, 11, 10, 12, 14, 13, 15] : [1, 2, 3, 2, 4, 3, 5],
        uploads: range === '30d' ? [0.3, 0.6, 0.8, 0.7, 1.2, 1.1, 1.4, 1.3, 1.6, 1.8, 1.7, 2.0] : [0.1, 0.2, 0.3, 0.25, 0.4, 0.35, 0.5],
      },
    };
  }, [range]);

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-700 text-white flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-secondary-900 dark:text-white">Usage analytics</div>
              <div className="text-sm text-secondary-600 dark:text-secondary-300">UI-only metrics dashboard (backend telemetry later)</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-secondary-500 dark:text-secondary-300" />
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
              >
                <option value="all">All users</option>
                <option value="admins">Admins</option>
                <option value="guests">Guests</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-secondary-500 dark:text-secondary-300" />
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>

            <Pill tone="success">{data.securityScore}</Pill>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Active users" value={data.activeUsers} hint={segment === 'all' ? 'Across workspace' : `Segment: ${segment}`} />
        <StatCard icon={MessageCircle} label="Messages" value={data.messages.toLocaleString()} hint={`Range: ${range}`} />
        <StatCard icon={FileText} label="Docs" value={data.docs} hint="Created/edited" />
        <StatCard icon={UploadCloud} label="Uploads" value={`${data.uploadsGb} GB`} hint="Total" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-secondary-900 dark:text-white">Quota usage</div>
            <Pill>UI-only</Pill>
          </div>

          <div className="mt-4 space-y-3">
            <ProgressRow label="Messages" icon={MessageCircle} used={data.usage.messages.used} limit={data.usage.messages.limit} unit="msgs" />
            <ProgressRow label="Docs" icon={FileText} used={data.usage.docs.used} limit={data.usage.docs.limit} unit="docs" />
            <ProgressRow label="Storage" icon={UploadCloud} used={data.usage.storage.used} limit={data.usage.storage.limit} unit="GB" />
          </div>
        </div>

        <div className="card p-6">
          <div className="font-semibold text-secondary-900 dark:text-white">Trends</div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <TrendCard title="Messages" icon={TrendingUp} points={data.sparklines.messages} />
            <TrendCard title="Docs" icon={FileText} points={data.sparklines.docs} />
            <TrendCard title="Uploads" icon={UploadCloud} points={data.sparklines.uploads} />
          </div>

          <div className="mt-5 text-xs text-secondary-500 dark:text-secondary-400">
            UI-only: these charts will be populated from backend analytics/events later.
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-secondary-900 dark:text-white">Notes</div>
          <Pill>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Privacy-first
            </span>
          </Pill>
        </div>
        <div className="mt-3 text-sm text-secondary-600 dark:text-secondary-300">
          Metrics are mocked for the UI demo. When backend is ready, we can track events (messages sent, docs edited, files uploaded) and show per-team / per-channel breakdowns.
        </div>
        <div className="mt-4 text-xs text-secondary-500 dark:text-secondary-400">Current segment filter is UI-only: {segment}</div>
      </div>
    </div>
  );
}

function TrendCard({ title, icon: Icon, points }) {
  return (
    <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-secondary-900 dark:text-white">{title}</div>
        <div className="w-9 h-9 rounded-xl bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center">
          <Icon className="w-4 h-4 text-secondary-700 dark:text-secondary-200" />
        </div>
      </div>
      <div className="mt-2 text-secondary-900 dark:text-white">
        <Sparkline points={points} />
      </div>
    </div>
  );
}
