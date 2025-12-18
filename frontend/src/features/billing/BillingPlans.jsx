import React, { useMemo, useState } from 'react';
import {
  CreditCard,
  Receipt,
  TrendingUp,
  Users,
  HardDrive,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Download,
  Plus,
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

function Stat({ icon: Icon, label, value, hint }) {
  return (
    <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-secondary-500 dark:text-secondary-400">{label}</div>
          <div className="mt-1 text-lg font-bold text-secondary-900 dark:text-white">{value}</div>
          {hint && <div className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">{hint}</div>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-600 flex items-center justify-center">
          <Icon className="w-5 h-5 text-secondary-700 dark:text-secondary-200" />
        </div>
      </div>
    </div>
  );
}

export default function BillingPlans() {
  const [plan, setPlan] = useState('pro');
  const [seats, setSeats] = useState(12);

  const plans = useMemo(
    () => [
      {
        id: 'starter',
        name: 'Starter',
        price: '$0',
        tagline: 'For small teams evaluating TeamOS',
        features: ['Chat + Tasks', 'Basic file uploads', 'Community support'],
      },
      {
        id: 'pro',
        name: 'Pro',
        price: '$12/user/mo',
        tagline: 'For growing teams',
        features: ['Unified Inbox', 'Docs + Boards', 'Automations (UI)', 'Email integration (UI)'],
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'Custom',
        tagline: 'Security, compliance, and SSO',
        features: ['SSO/SAML', 'DLP policies', 'Audit exports', 'Dedicated support'],
      },
    ],
    []
  );

  const invoices = useMemo(
    () => [
      { id: 'inv-1042', date: '2025-12-01', amount: '$144.00', status: 'paid' },
      { id: 'inv-1039', date: '2025-11-01', amount: '$132.00', status: 'paid' },
      { id: 'inv-1034', date: '2025-10-01', amount: '$120.00', status: 'paid' },
      { id: 'inv-1028', date: '2025-09-01', amount: '$120.00', status: 'paid' },
    ],
    []
  );

  const usage = useMemo(
    () => ({
      messages: { used: 18420, limit: 50000 },
      storageGb: { used: 18, limit: 100 },
      emailSync: { used: 0, limit: 0 },
    }),
    []
  );

  const pct = (u) => Math.min(100, Math.round((u.used / (u.limit || 1)) * 100));

  const changePlan = (next) => {
    setPlan(next);
    alert(`Switched plan to ${next} (UI-only)`);
  };

  const addSeat = () => {
    setSeats((s) => s + 1);
  };

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-bold text-secondary-900 dark:text-white">Billing & Plans</div>
            <div className="text-sm text-secondary-600 dark:text-secondary-300">UI-only: subscriptions and invoices will be backed by Stripe later.</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary px-4 py-2" onClick={() => alert('Update payment method (UI-only)')}>
              <CreditCard className="w-4 h-4" />
              <span className="ml-2">Payment method</span>
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Stat icon={Users} label="Seats" value={`${seats}`} hint="Active users on plan" />
          <Stat icon={TrendingUp} label="Spend (est.)" value={plan === 'pro' ? `$${seats * 12}/mo` : plan === 'starter' ? '$0/mo' : 'Custom'} hint="Estimate" />
          <Stat icon={Receipt} label="Next invoice" value="2026-01-01" hint="Billing cycle" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-secondary-900 dark:text-white">Plans</div>
            <Pill>{plan.toUpperCase()}</Pill>
          </div>

          <div className="mt-4 space-y-3">
            {plans.map((p) => (
              <button
                key={p.id}
                onClick={() => changePlan(p.id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  p.id === plan
                    ? 'border-primary-300 bg-primary-50/60 dark:border-primary-700 dark:bg-primary-900/10'
                    : 'border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-secondary-900 dark:text-white">{p.name}</div>
                      {p.id === plan && (
                        <Pill tone="success">
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Current
                          </span>
                        </Pill>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-secondary-600 dark:text-secondary-300">{p.tagline}</div>
                    <div className="mt-2 text-xs text-secondary-500 dark:text-secondary-400">
                      {p.features.join(' • ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-secondary-900 dark:text-white">{p.price}</div>
                    {p.id === 'enterprise' && (
                      <div className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">Contact sales</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn btn-primary px-4 py-2" onClick={addSeat}>
              <Plus className="w-4 h-4" />
              <span className="ml-2">Add seat</span>
            </button>
            <button className="btn btn-secondary px-4 py-2" onClick={() => alert('Manage seats (UI-only)')}>
              Manage seats
            </button>
          </div>
        </div>

        <div className="card p-6">
          <div className="font-semibold text-secondary-900 dark:text-white">Usage</div>
          <div className="mt-4 space-y-4">
            <UsageRow
              icon={Mail}
              label="Email sync"
              value="Not connected"
              tone="warn"
              desc="Connect Email integration to track usage"
              bar={0}
            />
            <UsageRow
              icon={TrendingUp}
              label="Messages"
              value={`${usage.messages.used.toLocaleString()} / ${usage.messages.limit.toLocaleString()}`}
              bar={pct(usage.messages)}
            />
            <UsageRow
              icon={HardDrive}
              label="Storage"
              value={`${usage.storageGb.used} GB / ${usage.storageGb.limit} GB`}
              bar={pct(usage.storageGb)}
            />
          </div>

          <div className="mt-5 text-xs text-secondary-500 dark:text-secondary-400">
            UI-only: usage numbers will reflect real storage/messages once backend telemetry is added.
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold text-secondary-900 dark:text-white">Invoices</div>
          <button className="btn btn-secondary px-4 py-2" onClick={() => alert('Download all (UI-only)')}>
            <Download className="w-4 h-4" />
            <span className="ml-2">Download</span>
          </button>
        </div>

        <div className="mt-4 divide-y divide-secondary-100 dark:divide-secondary-700 border border-secondary-200 dark:border-secondary-700 rounded-xl overflow-hidden">
          {invoices.map((inv) => (
            <div key={inv.id} className="p-4 bg-white dark:bg-secondary-800 flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-secondary-900 dark:text-white">{inv.id}</div>
                <div className="text-xs text-secondary-500 dark:text-secondary-400">{inv.date}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-secondary-900 dark:text-white">{inv.amount}</div>
                {inv.status === 'paid' ? (
                  <Pill tone="success">Paid</Pill>
                ) : (
                  <Pill tone="warn">
                    <span className="inline-flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Due
                    </span>
                  </Pill>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UsageRow({ icon: Icon, label, value, desc, tone, bar }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center">
            <Icon className="w-4 h-4 text-secondary-700 dark:text-secondary-200" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-secondary-900 dark:text-white">{label}</div>
            {desc && <div className="text-xs text-secondary-500 dark:text-secondary-400">{desc}</div>}
          </div>
        </div>
        <div className="text-sm text-secondary-700 dark:text-secondary-200">{value}</div>
      </div>
      {typeof bar === 'number' && (
        <div className="mt-2 h-2 rounded-full bg-secondary-100 dark:bg-secondary-700 overflow-hidden">
          <div className="h-full bg-primary-500" style={{ width: `${bar}%` }} />
        </div>
      )}
      {tone === 'warn' && (
        <div className="mt-2">
          <Pill tone="warn">Action needed</Pill>
        </div>
      )}
    </div>
  );
}
