/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  AtSign,
  Reply,
  Hash,
  ExternalLink,
  Check,
  CheckCheck,
} from 'lucide-react';
import { Button } from '../ui/button';

interface SlackNotification {
  id: string;
  notification_type: 'mention' | 'dm' | 'reply' | 'channel_message';
  text: string;
  text_preview: string;
  sender_name: string;
  sender_avatar: string | null;
  channel_name: string;
  channel_slack_id: string;
  is_read: boolean;
  priority: number;
  permalink: string | null;
  slack_created_at: string;
  has_attachments: boolean;
  reply_count: number;
}

interface NotificationsPanelProps {
  unreadOnly?: boolean;
}

export function NotificationsPanel({
  unreadOnly = false,
}: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<SlackNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mentions' | 'dms' | 'replies'>('all');

  useEffect(() => {
    loadNotifications();
  }, [unreadOnly, filter]);

  const loadNotifications = async () => {
    try {
      const params = new URLSearchParams();
      if (unreadOnly) params.append('unreadOnly', 'true');
      if (filter !== 'all') params.append('type', filter === 'mentions' ? 'mention' : filter === 'dms' ? 'dm' : 'reply');

      const response = await fetch(`/api/slack/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/slack/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/slack/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markAllRead: true,
        }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return <AtSign className="w-4 h-4 text-orange-600" />;
      case 'dm':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'reply':
        return <Reply className="w-4 h-4 text-green-600" />;
      default:
        return <Hash className="w-4 h-4 text-neutral-400" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <MessageSquare className="w-8 h-8 text-neutral-300" />
        </div>
        <p className="text-base font-medium text-neutral-900">Loading notifications...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center p-1 bg-neutral-100/50 rounded-xl border border-neutral-200/50 gap-1">
          {['all', 'mentions', 'dms', 'replies'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            variant="ghost"
            size="sm"
            className="text-xs gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            No notifications
          </h3>
          <p className="text-sm text-neutral-500">
            You&apos;re all caught up! New mentions and DMs will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white border rounded-xl p-4 hover:shadow-sm transition-all cursor-pointer ${
                notification.is_read
                  ? 'border-neutral-100'
                  : 'border-orange-200 bg-orange-50/30'
              }`}
              onClick={() => {
                if (!notification.is_read) markAsRead(notification.id);
                if (notification.permalink) window.open(notification.permalink, '_blank');
              }}
            >
              <div className="flex items-start gap-3">
                {notification.sender_avatar ? (
                  <img
                    src={notification.sender_avatar}
                    alt={notification.sender_name}
                    className="w-10 h-10 rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-neutral-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getNotificationIcon(notification.notification_type)}
                    <span className="font-semibold text-sm text-neutral-900">
                      {notification.sender_name}
                    </span>
                    <span className="text-xs text-neutral-400">in</span>
                    <span className="text-xs text-neutral-600 font-medium">
                      #{notification.channel_name}
                    </span>
                    <span className="text-xs text-neutral-400 ml-auto flex-shrink-0">
                      {formatTime(notification.slack_created_at)}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-700 line-clamp-2 mb-2">
                    {notification.text_preview}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    {notification.reply_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Reply className="w-3 h-3" />
                        {notification.reply_count} {notification.reply_count === 1 ? 'reply' : 'replies'}
                      </span>
                    )}
                    {notification.has_attachments && (
                      <span className="flex items-center gap-1">
                        📎 Attachment
                      </span>
                    )}
                    {!notification.is_read && (
                      <span className="ml-auto flex items-center gap-1 text-orange-600 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                        Unread
                      </span>
                    )}
                    {notification.is_read && notification.permalink && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(notification.permalink!, '_blank');
                        }}
                        className="ml-auto flex items-center gap-1 text-neutral-400 hover:text-orange-600 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View in Slack
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
