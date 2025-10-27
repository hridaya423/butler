/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  AlertTriangle,
  Brain,
  CalendarClock,
  Clock3,
  RefreshCw,
  Sparkles,
  Target,
  BookOpen,
} from "lucide-react";
import { Button } from "../ui/button";
import type { AssignmentInsights } from "@/lib/ai/groq";

type ApiResponse = {
  insights: AssignmentInsights | string;
};

const formatDueDate = (iso: string | null) => {
  if (!iso) return "No due date";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "No due date";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatMinutes = (minutes: number) => `${minutes} min`;

export function InsightsPanel() {
  const [insights, setInsights] = useState<AssignmentInsights | null>(null);
  const [fallbackText, setFallbackText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSupabase = useMemo(
    () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    [],
  );

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/insights", { cache: "no-store" });
      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Supabase not configured. Add GROQ_API_KEY to .env.local");
      }

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error((data as any)?.error || "Failed to fetch insights");
      }

      if (typeof data.insights === "string") {
        setFallbackText(data.insights);
        setInsights(null);
      } else {
        setInsights(data.insights);
        setFallbackText(null);
      }
    } catch (err) {
      console.error("Error fetching insights:", err);
      const message = err instanceof Error ? err.message : "Failed to load AI insights";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasSupabase) {
      fetchInsights();
    } else {
      setError("Configure Supabase to enable AI insights");
    }
  }, [hasSupabase]);

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 via-white to-blue-50 border-purple-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center border border-purple-200">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Insights</h3>
            <p className="text-xs text-gray-500">Personalised plan based on your current assignments</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchInsights}
          disabled={loading}
          className="text-gray-600 hover:text-gray-900"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading && !insights && !fallbackText && (
        <div className="flex items-center gap-2 text-gray-600">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <p className="text-sm">Analyzing your assignments...</p>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && fallbackText && (
        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {fallbackText}
        </div>
      )}

      {!loading && !error && insights && (
        <div className="space-y-5 text-sm text-gray-700">
          <div className="rounded-lg border border-purple-100 bg-white/80 px-4 py-3 shadow-xs">
            <p className="leading-relaxed">{insights.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-lg border border-gray-200 bg-white/90 p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-semibold text-gray-900">Top priorities</h4>
              </div>
              <div className="space-y-3">
                {insights.immediateActions.length === 0 && (
                  <p className="text-xs text-gray-500">Nothing urgent—review upcoming work or get ahead.</p>
                )}
                {insights.immediateActions.map((item) => (
                  <div
                    key={`${item.title}-${item.dueDate ?? "none"}`}
                    className="rounded-md border border-gray-200 bg-gray-50/60 px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.reason}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                          {item.priority}
                        </Badge>
                        <p className="text-[10px] text-gray-500">{formatDueDate(item.dueDate)}</p>
                        {item.subject && (
                          <p className="text-[10px] text-gray-400">Topic: {item.subject}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white/90 p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <CalendarClock className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-semibold text-gray-900">Suggested schedule</h4>
              </div>
              <div className="space-y-2">
                {insights.suggestedSchedule.map((slot) => (
                  <div key={`${slot.day}-${slot.focus}`} className="flex items-start gap-3 rounded-md bg-gray-50 px-3 py-2">
                    <div className="mt-0.5">
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wide bg-purple-100 text-purple-700">
                        {slot.day}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">{slot.focus}</p>
                      {slot.notes && <p className="text-xs text-gray-500">{slot.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-lg border border-gray-200 bg-white/90 p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Clock3 className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-semibold text-gray-900">Focused work blocks</h4>
              </div>
              <div className="space-y-2">
                {insights.timeEstimates.map((block) => (
                  <div key={`${block.title}-${block.minutes}`} className="rounded-md bg-gray-50 px-3 py-2 border border-gray-200">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900">{block.title}</p>
                      <Badge className="bg-purple-600 text-white text-[11px]">{formatMinutes(block.minutes)}</Badge>
                    </div>
                    {block.note && <p className="text-xs text-gray-500 mt-1">{block.note}</p>}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white/90 p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-semibold text-gray-900">Study tips</h4>
              </div>
              <div className="space-y-3">
                {insights.studyTips.map((tipGroup) => (
                  <div key={tipGroup.subject} className="rounded-md bg-gray-50 px-3 py-2 border border-gray-200">
                    <p className="text-xs font-semibold uppercase text-gray-500 tracking-wide mb-2">
                      {tipGroup.subject}
                    </p>
                    <ul className="space-y-1.5">
                      {tipGroup.tips.map((tip) => (
                        <li key={tip} className="text-xs text-gray-600 flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {insights.conflicts.length > 0 && (
            <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-xs">
              <div className="flex items-center gap-2 mb-2 text-amber-800">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="text-sm font-semibold">Watch these overlapping deadlines</h4>
              </div>
              <Separator className="border-amber-200 my-2" />
              <ul className="space-y-1.5 text-xs text-amber-900">
                {insights.conflicts.map((conflict) => (
                  <li key={conflict}>• {conflict}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </Card>
  );
}
