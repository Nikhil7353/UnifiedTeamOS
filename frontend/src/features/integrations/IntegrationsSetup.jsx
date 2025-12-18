import React, { useMemo, useState } from 'react';
import {
  Plug,
  Mail,
  Calendar,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  KeyRound,
  Copy,
  RefreshCw,
  Trash2,
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

function Card({ children }) {
  return <div className="card p-5">{children}</div>;
}

function Step({ n, title, desc, children }) {
  return (
    <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center text-secondary-700 dark:text-secondary-200 font-semibold">
          {n}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-secondary-900 dark:text-white">{title}</div>
          {desc && <div className="mt-1 text-sm text-secondary-600 dark:text-secondary-300">{desc}</div>}
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}

function ProviderButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl border text-sm transition-colors ${
        active
          ? 'border-primary-300 bg-primary-50/60 dark:border-primary-700 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300'
          : 'border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-200'
      }`}
    >
      {label}
    </button>
  );
}

export default function IntegrationsSetup() {
  const [active, setActive] = useState('email'); // email | calendar | storage

  const [email, setEmail] = useState({
    connected: false,
    provider: 'gmail',
    address: 'team@company.com',
    syncMode: 'imap',
  });

  const [calendar, setCalendar] = useState({
    connected: false,
    provider: 'google',
    scope: 'read_write',
  });

  const [storage, setStorage] = useState({
    connected: false,
    provider: 's3',
    bucket: 'teamos-files',
    region: 'ap-south-1',
  });

  const apps = useMemo(
    () => [
      {
        id: 'email',
        title: 'Email',
        desc: 'Connect Gmail/Outlook/IMAP for unified inbox and ticketing.',
        icon: Mail,
        status: email.connected ? 'Connected' : 'Not connected',
        tone: email.connected ? 'success' : 'warn',
      },
      {
        id: 'calendar',
        title: 'Calendar',
        desc: 'Connect calendars for meeting scheduling and reminders.',
        icon: Calendar,
        status: calendar.connected ? 'Connected' : 'Not connected',
        tone: calendar.connected ? 'success' : 'warn',
      },
      {
        id: 'storage',
        title: 'Storage',
        desc: 'Connect S3/Drive for file storage and sharing.',
        icon: HardDrive,
        status: storage.connected ? 'Connected' : 'Not connected',
        tone: storage.connected ? 'success' : 'warn',
      },
    ],
    [email.connected, calendar.connected, storage.connected]
  );

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied');
    } catch {
      alert('Copy failed');
    }
  };

  const connectEmail = () => {
    setEmail((e) => ({ ...e, connected: true }));
    alert('Email connected (UI-only)');
  };

  const disconnectEmail = () => {
    setEmail((e) => ({ ...e, connected: false }));
  };

  const connectCalendar = () => {
    setCalendar((c) => ({ ...c, connected: true }));
    alert('Calendar connected (UI-only)');
  };

  const disconnectCalendar = () => {
    setCalendar((c) => ({ ...c, connected: false }));
  };

  const connectStorage = () => {
    setStorage((s) => ({ ...s, connected: true }));
    alert('Storage connected (UI-only)');
  };

  const disconnectStorage = () => {
    setStorage((s) => ({ ...s, connected: false }));
  };

  const activeConfig = () => {
    if (active === 'email') return email;
    if (active === 'calendar') return calendar;
    return storage;
  };

  const isConnected = () => {
    const c = activeConfig();
    return Boolean(c.connected);
  };

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white flex items-center justify-center">
              <Plug className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-secondary-900 dark:text-white">Integrations</div>
              <div className="text-sm text-secondary-600 dark:text-secondary-300">UI-only connect flows (backend OAuth/IMAP/Graph later)</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Pill tone={isConnected() ? 'success' : 'warn'}>{isConnected() ? 'Connected' : 'Not connected'}</Pill>
            <button className="btn btn-secondary px-3 py-2" onClick={() => alert('Sync now (UI-only)')}>
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left: list */}
        <div className="xl:col-span-1 space-y-3">
          {apps.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                onClick={() => setActive(a.id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  active === a.id
                    ? 'border-primary-300 bg-primary-50/60 dark:border-primary-700 dark:bg-primary-900/10'
                    : 'border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-secondary-700 dark:text-secondary-200" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-secondary-900 dark:text-white">{a.title}</div>
                      <div className="text-xs text-secondary-600 dark:text-secondary-300">{a.desc}</div>
                    </div>
                  </div>
                  <Pill tone={a.tone}>{a.status}</Pill>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: details */}
        <div className="xl:col-span-2">
          {active === 'email' && (
            <div className="space-y-4">
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-secondary-900 dark:text-white">Email integration</div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-300">Connect an inbox to power Unified Inbox and Ticketing.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {email.connected ? (
                      <Pill tone="success">
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Connected
                        </span>
                      </Pill>
                    ) : (
                      <Pill tone="warn">
                        <span className="inline-flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Not connected
                        </span>
                      </Pill>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <ProviderButton active={email.provider === 'gmail'} onClick={() => setEmail((e) => ({ ...e, provider: 'gmail' }))} label="Gmail" />
                  <ProviderButton active={email.provider === 'outlook'} onClick={() => setEmail((e) => ({ ...e, provider: 'outlook' }))} label="Outlook" />
                  <ProviderButton active={email.provider === 'imap'} onClick={() => setEmail((e) => ({ ...e, provider: 'imap' }))} label="IMAP" />
                </div>

                <div className="mt-5 space-y-3">
                  <Step n={1} title="Choose a connection method" desc="OAuth (preferred) or IMAP/SMTP (legacy)">
                    <select
                      value={email.syncMode}
                      onChange={(e) => setEmail((x) => ({ ...x, syncMode: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                    >
                      <option value="imap">IMAP/SMTP</option>
                      <option value="oauth">OAuth</option>
                      <option value="graph">Microsoft Graph</option>
                    </select>
                  </Step>

                  <Step n={2} title="Connect inbox" desc="In backend we will redirect to provider auth">
                    <div className="flex items-center gap-2">
                      <input
                        value={email.address}
                        onChange={(e) => setEmail((x) => ({ ...x, address: e.target.value }))}
                        placeholder="inbox@company.com"
                        className="flex-1 px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                      />
                      <button className="btn btn-primary px-4 py-2" onClick={connectEmail}>
                        Connect
                      </button>
                    </div>
                  </Step>

                  <Step n={3} title="Webhook / callback URL" desc="Use for provider callbacks (UI-only)">
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value="https://localhost:5173/integrations/email/callback (UI-only)"
                        className="flex-1 px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                      />
                      <button className="btn btn-secondary px-3 py-2" onClick={() => copy('https://localhost:5173/integrations/email/callback')}>
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </Step>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="btn btn-secondary px-4 py-2" onClick={() => alert('Open provider setup docs (UI-only)')}>
                    <ExternalLink className="w-4 h-4" />
                    <span className="ml-2">Docs</span>
                  </button>
                  <button className="btn btn-secondary px-4 py-2" disabled={!email.connected} onClick={disconnectEmail}>
                    <Trash2 className="w-4 h-4" />
                    <span className="ml-2">Disconnect</span>
                  </button>
                </div>
              </Card>
            </div>
          )}

          {active === 'calendar' && (
            <div className="space-y-4">
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-secondary-900 dark:text-white">Calendar integration</div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-300">Schedule meetings and show availability (UI-only).</div>
                  </div>
                  <Pill tone={calendar.connected ? 'success' : 'warn'}>{calendar.connected ? 'Connected' : 'Not connected'}</Pill>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <ProviderButton active={calendar.provider === 'google'} onClick={() => setCalendar((c) => ({ ...c, provider: 'google' }))} label="Google" />
                  <ProviderButton active={calendar.provider === 'outlook'} onClick={() => setCalendar((c) => ({ ...c, provider: 'outlook' }))} label="Outlook" />
                </div>

                <div className="mt-5 space-y-3">
                  <Step n={1} title="Scopes" desc="Requested permissions">
                    <select
                      value={calendar.scope}
                      onChange={(e) => setCalendar((c) => ({ ...c, scope: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                    >
                      <option value="read">Read only</option>
                      <option value="read_write">Read + Write</option>
                    </select>
                  </Step>
                  <Step n={2} title="Connect" desc="OAuth flow will be implemented later">
                    <button className="btn btn-primary px-4 py-2" onClick={connectCalendar}>Connect calendar</button>
                  </Step>
                  <Step n={3} title="Callback URL" desc="Register in provider app (UI-only)">
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value="https://localhost:5173/integrations/calendar/callback (UI-only)"
                        className="flex-1 px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                      />
                      <button className="btn btn-secondary px-3 py-2" onClick={() => copy('https://localhost:5173/integrations/calendar/callback')}>
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </Step>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="btn btn-secondary px-4 py-2" onClick={() => alert('Provider console (UI-only)')}>
                    <KeyRound className="w-4 h-4" />
                    <span className="ml-2">Provider app</span>
                  </button>
                  <button className="btn btn-secondary px-4 py-2" disabled={!calendar.connected} onClick={disconnectCalendar}>
                    <Trash2 className="w-4 h-4" />
                    <span className="ml-2">Disconnect</span>
                  </button>
                </div>
              </Card>
            </div>
          )}

          {active === 'storage' && (
            <div className="space-y-4">
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-secondary-900 dark:text-white">Storage integration</div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-300">Configure object storage for uploads (UI-only).</div>
                  </div>
                  <Pill tone={storage.connected ? 'success' : 'warn'}>{storage.connected ? 'Connected' : 'Not connected'}</Pill>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <ProviderButton active={storage.provider === 's3'} onClick={() => setStorage((s) => ({ ...s, provider: 's3' }))} label="S3" />
                  <ProviderButton active={storage.provider === 'minio'} onClick={() => setStorage((s) => ({ ...s, provider: 'minio' }))} label="MinIO" />
                  <ProviderButton active={storage.provider === 'drive'} onClick={() => setStorage((s) => ({ ...s, provider: 'drive' }))} label="Google Drive" />
                </div>

                <div className="mt-5 space-y-3">
                  <Step n={1} title="Bucket / container" desc="Where uploaded files are stored">
                    <input
                      value={storage.bucket}
                      onChange={(e) => setStorage((s) => ({ ...s, bucket: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                    />
                  </Step>
                  <Step n={2} title="Region" desc="Used for URL generation">
                    <input
                      value={storage.region}
                      onChange={(e) => setStorage((s) => ({ ...s, region: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                    />
                  </Step>
                  <Step n={3} title="Connect" desc="Credentials and signing will be handled server-side later">
                    <button className="btn btn-primary px-4 py-2" onClick={connectStorage}>Connect storage</button>
                  </Step>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="btn btn-secondary px-4 py-2" onClick={() => alert('Test upload (UI-only)')}>
                    Test upload
                  </button>
                  <button className="btn btn-secondary px-4 py-2" disabled={!storage.connected} onClick={disconnectStorage}>
                    <Trash2 className="w-4 h-4" />
                    <span className="ml-2">Disconnect</span>
                  </button>
                </div>
              </Card>
            </div>
          )}

          <div className="mt-4 text-xs text-secondary-500 dark:text-secondary-400">
            UI-only: actual connections will require provider OAuth/IMAP/Graph credentials and backend endpoints.
          </div>
        </div>
      </div>
    </div>
  );
}
