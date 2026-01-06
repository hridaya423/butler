
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '../ui/button';
import { Link2, Unlink, AlertCircle, Loader2, Shield } from 'lucide-react';
import type { Provider } from '@supabase/supabase-js';
import { SparxConnect } from '@/components/education/sparx-connect';

interface Identity {
  id: string;
  provider: string;
  email?: string;
  created_at: string;
}

const AVAILABLE_PROVIDERS = [
  {
    id: 'notion' as Provider,
    name: 'Notion',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.214V6.354c0-.653-.28-.98-.747-.933l-15.177.887c-.56.047-.748.374-.748.98zm14.337.653c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
      </svg>
    ),
    description: 'Sync your Notion workspace and databases',
    color: 'from-gray-800 to-black',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    isCredentialBased: false,
  },
  {
    id: 'slack' as Provider,
    name: 'Slack',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
      </svg>
    ),
    description: 'Access workspace notifications and messages',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    isCredentialBased: false,
  },
  {
    id: 'github' as Provider,
    name: 'GitHub',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
    description: 'Sync repositories, PRs, and issues',
    color: 'from-gray-700 to-gray-900',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    isCredentialBased: false,
  },
  {
    id: 'bromcom' as any,
    name: 'Bromcom',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    description: 'Sync homework assignments from Bromcom VLE',
    color: 'from-blue-600 to-indigo-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    isCredentialBased: true,
  },
  {
    id: 'sparx' as any,
    name: 'Sparx Maths',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4H6v-2h4V7h2v4h4v2h-4v4z" />
      </svg>
    ),
    description: 'Sync homework from Sparx Maths',
    color: 'from-purple-600 to-indigo-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    isCredentialBased: true,
  },
  {
    id: 'google' as Provider,
    name: 'Google',
    icon: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
    description: 'Access Gmail messages and manage your inbox',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    isCredentialBased: false,
  },
];

export function ConnectedAccounts() {
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const [slackSyncStatus, setSlackSyncStatus] = useState<boolean>(false);
  const [bromcomConnected, setBromcomConnected] = useState<boolean>(false);
  const [showBromcomDialog, setShowBromcomDialog] = useState(false);
  const [bromcomEmail, setBromcomEmail] = useState('');
  const [bromcomPassword, setBromcomPassword] = useState('');
  const [bromcomSaving, setBromcomSaving] = useState(false);

  const [sparxConnected, setSparxConnected] = useState<boolean>(false);
  const [showSparxDialog, setShowSparxDialog] = useState(false);

  useEffect(() => {
    loadIdentities();
  }, []);

  const loadIdentities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.identities) {
        setIdentities(user.identities as Identity[]);
      }

      const { data: slackProfile } = await supabase
        .from('slack_profiles')
        .select('access_token')
        .eq('user_id', user?.id)
        .single();

      setSlackSyncStatus(!!slackProfile?.access_token);

      const { data: bromcomProfile } = await supabase
        .from('bromcom_profiles')
        .select('email_encrypted, last_synced_at')
        .eq('user_id', user?.id)
        .single();

      setBromcomConnected(!!bromcomProfile?.email_encrypted);

      const { data: sparxProfile } = await supabase
        .from('sparx_profiles')
        .select('encrypted_username, last_synced_at')
        .eq('user_id', user?.id)
        .single();

      setSparxConnected(!!sparxProfile?.encrypted_username);

    } catch (err) {
      setError('Failed to load connected accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleBromcomSave = async () => {
    if (!bromcomEmail || !bromcomPassword) {
      setError('Please enter your Bromcom credentials');
      return;
    }

    setBromcomSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/sync/bromcom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: bromcomEmail,
          password: bromcomPassword,
          saveCredentials: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save credentials');
      }

      setBromcomConnected(true);
      setShowBromcomDialog(false);
      setBromcomEmail('');
      setBromcomPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to save Bromcom credentials');
    } finally {
      setBromcomSaving(false);
    }
  };

  const handleBromcomDisconnect = async () => {
    if (!confirm('Remove saved Bromcom credentials?')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('bromcom_profiles')
        .delete()
        .eq('user_id', user?.id);

      setBromcomConnected(false);
    } catch (err) {
      setError('Failed to remove Bromcom credentials');
    }
  };

  const handleSparxDisconnect = async () => {
    if (!confirm('Remove saved Sparx Maths credentials?')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('sparx_profiles')
        .delete()
        .eq('user_id', user?.id);

      setSparxConnected(false);
    } catch (err) {
      setError('Failed to remove Sparx credentials');
    }
  };

  const handleConnect = async (provider: Provider | string) => {
    setConnecting(provider);
    setError(null);

    try {
      const options: any = {
        redirectTo: `${window.location.origin}/dashboard?section=settings&tab=accounts&linked=${provider}`,
      };

      if (provider === 'google') {
        options.scopes = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify';
      }

      if (provider === 'github') {
        options.scopes = 'repo read:user user:email';
      }

      if (provider === 'notion') {
        options.queryParams = {
          owner: 'user',
        };
      }

      const { data, error: linkError } = await supabase.auth.linkIdentity({
        provider,
        options,
      });

      if (linkError) {
        throw linkError;
      }

    } catch (err: any) {
      setError(err.message || `Failed to connect ${provider}`);
      setConnecting(null);
    }
  };

  const handleDisconnect = async (identityId: string, provider: string) => {
    if (identities.length === 1) {
      setError('Cannot disconnect your only login method. Add another provider first.');
      return;
    }

    if (!confirm(`Disconnect ${provider}? You can reconnect later.`)) {
      return;
    }

    try {
      const { error: unlinkError } = await supabase.auth.unlinkIdentity({
        identity_id: identityId,
      });

      if (unlinkError) {
        throw unlinkError;
      }

      await loadIdentities();
    } catch (err: any) {
      setError(err.message || `Failed to disconnect ${provider}`);
    }
  };

  const isConnected = (providerId: string) => {
    return identities.some((identity) => identity.provider === providerId);
  };

  const getIdentity = (providerId: string) => {
    return identities.find((identity) => identity.provider === providerId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900 mb-0.5">Connection Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid gap-3">
        {AVAILABLE_PROVIDERS.map((provider) => {
          const isBromcom = provider.id === 'bromcom';
          const isSparx = provider.id === 'sparx';
          const isCredentialBased = isBromcom || isSparx;
          const connected = isBromcom ? bromcomConnected : isSparx ? sparxConnected : isConnected(provider.id);
          const identity = getIdentity(provider.id);
          const isConnecting = connecting === provider.id;

          return (
            <div
              key={provider.id}
              className={`group relative rounded-xl border transition-all duration-200 overflow-hidden ${connected
                ? 'bg-white border-neutral-200 shadow-sm'
                : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center p-2.5 ${provider.bgColor} border ${provider.borderColor}`}>
                      <div className={provider.id === 'slack' ? 'text-[#4A154B]' : provider.id === 'github' ? 'text-[#181717]' : provider.id === 'bromcom' ? 'text-blue-700' : provider.id === 'sparx' ? 'text-purple-700' : ''}>
                        {provider.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-base font-semibold text-neutral-900">
                          {provider.name}
                        </h3>
                        {connected && (
                          <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {isBromcom ? 'Saved' : 'Connected'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">
                        {provider.description}
                      </p>
                      {connected && identity?.email && !isBromcom && (
                        <p className="text-xs text-neutral-500 font-medium bg-neutral-100 inline-block px-2 py-1 rounded-md">
                          {identity.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    {isCredentialBased ? (
                      connected ? (
                        <Button
                          onClick={() => {
                            if (isBromcom) handleBromcomDisconnect();
                            else if (isSparx) handleSparxDisconnect();
                          }}
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-red-200 font-medium"
                        >
                          <Unlink className="w-4 h-4" />
                          Remove
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            if (isBromcom) setShowBromcomDialog(true);
                            else if (isSparx) setShowSparxDialog(true);
                          }}
                          size="sm"
                          className="gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium shadow-sm"
                        >
                          <Link2 className="w-4 h-4" />
                          Connect
                        </Button>
                      )
                    ) : connected ? (
                      <>
                        {provider.id === 'slack' && !slackSyncStatus && (
                          <Button
                            onClick={() => window.location.href = '/api/slack/auth'}
                            size="sm"
                            className="gap-2 text-amber-700 bg-amber-50 border-2 border-amber-200 hover:bg-amber-100 font-medium shadow-sm"
                          >
                            <AlertCircle className="w-4 h-4" />
                            Enable Sync
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDisconnect(identity!.id, provider.name)}
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-red-200 font-medium"
                        >
                          <Unlink className="w-4 h-4" />
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleConnect(provider.id)}
                        disabled={isConnecting}
                        size="sm"
                        className="gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium shadow-sm"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Link2 className="w-4 h-4" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {connected && (
                <div className={`h-1 w-full bg-gradient-to-r ${provider.color}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${identities.length > 0 || bromcomConnected ? 'bg-green-500' : 'bg-neutral-300'}`} />
          <span className="text-sm font-semibold text-neutral-900">
            {identities.length + (bromcomConnected ? 1 : 0)}
          </span>
          <span className="text-sm text-neutral-500">
            {(identities.length + (bromcomConnected ? 1 : 0)) === 1 ? 'account connected' : 'accounts connected'}
          </span>
        </div>
      </div>

      {}
      {showBromcomDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={() => !bromcomSaving && setShowBromcomDialog(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-[101] w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => !bromcomSaving && setShowBromcomDialog(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              ✕
            </button>

            <div className="space-y-2 pr-8">
              <h2 className="text-lg font-semibold text-gray-900">
                Connect Bromcom
              </h2>
              <p className="text-sm text-gray-500">
                Enter your Bromcom VLE credentials. They will be encrypted and saved securely.
              </p>
            </div>

            <div className="space-y-4 mt-6">
              <div>
                <label htmlFor="bromcom-email" className="block text-sm font-medium text-gray-700 mb-2">
                  School Email
                </label>
                <input
                  id="bromcom-email"
                  type="email"
                  value={bromcomEmail}
                  onChange={(e) => setBromcomEmail(e.target.value)}
                  placeholder="you@school.com"
                  disabled={bromcomSaving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="bromcom-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="bromcom-password"
                  type="password"
                  value={bromcomPassword}
                  onChange={(e) => setBromcomPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={bromcomSaving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  Your credentials are encrypted before storage and never shared.
                </p>
              </div>

              <Button
                onClick={handleBromcomSave}
                disabled={bromcomSaving}
                className="w-full"
              >
                {bromcomSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Save & Sync"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {}
      {showSparxDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={() => setShowSparxDialog(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            <button
              onClick={() => setShowSparxDialog(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 z-10"
            >
              ✕
            </button>
            <SparxConnect onConnected={() => {
              setSparxConnected(true);
              setShowSparxDialog(false);
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
