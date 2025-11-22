'use client';

import { ArrowUpRight, Github } from 'lucide-react';
import Link from 'next/link';

export const Footer = () => {
    return (
        <footer className="bg-white border-t border-neutral-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 pt-24">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-24">
                    <div className="max-w-sm">
                        <p className="text-xl md:text-2xl font-serif text-neutral-400 leading-relaxed">
                            "For every minute spent organizing, an hour is earned."
                        </p>
                        <p className="mt-4 text-sm text-neutral-400 font-medium">
                            — Benjamin Franklin
                        </p>
                    </div>


                    <div className="flex flex-col md:items-end space-y-4">
                        <Link
                            href="/auth"
                            className="group flex items-center gap-2 text-lg font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                            Sign In
                            <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </Link>
                        <Link
                            href="/dashboard"
                            className="group flex items-center gap-2 text-lg font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                            Dashboard
                            <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </Link>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 text-lg font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                            GitHub
                            <Github className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </a>
                    </div>
                </div>

                <div className="relative flex justify-center">
                    <h1 className="text-[18vw] leading-[0.8] font-serif font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-neutral-200 to-white select-none pointer-events-none">
                        BUTLER
                    </h1>
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
                </div>
            </div>
        </footer>
    );
};
