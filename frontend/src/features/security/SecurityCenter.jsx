import React, { useState } from 'react';
import {
  Shield,
  Lock,
  KeyRound,
  Fingerprint,
  Timer,
  AlertTriangle,
  FileWarning,
  Settings,
  CheckCircle2,
  Plus,
  Search,
  Trash2,
  Copy,
  FileText,
  ShieldCheck,
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

function Toggle({ enabled, onChange, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        disabled
          ? 'bg-secondary-200 dark:bg-secondary-700 opacity-60 cursor-not-allowed'
          : enabled
            ? 'bg-primary-500'
            : 'bg-secondary-300 dark:bg-secondary-600'
      }`}
      aria-label="Toggle"
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function SecurityCenter() {
  const [tab, setTab] = useState('e2e'); // e2e | dlp | retention

  // UI-only state
  const [e2eEnabled, setE2eEnabled] = useState(false);
  const [keyRotation, setKeyRotation] = useState('30');
  const [allowGuestE2e, setAllowGuestE2e] = useState(false);
  const [deviceVerification, setDeviceVerification] = useState(true);

  const [dlpEnabled, setDlpEnabled] = useState(true);
  const [dlpBlockMode, setDlpBlockMode] = useState(true);
  const [dlpQuery, setDlpQuery] = useState('');
  const [dlpTestText, setDlpTestText] = useState('Send PAN 4111 1111 1111 1111 to test scanners');
  const [dlpRules, setDlpRules] = useState([
    { id: 'r1', name: 'Credit cards', pattern: 'card_number', action: 'block', severity: 'high', enabled: true },
    { id: 'r2', name: 'API keys', pattern: 'api_key', action: 'quarantine', severity: 'high', enabled: true },
    { id: 'r3', name: 'PII emails', pattern: 'email', action: 'warn', severity: 'medium', enabled: true },
    { id: 'r4', name: 'Secrets (generic)', pattern: 'secret', action: 'warn', severity: 'low', enabled: false },
  ]);

  const [retentionEnabled, setRetentionEnabled] = useState(true);
  const [retentionDefaultDays, setRetentionDefaultDays] = useState('90');
  const [retentionRules, setRetentionRules] = useState([
    { id: 'p1', scope: 'Public channels', type: 'messages', days: 180 },
    { id: 'p2', scope: 'Private channels', type: 'messages', days: 90 },
    { id: 'p3', scope: 'DMs', type: 'messages', days: 30 },
    { id: 'p4', scope: 'Files', type: 'files', days: 365 },
  ]);

  const addDlpRule = () => {
    const name = prompt('Rule name');
    if (!name) return;
    const pattern = prompt('Pattern: card_number | api_key | email | secret');
    if (!pattern) return;
    const action = prompt('Action: warn | quarantine | block');
    if (!action) return;
    const severity = prompt('Severity: low | medium | high');
    if (!severity) return;
    setDlpRules((prev) => [
      { id: `r-${Date.now()}`, name, pattern, action, severity, enabled: true },
      ...prev,
    ]);
  };

  const toggleDlpRule = (id) => {
    setDlpRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const deleteDlpRule = (id) => {
    setDlpRules((prev) => prev.filter((r) => r.id !== id));
  };

  const duplicateDlpRule = (id) => {
    const r = dlpRules.find((x) => x.id === id);
    if (!r) return;
    setDlpRules((prev) => [
      { ...r, id: `r-${Date.now()}`, name: `${r.name} (copy)` },
      ...prev,
    ]);
  };

  const addRetentionRule = () => {
    const scope = prompt('Scope (e.g. Public channels, Private channels, DMs, #support)');
    if (!scope) return;
    const type = prompt('Type: messages | files');
    if (!type) return;
    const daysStr = prompt('Days to retain (number)');
    if (!daysStr) return;
    const days = Number(daysStr);
    if (!Number.isFinite(days) || days <= 0) return;
    setRetentionRules((prev) => [
      { id: `p-${Date.now()}`, scope, type, days },
      ...prev,
    ]);
  };

  const deleteRetentionRule = (id) => {
    setRetentionRules((prev) => prev.filter((r) => r.id !== id));
  };

  const testDlpScan = () => {
    const t = dlpTestText.toLowerCase();
    let hits = [];
    if (/(\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b)/.test(t)) hits.push('card_number');
    if (/sk-[a-z0-9]{10,}/.test(t) || /api[_-]?key/.test(t)) hits.push('api_key');
    if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/.test(t)) hits.push('email');
    if (/secret|password|token/.test(t)) hits.push('secret');
    alert(hits.length ? `Matched scanners: ${hits.join(', ')}` : 'No matches');
  };

  return (
    <div className="flex h-full bg-secondary-50 dark:bg-secondary-900">
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-secondary-700 to-primary-600 text-white flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold text-secondary-900 dark:text-white truncate">Security</div>
                  <div className="text-sm text-secondary-500 dark:text-secondary-400">UI-first security center (policies enforced later)</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button onClick={() => setTab('e2e')} className={`btn px-4 py-2 ${tab === 'e2e' ? 'btn-primary' : 'btn-secondary'}`}>
                  <Lock className="w-4 h-4" />
                  <span className="ml-2">E2E Encryption</span>
                </button>
                <button onClick={() => setTab('dlp')} className={`btn px-4 py-2 ${tab === 'dlp' ? 'btn-primary' : 'btn-secondary'}`}>
                  <FileWarning className="w-4 h-4" />
                  <span className="ml-2">DLP</span>
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-secondary-200 dark:bg-secondary-700">Soon</span>
                </button>
                <button onClick={() => setTab('retention')} className={`btn px-4 py-2 ${tab === 'retention' ? 'btn-primary' : 'btn-secondary'}`}>
                  <Timer className="w-4 h-4" />
                  <span className="ml-2">Retention</span>
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-secondary-200 dark:bg-secondary-700">Soon</span>
                </button>
              </div>
            </div>

            <button className="btn btn-secondary px-3 py-2" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-auto p-6">
          {tab === 'e2e' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="card p-5 xl:col-span-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-bold text-secondary-900 dark:text-white">End-to-end encryption</div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-300">Protect messages and calls with device keys.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill tone={e2eEnabled ? 'success' : 'warn'}>{e2eEnabled ? 'Enabled' : 'Disabled'}</Pill>
                    <Toggle enabled={e2eEnabled} onChange={setE2eEnabled} />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SettingCard
                    icon={KeyRound}
                    title="Key rotation"
                    desc="Rotate encryption keys periodically"
                    disabled={!e2eEnabled}
                  >
                    <select
                      value={keyRotation}
                      onChange={(e) => setKeyRotation(e.target.value)}
                      disabled={!e2eEnabled}
                      className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                    >
                      <option value="7">Every 7 days</option>
                      <option value="30">Every 30 days</option>
                      <option value="90">Every 90 days</option>
                      <option value="0">Never</option>
                    </select>
                  </SettingCard>

                  <SettingCard
                    icon={Fingerprint}
                    title="Device verification"
                    desc="Require device verification for new logins"
                    disabled={!e2eEnabled}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-secondary-700 dark:text-secondary-200">Verification required</div>
                      <Toggle enabled={deviceVerification} onChange={setDeviceVerification} disabled={!e2eEnabled} />
                    </div>
                  </SettingCard>

                  <SettingCard
                    icon={AlertTriangle}
                    title="External guests"
                    desc="Allow guests in E2E rooms"
                    disabled={!e2eEnabled}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-secondary-700 dark:text-secondary-200">Allow guest participation</div>
                      <Toggle enabled={allowGuestE2e} onChange={setAllowGuestE2e} disabled={!e2eEnabled} />
                    </div>
                  </SettingCard>

                  <SettingCard
                    icon={CheckCircle2}
                    title="Compliance mode"
                    desc="Audit-only (no message content stored)"
                    disabled
                  >
                    <div className="text-sm text-secondary-500 dark:text-secondary-400">
                      Coming soon (enterprise)
                    </div>
                  </SettingCard>
                </div>

                <div className="mt-6 text-xs text-secondary-500 dark:text-secondary-400">
                  UI-only: backend later will implement key management, verification flows, and enforcement in chat/voice/video.
                </div>
              </div>

              <div className="card p-5">
                <div className="text-sm font-semibold text-secondary-900 dark:text-white">Notes</div>
                <div className="mt-3 space-y-3 text-sm text-secondary-600 dark:text-secondary-300">
                  <div>
                    <Pill>Scope</Pill>
                    <div className="mt-2">Messages, files, and calls can be protected once backend is implemented.</div>
                  </div>
                  <div>
                    <Pill>Key ownership</Pill>
                    <div className="mt-2">Keys are device-based; server cannot decrypt content in E2E mode.</div>
                  </div>
                  <div>
                    <Pill>Limitations</Pill>
                    <div className="mt-2">Search, previews, and automations may be limited in E2E rooms.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'dlp' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="card p-5 xl:col-span-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-bold text-secondary-900 dark:text-white">Data Loss Prevention (DLP)</div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-300">Scan messages/files for sensitive data and block or quarantine.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill tone={dlpEnabled ? 'success' : 'warn'}>{dlpEnabled ? 'Enabled' : 'Disabled'}</Pill>
                    <Toggle enabled={dlpEnabled} onChange={setDlpEnabled} />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SettingCard icon={FileWarning} title="Policy mode" desc="How to respond to matched content" disabled={!dlpEnabled}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm text-secondary-700 dark:text-secondary-200">Block mode</div>
                      <Toggle enabled={dlpBlockMode} onChange={setDlpBlockMode} disabled={!dlpEnabled} />
                    </div>
                    <div className="mt-2 text-xs text-secondary-500 dark:text-secondary-400">
                      {dlpBlockMode ? 'Blocks sends on match.' : 'Warns/quarantines without blocking.'}
                    </div>
                  </SettingCard>

                  <SettingCard icon={Search} title="Test scanner" desc="Paste sample text to see matches" disabled={!dlpEnabled}>
                    <textarea
                      value={dlpTestText}
                      onChange={(e) => setDlpTestText(e.target.value)}
                      disabled={!dlpEnabled}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                    />
                    <div className="mt-2 flex justify-end">
                      <button onClick={testDlpScan} disabled={!dlpEnabled} className="btn btn-secondary px-4 py-2">
                        Run test
                      </button>
                    </div>
                  </SettingCard>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input
                      value={dlpQuery}
                      onChange={(e) => setDlpQuery(e.target.value)}
                      placeholder="Search DLP rules..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                    />
                  </div>
                  <button onClick={addDlpRule} disabled={!dlpEnabled} className="btn btn-primary px-4 py-2">
                    <Plus className="w-4 h-4" />
                    <span className="ml-2">New rule</span>
                  </button>
                </div>

                <div className="mt-4 divide-y divide-secondary-100 dark:divide-secondary-700 border border-secondary-200 dark:border-secondary-700 rounded-xl overflow-hidden">
                  {dlpRules
                    .filter((r) => {
                      const q = dlpQuery.trim().toLowerCase();
                      if (!q) return true;
                      return (r.name + ' ' + r.pattern + ' ' + r.action + ' ' + r.severity).toLowerCase().includes(q);
                    })
                    .map((r) => (
                      <div key={r.id} className="p-4 bg-white dark:bg-secondary-800">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="font-semibold text-secondary-900 dark:text-white">{r.name}</div>
                              <Pill>{r.pattern}</Pill>
                              <Pill tone={r.severity === 'high' ? 'warn' : 'neutral'}>{r.severity}</Pill>
                              <Pill>{r.action}</Pill>
                              {!r.enabled && <Pill>Disabled</Pill>}
                            </div>
                            <div className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">UI-only: patterns and actions are mocked.</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Toggle enabled={r.enabled} onChange={() => toggleDlpRule(r.id)} disabled={!dlpEnabled} />
                            <button onClick={() => duplicateDlpRule(r.id)} disabled={!dlpEnabled} className="btn-ghost p-2" title="Duplicate">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteDlpRule(r.id)} disabled={!dlpEnabled} className="btn-ghost p-2" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {dlpRules.length === 0 && (
                    <div className="p-6 text-sm text-secondary-500 dark:text-secondary-400">No rules.</div>
                  )}
                </div>

                <div className="mt-6 text-xs text-secondary-500 dark:text-secondary-400">
                  UI-only: backend later will scan uploads/messages, enforce block/quarantine, and add audit events.
                </div>
              </div>

              <div className="card p-5">
                <div className="text-sm font-semibold text-secondary-900 dark:text-white">Recommended baseline</div>
                <div className="mt-3 space-y-3 text-sm text-secondary-600 dark:text-secondary-300">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 mt-0.5 text-secondary-600 dark:text-secondary-200" />
                    <div>Block known card patterns in external/client spaces.</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 mt-0.5 text-secondary-600 dark:text-secondary-200" />
                    <div>Quarantine API keys and alert admins.</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 mt-0.5 text-secondary-600 dark:text-secondary-200" />
                    <div>Warn on PII and suggest redaction.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'retention' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="card p-5 xl:col-span-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-bold text-secondary-900 dark:text-white">Retention & expiry</div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-300">Control how long messages and files are kept.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill tone={retentionEnabled ? 'success' : 'warn'}>{retentionEnabled ? 'Enabled' : 'Disabled'}</Pill>
                    <Toggle enabled={retentionEnabled} onChange={setRetentionEnabled} />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SettingCard icon={Timer} title="Default retention" desc="Applied when no specific rule matches" disabled={!retentionEnabled}>
                    <select
                      value={retentionDefaultDays}
                      onChange={(e) => setRetentionDefaultDays(e.target.value)}
                      disabled={!retentionEnabled}
                      className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                    >
                      <option value="7">7 days</option>
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                      <option value="365">365 days</option>
                      <option value="0">Never expire</option>
                    </select>
                  </SettingCard>

                  <SettingCard icon={FileText} title="Deletion behavior" desc="How expiry is handled" disabled={!retentionEnabled}>
                    <div className="text-sm text-secondary-700 dark:text-secondary-200">Hard delete after expiry</div>
                    <div className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">UI-only (legal holds coming later)</div>
                  </SettingCard>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-secondary-900 dark:text-white">Rules</div>
                  <button onClick={addRetentionRule} disabled={!retentionEnabled} className="btn btn-primary px-4 py-2">
                    <Plus className="w-4 h-4" />
                    <span className="ml-2">New rule</span>
                  </button>
                </div>

                <div className="mt-4 divide-y divide-secondary-100 dark:divide-secondary-700 border border-secondary-200 dark:border-secondary-700 rounded-xl overflow-hidden">
                  {retentionRules.map((r) => (
                    <div key={r.id} className="p-4 bg-white dark:bg-secondary-800">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="font-semibold text-secondary-900 dark:text-white">{r.scope}</div>
                            <Pill>{r.type}</Pill>
                            <Pill>{r.days} days</Pill>
                          </div>
                          <div className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">UI-only: will be enforced server-side later.</div>
                        </div>
                        <button onClick={() => deleteRetentionRule(r.id)} disabled={!retentionEnabled} className="btn-ghost p-2" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-xs text-secondary-500 dark:text-secondary-400">
                  UI-only: backend later will apply retention jobs, legal holds, and exports.
                </div>
              </div>

              <div className="card p-5">
                <div className="text-sm font-semibold text-secondary-900 dark:text-white">Examples</div>
                <div className="mt-3 space-y-3 text-sm text-secondary-600 dark:text-secondary-300">
                  <div>
                    <Pill>DMs</Pill>
                    <div className="mt-2">Expire after 30 days for reduced risk.</div>
                  </div>
                  <div>
                    <Pill>Client spaces</Pill>
                    <div className="mt-2">Keep 90–180 days depending on contract requirements.</div>
                  </div>
                  <div>
                    <Pill>Files</Pill>
                    <div className="mt-2">Keep 365 days; purge temp uploads faster.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingCard({ icon: Icon, title, desc, children, disabled }) {
  return (
    <div className={`p-4 rounded-xl border ${disabled ? 'opacity-70' : ''} border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center">
          <Icon className="w-5 h-5 text-secondary-700 dark:text-secondary-200" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-secondary-900 dark:text-white">{title}</div>
          <div className="text-sm text-secondary-600 dark:text-secondary-300">{desc}</div>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
