'use client';

import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { CheckCircle2, Loader2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'motion/react';

interface PaymentSettingsProps {
    initialProvider?: 'stripe' | 'lemonsqueezy' | 'polar';
}

export function PaymentSettings({ initialProvider = 'stripe' }: PaymentSettingsProps) {
    const [activeProvider, setActiveProvider] = useState<'stripe' | 'lemonsqueezy' | 'polar'>(initialProvider);
    const [apiKeys, setApiKeys] = useState({
        stripe: '',
        lemonsqueezy: '',
        polar: '',
    });
    const [savedKeys, setSavedKeys] = useState({
        stripe: false,
        lemonsqueezy: false,
        polar: false,
    });
    const [showKey, setShowKey] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata) {
                setApiKeys({
                    stripe: user.user_metadata.stripe_api_key || '',
                    lemonsqueezy: user.user_metadata.lemonsqueezy_api_key || '',
                    polar: user.user_metadata.polar_api_key || '',
                });
                setSavedKeys({
                    stripe: !!user.user_metadata.stripe_api_key,
                    lemonsqueezy: !!user.user_metadata.lemonsqueezy_api_key,
                    polar: !!user.user_metadata.polar_api_key,
                });
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const keyName = `${activeProvider}_api_key`;
            const keyValue = apiKeys[activeProvider].trim();

            const { error } = await supabase.auth.updateUser({
                data: { [keyName]: keyValue },
            });

            if (error) throw error;

            setSavedKeys(prev => ({ ...prev, [activeProvider]: !!keyValue }));
            setApiKeys(prev => ({ ...prev, [activeProvider]: keyValue }));

        } catch (error) {
            console.error('Error saving API key:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const endpoint = `/api/${activeProvider}/sync`;
            const response = await fetch(endpoint, { method: 'POST' });

            if (response.ok) {
                const data = await response.json();
                console.log(`Synced ${activeProvider}:`, data);
            } else {
                const errorData = await response.json();
                console.error(`Error syncing ${activeProvider}:`, errorData);
            }
        } catch (error) {
            console.error('Error syncing:', error);
        } finally {
            setSyncing(false);
        }
    };

    const providers = [
        {
            id: 'stripe',
            name: 'Stripe',
            icon: (
                <svg viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor">
                    <path d="M11.9 13.6c0-1.7 1.4-2.8 3.8-2.8 1.6 0 3 .5 4.1 1.2l.8-2.3c-1.3-.8-3-1.3-4.9-1.3-4.3 0-7.2 2.2-7.2 6 0 5.9 8.1 4.9 8.1 7.4 0 1.8-1.6 2.7-4 2.7-1.9 0-3.6-.6-4.9-1.5l-.9 2.4c1.5 1 3.6 1.6 5.8 1.6 4.6 0 7.5-2.2 7.5-6.2 0-6.3-8.1-5.2-8.1-7.2" />
                </svg>
            ),
            color: 'text-[#635BFF]',
            bgColor: 'bg-[#635BFF]/10',
        },
        {
            id: 'lemonsqueezy',
            name: 'Lemon Squeezy',
            icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M12.876.006c-5.717-.26-10.96 3.77-12.35 9.176-.11.43-.186.86-.23 1.29-.023.22-.04.438-.05.657 0 .02-.004.035-.004.054 0 1.25.187 2.52.56 3.75 1.543 5.1 6.55 8.7 11.95 8.7h.02c.18 0 .36-.003.54-.01 6.57-.23 11.58-6.35 10.46-12.82C22.68 4.7 18.06.24 12.877.006zm-4.3 15.6c-1.25.5-2.67.2-3.64-.77-.97-.97-1.27-2.4-.77-3.64l.15-.35c.02-.04.04-.08.06-.12l4.55 4.55c-.04.02-.08.04-.12.06l-.23.27z" />
                </svg>
            ),
            color: 'text-[#FFC233]',
            bgColor: 'bg-[#FFC233]/10',
        },
        {
            id: 'polar',
            name: 'Polar',
            icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
            ),
            color: 'text-[#0062FF]',
            bgColor: 'bg-[#0062FF]/10',
        },
    ] as const;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="inline-flex items-center gap-1 p-1 bg-neutral-100 rounded-xl">
                {providers.map((provider) => (
                    <button
                        key={provider.id}
                        onClick={() => setActiveProvider(provider.id)}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeProvider === provider.id
                                ? 'bg-white text-neutral-900 shadow-sm'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        <div className={`${activeProvider === provider.id ? provider.color : 'text-neutral-400'}`}>
                            {provider.icon}
                        </div>
                        {provider.name}
                        {savedKeys[provider.id] && (
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        )}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeProvider}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${providers.find(p => p.id === activeProvider)?.bgColor} flex items-center justify-center ${providers.find(p => p.id === activeProvider)?.color}`}>
                                {providers.find(p => p.id === activeProvider)?.icon}
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-neutral-900">
                                    {providers.find(p => p.id === activeProvider)?.name}
                                </h3>
                                <p className="text-sm text-neutral-500 mt-0.5">
                                    {savedKeys[activeProvider] ? 'Connected and syncing' : 'Not connected'}
                                </p>
                            </div>
                        </div>
                        {savedKeys[activeProvider] && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-md">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-xs font-medium text-green-700">Active</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                API Key
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        type={showKey ? 'text' : 'password'}
                                        placeholder={`${activeProvider === 'stripe' ? 'sk_live_...' : 'Enter your API key'}`}
                                        value={apiKeys[activeProvider]}
                                        onChange={(e) => setApiKeys(prev => ({ ...prev, [activeProvider]: e.target.value }))}
                                        className="pr-10 bg-white border-neutral-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    >
                                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving || !apiKeys[activeProvider]}
                                    className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 shadow-sm"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {savedKeys[activeProvider] && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="pt-3 border-t border-neutral-200"
                            >
                                <Button
                                    onClick={handleSync}
                                    disabled={syncing}
                                    variant="outline"
                                    className="w-full gap-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                                >
                                    {syncing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Syncing...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="w-4 h-4" />
                                            Sync Now
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        )}
                    </div>

                    <div className="text-xs text-neutral-500 bg-neutral-50 rounded-lg p-3">
                        <p>
                            <strong className="text-neutral-700">Where to find this:</strong>{' '}
                            {activeProvider === 'stripe' && 'Go to Stripe Dashboard → Developers → API keys'}
                            {activeProvider === 'lemonsqueezy' && 'Go to Lemon Squeezy → Settings → API'}
                            {activeProvider === 'polar' && 'Go to Polar → Settings → API Keys'}
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
