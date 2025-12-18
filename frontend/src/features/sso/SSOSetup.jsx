import React, { useMemo, useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Link as LinkIcon,
  Globe,
  Download,
  Upload,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Users,
  Settings,
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

export default function SSOSetup() {
  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState('okta');
  const [domain, setDomain] = useState('company.com');
  const [verified, setVerified] = useState(false);
  const [enforceSso, setEnforceSso] = useState(false);

  const [saml, setSaml] = useState({
    ssoUrl: 'https://example.okta.com/app/teamos/sso/saml',
    entityId: 'urn:teamos:saml:entity',
    x509: 'MIID...FAKE...CERT...UIONLY',
  });

  const acsUrl = useMemo(() => 'https://localhost:5173/sso/saml/acs (UI-only)', []);
  const spEntityId = useMemo(() => 'urn:teamos:sp', []);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied');
    } catch {
      alert('Copy failed');
    }
  };

  const uploadMetadata = () => {
    alert('Upload metadata (UI-only)');
  };

  const downloadMetadata = () => {
    alert('Download metadata (UI-only)');
  };

  const verifyDomain = () => {
    setVerified(true);
    alert('Domain verified (UI-only)');
  };

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-bold text-secondary-900 dark:text-white">SSO / SAML</div>
            <div className="text-sm text-secondary-600 dark:text-secondary-300">
              UI-only: identity provider configuration (Okta/Azure AD/Google Workspace)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Pill tone={enabled ? 'success' : 'warn'}>{enabled ? 'Enabled' : 'Disabled'}</Pill>
            <Toggle enabled={enabled} onChange={setEnabled} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700/40">
            <div className="text-xs text-secondary-500 dark:text-secondary-400">Provider</div>
            <div className="mt-1 font-semibold text-secondary-900 dark:text-white">{provider.toUpperCase()}</div>
          </div>
          <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700/40">
            <div className="text-xs text-secondary-500 dark:text-secondary-400">Domain</div>
            <div className="mt-1 font-semibold text-secondary-900 dark:text-white">{domain}</div>
          </div>
          <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700/40">
            <div className="text-xs text-secondary-500 dark:text-secondary-400">Verification</div>
            <div className="mt-1">
              {verified ? (
                <Pill tone="success">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </Pill>
              ) : (
                <Pill tone="warn">
                  <span className="inline-flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Not verified
                  </span>
                </Pill>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-secondary-900 dark:text-white">Service Provider (TeamOS)</div>
            <Pill>SP</Pill>
          </div>

          <div className="mt-4 space-y-4">
            <Field label="ACS URL" hint="Paste into your IdP">
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={acsUrl}
                  className="flex-1 px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                />
                <button className="btn btn-secondary px-3 py-2" onClick={() => copy(acsUrl)} title="Copy">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </Field>

            <Field label="SP Entity ID" hint="Unique identifier for TeamOS">
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={spEntityId}
                  className="flex-1 px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                />
                <button className="btn btn-secondary px-3 py-2" onClick={() => copy(spEntityId)} title="Copy">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </Field>

            <div className="flex flex-wrap gap-2">
              <button className="btn btn-secondary px-4 py-2" onClick={downloadMetadata}>
                <Download className="w-4 h-4" />
                <span className="ml-2">Download metadata</span>
              </button>
              <button className="btn btn-secondary px-4 py-2" onClick={uploadMetadata}>
                <Upload className="w-4 h-4" />
                <span className="ml-2">Upload IdP metadata</span>
              </button>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-secondary-900 dark:text-white">Identity Provider (IdP)</div>
            <Pill>IdP</Pill>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4">
            <Field label="Provider">
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
              >
                <option value="okta">Okta</option>
                <option value="azure">Azure AD</option>
                <option value="google">Google Workspace</option>
              </select>
            </Field>

            <Field label="SSO URL">
              <input
                value={saml.ssoUrl}
                onChange={(e) => setSaml((s) => ({ ...s, ssoUrl: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
              />
            </Field>

            <Field label="IdP Entity ID">
              <input
                value={saml.entityId}
                onChange={(e) => setSaml((s) => ({ ...s, entityId: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
              />
            </Field>

            <Field label="X.509 Certificate" hint="Paste certificate for signature validation">
              <textarea
                value={saml.x509}
                onChange={(e) => setSaml((s) => ({ ...s, x509: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-secondary-900 dark:text-white">Domain verification</div>
            <Globe className="w-5 h-5 text-secondary-500 dark:text-secondary-300" />
          </div>

          <div className="mt-4 space-y-4">
            <Field label="Company domain">
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
              />
            </Field>

            <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-700/40">
              <div className="text-xs text-secondary-500 dark:text-secondary-400">DNS TXT record</div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="text-sm font-mono text-secondary-900 dark:text-white truncate">teamos-verification=abc123</div>
                <button className="btn btn-secondary px-3 py-2" onClick={() => copy('teamos-verification=abc123')}>
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 text-xs text-secondary-500 dark:text-secondary-400">Add this TXT record to verify domain ownership.</div>
            </div>

            <button className="btn btn-primary px-4 py-2" onClick={verifyDomain}>
              <ShieldCheck className="w-4 h-4" />
              <span className="ml-2">Verify domain</span>
            </button>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-secondary-900 dark:text-white">Access policies</div>
            <Settings className="w-5 h-5 text-secondary-500 dark:text-secondary-300" />
          </div>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-secondary-900 dark:text-white">Enforce SSO</div>
                <div className="text-sm text-secondary-600 dark:text-secondary-300">Require SSO for all members</div>
              </div>
              <Toggle enabled={enforceSso} onChange={setEnforceSso} />
            </div>

            <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700/40">
              <div className="flex items-start gap-2">
                <Users className="w-5 h-5 text-secondary-600 dark:text-secondary-200 mt-0.5" />
                <div>
                  <div className="font-semibold text-secondary-900 dark:text-white">SCIM provisioning</div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-300">Coming soon (UI-only)</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button className="btn btn-secondary px-4 py-2" onClick={() => alert('Generate SCIM token (UI-only)')}>
                      Generate token
                    </button>
                    <button className="btn btn-secondary px-4 py-2" onClick={() => alert('View SCIM docs (UI-only)')}>
                      Docs
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-secondary-500 dark:text-secondary-400">
              UI-only: backend later will validate SAML assertions, map users, enforce session policies, and SCIM.
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-secondary-500 dark:text-secondary-400">
        Tip: If you want, I can add provider-specific setup steps for Okta and Azure AD.
      </div>
    </div>
  );
}
