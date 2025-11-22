'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const HeroSection = () => {
    return (
        <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 bg-gradient-to-br from-white via-orange-50/30 to-neutral-50 overflow-hidden dither-effect">

            <div className="relative z-10 max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >

                    <h1 className="text-6xl md:text-8xl font-semibold text-neutral-900 tracking-tight mb-8 leading-[1.1]">
                        The intelligent inbox<br />
                        <span className="text-orange-500">for deep work.</span>
                    </h1>

                    <p className="text-xl text-neutral-500 max-w-xl mx-auto mb-12 leading-relaxed font-light">
                        Butler filters the noise, automates the busywork, and helps you focus on what actually matters.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/auth" className="group flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-full text-sm font-medium transition-all duration-300 hover:bg-black hover:scale-105 hover:shadow-xl hover:shadow-neutral-900/20">
                            <span>Get Started</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </motion.div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </section>
    );
};
