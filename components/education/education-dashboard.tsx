"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    BookOpen,
    Calculator,
    Users,
    RefreshCw,
    Brain,
    Filter,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock,
    ChevronDown,
    Search,
    TrendingUp,
    Zap,
    GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { EducationFilters } from "./education-filters";
import { EducationInsights } from "./education-insights";
import { SparxConnect } from "./sparx-connect";
import { TeamsConnect } from "./teams-connect";

type EducationTab = "all" | "bromcom" | "sparx" | "teams";

interface EducationAssignment {
    id: string;
    title: string;
    description?: string;
    due_date: string | null;
    source: "bromcom" | "sparx" | "teams";
    status: string;
    priority: string;
    subject?: string;
    course?: string;
    completion_progress?: number;
    metadata?: any;
    created_at: string;
}

export function EducationDashboard() {
    const [activeTab, setActiveTab] = useState<EducationTab>("all");
    const [assignments, setAssignments] = useState<EducationAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showInsights, setShowInsights] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [filters, setFilters] = useState({
        dueDate: "all" as "all" | "today" | "week" | "overdue",
        subject: "all",
        priority: "all" as "all" | "high" | "medium" | "low",
        showCompleted: true,
    });

    const [connections, setConnections] = useState({
        bromcom: false,
        sparx: false,
        teams: false,
    });

    const supabase = createClient();

    useEffect(() => {
        checkConnections();
        fetchAssignments();
    }, []);

    const checkConnections = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: bromcom } = await supabase
            .from("bromcom_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

        const { data: sparx } = await supabase
            .from("sparx_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

        const { data: teams } = await supabase
            .from("teams_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

        setConnections({
            bromcom: !!bromcom,
            sparx: !!sparx,
            teams: !!teams,
        });
    };

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const { data: assignmentsData, error: assignmentsError } = await supabase
                .from("assignments")
                .select("*")
                .in("source", ["bromcom", "sparx", "teams"])
                .order("due_date", { ascending: true, nullsFirst: false });

            if (assignmentsError) throw assignmentsError;

            const { data: sparxData } = await supabase
                .from("sparx_homework")
                .select("sparx_id, completion_progress, total_tasks, completed_tasks, topics");

            const mergedAssignments = (assignmentsData || []).map((assignment: any) => {
                if (assignment.source === "sparx" && sparxData) {
                    const sparxHw = sparxData.find((hw: any) => hw.sparx_id === assignment.external_id);
                    if (sparxHw) {
                        return {
                            ...assignment,
                            completion_progress: sparxHw.completion_progress,
                            total_tasks: sparxHw.total_tasks,
                            completed_tasks: sparxHw.completed_tasks,
                            topics: sparxHw.topics,
                        };
                    }
                }
                return assignment;
            });

            setAssignments(mergedAssignments);
        } catch (error) {
            toast("Failed to load assignments", { icon: "❌" });
        } finally {
            setLoading(false);
        }
    };

    const handleSyncAll = async () => {
        setSyncing(true);
        try {
            const promises = [];
            if (connections.bromcom) {
                promises.push(fetch("/api/sync/bromcom", { method: "POST" }));
            }
            if (connections.sparx) {
                promises.push(fetch("/api/sync/sparx", { method: "POST" }));
            }
            if (connections.teams) {
                promises.push(fetch("/api/sync/teams", { method: "POST" }));
            }

            await Promise.all(promises);
            await fetchAssignments();
            toast("All education data synced!", { icon: "✅" });
        } catch (error) {
            toast("Failed to sync some services", { icon: "❌" });
        } finally {
            setSyncing(false);
        }
    };

    const handleSyncService = async (service: "bromcom" | "sparx" | "teams") => {
        setSyncing(true);
        try {
            const endpoints: Record<string, string> = {
                bromcom: "/api/sync/bromcom",
                sparx: "/api/sync/sparx",
                teams: "/api/sync/teams",
            };

            const response = await fetch(endpoints[service], { method: "POST" });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Sync failed");
            }

            await fetchAssignments();
            toast(`${service.charAt(0).toUpperCase() + service.slice(1)} synced!`, { icon: "✅" });
        } catch (error: any) {
            toast(error.message || `Failed to sync ${service}`, { icon: "❌" });
        } finally {
            setSyncing(false);
        }
    };

    const filteredAssignments = assignments.filter((a) => {
        if (activeTab !== "all" && a.source !== activeTab) return false;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (
                !a.title.toLowerCase().includes(query) &&
                !a.description?.toLowerCase().includes(query) &&
                !a.subject?.toLowerCase().includes(query)
            ) {
                return false;
            }
        }

        if (filters.dueDate !== "all" && a.due_date) {
            const due = new Date(a.due_date);
            const now = new Date();
            const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            if (filters.dueDate === "today" && diffDays !== 0) return false;
            if (filters.dueDate === "week" && (diffDays < 0 || diffDays > 7)) return false;
            if (filters.dueDate === "overdue" && diffDays >= 0) return false;
        }
        if (filters.priority !== "all" && a.priority !== filters.priority) return false;

        return true;
    });

    const stats = {
        total: assignments.length,
        active: assignments.filter((a) => a.status !== "completed").length,
        overdue: assignments.filter((a) => {
            if (!a.due_date) return false;
            return new Date(a.due_date) < new Date() && a.status !== "completed";
        }).length,
        dueSoon: assignments.filter((a) => {
            if (!a.due_date) return false;
            const diff = new Date(a.due_date).getTime() - new Date().getTime();
            return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000 && a.status !== "completed";
        }).length,
    };

    const tabs = [
        { id: "all" as const, label: "All", icon: GraduationCap, count: assignments.length },
        { id: "bromcom" as const, label: "Bromcom", icon: BookOpen, count: assignments.filter((a) => a.source === "bromcom").length },
        { id: "sparx" as const, label: "Sparx", icon: Calculator, count: assignments.filter((a) => a.source === "sparx").length },
        { id: "teams" as const, label: "Teams", icon: Users, count: assignments.filter((a) => a.source === "teams").length },
    ];

    if (loading) {
        return (
            <div className="p-12 text-center">
                <GraduationCap className="w-12 h-12 text-neutral-300 mx-auto mb-4 animate-pulse" />
                <p className="text-base font-medium text-neutral-900">Loading education data...</p>
            </div>
        );
    }

    const noConnections = !connections.bromcom && !connections.sparx && !connections.teams;

    if (noConnections) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
                <div className="w-20 h-20 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
                    <GraduationCap className="w-10 h-10 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">
                    Connect Your Education Services
                </h3>
                <p className="text-sm text-neutral-500 max-w-sm mb-8">
                    Connect Bromcom, Sparx Maths, or Microsoft Teams to see all your homework in one place.
                </p>
                <Button
                    onClick={() => (window.location.href = "/dashboard?section=settings")}
                    className="bg-neutral-900 hover:bg-neutral-800"
                >
                    Go to Settings
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                    <GraduationCap className="w-32 h-32" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-1">
                            Education Hub
                        </h2>
                        <p className="text-sm text-neutral-500">
                            {stats.active} active assignments • {stats.dueSoon} due soon • {stats.overdue} overdue
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowInsights(!showInsights)}
                            className={cn(
                                "gap-2",
                                showInsights && "bg-purple-50 border-purple-200 text-purple-700"
                            )}
                        >
                            <Brain className="w-4 h-4" />
                            AI Insights
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleSyncAll}
                            disabled={syncing}
                            className="gap-2 bg-white hover:bg-neutral-50 transition-all shadow-sm"
                        >
                            <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
                            {syncing ? "Syncing..." : "Sync All"}
                        </Button>
                    </div>
                </div>

                { }
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white rounded-lg border border-neutral-100">
                                <BookOpen className="w-4 h-4 text-neutral-500" />
                            </div>
                            <span className="text-sm font-medium text-neutral-600">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white rounded-lg border border-blue-100">
                                <Clock className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="text-sm font-medium text-blue-700">Active</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">{stats.active}</p>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white rounded-lg border border-orange-100">
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                            </div>
                            <span className="text-sm font-medium text-orange-700">Due Soon</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-700">{stats.dueSoon}</p>
                    </div>

                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white rounded-lg border border-red-100">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                            </div>
                            <span className="text-sm font-medium text-red-700">Overdue</span>
                        </div>
                        <p className="text-2xl font-bold text-red-700">{stats.overdue}</p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showInsights && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <EducationInsights assignments={assignments} />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const isAllTab = tab.id === "all";
                            const isConnected = isAllTab ||
                                connections[tab.id as Exclude<typeof tab.id, "all">];

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                                        isActive
                                            ? "bg-neutral-900 text-white"
                                            : "text-neutral-600 hover:bg-neutral-100",
                                        !isConnected && !isAllTab && "opacity-70"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span
                                            className={cn(
                                                "text-xs px-1.5 py-0.5 rounded-md",
                                                isActive ? "bg-white/20" : "bg-neutral-200"
                                            )}
                                        >
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input
                                placeholder="Search assignments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 w-64 bg-neutral-50 border-neutral-200"
                            />
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn("gap-2", showFilters && "bg-neutral-100")}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            <ChevronDown
                                className={cn(
                                    "w-3 h-3 transition-transform",
                                    showFilters && "rotate-180"
                                )}
                            />
                        </Button>

                        {activeTab !== "all" && connections[activeTab] && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSyncService(activeTab)}
                                disabled={syncing}
                                className="gap-2"
                            >
                                <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
                                Sync {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                            </Button>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-neutral-100"
                        >
                            <EducationFilters filters={filters} setFilters={setFilters} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="space-y-4">
                { }
                {activeTab === "sparx" && !connections.sparx ? (
                    <SparxConnect onConnected={() => { checkConnections(); fetchAssignments(); }} />
                ) : activeTab === "teams" && !connections.teams ? (
                    <TeamsConnect onConnected={() => { checkConnections(); fetchAssignments(); }} />
                ) : filteredAssignments.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-neutral-100 rounded-2xl">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-sm font-medium text-neutral-900">
                            {searchQuery || filters.dueDate !== "all" || filters.priority !== "all"
                                ? "No assignments match your filters"
                                : "All caught up!"}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1">
                            {searchQuery || filters.dueDate !== "all" || filters.priority !== "all"
                                ? "Try adjusting your filters"
                                : "No active assignments found."}
                        </p>
                    </div>
                ) : (
                    filteredAssignments.map((assignment) => (
                        <motion.div
                            key={assignment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group bg-white border border-neutral-100 rounded-xl p-4 hover:shadow-md transition-all cursor-default"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-semibold text-neutral-900">
                                            {assignment.title}
                                        </h4>

                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "text-xs",
                                                assignment.source === "bromcom" &&
                                                "bg-blue-50 text-blue-600",
                                                assignment.source === "sparx" &&
                                                "bg-purple-50 text-purple-600",
                                                assignment.source === "teams" &&
                                                "bg-indigo-50 text-indigo-600"
                                            )}
                                        >
                                            {assignment.source.charAt(0).toUpperCase() +
                                                assignment.source.slice(1)}
                                        </Badge>

                                        {(assignment.subject || assignment.course) && (
                                            <Badge
                                                variant="secondary"
                                                className="bg-neutral-100 text-neutral-600"
                                            >
                                                {assignment.subject || assignment.course}
                                            </Badge>
                                        )}

                                        {assignment.priority === "high" && (
                                            <Badge
                                                variant="destructive"
                                                className="bg-red-50 text-red-600 border-red-100"
                                            >
                                                High Priority
                                            </Badge>
                                        )}
                                    </div>

                                    {assignment.description && (
                                        <p className="text-sm text-neutral-500 line-clamp-2">
                                            {assignment.description}
                                        </p>
                                    )}

                                    {assignment.due_date && (
                                        <div className="flex items-center gap-4 pt-2">
                                            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>
                                                    Due{" "}
                                                    {new Date(
                                                        assignment.due_date
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {(() => {
                                                const due = new Date(assignment.due_date);
                                                const now = new Date();
                                                const diff = due.getTime() - now.getTime();
                                                const days = Math.ceil(
                                                    diff / (1000 * 60 * 60 * 24)
                                                );
                                                if (assignment.status === "completed")
                                                    return (
                                                        <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                            ✓ Completed
                                                        </span>
                                                    );
                                                if (days < 0)
                                                    return (
                                                        <span className="text-[10px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                                            Overdue
                                                        </span>
                                                    );
                                                if (days <= 3)
                                                    return (
                                                        <span className="text-[10px] font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                                            {days === 0
                                                                ? "Due Today"
                                                                : `In ${days} days`}
                                                        </span>
                                                    );
                                                return null;
                                            })()}
                                        </div>
                                    )}

                                    {assignment.completion_progress !== undefined && (
                                        <div className="flex items-center gap-2 pt-2">
                                            <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full transition-all"
                                                    style={{
                                                        width: `${assignment.completion_progress}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs text-neutral-500">
                                                {assignment.completion_progress}%
                                            </span>
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
