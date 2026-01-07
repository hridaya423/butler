
"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type ToastFn = typeof toast & {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
};

const toastTyped = toast as ToastFn;

export function UniversalSyncButton({ onSyncComplete }: { onSyncComplete?: () => void }) {
    const [syncing, setSyncing] = useState(false);

    const handleSync = async () => {
        setSyncing(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setSyncing(false);
            return;
        }

        try {
            const promises = [];

            const isGitHubConnected = user.identities?.some((id: any) => id.provider === 'github');
            if (isGitHubConnected) {
                promises.push(
                    fetch('/api/github/sync', { method: 'POST' })
                        .then(async res => {
                            if (res.status === 401 || res.status === 403) {
                                throw new Error('REAUTH_GITHUB');
                            }

                            const data = await res.json();
                            if (data.error) {
                                const errorLower = data.error.toLowerCase();
                                if (errorLower.includes('token') || errorLower.includes('expired') || errorLower.includes('invalid') || errorLower.includes('unauthorized') || errorLower.includes('401') || errorLower.includes('403')) {
                                    throw new Error('REAUTH_GITHUB');
                                }
                                throw new Error(`GitHub: ${data.error}`);
                            }
                            return 'GitHub';
                        })
                );
            }

            const { data: slackProfile } = await supabase
                .from('slack_profiles')
                .select('access_token')
                .eq('user_id', user.id)
                .single();

            if (slackProfile?.access_token) {
                promises.push(
                    fetch('/api/slack/sync', { method: 'POST' })
                        .then(async res => {
                            if (res.status === 401 || res.status === 403) {
                                throw new Error('REAUTH_SLACK');
                            }

                            const data = await res.json();
                            if (data.error) {
                                const errorLower = data.error.toLowerCase();
                                if (errorLower.includes('token') || errorLower.includes('expired') || errorLower.includes('invalid') || errorLower.includes('unauthorized') || errorLower.includes('401') || errorLower.includes('403')) {
                                    throw new Error('REAUTH_SLACK');
                                }
                                throw new Error(`Slack: ${data.error}`);
                            }
                            return 'Slack';
                        })
                );
            }

            const { data: notionProfile } = await supabase
                .from('notion_profiles')
                .select('access_token, default_database_id')
                .eq('user_id', user.id)
                .single();

            if (notionProfile?.access_token && notionProfile?.default_database_id) {
                promises.push(
                    fetch('/api/notion/sync', { method: 'POST' })
                        .then(async res => {
                            if (res.status === 401 || res.status === 403) {
                                throw new Error('REAUTH_NOTION');
                            }
                            const data = await res.json();
                            if (data.error) {
                                throw new Error(`Notion: ${data.error}`);
                            }
                            return 'Notion';
                        })
                );
            }

            const { data: bromcomProfile } = await supabase
                .from('bromcom_profiles')
                .select('email_encrypted')
                .eq('user_id', user.id)
                .single();

            if (bromcomProfile?.email_encrypted) {
                promises.push(
                    fetch('/api/sync/bromcom', { method: 'POST' })
                        .then(async res => {
                            const data = await res.json();
                            if (data.error) {
                                if (data.needsCredentials) {
                                    throw new Error('Bromcom: Credentials needed');
                                }
                                throw new Error(`Bromcom: ${data.error}`);
                            }
                            return 'Bromcom';
                        })
                );
            }

            if (promises.length === 0) {
                toastTyped.info("No connected accounts to sync");
                setSyncing(false);
                return;
            }

            const results = await Promise.allSettled(promises);

            const success = results
                .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
                .map(r => r.value);

            const errors = results
                .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
                .map(r => r.reason.message);

            const needsGitHubReauth = errors.some(e => e === 'REAUTH_GITHUB');
            const needsSlackReauth = errors.some(e => e === 'REAUTH_SLACK');

            if (needsGitHubReauth || needsSlackReauth) {
                const providerName = needsGitHubReauth ? 'GitHub' : 'Slack';
                const providerKey = needsGitHubReauth ? 'github' : 'slack';
                toast(`${providerName} token expired`, {
                    description: 'Your session has expired. Please re-authenticate to continue syncing.',
                    action: {
                        label: 'Re-authenticate',
                        onClick: async () => {
                            const { data, error } = await supabase.auth.signInWithOAuth({
                                provider: providerKey as 'github' | 'slack',
                                options: {
                                    redirectTo: `${window.location.origin}/auth/callback`,
                                    scopes: providerKey === 'github' ? 'repo read:user user:email' : 'channels:read chat:write',
                                    skipBrowserRedirect: false
                                }
                            });
                            if (error) {
                                toastTyped.error('Failed to start re-authentication');
                            } else if (data?.url) {
                                window.location.href = data.url;
                            }
                        }
                    },
                    duration: 10000
                });
            } else {
                if (success.length > 0) {
                    toastTyped.success(`Synced: ${success.join(', ')}`);
                }

                if (errors.length > 0) {
                    toastTyped.error(`Failed: ${errors.join(', ')}`);
                }
            }

            window.dispatchEvent(new CustomEvent('butler:sync-complete'));

            if (onSyncComplete) {
                onSyncComplete();
            }

        } catch (err) {
            toastTyped.error("Sync failed");
        } finally {
            setSyncing(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className="gap-2 h-9 text-xs font-medium bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300 transition-all shadow-sm"
            onClick={handleSync}
            disabled={syncing}
        >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync All'}
        </Button>
    );
}
