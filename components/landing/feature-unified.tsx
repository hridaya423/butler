'use client';

import { motion } from 'framer-motion';
import { Mail, MessageSquare, Slack, Filter, Clock, Archive } from 'lucide-react';
import { useState } from 'react';

export const FeatureUnified = () => {
    const [activeFilter, setActiveFilter] = useState('all');

    const messages = [
        { id: 1, type: 'slack', title: 'Design Review', time: '2m ago', priority: 'high' },
        { id: 2, type: 'mail', title: 'Contract Signed', time: '15m ago', priority: 'high' },
        { id: 3, type: 'linear', title: 'Bug Report #129', time: '1h ago', priority: 'medium' },
        { id: 4, type: 'slack', title: 'Lunch?', time: '2h ago', priority: 'low' },
    ];

    return (
        <section className="py-32 px-6 bg-white">
            <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-20 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                    <span className="text-sm font-medium text-neutral-900">Inbox</span>
                                </div>
                                <div className="flex gap-2">
                                    {['All', 'Urgent', 'Mentions'].map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setActiveFilter(filter.toLowerCase())}
                                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${activeFilter === filter.toLowerCase()
                                                ? 'bg-neutral-900 text-white'
                                                : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                                                }`}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="divide-y divide-neutral-50">
                                {messages.map((msg, i) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.type === 'slack' ? 'bg-neutral-100 text-neutral-600' :
                                            msg.type === 'mail' ? 'bg-orange-50 text-orange-600' :
                                                'bg-neutral-100 text-neutral-600'
                                            }`}>
                                            {msg.type === 'slack' ? <Slack className="w-4 h-4" /> :
                                                msg.type === 'mail' ? <Mail className="w-4 h-4" /> :
                                                    <MessageSquare className="w-4 h-4" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-neutral-900 truncate">{msg.title}</h4>
                                            <p className="text-xs text-neutral-500">Connects to Linear, Slack, Gmail</p>
                                        </div>

                                        <span className="text-xs text-neutral-400 font-medium tabular-nums">{msg.time}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100 flex justify-between items-center text-xs text-neutral-500">
                                <span>4 unread messages</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Updated just now
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-semibold text-neutral-900 tracking-tight mb-6">
                                All your tools.<br />
                                <span className="text-neutral-400">One stream.</span>
                            </h2>

                            <p className="text-lg text-neutral-500 leading-relaxed mb-8 max-w-md font-light">
                                Stop switching tabs. Butler unifies your communications into a single, intelligent feed that prioritizes what matters.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center">
                                        <Filter className="w-5 h-5 text-neutral-900" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-neutral-900">Smart Filtering</h3>
                                        <p className="text-sm text-neutral-500">Automatically categorizes messages by priority.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center">
                                        <Archive className="w-5 h-5 text-neutral-900" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-neutral-900">Auto-Archive</h3>
                                        <p className="text-sm text-neutral-500">Clears out newsletters and spam automatically.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
