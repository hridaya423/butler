/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Mail,
  Inbox,
  Send,
  Star,
  RefreshCw,
  Search,
  MailOpen,
  Paperclip,
  AlertCircle,
  Loader2,
  Brain,
  Shield,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

interface GmailMessage {
  id: string;
  gmail_message_id: string;
  subject: string;
  snippet: string;
  from_name: string;
  from_email: string;
  to_emails: string[];
  labels: string[];
  is_read: boolean;
  is_starred: boolean;
  is_important: boolean;
  has_attachments: boolean;
  sent_at: string;
}

interface GmailProfile {
  email_address: string;
  last_synced_at: string;
  ai_insights_enabled: boolean;
}

export function GmailDashboard() {
  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'inbox' | 'unread' | 'starred' | 'sent'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProfile();
    loadMessages();
  }, [filter]);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/gmail/profile');
      const data = await response.json();
      setProfile(data.profile);
    } catch (error) {
      console.error('Error loading Gmail profile:', error);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gmail/messages?filter=${filter}&limit=100`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/gmail/sync', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        await loadProfile();
        await loadMessages();
      }
    } catch (error) {
      console.error('Error syncing Gmail:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleMarkAsRead = async (messageId: string, isRead: boolean) => {
    try {
      await fetch('/api/gmail/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, isRead }),
      });

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, is_read: isRead } : m))
      );
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const handleToggleAI = async () => {
    if (!profile) return;

    const newValue = !profile.ai_insights_enabled;

    try {
      const response = await fetch('/api/gmail/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ai_insights_enabled: newValue }),
      });

      if (response.ok) {
        setProfile({ ...profile, ai_insights_enabled: newValue });
      }
    } catch (error) {
      console.error('Error toggling AI insights:', error);
    }
  };

  const filteredMessages = messages.filter((msg) =>
    searchQuery
      ? msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.from_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.snippet.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const stats = {
    total: messages.length,
    unread: messages.filter((m) => !m.is_read).length,
    starred: messages.filter((m) => m.is_starred).length,
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Gmail Not Connected</h3>
        <p className="text-sm text-neutral-500 max-w-md mb-4">
          Connect your Google account to access your Gmail messages and manage your inbox from
          Butler.
        </p>
        <Button
          onClick={() => (window.location.href = '/dashboard?section=settings&tab=accounts')}
          className="bg-neutral-900 hover:bg-neutral-800"
        >
          Connect Gmail
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Gmail</h2>
          <p className="text-sm text-neutral-500 mt-1">{profile.email_address}</p>
        </div>
        <Button
          onClick={handleSync}
          disabled={syncing}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync'}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Inbox className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-neutral-900">{stats.total}</p>
              <p className="text-xs text-neutral-500">Total Messages</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-neutral-900">{stats.unread}</p>
              <p className="text-xs text-neutral-500">Unread</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-neutral-900">{stats.starred}</p>
              <p className="text-xs text-neutral-500">Starred</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`bg-white border rounded-xl p-4 transition-colors ${
        profile.ai_insights_enabled
          ? 'border-purple-200 bg-purple-50/30'
          : 'border-neutral-200'
      }`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              profile.ai_insights_enabled
                ? 'bg-purple-100'
                : 'bg-neutral-100'
            }`}>
              {profile.ai_insights_enabled ? (
                <Brain className="w-5 h-5 text-purple-600" />
              ) : (
                <Shield className="w-5 h-5 text-neutral-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-neutral-900">AI Insights</h3>
                {profile.ai_insights_enabled && (
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {profile.ai_insights_enabled
                  ? 'AI can analyze your emails to provide insights and suggestions. Your privacy matters—disable this anytime.'
                  : 'Enable AI to analyze emails for insights. Emails are never processed without your permission.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleAI}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              profile.ai_insights_enabled ? 'bg-purple-600' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                profile.ai_insights_enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {[
              { id: 'inbox', label: 'Inbox', icon: Inbox },
              { id: 'unread', label: 'Unread', icon: Mail },
              { id: 'starred', label: 'Starred', icon: Star },
              { id: 'sent', label: 'Sent', icon: Send },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f.id
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1" />

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-neutral-50 border-neutral-200"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-8 h-8 text-neutral-300 mb-2" />
            <p className="text-sm text-neutral-500">No messages found</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 hover:bg-neutral-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                        message.is_read ? 'bg-neutral-100 text-neutral-600' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {message.from_name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p
                        className={`text-sm truncate ${
                          message.is_read ? 'font-normal text-neutral-700' : 'font-semibold text-neutral-900'
                        }`}
                      >
                        {message.from_name}
                      </p>
                      {message.is_starred && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                      {message.has_attachments && <Paperclip className="w-3.5 h-3.5 text-neutral-400" />}
                      {message.is_important && (
                        <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Important</Badge>
                      )}
                    </div>

                    <p
                      className={`text-sm mb-1 ${
                        message.is_read ? 'font-normal text-neutral-600' : 'font-semibold text-neutral-900'
                      }`}
                    >
                      {message.subject || '(No Subject)'}
                    </p>

                    <p className="text-xs text-neutral-500 line-clamp-1">{message.snippet}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-xs text-neutral-500">
                      {new Date(message.sent_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(message.id, !message.is_read);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {message.is_read ? (
                        <Mail className="w-4 h-4" />
                      ) : (
                        <MailOpen className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
