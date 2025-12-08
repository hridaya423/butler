"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    RefreshCw,
    CheckCircle2,
    Clock,
    Calendar,
    FileText,
    Loader2,
    ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { TeamsConnect } from "./teams-connect";

interface TeamsAssignment {
    id: string;
    title: string;
    description?: string;
    due_date: string | null;
    class_name: string;
    status: string;
    points_possible?: number;
    points_earned?: number;
    submission_status: string;
    web_url?: string;
    metadata: any;
}

export function TeamsDashboard() {
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [assignments, setAssignments] = useState<TeamsAssignment[]>([]);

    const supabase = createClient();

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const isTeamsConnected = user.identities?.some(
                (id: any) => id.provider === "azure"
            );

            if (isTeamsConnected) {
                setIsConnected(true);
                await fetchAssignments();
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignments = async () => {
        try {
            const { data, error } = await supabase
                .from("assignments")
                .select("*")
                .eq("source", "teams")
                .order("due_date", { ascending: true });

            if (error) throw error;
            setAssignments(data || []);
        } catch (error) {
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const response = await fetch("/api/sync/teams", { method: "POST" });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Sync failed");
            }

            await fetchAssignments();
            toast("Teams data synced!", { icon: "✅" });
        } catch (error) {
            toast(error instanceof Error ? error.message : "Failed to sync Teams", { icon: "❌" });
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-300 mx-auto mb-4" />
                <p className="text-base font-medium text-neutral-900">Loading Teams...</p>
            </div>
        );
    }

    if (!isConnected) {
        return <TeamsConnect onConnected={checkConnection} />;
    }

    const activeAssignments = assignments.filter((a) => a.submission_status !== "submitted");
    const submittedAssignments = assignments.filter((a) => a.submission_status === "submitted");

    const classCounts: Record<string, number> = {};
    assignments.forEach((a) => {
        classCounts[a.class_name] = (classCounts[a.class_name] || 0) + 1;
    });

    return (
        <div className="space-y-6">
            {}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                    <Users className="w-32 h-32" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-1">
                            Microsoft Teams
                        </h2>
                        <p className="text-sm text-neutral-600">
                            {activeAssignments.length} active • {submittedAssignments.length} submitted
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleSync}
                        disabled={syncing}
                        className="gap-2 bg-white hover:bg-indigo-50 transition-all shadow-sm border-indigo-200"
                    >
                        <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
                        {syncing ? "Syncing..." : "Sync Now"}
                    </Button>
                </div>

                {}
                <div className="flex flex-wrap gap-2 mt-4">
                    {Object.entries(classCounts).map(([className, count]) => (
                        <Badge
                            key={className}
                            variant="secondary"
                            className="bg-white/80 text-indigo-700 border border-indigo-100"
                        >
                            {className}: {count}
                        </Badge>
                    ))}
                </div>
            </div>

            {}
            <div className="space-y-4">
                {activeAssignments.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-neutral-100 rounded-2xl">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-sm font-medium text-neutral-900">All assignments submitted!</h3>
                        <p className="text-xs text-neutral-500 mt-1">
                            Great work! Check back later for new assignments.
                        </p>
                    </div>
                ) : (
                    activeAssignments.map((assignment) => (
                        <motion.div
                            key={assignment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group bg-white border border-neutral-100 rounded-xl p-4 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <FileText className="w-4 h-4 text-indigo-500" />
                                        <h4 className="font-semibold text-neutral-900">
                                            {assignment.title}
                                        </h4>
                                        <Badge
                                            variant="secondary"
                                            className="bg-indigo-50 text-indigo-600 text-xs"
                                        >
                                            {assignment.class_name}
                                        </Badge>
                                    </div>

                                    {assignment.description && (
                                        <p className="text-sm text-neutral-500 line-clamp-2">
                                            {assignment.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4">
                                        {assignment.due_date && (
                                            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>
                                                    Due {new Date(assignment.due_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}

                                        {assignment.points_possible && (
                                            <span className="text-xs text-neutral-500">
                                                {assignment.points_possible} points
                                            </span>
                                        )}

                                        {(() => {
                                            if (!assignment.due_date) return null;
                                            const due = new Date(assignment.due_date);
                                            const now = new Date();
                                            const diff = due.getTime() - now.getTime();
                                            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

                                            if (days < 0)
                                                return (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Overdue
                                                    </Badge>
                                                );
                                            if (days <= 3)
                                                return (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-orange-50 text-orange-600 text-xs"
                                                    >
                                                        {days === 0 ? "Due Today" : `In ${days} days`}
                                                    </Badge>
                                                );
                                            return null;
                                        })()}
                                    </div>
                                </div>

                                {assignment.web_url && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <a
                                            href={assignment.web_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-1" />
                                            Open
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
