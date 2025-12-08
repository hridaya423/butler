"use client";

import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Loader2 } from "lucide-react";

interface InsightBubbleProps {
    isVisible: boolean;
    isLoading: boolean;
    insight: string | null;
    position?: "top" | "bottom" | "left" | "right";
}

export function InsightBubble({ isVisible, isLoading, insight, position = "right" }: InsightBubbleProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, x: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 10 }}
                    className="absolute left-full top-0 ml-4 z-50 w-64 pointer-events-none"
                >
                    <div className="bg-white rounded-xl shadow-xl border border-purple-100 p-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-orange-500" />

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                                ) : (
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">AI Insight</span>
                                </div>

                                {isLoading ? (
                                    <div className="space-y-2">
                                        <div className="h-3 bg-neutral-100 rounded w-3/4 animate-pulse" />
                                        <div className="h-3 bg-neutral-100 rounded w-1/2 animate-pulse" />
                                    </div>
                                ) : (
                                    <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                                        {insight}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="absolute top-6 -left-1.5 w-3 h-3 bg-white border-l border-b border-purple-100 transform rotate-45" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
