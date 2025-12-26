import React, { useMemo, useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Moon,
  Shield,
  Plug,
  CreditCard,
  KeyRound,
  ScrollText,
  BarChart3,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Save,
} from 'lucide-react';
import BillingPlans from '../billing/BillingPlans';
import SSOSetup from '../sso/SSOSetup';
import IntegrationsSetup from '../integrations/IntegrationsSetup';
import AuditExport from '../audit/AuditExport';
import UsageAnalytics from '../analytics/UsageAnalytics';
import PolicyTemplates from '../policies/PolicyTemplates';
import ProfilePictureUpload from '../../components/ProfilePictureUpload';
import { getCurrentUserProfile } from '../../services/profileService';

function SectionCard({ active, onClick, icon: Icon, title, desc, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-colors ${
        active
          ? 'border-primary-300 bg-primary-50/60 dark:border-primary-700 dark:bg-primary-900/10'
          : 'border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center text-secondary-700 dark:text-secondary-200">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold text-secondary-900 dark:text-white truncate">{title}</div>
            {badge && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-200 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200">
                {badge}
              </span>
            )}
          </div>
          <div className="mt-1 text-sm text-secondary-600 dark:text-secondary-300">{desc}</div>
        </div>
        <ChevronRight className="w-4 h-4 text-secondary-300 dark:text-secondary-600 mt-1" />
      </div>
    </button>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">{label}</div>
      {hint && <div className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">{hint}</div>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-600'
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

export default function SettingsHub({ currentUser }) {
  const [active, setActive] = useState('home');

  const [profile, setProfile] = useState({
    fullName: currentUser?.full_name || 'Nikhil',
    username: currentUser?.username || 'nikhil',
    email: currentUser?.email || 'nikhil@company.com',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    desktop: true,
    mentionsOnly: false,
  });

  const [appearance, setAppearance] = useState({
    compact: false,
    reduceMotion: false,
  });

  const [security, setSecurity] = useState({
    mfaRequired: false,
    sessionTimeout: '30',
  });

  const sections = useMemo(
    () => [
      {
        id: 'profile',
        title: 'Profile',
        desc: 'Identity and personal details',
        icon: User,
      },
      {
        id: 'notifications',
        title: 'Notifications',
        desc: 'Email, desktop, and mention preferences',
        icon: Bell,
      },
      {
        id: 'appearance',
        title: 'Appearance',
        desc: 'Theme and layout preferences',
        icon: Moon,
      },
      {
        id: 'security',
        title: 'Security',
        desc: 'MFA, sessions, and security controls',
        icon: Shield,
      },
      {
        id: 'integrations',
        title: 'Integrations',
        desc: 'Connect Email, Calendar, and Storage',
        icon: Plug,
      },
      {
        id: 'policies',
        title: 'Policy templates',
        desc: 'Apply preset security configurations',
        icon: Sparkles,
      },
      {
        id: 'sso',
        title: 'SSO / SAML',
        desc: 'Identity provider configuration',
        icon: KeyRound,
      },
      {
        id: 'billing',
        title: 'Billing',
        desc: 'Plans, invoices, and usage',
        icon: CreditCard,
      },
      {
        id: 'audit',
        title: 'Audit export',
        desc: 'Compliance exports and download history',
        icon: ScrollText,
      },
      {
        id: 'analytics',
        title: 'Usage analytics',
        desc: 'Dashboards, quotas, and trends',
        icon: BarChart3,
      },
    ],
    []
  );

  const saveMock = () => {
    alert('Saved (UI-only)');
  };

  return (
    <div className="flex h-full bg-secondary-50 dark:bg-secondary-900">
      {/* Left: sections */}
      <div className="w-[420px] shrink-0 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 flex flex-col">
        <div className="p-5 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-700 text-white flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-secondary-900 dark:text-white">Settings</div>
                <div className="text-xs text-secondary-500 dark:text-secondary-400">Global settings hub (UI-first)</div>
              </div>
            </div>

            <button onClick={() => setActive('home')} className="btn btn-secondary px-3 py-2" title="Home">
              Home
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-2">
          <div className="card p-4">
            <div className="text-xs text-secondary-500 dark:text-secondary-400">Signed in as</div>
            <div className="mt-1 font-semibold text-secondary-900 dark:text-white">{currentUser?.username || '—'}</div>
            <div className="text-xs text-secondary-500 dark:text-secondary-400">{currentUser?.email || '—'}</div>
          </div>

          <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mt-3">Sections</div>
          {sections.map((s) => (
            <SectionCard
              key={s.id}
              active={active === s.id}
              onClick={() => setActive(s.id)}
              icon={s.icon}
              title={s.title}
              desc={s.desc}
              badge={s.badge}
            />
          ))}
        </div>
      </div>

      {/* Right: details */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-2xl font-bold text-secondary-900 dark:text-white truncate">
                {active === 'home' ? 'Settings home' : sections.find((s) => s.id === active)?.title}
              </div>
              <div className="mt-1 text-sm text-secondary-600 dark:text-secondary-300">
                {active === 'home'
                  ? 'Pick a section on the left to configure TeamOS.'
                  : sections.find((s) => s.id === active)?.desc}
              </div>
            </div>
            {active !== 'home' && (
              <div className="flex items-center gap-2">
                <button onClick={saveMock} className="btn btn-primary px-4 py-2">
                  <Save className="w-4 h-4" />
                  <span className="ml-2">Save</span>
                </button>
                <button className="btn btn-secondary px-3 py-2" title="Open docs" onClick={() => alert('Docs (UI-only)')}>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {active === 'home' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card p-5">
                <div className="font-semibold text-secondary-900 dark:text-white">Recommended setup</div>
                <div className="mt-3 text-sm text-secondary-600 dark:text-secondary-300 space-y-2">
                  <div>- Enable Security policies (E2E/DLP/Retention)</div>
                  <div>- Connect Email integration</div>
                  <div>- Configure Notifications preferences</div>
                </div>
              </div>
              <div className="card p-5">
                <div className="font-semibold text-secondary-900 dark:text-white">Workspace defaults</div>
                <div className="mt-3 text-sm text-secondary-600 dark:text-secondary-300">UI-only: org-wide settings will be enforced after backend APIs are added.</div>
              </div>
            </div>
          )}

          {active === 'profile' && (
            <div className="card p-6 max-w-2xl">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
                <ProfilePictureUpload
                  userId={currentUser?.id}
                  currentPic={currentUser?.profile_pic}
                  onUpload={(newPic) => {
                    // Update currentUser with new profile picture
                    currentUser.profile_pic = newPic;
                    // Force re-render
                    setActive(active);
                  }}
                  onDelete={() => {
                    // Remove profile picture from currentUser
                    currentUser.profile_pic = null;
                    // Force re-render
                    setActive(active);
                  }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full name">
                  <input
                    value={profile.fullName}
                    onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                  />
                </Field>
                <Field label="Username">
                  <input
                    value={profile.username}
                    onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                  />
                </Field>
                <Field label="Email">
                  <input
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                  />
                </Field>
                <Field label="Time zone" hint="Used for timestamps and reminders">
                  <select className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white">
                    <option>Asia/Kolkata</option>
                    <option>UTC</option>
                    <option>America/Los_Angeles</option>
                  </select>
                </Field>
              </div>
              <div className="mt-6 text-xs text-secondary-500 dark:text-secondary-400">UI-only: profile persistence will be backed by API later.</div>
            </div>
          )}

          {active === 'notifications' && (
            <div className="card p-6 max-w-2xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-secondary-900 dark:text-white">Email notifications</div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-300">Send activity alerts by email</div>
                </div>
                <Toggle enabled={notifications.email} onChange={(v) => setNotifications((n) => ({ ...n, email: v }))} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-secondary-900 dark:text-white">Desktop notifications</div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-300">Show browser notifications</div>
                </div>
                <Toggle enabled={notifications.desktop} onChange={(v) => setNotifications((n) => ({ ...n, desktop: v }))} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-secondary-900 dark:text-white">Mentions only</div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-300">Only notify when you are mentioned</div>
                </div>
                <Toggle enabled={notifications.mentionsOnly} onChange={(v) => setNotifications((n) => ({ ...n, mentionsOnly: v }))} />
              </div>

              <div className="mt-2 text-xs text-secondary-500 dark:text-secondary-400">UI-only: preference storage and delivery will be added later.</div>
            </div>
          )}

          {active === 'appearance' && (
            <div className="card p-6 max-w-2xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-secondary-900 dark:text-white">Compact density</div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-300">Tighter spacing for lists</div>
                </div>
                <Toggle enabled={appearance.compact} onChange={(v) => setAppearance((a) => ({ ...a, compact: v }))} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-secondary-900 dark:text-white">Reduce motion</div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-300">Minimize animations</div>
                </div>
                <Toggle enabled={appearance.reduceMotion} onChange={(v) => setAppearance((a) => ({ ...a, reduceMotion: v }))} />
              </div>

              <div className="text-xs text-secondary-500 dark:text-secondary-400">UI-only: global theme settings are partially implemented (dark mode toggle in sidebar).</div>
            </div>
          )}

          {active === 'security' && (
            <div className="card p-6 max-w-2xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-secondary-900 dark:text-white">Require MFA for admins</div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-300">Enforce MFA at org level</div>
                </div>
                <Toggle enabled={security.mfaRequired} onChange={(v) => setSecurity((s) => ({ ...s, mfaRequired: v }))} />
              </div>

              <Field label="Session timeout" hint="Auto sign-out after inactivity">
                <select
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity((s) => ({ ...s, sessionTimeout: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="240">4 hours</option>
                </select>
              </Field>

              <div className="text-xs text-secondary-500 dark:text-secondary-400">UI-only: for full security policies see the dedicated Security tab.</div>
            </div>
          )}

          {active === 'integrations' && (
            <div className="max-w-5xl">
              <IntegrationsSetup />
            </div>
          )}

          {active === 'audit' && (
            <div className="max-w-5xl">
              <AuditExport />
            </div>
          )}

          {active === 'analytics' && (
            <div className="max-w-5xl">
              <UsageAnalytics />
            </div>
          )}

          {active === 'policies' && (
            <div className="max-w-5xl">
              <PolicyTemplates />
            </div>
          )}

          {active === 'billing' && (
            <div className="max-w-5xl">
              <BillingPlans />
            </div>
          )}

          {active === 'sso' && (
            <div className="max-w-5xl">
              <SSOSetup />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
