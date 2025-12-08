"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterState {
    dueDate: "all" | "today" | "week" | "overdue";
    subject: string;
    priority: "all" | "high" | "medium" | "low";
    showCompleted: boolean;
}

interface EducationFiltersProps {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
}

export function EducationFilters({ filters, setFilters }: EducationFiltersProps) {
    const dueDateOptions = [
        { id: "all" as const, label: "All Dates", icon: Calendar },
        { id: "today" as const, label: "Due Today", icon: Clock },
        { id: "week" as const, label: "This Week", icon: ChevronRight },
        { id: "overdue" as const, label: "Overdue", icon: AlertCircle },
    ];

    const priorityOptions = [
        { id: "all" as const, label: "All Priorities" },
        { id: "high" as const, label: "High", color: "bg-red-100 text-red-700" },
        { id: "medium" as const, label: "Medium", color: "bg-orange-100 text-orange-700" },
        { id: "low" as const, label: "Low", color: "bg-green-100 text-green-700" },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Due Date
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                    {dueDateOptions.map((option) => {
                        const Icon = option.icon;
                        const isActive = filters.dueDate === option.id;

                        return (
                            <button
                                key={option.id}
                                onClick={() =>
                                    setFilters({ ...filters, dueDate: option.id })
                                }
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-neutral-900 text-white"
                                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                )}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Priority
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                    {priorityOptions.map((option) => {
                        const isActive = filters.priority === option.id;

                        return (
                            <button
                                key={option.id}
                                onClick={() =>
                                    setFilters({ ...filters, priority: option.id })
                                }
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-neutral-900 text-white"
                                        : option.color
                                            ? option.color
                                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                )}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                    Subject
                    <Badge variant="secondary" className="text-[10px] bg-purple-100 text-purple-600">
                        AI
                    </Badge>
                </label>
                <div className="flex items-center gap-2">
                    <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-neutral-900 text-white"
                    >
                        All Subjects
                    </button>
                    <span className="text-xs text-neutral-400">
                        AI categorization coming soon
                    </span>
                </div>
            </div>
        </div>
    );
}
