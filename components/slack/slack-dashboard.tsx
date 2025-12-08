'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  RefreshCw,
  Calendar,
  Bell,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/button';
import { NotificationsPanel } from './notifications-panel';

interface SlackProfile {
  slack_team_name: string;
  slack_username: string;
  slack_display_name: string | null;
  slack_avatar_url: string | null;
  last_synced_at: string | null;
}

interface NotificationSummary {
  total: number;
  unread: number;
  mentions: number;
  dms: number;
  replies: number;
}

export function SlackDashboard() {
  const [profile, setProfile] = useState<SlackProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [notificationSummary, setNotificationSummary] = useState<NotificationSummary | null>(
    null
  );

  useEffect(() => {
    loadProfile();
    loadNotificationSummary();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/slack/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationSummary = async () => {
    try {
      const response = await fetch('/api/slack/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotificationSummary(data.summary);
      }
    } catch (error) {
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/slack/sync', { method: 'POST' });
      if (response.ok) {
        await loadProfile();
        await loadNotificationSummary();
        window.location.reload();
      }
    } catch (error) {
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <MessageSquare className="w-8 h-8 text-neutral-300" />
        </div>
        <p className="text-base font-medium text-neutral-900">Loading Slack data...</p>
        <p className="text-sm text-neutral-500">Fetching your workspace and notifications.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="w-20 h-20 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
          <MessageSquare className="w-10 h-10 text-neutral-400" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">
          Slack Not Connected
        </h3>
        <p className="text-sm text-neutral-500 max-w-sm mb-8">
          Log in with Slack to see your workspace notifications, mentions, and DMs all in one place.
        </p>
        <p className="text-xs text-neutral-400 italic">
          Sign out and log in using &quot;Continue with Slack&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <MessageSquare className="w-32 h-32" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {profile.slack_avatar_url ? (
              <img
                src={profile.slack_avatar_url}
                alt={profile.slack_display_name || profile.slack_username}
                className="w-20 h-20 rounded-2xl border-4 border-white shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-neutral-100 flex items-center justify-center border-4 border-white shadow-sm">
                <MessageSquare className="w-8 h-8 text-neutral-400" />
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-1">
                {profile.slack_display_name || profile.slack_username}
              </h2>

              <a
                href={`https://app.slack.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-500 hover:text-orange-600 transition-colors flex items-center gap-1 mb-3"
              >
                {profile.slack_team_name}
                <ExternalLink className="w-3 h-3" />
              </a>

              {notificationSummary && (
                <div className="flex items-center gap-4 text-xs font-medium text-neutral-600">
                  <div className="flex items-center gap-1.5 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
                    <Bell className="w-3.5 h-3.5 text-orange-600" />
                    <span className="text-orange-900">
                      {notificationSummary.unread} Unread
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1 rounded-md border border-neutral-100">
                    <span>@ {notificationSummary.mentions} Mentions</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1 rounded-md border border-neutral-100">
                    <span>💬 {notificationSummary.dms} DMs</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <div className="text-right hidden md:block mr-2">
              <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                Last Synced
              </p>
              <p className="text-xs text-neutral-600 font-medium flex items-center justify-end gap-1.5">
                <Calendar className="w-3 h-3 text-neutral-400" />
                {profile.last_synced_at
                  ? new Date(profile.last_synced_at).toLocaleString()
                  : 'Never'}
              </p>
            </div>

            <Button
              onClick={handleSync}
              disabled={syncing}
              variant="outline"
              className="gap-2 bg-white hover:bg-neutral-50 transition-all shadow-sm h-10 px-4"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Notifications</h3>
          </div>

          <NotificationsPanel />
        </div>
      </motion.div>
    </div>
  );
}
