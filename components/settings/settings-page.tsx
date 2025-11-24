'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CreditCard, Link2 } from 'lucide-react';
import { PaymentSettings } from './payment-settings';
import { ConnectedAccounts } from './connected-accounts';

interface SettingsPageProps {
  initialTab?: 'accounts' | 'integrations';
  initialProvider?: 'stripe' | 'lemonsqueezy' | 'polar';
}

export function SettingsPage({ initialTab = 'integrations', initialProvider = 'stripe' }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'accounts') {
      setActiveTab('accounts');
    }
  }, []);

  const tabs = [
    {
      id: 'integrations' as const,
      label: 'Payment Integrations',
      icon: CreditCard,
    },
    {
      id: 'accounts' as const,
      label: 'Connected Accounts',
      icon: Link2,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 border-b border-neutral-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'integrations' && <PaymentSettings initialProvider={initialProvider} />}
        {activeTab === 'accounts' && <ConnectedAccounts />}
      </motion.div>
    </div>
  );
}
