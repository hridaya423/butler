"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Brain,
    Sparkles,
    TrendingUp,
    AlertTriangle,
    Calendar,
    BookOpen,
    Zap,
    Clock,
    Target,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Assignment {
    id: string;
    title: string;
    description?: string;
    due_date: string | null;
    source: string;
    status: string;
    priority: string;
    subject?: string;
    course?: string;
}

interface EducationInsightsProps {
    assignments: Assignment[];
}

interface Insight {
    id: string;
    type: "warning" | "tip" | "info" | "success";
    icon: any;
    title: string;
    description: string;
    priority: number;
}

export function EducationInsights({ assignments }: EducationInsightsProps) {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        generateInsights();
    }, [assignments]);

    const generateInsights = async () => {
        setLoading(true);

        const generatedInsights: Insight[] = [];

        const now = new Date();
        const activeAssignments = assignments.filter((a) => a.status !== "completed");

        const overdue = activeAssignments.filter((a) => {
            if (!a.due_date) return false;
            return new Date(a.due_date) < now;
        });

        if (overdue.length > 0) {
            generatedInsights.push({
                id: "overdue-warning",
                type: "warning",
                icon: AlertTriangle,
                title: `${overdue.length} Overdue Assignment${overdue.length > 1 ? "s" : ""}`,
                description: `You have ${overdue.length} assignment${overdue.length > 1 ? "s" : ""} past the due date. Consider prioritizing ${overdue[0].title}.`,
                priority: 1,
            });
        }

        const dueToday = activeAssignments.filter((a) => {
            if (!a.due_date) return false;
            const due = new Date(a.due_date);
            return (
                due.getDate() === now.getDate() &&
                due.getMonth() === now.getMonth() &&
                due.getFullYear() === now.getFullYear()
            );
        });

        if (dueToday.length > 0) {
            generatedInsights.push({
                id: "due-today",
                type: "warning",
                icon: Clock,
                title: `${dueToday.length} Due Today`,
                description: `${dueToday.map((a) => a.title).join(", ")} ${dueToday.length > 1 ? "are" : "is"} due today. Focus on completing ${dueToday.length > 1 ? "these" : "this"} first.`,
                priority: 2,
            });
        }

        const weekAhead = activeAssignments.filter((a) => {
            if (!a.due_date) return false;
            const due = new Date(a.due_date);
            const diff = due.getTime() - now.getTime();
            return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
        });

        if (weekAhead.length >= 5) {
            generatedInsights.push({
                id: "busy-week",
                type: "info",
                icon: Calendar,
                title: "Busy Week Ahead",
                description: `You have ${weekAhead.length} assignments due this week. Consider creating a study schedule to manage your workload.`,
                priority: 3,
            });
        }

        const subjectCounts: Record<string, number> = {};
        activeAssignments.forEach((a) => {
            const subject = a.subject || a.course || "Uncategorized";
            subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
        });

        const topSubject = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0];
        if (topSubject && topSubject[1] >= 3) {
            generatedInsights.push({
                id: "subject-focus",
                type: "tip",
                icon: Target,
                title: `${topSubject[0]} Focus`,
                description: `You have ${topSubject[1]} ${topSubject[0]} assignments. Consider batching them together for more efficient studying.`,
                priority: 4,
            });
        }

        const highPriority = activeAssignments.filter((a) => a.priority === "high");
        if (highPriority.length > 0 && !overdue.length) {
            generatedInsights.push({
                id: "high-priority",
                type: "info",
                icon: Zap,
                title: `${highPriority.length} High Priority`,
                description: `Don't forget about your high priority assignments: ${highPriority.slice(0, 2).map((a) => a.title).join(", ")}${highPriority.length > 2 ? ` and ${highPriority.length - 2} more` : ""}.`,
                priority: 5,
            });
        }

        if (activeAssignments.length === 0) {
            generatedInsights.push({
                id: "all-done",
                type: "success",
                icon: CheckCircle2,
                title: "All Caught Up! 🎉",
                description: "You've completed all your assignments. Great work! Take a well-deserved break.",
                priority: 0,
            });
        }

        if (activeAssignments.length > 0 && generatedInsights.length < 3) {
            generatedInsights.push({
                id: "productivity-tip",
                type: "tip",
                icon: Sparkles,
                title: "Productivity Tip",
                description: "Try the Pomodoro technique: 25 minutes of focused work, followed by a 5-minute break. It can help maintain concentration.",
                priority: 10,
            });
        }

        generatedInsights.sort((a, b) => a.priority - b.priority);
        setInsights(generatedInsights.slice(0, 3));
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                    <span className="text-sm font-medium text-purple-700">
                        Generating AI insights...
                    </span>
                </div>
            </div>
        );
    }

    if (insights.length === 0) {
        return null;
    }

    return (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-semibold text-purple-900">AI Insights</h3>
                <Sparkles className="w-4 h-4 text-purple-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.map((insight, index) => {
                    const Icon = insight.icon;
                    return (
                        <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "bg-white/80 backdrop-blur-sm rounded-xl p-4 border",
                                insight.type === "warning" && "border-orange-200",
                                insight.type === "tip" && "border-blue-200",
                                insight.type === "info" && "border-purple-200",
                                insight.type === "success" && "border-green-200"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={cn(
                                        "p-2 rounded-lg",
                                        insight.type === "warning" && "bg-orange-100",
                                        insight.type === "tip" && "bg-blue-100",
                                        insight.type === "info" && "bg-purple-100",
                                        insight.type === "success" && "bg-green-100"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "w-4 h-4",
                                            insight.type === "warning" && "text-orange-600",
                                            insight.type === "tip" && "text-blue-600",
                                            insight.type === "info" && "text-purple-600",
                                            insight.type === "success" && "text-green-600"
                                        )}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-neutral-900 mb-1">
                                        {insight.title}
                                    </h4>
                                    <p className="text-xs text-neutral-600 leading-relaxed">
                                        {insight.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
