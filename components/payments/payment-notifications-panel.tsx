'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, DollarSign, TrendingUp } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  formatCurrency,
  getNotificationIcon,
  type PaymentNotification,
} from '@/lib/types/payments';
import {
  getPaymentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/supabase/payments';

export function PaymentNotificationsPanel() {
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getPaymentNotifications(filter === 'unread', 50);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="border-orange-100 shadow-sm rounded-2xl bg-white">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3
                className="text-xl font-semibold text-neutral-900 tracking-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Payment Activity
              </h3>
              <p className="text-sm text-neutral-500 font-light">
                Recent transactions and updates
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-orange-100 text-orange-600 border-0 px-2 py-1">
              {unreadCount} new
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                filter === 'all'
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                filter === 'unread'
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              Unread
            </button>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs hover:bg-orange-50 transition-all duration-300"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-neutral-500">
              <p className="text-sm font-light">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
              <p className="text-base font-light mb-1">No notifications yet</p>
              <p className="text-sm font-light">
                Payment activity will appear here
              </p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  notification.is_read
                    ? 'bg-neutral-50/50 border-neutral-100 opacity-60'
                    : 'bg-white border-orange-100 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      notification.type === 'payment_received'
                        ? 'bg-green-100'
                        : notification.type === 'subscription_created'
                        ? 'bg-blue-100'
                        : notification.type === 'subscription_renewed'
                        ? 'bg-purple-100'
                        : 'bg-orange-100'
                    }`}
                  >
                    <DollarSign
                      className={`w-5 h-5 ${
                        notification.type === 'payment_received'
                          ? 'text-green-600'
                          : notification.type === 'subscription_created'
                          ? 'text-blue-600'
                          : notification.type === 'subscription_renewed'
                          ? 'text-purple-600'
                          : 'text-orange-600'
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <h4 className="text-sm font-medium text-neutral-900">
                          {notification.title}
                        </h4>
                      </div>
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-1 rounded hover:bg-green-100 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-neutral-600 font-light mb-2">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-neutral-900">
                        {formatCurrency(
                          notification.amount,
                          notification.currency
                        )}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-neutral-400">
                        {notification.project_name && (
                          <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                            {notification.project_name}
                          </span>
                        )}
                        <span>{getTimeAgo(notification.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
