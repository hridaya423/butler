'use client';

import { motion } from 'framer-motion';
import { Check, X, Mail, MessageSquare, GitBranch, Clock, AlertCircle } from 'lucide-react';

export const ValueProp = () => {
    return (
        <section className="py-32 px-6 bg-white border-t border-neutral-100">
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-50 border border-neutral-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">The Problem</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-semibold text-neutral-900 leading-tight tracking-tight">
                            Fragmented tools,<br />
                            <span className="text-neutral-400">fragmented focus.</span>
                        </h2>

                        <div className="space-y-4 text-neutral-500 leading-relaxed font-light text-lg">
                            <p>
                                Slack notifications interrupt deep work. Gmail sits unchecked for hours.
                                Context switching costs you 2.5 hours every single day.
                            </p>
                        </div>

                        <div className="grid grid-cols-4 gap-4 pt-4">
                            {[
                                { name: 'Slack', icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.52 2.52 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" /></svg> },
                                { name: 'Gmail', icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" /></svg> },
                                { name: 'Linear', icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M11.264 2.397c.484-.46 1.258-.276 1.48.352l.012.046 2.52 10.083 7.84-2.24a1.05 1.05 0 0 1 1.287 1.29l-.013.045-3.36 9.52a1.05 1.05 0 0 1-1.916.14l-.018-.047-2.52-10.082-7.84 2.24a1.05 1.05 0 0 1-1.287-1.29l.013-.045 3.36-9.52a1.05 1.05 0 0 1 .442-.492z" /></svg> },
                                { name: 'Notion', icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M4.459 4.208c.746.606 1.026.56 2.67.839l11.052 1.695c.826.126.867-.29.826-.992l-.053-.681c-.102-1.302-1.138-2.336-2.47-2.372L5.216 2.56c-1.285-.026-2.324.962-2.324 2.208v16.293c0 1.246.994 2.316 2.219 2.39l10.977.62c1.256.072 2.33-1.02 2.33-2.372V8.909c0-.745-.62-1.378-1.352-1.378-.228 0-.447.06-.64.172L8.69 11.963v7.903c0 .505-.505.505-.505.06V8.65c0-1.314-.943-2.218-2.218-2.218-.28 0-.544.043-.787.123l-.72.25V4.208z" /></svg> },
                                { name: 'Cal', icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S16.627 0 12 0zm0 4.8c3.977 0 7.2 3.223 7.2 7.2s-3.223 7.2-7.2 7.2-7.2-3.223-7.2-7.2 3.223-7.2 7.2-7.2zm-1.2 3.6v4.8h4.8v-2.4h-2.4V8.4h-2.4z" /></svg> },
                                { name: 'Figma', icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 24c3.314 0 6-2.686 6-6 0-3.314-2.686-6-6-6-3.314 0-6 2.686-6 6 0 3.314 2.686 6 6 6zm0-12c3.314 0 6-2.686 6-6 0-3.314-2.686-6-6-6-3.314 0-6 2.686-6 6 0 3.314 2.686 6 6 6zm-6 0c0-3.314 2.686-6 6-6v6H6zm0-6c0-3.314 2.686-6 6-6v6H6z" /></svg> },
                                { name: 'GitHub', icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg> },
                                { name: 'Zoom', icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M3.112 5.115A3.117 3.117 0 0 1 6.223 2h11.554a3.117 3.117 0 0 1 3.111 3.115v13.77a3.117 3.117 0 0 1-3.111 3.116H6.223a3.117 3.117 0 0 1-3.111-3.116V5.115zM0 6.669v10.662a2.224 2.224 0 0 0 2.223 2.223h19.554A2.224 2.224 0 0 0 24 17.331V6.67A2.224 2.224 0 0 0 21.777 4.446H2.223A2.224 2.224 0 0 0 0 6.67z" /></svg> }
                            ].map((app, i) => (
                                <motion.div
                                    key={app.name}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="aspect-square rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center opacity-50 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer text-neutral-600"
                                >
                                    {app.icon}
                                </motion.div>
                            ))}
                        </div>
                    </div>


                    <div className="space-y-8 relative">

                        <div className="hidden md:block absolute -left-10 top-1/2 w-20 h-px bg-gradient-to-r from-neutral-200 to-orange-200" />

                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            <span className="text-xs font-medium text-orange-600 uppercase tracking-wide">The Solution</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-semibold text-neutral-900 leading-tight tracking-tight">
                            One intelligent<br />
                            <span className="text-orange-500">command center.</span>
                        </h2>

                        <div className="space-y-4 text-neutral-500 leading-relaxed font-light text-lg">
                            <p>
                                Butler unifies your workflow. AI curates what's urgent, blocks distractions,
                                and automates the coordination work.
                            </p>
                        </div>


                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="relative p-6 rounded-2xl bg-white border border-orange-100 shadow-sm"
                        >
                            <div className="space-y-3">

                                <div className="flex items-center justify-between border-b border-neutral-50 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                                            <AlertCircle className="w-4 h-4 text-orange-500" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-neutral-900">Inbox</div>
                                            <div className="text-xs text-neutral-400">3 items need attention</div>
                                        </div>
                                    </div>
                                    <div className="px-2 py-1 rounded-full bg-orange-50 text-[10px] font-medium text-orange-600">
                                        Unified
                                    </div>
                                </div>


                                <div className="space-y-2 pt-1">

                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50/50 border border-neutral-100/50">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                            <MessageSquare className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-neutral-900">Team standup in 10 min</span>
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-orange-100 text-orange-600">Urgent</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                                                <span>Slack</span>
                                                <span>•</span>
                                                <Clock className="w-3 h-3" />
                                                <span>2m ago</span>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50/50 border border-neutral-100/50">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-neutral-900">Design feedback from Sarah</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                                                <span>Gmail</span>
                                                <span>•</span>
                                                <Clock className="w-3 h-3" />
                                                <span>15m ago</span>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50/50 border border-neutral-100/50">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                            <GitBranch className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-neutral-900">PR #247 needs review</span>
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-neutral-100 text-neutral-600">@mention</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                                                <span>Linear</span>
                                                <span>•</span>
                                                <Clock className="w-3 h-3" />
                                                <span>1h ago</span>
                                            </div>
                                        </div>
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
