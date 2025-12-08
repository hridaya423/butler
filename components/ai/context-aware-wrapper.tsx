"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AssistantPanel, type AIAction } from "./assistant-panel";

interface ContextAwareWrapperProps {
    children: React.ReactNode;
    contextType: string;
    data: any;
    className?: string;
}

export function ContextAwareWrapper({
    children,
    contextType,
    data,
    className,
}: ContextAwareWrapperProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [insight, setInsight] = useState<string>("");
    const [actions, setActions] = useState<AIAction[]>([]);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);

    const handleOpenChange = async (open: boolean) => {
        setIsOpen(open);
        if (open && !hasAnalyzed) {
            setIsLoading(true);
            try {
                const response = await fetch("/api/ai/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contextType, data }),
                });

                if (response.ok) {
                    const result = await response.json();
                    setInsight(result.insight || "No insight available.");
                    setActions(result.actions || []);
                    setHasAnalyzed(true);
                }
            } catch (error) {
                setInsight("Failed to analyze context.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <div
                    className={cn(
                        "relative group cursor-pointer transition-all duration-300 rounded-xl",
                        isOpen && "ring-2 ring-indigo-500/20 bg-indigo-50/10",
                        className
                    )}
                >
                    {children}

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 pointer-events-none">
                        <div className="bg-white/90 backdrop-blur-sm text-indigo-600 shadow-sm border border-indigo-100 rounded-full p-1.5 transform scale-90 group-hover:scale-100 transition-transform">
                            <Sparkles className="w-3.5 h-3.5" />
                        </div>
                    </div>

                    <div className={cn(
                        "absolute inset-0 border-2 border-indigo-400/30 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none",
                        isOpen ? "opacity-100" : "group-hover:opacity-100"
                    )} />
                </div>
            </PopoverTrigger>
            <PopoverContent
                side="right"
                align="start"
                sideOffset={20}
                className="p-0 border-0 bg-transparent shadow-none w-auto"
            >
                <AssistantPanel
                    insight={insight}
                    actions={actions}
                    isLoading={isLoading}
                    contextType={contextType}
                />
            </PopoverContent>
        </Popover>
    );
}
