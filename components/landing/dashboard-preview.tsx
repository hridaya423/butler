'use client';

import { motion } from 'framer-motion';
import { Command, Bell, Search, Calendar, Inbox, Sparkles, MoreHorizontal, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

export const DashboardPreview = () => {
    return (
        <div className="relative w-full max-w-5xl mx-auto aspect-[16/10] rounded-xl border border-white/10 bg-[#0A0A0A] shadow-2xl shadow-black/50 overflow-hidden flex">
            <div className="w-64 border-r border-white/10 bg-[#0A0A0A] flex flex-col p-4 hidden md:flex">
                <div className="flex items-center gap-2 mb-8 px-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-serif font-medium text-white tracking-wide">Butler</span>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 text-white text-sm font-medium">
                        <Inbox className="w-4 h-4 text-neutral-400" />
                        <span>Inbox</span>
                        <span className="ml-auto text-xs text-neutral-500">4</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium cursor-pointer">
                        <Calendar className="w-4 h-4" />
                        <span>Today</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium cursor-pointer">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Done</span>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="text-xs font-medium text-neutral-600 px-3 mb-2 uppercase tracking-wider">Contexts</div>
                    <div className="space-y-1">
                        {['Personal', 'Work', 'Deep Focus'].map((ctx) => (
                            <div key={ctx} className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-500 hover:text-neutral-300 cursor-pointer">
                                <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                                {ctx}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-[#0A0A0A]">
                <div className="h-14 border-b border-white/10 flex items-center justify-between px-6">
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Clock className="w-4 h-4" />
                        <span>Good morning</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                            <Bell className="w-4 h-4 text-orange-500" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-8 overflow-hidden relative">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-serif text-white">Morning Briefing</h2>
                            <span className="text-xs text-neutral-500 bg-white/5 px-2 py-1 rounded border border-white/5">AI Generated</span>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
                        >
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-neutral-300 text-sm leading-relaxed">
                                        You have a light schedule this morning. The <span className="text-white font-medium">Q3 Financial Review</span> is your main priority at 10:00 AM. I've also drafted a reply to Sarah regarding the design system.
                                    </p>
                                    <div className="flex gap-2 pt-2">
                                        <button className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-xs text-white font-medium transition-colors">
                                            Review Draft
                                        </button>
                                        <button className="px-3 py-1.5 rounded-md bg-transparent border border-white/10 hover:bg-white/5 text-xs text-neutral-400 transition-colors">
                                            View Calendar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        <div className="space-y-3">
                            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Up Next</div>
                            {[
                                { title: "Q3 Financial Review", time: "10:00 AM", type: "Meeting", icon: Calendar },
                                { title: "Approve New Designs", time: "11:30 AM", type: "Task", icon: CheckCircle2 },
                                { title: "Lunch with Team", time: "12:30 PM", type: "Event", icon: Calendar },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 + 0.2 }}
                                    className="group flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-neutral-200 group-hover:text-white">{item.title}</div>
                                        <div className="text-xs text-neutral-500">{item.time}</div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="w-4 h-4 text-neutral-500" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
