import React, { useMemo, useState } from 'react';
import {
  Shield,
  Lock,
  FileWarning,
  Timer,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Eye,
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

function TogglePreview({ on, label }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary-50 dark:bg-secondary-700/40">
      <div className="text-sm text-secondary-700 dark:text-secondary-200">{label}</div>
      {on ? <Pill tone="success">On</Pill> : <Pill>Off</Pill>}
    </div>
  );
}

export default function PolicyTemplates() {
  const templates = useMemo(
    () => [
      {
        id: 'startup',
        title: 'Startup',
        tag: 'Fast setup',
        desc: 'Reasonable defaults for small teams. Minimal friction.',
        config: {
          e2e: false,
          dlp: false,
          retentionDays: 90,
          sso: false,
        },
      },
      {
        id: 'standard',
        title: 'Standard',
        tag: 'Recommended',
        desc: 'Balanced security + usability for most orgs.',
        config: {
          e2e: true,
          dlp: true,
          retentionDays: 180,
          sso: false,
        },
      },
      {
        id: 'enterprise',
        title: 'Enterprise',
        tag: 'Compliance',
        desc: 'Strict controls for regulated environments.',
        config: {
          e2e: true,
          dlp: true,
          retentionDays: 365,
          sso: true,
        },
      },
    ],
    []
  );

  const [selectedId, setSelectedId] = useState('standard');
  const [appliedId, setAppliedId] = useState('startup');

  const selected = useMemo(() => templates.find((t) => t.id === selectedId) || templates[0], [templates, selectedId]);
  const applied = useMemo(() => templates.find((t) => t.id === appliedId) || templates[0], [templates, appliedId]);

  const apply = () => {
    setAppliedId(selectedId);
    alert(`Applied template: ${selected.title} (UI-only)`);
  };

  const diff = useMemo(() => {
    const a = applied.config;
    const b = selected.config;
    return {
      e2e: a.e2e !== b.e2e,
      dlp: a.dlp !== b.dlp,
      retentionDays: a.retentionDays !== b.retentionDays,
      sso: a.sso !== b.sso,
    };
  }, [applied, selected]);

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-secondary-700 to-primary-600 text-white flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-secondary-900 dark:text-white">Policy templates</div>
              <div className="text-sm text-secondary-600 dark:text-secondary-300">Apply preset security policies (UI-first)</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Pill>
              <span className="inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Templates
              </span>
            </Pill>
            <Pill tone="success">Current: {applied.title}</Pill>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-1 space-y-3">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={`w-full text-left p-4 rounded-xl border transition-colors ${
                selectedId === t.id
                  ? 'border-primary-300 bg-primary-50/60 dark:border-primary-700 dark:bg-primary-900/10'
                  : 'border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-secondary-900 dark:text-white">{t.title}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-200 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200">
                      {t.tag}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-secondary-600 dark:text-secondary-300">{t.desc}</div>
                </div>
                {appliedId === t.id ? (
                  <Pill tone="success">
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Applied
                    </span>
                  </Pill>
                ) : (
                  <Pill>Preview</Pill>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="xl:col-span-2 space-y-4">
          <div className="card p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-bold text-secondary-900 dark:text-white">{selected.title} template</div>
                <div className="mt-1 text-sm text-secondary-600 dark:text-secondary-300">Preview what will change before applying.</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn btn-secondary px-3 py-2" onClick={() => alert('View policy details (UI-only)')}>
                  <Eye className="w-4 h-4" />
                </button>
                <button className="btn btn-primary px-4 py-2" onClick={apply} disabled={appliedId === selectedId}>
                  Apply template
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-secondary-900 dark:text-white">Preview settings</div>
                  {appliedId === selectedId ? <Pill tone="success">No changes</Pill> : <Pill tone="warn">Changes pending</Pill>}
                </div>
                <div className="mt-4 space-y-2">
                  <TogglePreview on={selected.config.e2e} label="E2E Encryption" />
                  <TogglePreview on={selected.config.dlp} label="DLP (scanner + block/quarantine)" />
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary-50 dark:bg-secondary-700/40">
                    <div className="text-sm text-secondary-700 dark:text-secondary-200">Retention</div>
                    <Pill>{selected.config.retentionDays} days</Pill>
                  </div>
                  <TogglePreview on={selected.config.sso} label="SSO enforced" />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800">
                <div className="font-semibold text-secondary-900 dark:text-white">Diff vs current</div>
                <div className="mt-3 space-y-2">
                  <DiffRow icon={Lock} label="E2E Encryption" changed={diff.e2e} />
                  <DiffRow icon={FileWarning} label="DLP" changed={diff.dlp} />
                  <DiffRow icon={Timer} label="Retention" changed={diff.retentionDays} />
                  <DiffRow icon={KeyRound} label="SSO" changed={diff.sso} />
                </div>
                <div className="mt-4 text-xs text-secondary-500 dark:text-secondary-400">
                  UI-only: applying will later write org policy settings to backend.
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-300" />
              </div>
              <div>
                <div className="font-semibold text-secondary-900 dark:text-white">Notes</div>
                <div className="mt-1 text-sm text-secondary-600 dark:text-secondary-300">
                  - Enterprise template typically requires SSO + DLP enforcement.
                  <br />
                  - In E2E mode, search and automations may be limited.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiffRow({ icon: Icon, label, changed }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary-50 dark:bg-secondary-700/40">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-secondary-600 dark:text-secondary-200" />
        <div className="text-sm text-secondary-700 dark:text-secondary-200">{label}</div>
      </div>
      {changed ? <Pill tone="warn">Will change</Pill> : <Pill tone="success">No change</Pill>}
    </div>
  );
}
