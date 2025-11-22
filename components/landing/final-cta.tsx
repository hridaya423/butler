'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const FinalCTA = () => {
    return (
        <section className="py-32 px-6 bg-white overflow-hidden">
            <div className="max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10"
                >
                    <h2 className="text-5xl md:text-7xl font-semibold text-neutral-900 tracking-tight mb-8 leading-tight">
                        Ready to reclaim<br />
                        your <span className="text-orange-500">focus?</span>
                    </h2>

                    <p className="text-xl text-neutral-500 mb-12 max-w-xl mx-auto font-light">
                        Join thousands of developers and founders who use Butler to filter the noise and ship faster.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/auth" className="group flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-full text-sm font-medium transition-all duration-300 hover:bg-black hover:scale-105 hover:shadow-xl hover:shadow-neutral-900/20">
                            <span>Get Started</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
