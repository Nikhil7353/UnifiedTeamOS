import React, { useMemo, useState, useEffect } from 'react';
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
import { getUsageAnalytics } from '../../services/analyticsService';

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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const analyticsData = await getUsageAnalytics(range, segment);
        setData(analyticsData);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [range, segment]);

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <div className="card p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-secondary-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-secondary-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <div className="text-sm text-secondary-600 dark:text-secondary-300">Real-time metrics and usage statistics</div>
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
          Real-time analytics tracking user activity, messages, documents, and system usage across your team workspace.
        </div>
        <div className="mt-4 text-xs text-secondary-500 dark:text-secondary-400">Analytics updated in real-time</div>
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
