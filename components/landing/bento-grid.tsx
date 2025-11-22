'use client';

import { motion } from 'framer-motion';
import { LayoutGrid, BellOff, Check, Mail, Calendar, MessageSquare, Sparkles, Zap, Shield, FileText, Figma, ArrowUpRight, Play, X, Filter, Clock, Users, AlertCircle, MoveRight } from 'lucide-react';

const UnifiedStreamCard = () => {
    return (
        <div className="h-full flex flex-col p-6 group relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-800/50 rounded-xl flex items-center justify-center border border-white/5">
                        <LayoutGrid className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-white">Command Center</h3>
                        <p className="text-xs text-neutral-500">Unified inbox with smart filters.</p>
                    </div>
                </div>
                <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                    {['All', 'Urgent', 'Mentions'].map((filter, i) => (
                        <div key={filter} className={`px-2 py-1 rounded text-[10px] font-medium cursor-pointer transition-colors ${i === 1 ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}>
                            {filter}
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative flex-1 space-y-2">
                {[
                    { icon: Mail, bg: "bg-blue-500/20", text: "New Contract.pdf", snippet: "Legal needs your signature by EOD...", tag: "Urgent", time: "2m" },
                    { icon: MessageSquare, bg: "bg-orange-500/20", text: "Design Feedback", snippet: "Can we adjust the padding on the hero section...", tag: "Blocking", time: "15m" },
                    { icon: Check, bg: "bg-purple-500/20", text: "Fix Navigation Bug", snippet: "Mobile menu not closing properly on iOS...", tag: "Bug", time: "1h" },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                        className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-neutral-900/50 cursor-pointer group/item transition-colors"
                    >
                        <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                            <item.icon className="w-4 h-4 text-white/70" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="text-sm font-medium text-neutral-200 truncate">{item.text}</span>
                                <span className="text-[10px] text-neutral-500">{item.time}</span>
                            </div>
                            <p className="text-xs text-neutral-500 truncate mb-2">{item.snippet}</p>
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${item.tag === 'Urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                    item.tag === 'Blocking' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                        'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                    }`}>
                                    {item.tag}
                                </span>
                                <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <span className="text-[10px] text-neutral-400 hover:text-white cursor-pointer">Reply</span>
                                    <span className="text-[10px] text-neutral-400 hover:text-white cursor-pointer">Archive</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const SmartCurationCard = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 group relative overflow-hidden">

            <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
                <div className="w-6 h-6 bg-orange-500/10 rounded-lg flex items-center justify-center border border-orange-500/20">
                    <Sparkles className="w-3 h-3 text-orange-500" />
                </div>
                <span className="text-xs font-medium text-neutral-400">Smart Curation</span>
            </div>


            <div className="flex flex-col items-center space-y-6">

                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <div className="text-4xl font-mono font-light text-neutral-600 line-through decoration-neutral-700 mb-2">47</div>
                        <div className="text-xs text-neutral-500 uppercase tracking-wider">Inbox</div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-orange-500/20 blur-xl" />
                        <MoveRight className="w-6 h-6 text-orange-500 relative z-10" />
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-mono font-light text-white mb-2">3</div>
                        <div className="text-xs text-orange-400 uppercase tracking-wider font-medium">Priority</div>
                    </div>
                </div>


                <div className="w-full max-w-[85%] space-y-2.5">
                    {[
                        { action: 'Auto-archived', count: 32, color: 'neutral', icon: X },
                        { action: 'Summarized', count: 8, color: 'blue', icon: FileText },
                        { action: 'Flagged urgent', count: 4, color: 'orange', icon: AlertCircle },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <item.icon className={`w-3.5 h-3.5 ${item.color === 'neutral' ? 'text-neutral-500' :
                                    item.color === 'blue' ? 'text-blue-400' :
                                        'text-orange-400'
                                    }`} />
                                <span className="text-xs text-neutral-300">{item.action}</span>
                            </div>
                            <span className="text-xs font-mono text-neutral-500">{item.count}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const NotificationShieldCard = () => {
    return (
        <div className="h-full flex flex-col p-6 group relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center border border-green-500/20">
                        <Shield className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Deep Work Mode</h3>
                        <p className="text-[10px] text-neutral-500">Shield active.</p>
                    </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center mb-4 relative">
                <div className="absolute inset-0 bg-green-500/5 blur-2xl rounded-full" />
                <div className="text-3xl font-mono text-white mb-1 relative z-10">01:20:45</div>
                <div className="text-[10px] text-neutral-500 relative z-10">Time remaining</div>
            </div>

            <div className="bg-white/5 rounded-lg p-2 flex items-center gap-3 border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-[10px] text-neutral-400">Blocked notification from <span className="text-white">Slack #random</span></span>
            </div>
        </div>
    );
};

const ActiveProjectCard = () => {
    return (
        <div className="h-full flex flex-col p-6 group relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4 z-10">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                    <LayoutGrid className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">Project Board</h3>
                    <p className="text-[10px] text-neutral-500">Q3 Launch</p>
                </div>
            </div>


            <div className="flex-1 flex gap-3">
                {[
                    { title: 'To Do', count: 3, items: ['Design', 'Specs'] },
                    { title: 'In Progress', count: 2, items: ['Dev', 'QA'] },
                ].map((column, i) => (
                    <div key={i} className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">{column.title}</span>
                            <span className="text-[10px] text-neutral-600">{column.count}</span>
                        </div>
                        <div className="space-y-2">
                            {column.items.map((item, j) => (
                                <motion.div
                                    key={j}
                                    drag
                                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                    className="bg-white/5 border border-white/5 rounded-lg p-2 cursor-grab active:cursor-grabbing"
                                >
                                    <div className="text-[10px] font-medium text-neutral-300">{item}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AutomationsCard = () => {
    return (
        <div className="h-full flex flex-col p-6 group relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
                        <Zap className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Workflows</h3>
                        <p className="text-[10px] text-neutral-500">Auto-pilot mode.</p>
                    </div>
                </div>
                <div className="px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] text-green-400 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Active
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-3">
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                    <div className="absolute inset-0 bg-purple-500/5 blur-xl rounded-xl" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md bg-purple-500/20 flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-purple-400" />
                                </div>
                                <span className="text-sm font-medium text-white">Morning Brief</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-1 h-1 rounded-full bg-purple-400"
                                />
                                <span className="text-[10px] text-purple-300 font-medium">Running</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {[
                                { text: 'Scanned 47 emails', done: true },
                                { text: 'Found 3 urgent items', done: true },
                                { text: 'Generating summary...', done: false },
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    {step.done ? (
                                        <Check className="w-3.5 h-3.5 text-green-400" />
                                    ) : (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-3.5 h-3.5 flex items-center justify-center"
                                        >
                                            <div className="w-3.5 h-3.5 border-2 border-orange-400 border-t-transparent rounded-full" />
                                        </motion.div>
                                    )}
                                    <span className={`text-xs ${step.done ? 'text-neutral-400' : 'text-neutral-300'}`}>{step.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-md bg-green-500/20 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-green-400" />
                            </div>
                            <span className="text-xs font-medium text-neutral-400">Focus Mode</span>
                        </div>
                        <span className="text-[10px] text-green-400">Completed</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const BentoGrid = () => {
    return (
        <section className="py-32 px-6 max-w-7xl mx-auto bg-background">
            <div className="mb-16 text-center">
                <h2 className="text-4xl md:text-5xl font-serif mb-4 text-white">Everything you need.</h2>
                <p className="text-neutral-400 text-lg">Powerful features wrapped in a beautiful interface.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">

                <motion.div
                    whileHover={{ y: -5 }}
                    className="md:col-span-2 bg-[#0A0A0A] rounded-3xl border border-white/10 shadow-2xl overflow-hidden hover:border-white/20 transition-colors"
                >
                    <UnifiedStreamCard />
                </motion.div>
                <motion.div
                    whileHover={{ y: -5 }}
                    className="md:col-span-1 bg-[#0A0A0A] rounded-3xl border border-white/10 shadow-2xl overflow-hidden hover:border-white/20 transition-colors"
                >
                    <SmartCurationCard />
                </motion.div>


                <motion.div
                    whileHover={{ y: -5 }}
                    className="md:col-span-1 bg-[#0A0A0A] rounded-3xl border border-white/10 shadow-2xl overflow-hidden hover:border-white/20 transition-colors"
                >
                    <NotificationShieldCard />
                </motion.div>
                <motion.div
                    whileHover={{ y: -5 }}
                    className="md:col-span-1 bg-[#0A0A0A] rounded-3xl border border-white/10 shadow-2xl overflow-hidden hover:border-white/20 transition-colors"
                >
                    <ActiveProjectCard />
                </motion.div>
                <motion.div
                    whileHover={{ y: -5 }}
                    className="md:col-span-1 bg-[#0A0A0A] rounded-3xl border border-white/10 shadow-2xl overflow-hidden hover:border-white/20 transition-colors"
                >
                    <AutomationsCard />
                </motion.div>
            </div>
        </section>
    );
};
