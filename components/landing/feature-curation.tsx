'use client';

import { motion } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';

export const FeatureCuration = () => {
    return (
        <section className="py-32 px-6 bg-white">
            <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-20 items-center">

                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-semibold text-neutral-900 tracking-tight mb-6">
                                Your personal<br />
                                <span className="text-neutral-400">gatekeeper.</span>
                            </h2>

                            <p className="text-lg text-neutral-500 leading-relaxed mb-8 max-w-md font-light">
                                Butler learns what's important to you. It highlights the signals and quietly archives the noise, so you never miss a beat.
                            </p>

                            <div className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                                <Sparkles className="w-4 h-4 text-orange-500" />
                                <span>Powered by local LLMs</span>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="relative space-y-4">
                            <motion.div
                                initial={{ opacity: 1, x: 0 }}
                                animate={{ opacity: 0.3, x: 20 }}
                                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 bg-neutral-50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-neutral-200" />
                                    <div className="space-y-1">
                                        <div className="w-24 h-2 bg-neutral-200 rounded" />
                                        <div className="w-16 h-2 bg-neutral-100 rounded" />
                                    </div>
                                </div>
                                <X className="w-4 h-4 text-neutral-300" />
                            </motion.div>

                            <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                className="relative flex items-center justify-between p-6 rounded-xl border border-orange-100 bg-orange-50/50 shadow-sm z-10"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium">
                                        JD
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-neutral-900">John Doe</h4>
                                        <p className="text-sm text-neutral-500">Can we schedule a call?</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">Priority</span>
                                    <Check className="w-4 h-4 text-orange-500" />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 1, x: 0 }}
                                animate={{ opacity: 0.3, x: 20 }}
                                transition={{ duration: 2, delay: 1, repeat: Infinity, repeatType: "reverse" }}
                                className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 bg-neutral-50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-neutral-200" />
                                    <div className="space-y-1">
                                        <div className="w-32 h-2 bg-neutral-200 rounded" />
                                        <div className="w-20 h-2 bg-neutral-100 rounded" />
                                    </div>
                                </div>
                                <X className="w-4 h-4 text-neutral-300" />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
