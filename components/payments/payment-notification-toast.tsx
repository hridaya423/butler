'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, DollarSign } from 'lucide-react';
import {
  formatCurrency,
  getNotificationIcon,
  type PaymentNotification,
} from '@/lib/types/payments';
import {
  getPaymentNotifications,
  markNotificationAsRead,
  subscribeToPaymentNotifications,
} from '@/lib/supabase/payments';

export function PaymentNotificationToast() {
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);
  const [visibleNotifications, setVisibleNotifications] = useState<Set<string>>(
    new Set()
  );

  const handleDismiss = useCallback(async (notificationId: string) => {
    setVisibleNotifications((prev) => {
      const newSet = new Set(prev);
      newSet.delete(notificationId);
      return newSet;
    });

    setTimeout(async () => {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    }, 300);
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const unread = await getPaymentNotifications(true, 5);
        setNotifications(unread);
        unread.forEach((notif, index) => {
          setTimeout(() => {
            setVisibleNotifications((prev) => new Set(prev).add(notif.id));
          }, index * 500);
        });
      } catch (error) {
      }
    };

    loadNotifications();

    const subscription = subscribeToPaymentNotifications((notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setVisibleNotifications((prev) => new Set(prev).add(notification.id));

      setTimeout(() => {
        handleDismiss(notification.id);
      }, 10000);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleDismiss]);

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'payment_received':
        return 'from-green-50 to-emerald-50 border-green-200';
      case 'subscription_created':
        return 'from-blue-50 to-indigo-50 border-blue-200';
      case 'subscription_renewed':
        return 'from-purple-50 to-violet-50 border-purple-200';
      case 'refund_issued':
        return 'from-orange-50 to-amber-50 border-orange-200';
      default:
        return 'from-neutral-50 to-gray-50 border-neutral-200';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'payment_received':
        return 'text-green-600 bg-green-100';
      case 'subscription_created':
        return 'text-blue-600 bg-blue-100';
      case 'subscription_renewed':
        return 'text-purple-600 bg-purple-100';
      case 'refund_issued':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  return (
    <div className="fixed top-20 right-6 z-50 w-96 max-w-full space-y-3">
      <AnimatePresence mode="popLayout">
        {notifications
          .filter((n) => visibleNotifications.has(n.id))
          .map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`bg-gradient-to-br ${getBackgroundColor(notification.type)} border rounded-2xl shadow-xl overflow-hidden`}
            >
              <motion.div
                className="h-1 bg-gradient-to-r from-orange-500 to-orange-300"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 10, ease: 'linear' }}
                style={{ transformOrigin: 'left' }}
              />

              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconColor(notification.type)} flex-shrink-0`}
                  >
                    <DollarSign className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <h4 className="text-base font-semibold text-neutral-900">
                            {notification.title}
                          </h4>
                        </div>
                        {notification.project_name && (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-white/60 rounded-full text-neutral-600 mt-1">
                            {notification.project_name}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDismiss(notification.id)}
                        className="p-1 rounded-lg hover:bg-white/50 transition-colors"
                      >
                        <X className="w-4 h-4 text-neutral-500" />
                      </button>
                    </div>

                    <p className="text-sm text-neutral-700 font-light mb-3">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-semibold text-neutral-900 tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
                          {formatCurrency(notification.amount, notification.currency)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <Check className="w-3 h-3" />
                        <span>Just now</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
