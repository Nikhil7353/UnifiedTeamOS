import React, { useMemo, useState } from 'react';
import {
  ShieldCheck,
  Users,
  UserCog,
  ScrollText,
  Settings,
  Plus,
  Search,
  MoreVertical,
  KeyRound,
  Lock,
  Eye,
  Ban,
  CheckCircle2,
  AlertCircle,
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

export default function AdminPanel({ currentUser }) {
  const [tab, setTab] = useState('users'); // users | roles | audit | settings
  const [query, setQuery] = useState('');

  const [users, setUsers] = useState([
    { id: 1, username: 'nikhil', email: 'nikhil@company.com', role: 'owner', status: 'active', mfa: true },
    { id: 2, username: 'asha', email: 'asha@company.com', role: 'admin', status: 'active', mfa: false },
    { id: 3, username: 'rahul', email: 'rahul@company.com', role: 'member', status: 'active', mfa: false },
    { id: 4, username: 'sarah', email: 'sarah@client.com', role: 'guest', status: 'invited', mfa: false },
  ]);

  const [roles] = useState([
    { id: 'owner', name: 'Owner', perms: ['all'], description: 'Full access to org and billing.' },
    { id: 'admin', name: 'Admin', perms: ['manage_users', 'manage_channels', 'manage_policies'], description: 'Manage users and settings.' },
    { id: 'member', name: 'Member', perms: ['chat', 'tasks', 'docs'], description: 'Standard workspace access.' },
    { id: 'guest', name: 'Guest', perms: ['chat_limited'], description: 'Limited access for externals.' },
  ]);

  const [audit] = useState([
    { id: 1, at: '10m ago', actor: 'nikhil', action: 'Updated RBAC policy', severity: 'info' },
    { id: 2, at: '1h ago', actor: 'asha', action: 'Invited user sarah@client.com', severity: 'warn' },
    { id: 3, at: '2d ago', actor: 'system', action: 'Password policy enforced', severity: 'info' },
    { id: 4, at: '5d ago', actor: 'nikhil', action: 'Disabled Join-by-name (UI)', severity: 'info' },
  ]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => (u.username + ' ' + u.email + ' ' + u.role).toLowerCase().includes(q));
  }, [users, query]);

  const inviteUser = () => {
    const email = prompt('Invite email');
    if (!email) return;
    const username = email.split('@')[0];
    setUsers((prev) => [
      { id: Math.max(...prev.map((u) => u.id)) + 1, username, email, role: 'guest', status: 'invited', mfa: false },
      ...prev,
    ]);
  };

  const toggleUserStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' }
          : u
      )
    );
  };

  const setUserRole = (id) => {
    const role = prompt('Set role: owner | admin | member | guest');
    if (!role) return;
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  return (
    <div className="flex h-full bg-secondary-50 dark:bg-secondary-900">
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-700 text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold text-secondary-900 dark:text-white truncate">Admin</div>
                  <div className="text-sm text-secondary-500 dark:text-secondary-400">
                    UI-first admin panel (backend policies later)
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <TabButton active={tab === 'users'} onClick={() => setTab('users')} icon={Users} label="Users" />
                <TabButton active={tab === 'roles'} onClick={() => setTab('roles')} icon={UserCog} label="Roles" />
                <TabButton active={tab === 'audit'} onClick={() => setTab('audit')} icon={ScrollText} label="Audit" />
                <TabButton active={tab === 'settings'} onClick={() => setTab('settings')} icon={Settings} label="Settings" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {tab === 'users' && (
                <button onClick={inviteUser} className="btn btn-primary px-4 py-2">
                  <Plus className="w-4 h-4" />
                  <span className="ml-2 hidden sm:inline">Invite</span>
                </button>
              )}
            </div>
          </div>

          {(tab === 'users' || tab === 'audit') && (
            <div className="mt-4 relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tab === 'users' ? 'Search users...' : 'Search audit...'}
                className="w-full pl-10 pr-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-auto p-6">
          {tab === 'users' && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
                <div className="font-semibold text-secondary-900 dark:text-white">Users</div>
                <div className="text-xs text-secondary-500 dark:text-secondary-400">Mocked — RBAC backend later</div>
              </div>

              <div className="divide-y divide-secondary-100 dark:divide-secondary-700">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white flex items-center justify-center font-semibold">
                      {u.username.slice(0, 1).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-secondary-900 dark:text-white truncate">{u.username}</div>
                          <div className="text-sm text-secondary-600 dark:text-secondary-300 truncate">{u.email}</div>
                        </div>
                        <button className="btn-ghost p-2" title="More">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Pill>{u.role}</Pill>
                        {u.status === 'active' && <Pill tone="success">Active</Pill>}
                        {u.status === 'invited' && <Pill tone="warn">Invited</Pill>}
                        {u.status === 'disabled' && <Pill tone="danger">Disabled</Pill>}
                        <Pill>
                          <span className="inline-flex items-center gap-1">
                            <KeyRound className="w-3.5 h-3.5" />
                            MFA: {u.mfa ? 'On' : 'Off'}
                          </span>
                        </Pill>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button onClick={() => setUserRole(u.id)} className="btn btn-secondary px-4 py-2">
                          Change role
                        </button>
                        <button onClick={() => toggleUserStatus(u.id)} className="btn btn-secondary px-4 py-2">
                          {u.status === 'disabled' ? 'Enable' : 'Disable'}
                        </button>
                        <button className="btn btn-secondary px-4 py-2" title="View profile (soon)">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="p-6 text-sm text-secondary-500 dark:text-secondary-400">No users found.</div>
                )}
              </div>
            </div>
          )}

          {tab === 'roles' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {roles.map((r) => (
                <div key={r.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-bold text-secondary-900 dark:text-white">{r.name}</div>
                      <div className="text-sm text-secondary-600 dark:text-secondary-300">{r.description}</div>
                    </div>
                    <Pill>{r.id}</Pill>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Permissions</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {r.perms.map((p) => (
                        <Pill key={p}>{p}</Pill>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-secondary-500 dark:text-secondary-400">
                    UI-only: role editing will be enabled with backend RBAC policies later.
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'audit' && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
                <div className="font-semibold text-secondary-900 dark:text-white">Audit log</div>
                <div className="text-xs text-secondary-500 dark:text-secondary-400">Mocked</div>
              </div>

              <div className="divide-y divide-secondary-100 dark:divide-secondary-700">
                {audit
                  .filter((a) => {
                    const q = query.trim().toLowerCase();
                    if (!q) return true;
                    return (a.actor + ' ' + a.action).toLowerCase().includes(q);
                  })
                  .map((a) => (
                    <div key={a.id} className="p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center">
                        {a.severity === 'warn' ? (
                          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-300" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-secondary-600 dark:text-secondary-200" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-secondary-900 dark:text-white truncate">{a.action}</div>
                          <div className="text-xs text-secondary-500 dark:text-secondary-400">{a.at}</div>
                        </div>
                        <div className="mt-1 text-sm text-secondary-600 dark:text-secondary-300">Actor: {a.actor}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {tab === 'settings' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="card p-5">
                <div className="text-lg font-bold text-secondary-900 dark:text-white">Security</div>
                <div className="mt-3 space-y-3">
                  <SettingRow icon={Lock} title="Password policy" desc="Minimum length, complexity, rotation" value="Enforced" />
                  <SettingRow icon={KeyRound} title="MFA requirement" desc="Require MFA for admins" value="Recommended" />
                  <SettingRow icon={Ban} title="IP allowlist" desc="Restrict access by IP (enterprise)" value="Coming soon" />
                </div>
              </div>

              <div className="card p-5">
                <div className="text-lg font-bold text-secondary-900 dark:text-white">Organization</div>
                <div className="mt-3 space-y-3">
                  <SettingRow icon={Users} title="Workspace name" desc="Display name in sidebar" value="TeamOS" />
                  <SettingRow icon={ShieldCheck} title="RBAC" desc="Roles and permissions model" value="Enabled" />
                  <SettingRow icon={Settings} title="Integrations" desc="Email, calendar, SSO" value="UI-first" />
                </div>
              </div>

              <div className="text-xs text-secondary-500 dark:text-secondary-400">
                UI-only: settings will be stored and enforced once backend admin APIs are added.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} className={`btn px-4 py-2 ${active ? 'btn-primary' : 'btn-secondary'}`}>
      <Icon className="w-4 h-4" />
      <span className="ml-2">{label}</span>
    </button>
  );
}

function SettingRow({ icon: Icon, title, desc, value }) {
  return (
    <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700/40">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-600 flex items-center justify-center">
          <Icon className="w-5 h-5 text-secondary-600 dark:text-secondary-200" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-secondary-900 dark:text-white">{title}</div>
          <div className="text-sm text-secondary-600 dark:text-secondary-300">{desc}</div>
          <div className="mt-2">
            <Pill>{value}</Pill>
          </div>
        </div>
      </div>
    </div>
  );
}
