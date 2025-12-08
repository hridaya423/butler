"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ToastFn = typeof toast & {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
};

const toastTyped = toast as ToastFn;

interface NotionTask {
    id: string;
    title: string;
    status: string;
    due_date: string | null;
    priority: string;
    metadata: any;
    created_at: string;
}

export function NotionDashboard() {
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [tasks, setTasks] = useState<NotionTask[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        checkConnection();
        fetchTasks();
    }, []);

    const checkConnection = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("notion_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

        setIsConnected(!!data);
    };

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("assignments")
                .select("*")
                .eq("source", "notion")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setTasks(data || []);
        } catch (error) {
            toastTyped.error("Failed to load Notion tasks");
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        try {
            setSyncing(true);
            const response = await fetch("/api/notion/sync", {
                method: "POST",
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    toastTyped.error("Notion session expired. Please re-connect in settings.");
                    return;
                }
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Sync failed");
            }

            await fetchTasks();
            toastTyped.success("Notion data synced successfully");
        } catch (error) {
            toastTyped.error(error instanceof Error ? error.message : "Failed to sync Notion");
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-300 mx-auto mb-4" />
                <p className="text-base font-medium text-neutral-900">Loading tasks...</p>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
                <div className="w-20 h-20 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">
                    Notion Not Connected
                </h3>
                <p className="text-sm text-neutral-500 max-w-sm mb-8">
                    Connect your Notion workspace to manage your tasks and pages directly from Butler.
                </p>
                <Button
                    onClick={() => window.location.href = '/dashboard?section=settings'}
                    className="bg-neutral-900 hover:bg-neutral-800"
                >
                    Connect Notion
                </Button>
            </div>
        );
    }

    const activeTasks = tasks.filter(t => t.status !== 'Done' && t.status !== 'Completed');
    const completedTasks = tasks.filter(t => t.status === 'Done' || t.status === 'Completed');

    return (
        <div className="space-y-8">
            <div className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                    <FileText className="w-32 h-32" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-1">
                            Notion
                        </h2>
                        <p className="text-sm text-neutral-500 mb-4">
                            {activeTasks.length} active tasks • {completedTasks.length} completed
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleSync}
                        disabled={syncing}
                        className="gap-2 bg-white hover:bg-neutral-50 transition-all shadow-sm"
                    >
                        <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
                        {syncing ? 'Syncing...' : 'Sync Now'}
                    </Button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white rounded-lg border border-neutral-100">
                                <FileText className="w-4 h-4 text-neutral-500" />
                            </div>
                            <span className="text-sm font-medium text-neutral-600">Active</span>
                        </div>
                        <p className="text-2xl font-bold text-neutral-900">{activeTasks.length}</p>
                    </div>

                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white rounded-lg border border-green-100">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                            </div>
                            <span className="text-sm font-medium text-green-700">Completed</span>
                        </div>
                        <p className="text-2xl font-bold text-green-700">{completedTasks.length}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {tasks.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-neutral-100 rounded-2xl">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-medium text-neutral-900">No tasks found</h3>
                        <p className="text-xs text-neutral-500 mt-1">Your connected Notion database is empty.</p>
                    </div>
                ) : (
                    activeTasks.map((task) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group bg-white border border-neutral-100 rounded-xl p-4 hover:shadow-md transition-all cursor-default"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-neutral-900">{task.title}</h4>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="bg-neutral-100 text-neutral-600 hover:bg-neutral-200 text-xs">
                                            {task.status || 'No Status'}
                                        </Badge>
                                        {task.priority && (
                                            <Badge variant="outline" className="border-neutral-200 text-neutral-500 text-xs">
                                                {task.priority}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a href={task.metadata?.url} target="_blank" rel="noopener noreferrer">
                                        Open in Notion
                                    </a>
                                </Button>
                            </div>
                        </motion.div>
                    )))}
            </div>
        </div>
    );
}
