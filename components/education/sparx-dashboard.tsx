"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Calculator,
    Star,
    Zap,
    Target,
    Lightbulb,
    RefreshCw,
    CheckCircle2,
    Clock,
    Trophy,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { SparxConnect } from "./sparx-connect";

interface SparxHomework {
    id: string;
    sparx_id: string;
    title: string;
    due_date: string | null;
    status: string;
    completion_progress: number;
    total_tasks: number;
    completed_tasks: number;
    bookwork_accuracy: string;
    homework_type: string;
    topics: string[];
    xp_earned: number;
    metadata: any;
}

interface SparxProfile {
    id: string;
    student_name: string;
    school_name: string;
    total_xp: number;
    last_synced_at: string;
}

export function SparxDashboard() {
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [profile, setProfile] = useState<SparxProfile | null>(null);
    const [homework, setHomework] = useState<SparxHomework[]>([]);

    const supabase = createClient();

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: sparxProfile } = await supabase
                .from("sparx_profiles")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (sparxProfile) {
                setIsConnected(true);
                setProfile(sparxProfile);
                await fetchHomework();
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const fetchHomework = async () => {
        try {
            const { data, error } = await supabase
                .from("sparx_homework")
                .select("*")
                .order("due_date", { ascending: true });

            if (error) throw error;
            setHomework(data || []);
        } catch (error) {
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const response = await fetch("/api/sync/sparx", { method: "POST" });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Sync failed");
            }

            await fetchHomework();
            await checkConnection();
            toast.success("Sparx data synced!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to sync Sparx");
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-300 mx-auto mb-4" />
                <p className="text-base font-medium text-neutral-900">Loading Sparx...</p>
            </div>
        );
    }

    if (!isConnected) {
        return <SparxConnect onConnected={checkConnection} />;
    }

    const homeworkTypes = [
        { id: "compulsory", label: "Compulsory", icon: Star, color: "text-yellow-500" },
        { id: "xp_boost", label: "XP Boost", icon: Zap, color: "text-purple-500" },
        { id: "target", label: "Target", icon: Target, color: "text-blue-500" },
        { id: "independent_learning", label: "Independent", icon: Lightbulb, color: "text-green-500" },
    ];

    const activeHomework = homework.filter((h) => h.status !== "completed");
    const completedHomework = homework.filter((h) => h.status === "completed");

    return (
        <div className="space-y-6">
            {}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                    <Calculator className="w-32 h-32" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-1">
                            Sparx Maths
                        </h2>
                        <p className="text-sm text-neutral-600">
                            {profile?.student_name && `Welcome, ${profile.student_name}!`}
                            {profile?.school_name && ` • ${profile.school_name}`}
                        </p>
                        {profile?.total_xp && (
                            <div className="flex items-center gap-2 mt-2">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-semibold text-yellow-600">
                                    {profile.total_xp.toLocaleString()} XP
                                </span>
                            </div>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleSync}
                        disabled={syncing}
                        className="gap-2 bg-white hover:bg-purple-50 transition-all shadow-sm border-purple-200"
                    >
                        <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
                        {syncing ? "Syncing..." : "Sync Now"}
                    </Button>
                </div>

                {}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    {homeworkTypes.map((type) => {
                        const Icon = type.icon;
                        const count = homework.filter((h) => h.homework_type === type.id).length;
                        const completed = homework.filter(
                            (h) => h.homework_type === type.id && h.status === "completed"
                        ).length;

                        return (
                            <div
                                key={type.id}
                                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white rounded-lg border border-purple-100">
                                        <Icon className={cn("w-4 h-4", type.color)} />
                                    </div>
                                    <span className="text-sm font-medium text-neutral-600">
                                        {type.label}
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {completed}/{count}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {}
            <div className="space-y-4">
                {activeHomework.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-neutral-100 rounded-2xl">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-sm font-medium text-neutral-900">All homework completed!</h3>
                        <p className="text-xs text-neutral-500 mt-1">
                            Great job! Check back later for new assignments.
                        </p>
                    </div>
                ) : (
                    activeHomework.map((hw) => {
                        const typeInfo = homeworkTypes.find((t) => t.id === hw.homework_type);
                        const Icon = typeInfo?.icon || Star;
                        const progress = hw.total_tasks > 0
                            ? Math.round((hw.completed_tasks / hw.total_tasks) * 100)
                            : 0;

                        return (
                            <motion.div
                                key={hw.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group bg-white border border-neutral-100 rounded-xl p-4 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Icon className={cn("w-4 h-4", typeInfo?.color)} />
                                            <h4 className="font-semibold text-neutral-900">
                                                {hw.title}
                                            </h4>
                                            <Badge
                                                variant="secondary"
                                                className="bg-purple-50 text-purple-600 text-xs"
                                            >
                                                {typeInfo?.label || hw.homework_type}
                                            </Badge>
                                        </div>

                                        {}
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-purple-500 rounded-full transition-all"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-neutral-600 font-medium">
                                                {hw.completed_tasks}/{hw.total_tasks}
                                            </span>
                                        </div>

                                        {}
                                        <div className="flex items-center gap-4">
                                            {hw.due_date && (
                                                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>
                                                        Due {new Date(hw.due_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            {hw.bookwork_accuracy && (
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-xs",
                                                        hw.bookwork_accuracy === "green" &&
                                                        "border-green-200 text-green-600",
                                                        hw.bookwork_accuracy === "amber" &&
                                                        "border-orange-200 text-orange-600",
                                                        hw.bookwork_accuracy === "red" &&
                                                        "border-red-200 text-red-600"
                                                    )}
                                                >
                                                    Bookwork: {hw.bookwork_accuracy}
                                                </Badge>
                                            )}
                                            {hw.xp_earned > 0 && (
                                                <span className="text-xs text-yellow-600 font-medium">
                                                    +{hw.xp_earned} XP
                                                </span>
                                            )}
                                        </div>

                                        {}
                                        {hw.topics && hw.topics.length > 0 && (
                                            <div className="flex items-center gap-2 flex-wrap pt-1">
                                                {hw.topics.slice(0, 3).map((topic, i) => (
                                                    <Badge
                                                        key={i}
                                                        variant="secondary"
                                                        className="text-xs bg-neutral-100 text-neutral-600"
                                                    >
                                                        {topic}
                                                    </Badge>
                                                ))}
                                                {hw.topics.length > 3 && (
                                                    <span className="text-xs text-neutral-400">
                                                        +{hw.topics.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
