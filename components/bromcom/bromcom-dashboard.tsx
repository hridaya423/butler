"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Clock, Calendar, AlertCircle, RefreshCw } from "lucide-react";
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

interface Assignment {
    id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    priority: string;
    status: string;
    course: string | null;
    metadata: any;
}

export function BromcomDashboard() {
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        checkConnection();
        fetchAssignments();
    }, []);

    const checkConnection = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("bromcom_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

        setIsConnected(!!data);
    };

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("assignments")
                .select("*")
                .eq("source", "bromcom")
                .order("due_date", { ascending: true });

            if (error) throw error;
            setAssignments(data || []);
        } catch (error) {
            toastTyped.error("Failed to load Bromcom assignments");
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        try {
            setSyncing(true);
            const response = await fetch("/api/sync/bromcom", {
                method: "POST",
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.needsCredentials) {
                    toastTyped.error("Please enter your Bromcom credentials in Settings");
                    return;
                }
                throw new Error(data.error || "Sync failed");
            }

            await fetchAssignments();
            toastTyped.success("Bromcom data synced successfully");
        } catch (error) {
            toastTyped.error(error instanceof Error ? error.message : "Failed to sync Bromcom");
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-300 mx-auto mb-4" />
                <p className="text-base font-medium text-neutral-900">Loading assignments...</p>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
                <div className="w-20 h-20 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
                    <BookOpen className="w-10 h-10 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">
                    Bromcom Not Connected
                </h3>
                <p className="text-sm text-neutral-500 max-w-sm mb-8">
                    Connect your Bromcom account to manage your homework and assignments directly from Butler.
                </p>
                <Button
                    onClick={() => window.location.href = '/dashboard?section=settings'}
                    className="bg-neutral-900 hover:bg-neutral-800"
                >
                    Connect Bromcom
                </Button>
            </div>
        );
    }

    const activeAssignments = assignments.filter(a => a.status !== 'completed');
    const dueSoon = activeAssignments.filter(a => {
        if (!a.due_date) return false;
        const due = new Date(a.due_date);
        const now = new Date();
        const diff = due.getTime() - now.getTime();
        return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
    });

    return (
        <div className="space-y-8">
            <div className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                    <BookOpen className="w-32 h-32" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-1">
                            Bromcom
                        </h2>
                        <p className="text-sm text-neutral-500 mb-4">
                            {activeAssignments.length} active assignments • {dueSoon.length} due soon
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
                                <BookOpen className="w-4 h-4 text-neutral-500" />
                            </div>
                            <span className="text-sm font-medium text-neutral-600">Active</span>
                        </div>
                        <p className="text-2xl font-bold text-neutral-900">{activeAssignments.length}</p>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white rounded-lg border border-orange-100">
                                <Clock className="w-4 h-4 text-orange-500" />
                            </div>
                            <span className="text-sm font-medium text-orange-700">Due Soon</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-700">{dueSoon.length}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {activeAssignments.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-neutral-100 rounded-2xl">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <BookOpen className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-sm font-medium text-neutral-900">All caught up!</h3>
                        <p className="text-xs text-neutral-500 mt-1">No active assignments found.</p>
                    </div>
                ) : (
                    activeAssignments.map((assignment) => (
                        <motion.div
                            key={assignment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group bg-white border border-neutral-100 rounded-xl p-4 hover:shadow-md transition-all cursor-default"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-neutral-900">{assignment.title}</h4>
                                        {assignment.course && (
                                            <Badge variant="secondary" className="bg-neutral-100 text-neutral-600 hover:bg-neutral-200">
                                                {assignment.course}
                                            </Badge>
                                        )}
                                        {assignment.priority === 'high' && (
                                            <Badge variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-100">
                                                High Priority
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed">
                                        {assignment.description || "No description provided"}
                                    </p>

                                    {assignment.due_date && (
                                        <div className="flex items-center gap-4 pt-2">
                                            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>Due {new Date(assignment.due_date).toLocaleDateString()}</span>
                                            </div>
                                            {(() => {
                                                const due = new Date(assignment.due_date);
                                                const now = new Date();
                                                const diff = due.getTime() - now.getTime();
                                                const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

                                                if (days < 0) return <span className="text-[10px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Overdue</span>;
                                                if (days <= 3) return <span className="text-[10px] font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{days === 0 ? 'Due Today' : `In ${days} days`}</span>;
                                                return null;
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
