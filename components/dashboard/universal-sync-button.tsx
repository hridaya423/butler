/* eslint-disable @typescript-eslint/no-explicit-any */
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
                            const data = await res.json();
                            if (data.error) throw new Error(`GitHub: ${data.error}`);
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
                            const data = await res.json();
                            if (data.error) throw new Error(`Slack: ${data.error}`);
                            return 'Slack';
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

            if (success.length > 0) {
                toastTyped.success(`Synced: ${success.join(', ')}`);
            }

            if (errors.length > 0) {
                toastTyped.error(`Failed: ${errors.join(', ')}`);
            }

            if (onSyncComplete) {
                onSyncComplete();
            }

        } catch (err) {
            console.error("Sync failed:", err);
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
