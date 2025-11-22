'use client';

import { motion } from 'framer-motion';
import { Mail, MessageSquare, Calendar, Github, Twitter, Figma, Slack, Trello, Database, Cloud } from 'lucide-react';

const integrations = [
    { name: 'Gmail', icon: Mail },
    { name: 'Slack', icon: Slack },
    { name: 'Calendar', icon: Calendar },
    { name: 'GitHub', icon: Github },
    { name: 'Figma', icon: Figma },
    { name: 'Trello', icon: Trello },
    { name: 'Notion', icon: Database },
    { name: 'Drive', icon: Cloud },
    { name: 'Linear', icon: MessageSquare },
    { name: 'X', icon: Twitter },
];

export const InfiniteMarquee = () => {
    return (
        <section className="py-24 overflow-hidden bg-background border-y border-white/5">
            <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
                <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Works with everything you use</p>
            </div>

            <div className="relative flex overflow-hidden group">
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

                <motion.div
                    className="flex gap-16 items-center whitespace-nowrap"
                    animate={{ x: [0, -1000] }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                >
                    {[...integrations, ...integrations, ...integrations].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-neutral-600 hover:text-white transition-colors cursor-pointer">
                            <item.icon className="w-6 h-6" />
                            <span className="text-lg font-medium">{item.name}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
