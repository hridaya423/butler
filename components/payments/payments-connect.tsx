"use client";

import { motion } from "motion/react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { CreditCard, ArrowRight, CheckCircle2 } from "lucide-react";

interface PaymentsConnectProps {
    onConnect: (provider: 'stripe' | 'lemonsqueezy' | 'polar') => void;
}

export function PaymentsConnect({ onConnect }: PaymentsConnectProps) {
    const providers = [
        {
            id: 'stripe',
            name: 'Stripe',
            description: 'The standard for online payments. Best for SaaS and e-commerce.',
            icon: (
                <div className="w-10 h-10 bg-[#635BFF]/10 rounded-xl flex items-center justify-center">
                    <svg viewBox="0 0 32 32" className="w-6 h-6 text-[#635BFF]" fill="currentColor">
                        <path d="M11.9 13.6c0-1.7 1.4-2.8 3.8-2.8 1.6 0 3 .5 4.1 1.2l.8-2.3c-1.3-.8-3-1.3-4.9-1.3-4.3 0-7.2 2.2-7.2 6 0 5.9 8.1 4.9 8.1 7.4 0 1.8-1.6 2.7-4 2.7-1.9 0-3.6-.6-4.9-1.5l-.9 2.4c1.5 1 3.6 1.6 5.8 1.6 4.6 0 7.5-2.2 7.5-6.2 0-6.3-8.1-5.2-8.1-7.2" />
                    </svg>
                </div>
            ),
            popular: true,
        },
        {
            id: 'lemonsqueezy',
            name: 'Lemon Squeezy',
            description: 'Merchant of record handling tax & compliance for you.',
            icon: (
                <div className="w-10 h-10 bg-[#FFC233]/10 rounded-xl flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#FFC233]" fill="currentColor">
                        <path d="M12.876.006c-5.717-.26-10.96 3.77-12.35 9.176-.11.43-.186.86-.23 1.29-.023.22-.04.438-.05.657 0 .02-.004.035-.004.054 0 1.25.187 2.52.56 3.75 1.543 5.1 6.55 8.7 11.95 8.7h.02c.18 0 .36-.003.54-.01 6.57-.23 11.58-6.35 10.46-12.82C22.68 4.7 18.06.24 12.877.006zm-4.3 15.6c-1.25.5-2.67.2-3.64-.77-.97-.97-1.27-2.4-.77-3.64l.15-.35c.02-.04.04-.08.06-.12l4.55 4.55c-.04.02-.08.04-.12.06l-.23.27z" />
                    </svg>
                </div>
            ),
            popular: false,
        },
        {
            id: 'polar',
            name: 'Polar',
            description: 'Monetization for developers. Subscriptions & funding.',
            icon: (
                <div className="w-10 h-10 bg-[#0062FF]/10 rounded-xl flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#0062FF]" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                    </svg>
                </div>
            ),
            popular: false,
        },
    ] as const;

    return (
        <div className="flex flex-col items-center justify-center min-h-[600px] p-8 text-center max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <div className="w-20 h-20 bg-neutral-100 rounded-3xl flex items-center justify-center mb-6 mx-auto rotate-3 hover:rotate-6 transition-transform duration-500">
                    <CreditCard className="w-10 h-10 text-neutral-400" />
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 tracking-tight mb-3">
                    Connect Payments
                </h2>
                <p className="text-base text-neutral-500 max-w-md mx-auto">
                    Choose a provider to start tracking your revenue, subscriptions, and customers in one unified dashboard.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {providers.map((provider, index) => (
                    <motion.div
                        key={provider.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="relative p-6 h-full flex flex-col items-center text-center bg-white hover:shadow-xl hover:shadow-neutral-200/50 transition-all duration-300 border-neutral-200 hover:border-orange-200 group cursor-pointer"
                            onClick={() => onConnect(provider.id)}
                        >
                            {provider.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                                {provider.icon}
                            </div>

                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                {provider.name}
                            </h3>
                            <p className="text-sm text-neutral-500 leading-relaxed mb-6 flex-1">
                                {provider.description}
                            </p>

                            <Button
                                variant="outline"
                                className="w-full gap-2 group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-900 transition-all"
                            >
                                Connect
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 flex items-center gap-2 text-sm text-neutral-400"
            >
                <CheckCircle2 className="w-4 h-4" />
                <span>Secure encryption</span>
                <span className="mx-2">•</span>
                <CheckCircle2 className="w-4 h-4" />
                <span>Read-only access</span>
                <span className="mx-2">•</span>
                <CheckCircle2 className="w-4 h-4" />
                <span>Real-time sync</span>
            </motion.div>
        </div>
    );
}
