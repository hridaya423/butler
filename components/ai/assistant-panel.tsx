"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Copy, Check, StickyNote, ArrowUpRight, Loader2, ExternalLink, ListTodo } from "lucide-react";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export type AIAction = {
    label: string;
    type: "copy" | "save" | "task" | "open_url";
    payload: string | any;
};

interface AssistantPanelProps {
    insight: string;
    actions: AIAction[];
    isLoading: boolean;
    contextType: string;
    contextId?: string;
}

export function AssistantPanel({ insight, actions, isLoading, contextType, contextId }: AssistantPanelProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [savedIndex, setSavedIndex] = useState<number | null>(null);

    const handleAction = async (action: AIAction, index: number) => {
        try {
            if (action.type === "copy") {
                await navigator.clipboard.writeText(typeof action.payload === 'string' ? action.payload : JSON.stringify(action.payload));
                setCopiedIndex(index);
                toast("Copied to clipboard");
                setTimeout(() => setCopiedIndex(null), 2000);
            } else if (action.type === "save") {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    toast("You must be logged in to save notes", { icon: "❌" });
                    return;
                }

                const { error } = await supabase.from("ai_memories").insert({
                    context_type: contextType,
                    context_id: contextId || "general",
                    content: JSON.stringify(action.payload),
                    type: "note",
                    user_id: user.id
                });

                if (!error) {
                    setSavedIndex(index);
                    toast("Note saved to memory", { icon: "✓" });
                    setTimeout(() => setSavedIndex(null), 2000);
                } else {
                    throw error;
                }
            } else if (action.type === "open_url") {
                window.open(action.payload, '_blank');
            } else if (action.type === "task") {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    toast("You must be logged in to create tasks", { icon: "❌" });
                    return;
                }

                const { error } = await supabase.from("ai_memories").insert({
                    context_type: contextType,
                    context_id: contextId || "general",
                    content: JSON.stringify(action.payload),
                    type: "task",
                    user_id: user.id
                });

                if (!error) {
                    setSavedIndex(index);
                    toast("Task created", { icon: "✓" });
                    setTimeout(() => setSavedIndex(null), 2000);
                } else {
                    throw error;
                }
            }
        } catch (error: any) {

            if (error?.code === '42P01') {
                toast("Database table missing. Run the setup script!", { icon: "❌" });
            } else if (error?.message) {
                toast(`Action failed: ${error.message}`, { icon: "❌" });
            } else {
                toast("Failed to perform action", { icon: "❌" });
            }
        }
    };

    return (
        <Card className="w-80 border border-neutral-200 shadow-xl bg-white overflow-hidden rounded-xl">
            <div className="p-4">
                <div className="min-h-[40px] mb-4">
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-neutral-500 text-sm animate-pulse">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="font-medium">Analyzing context...</span>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3"
                        >
                            <div className="p-2 bg-indigo-50 rounded-lg flex-shrink-0 mt-0.5">
                                <Sparkles className="w-4 h-4 text-indigo-600" />
                            </div>
                            <p className="text-sm text-neutral-900 leading-relaxed font-medium">
                                {insight}
                            </p>
                        </motion.div>
                    )}
                </div>

                {!isLoading && actions.length > 0 && (
                    <div className="space-y-1 pt-3 border-t border-neutral-100">
                        {actions.map((action, idx) => (
                            <motion.button
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => handleAction(action, idx)}
                                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 group transition-all duration-200 text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${action.type === 'copy' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' :
                                        action.type === 'save' ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-100' :
                                            action.type === 'open_url' ? 'bg-purple-50 text-purple-600 group-hover:bg-purple-100' :
                                                'bg-green-50 text-green-600 group-hover:bg-green-100'
                                        }`}>
                                        {action.type === 'copy' && <Copy className="w-4 h-4" />}
                                        {action.type === 'save' && <StickyNote className="w-4 h-4" />}
                                        {action.type === 'task' && <ListTodo className="w-4 h-4" />}
                                        {action.type === 'open_url' && <ExternalLink className="w-4 h-4" />}
                                    </div>
                                    <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900">
                                        {action.label}
                                    </span>
                                </div>

                                {(copiedIndex === idx || savedIndex === idx) ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <ArrowUpRight className="w-4 h-4 text-neutral-300 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                )}
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}
