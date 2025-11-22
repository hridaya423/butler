'use client';

import { motion } from 'framer-motion';
import { GitBranch, Zap, CheckCircle2 } from 'lucide-react';

export const FeatureAutomation = () => {
    const steps = [
        { id: 1, title: 'Trigger', desc: 'New email from VIP', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
        { id: 2, title: 'Action', desc: 'Summarize content', icon: GitBranch, color: 'text-neutral-600', bg: 'bg-neutral-100' },
        { id: 3, title: 'Result', desc: 'Create Linear task', icon: CheckCircle2, color: 'text-orange-500', bg: 'bg-orange-50' },
    ];

    return (
        <section className="py-32 px-6 bg-white">
            <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative order-2 lg:order-1"
                    >
                        <div className="relative pl-8 border-l border-neutral-100 space-y-12">
                            {steps.map((step, i) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.2 }}
                                    className="relative"
                                >

                                    <div className={`absolute -left-[41px] top-2 w-5 h-5 rounded-full border-4 border-white ${step.bg.replace('bg-', 'bg-')} ${step.color.replace('text-', 'bg-')}`} />

                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-lg ${step.bg}`}>
                                            <step.icon className={`w-5 h-5 ${step.color}`} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-neutral-900">{step.title}</h4>
                                            <p className="text-sm text-neutral-500">{step.desc}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                    <div className="space-y-8 order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-semibold text-neutral-900 tracking-tight mb-6">
                                Automate the<br />
                                <span className="text-neutral-400">busywork.</span>
                            </h2>

                            <p className="text-lg text-neutral-500 leading-relaxed mb-8 max-w-md font-light">
                                Connect your tools and let Butler handle the repetitive tasks. From scheduling meetings to creating tickets, it just works.
                            </p>

                            <div className="flex flex-wrap gap-3">
                                {['Linear', 'Notion', 'Slack', 'Gmail', 'GitHub'].map((tool) => (
                                    <span key={tool} className="px-3 py-1 text-sm text-neutral-500 bg-neutral-50 rounded-full border border-neutral-100">
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
