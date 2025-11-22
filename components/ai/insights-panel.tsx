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
    <Card className="p-6 bg-white border-orange-100 shadow-sm rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>AI Insights</h3>
            <p className="text-sm text-neutral-500 font-light">Your personalized productivity plan</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchInsights}
          disabled={loading}
          className="text-neutral-600 hover:text-neutral-900 hover:bg-orange-50 transition-all duration-300"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading && !insights && !fallbackText && (
        <div className="flex items-center gap-3 text-neutral-600 py-8">
          <Sparkles className="w-5 h-5 animate-pulse text-purple-500" />
          <p className="text-base font-light">Analyzing your messages...</p>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-4 rounded-xl font-light">
          {error}
        </div>
      )}

      {!loading && !error && fallbackText && (
        <div className="text-base text-neutral-700 whitespace-pre-wrap leading-relaxed font-light">
          {fallbackText}
        </div>
      )}

      {!loading && !error && insights && (
        <div className="space-y-6 text-sm text-neutral-700">
          <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 px-5 py-4">
            <p className="leading-relaxed font-light text-neutral-600">{insights.summary}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <section className="rounded-xl border border-neutral-100 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-purple-600" />
                <h4 className="text-base font-semibold text-neutral-900">Top priorities</h4>
              </div>
              <div className="space-y-3">
                {insights.immediateActions.length === 0 && (
                  <p className="text-sm text-neutral-500 font-light">Nothing urgent—review upcoming work or get ahead.</p>
                )}
                {insights.immediateActions.map((item) => (
                  <div
                    key={`${item.title}-${item.dueDate ?? "none"}`}
                    className="rounded-lg border border-neutral-100 bg-neutral-50/50 px-4 py-3 hover:border-orange-200 hover:bg-white transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-neutral-900">{item.title}</p>
                        <p className="text-xs text-neutral-500 mt-1.5 font-light">{item.reason}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant="outline" className="text-[9px] uppercase tracking-wide border-neutral-200">
                          {item.priority}
                        </Badge>
                        <p className="text-[10px] text-neutral-500">{formatDueDate(item.dueDate)}</p>
                        {item.subject && (
                          <p className="text-[10px] text-neutral-400">Topic: {item.subject}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-neutral-100 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <CalendarClock className="w-4 h-4 text-purple-600" />
                <h4 className="text-base font-semibold text-neutral-900">Suggested schedule</h4>
              </div>
              <div className="space-y-3">
                {insights.suggestedSchedule.map((slot) => (
                  <div key={`${slot.day}-${slot.focus}`} className="flex items-start gap-3 rounded-lg bg-neutral-50 px-4 py-3 border border-neutral-100">
                    <div className="mt-0.5">
                      <Badge variant="secondary" className="text-[9px] uppercase tracking-wide bg-purple-100 text-purple-700 border-0">
                        {slot.day}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-neutral-900">{slot.focus}</p>
                      {slot.notes && <p className="text-xs text-neutral-500 font-light">{slot.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <section className="rounded-xl border border-neutral-100 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock3 className="w-4 h-4 text-purple-600" />
                <h4 className="text-base font-semibold text-neutral-900">Focused work blocks</h4>
              </div>
              <div className="space-y-3">
                {insights.timeEstimates.map((block) => (
                  <div key={`${block.title}-${block.minutes}`} className="rounded-lg bg-neutral-50 px-4 py-3 border border-neutral-100">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-neutral-900">{block.title}</p>
                      <Badge className="bg-purple-600 text-white text-[10px] px-2 py-0.5">{formatMinutes(block.minutes)}</Badge>
                    </div>
                    {block.note && <p className="text-xs text-neutral-500 mt-2 font-light">{block.note}</p>}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-neutral-100 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <h4 className="text-base font-semibold text-neutral-900">Study tips</h4>
              </div>
              <div className="space-y-3">
                {insights.studyTips.map((tipGroup) => (
                  <div key={tipGroup.subject} className="rounded-lg bg-neutral-50 px-4 py-3 border border-neutral-100">
                    <p className="text-xs font-semibold uppercase text-neutral-500 tracking-wide mb-2">
                      {tipGroup.subject}
                    </p>
                    <ul className="space-y-2">
                      {tipGroup.tips.map((tip) => (
                        <li key={tip} className="text-xs text-neutral-600 flex gap-2 font-light">
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
            <section className="rounded-xl border border-orange-200 bg-orange-50 px-5 py-4">
              <div className="flex items-center gap-2 mb-3 text-orange-800">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="text-base font-semibold">Watch these overlapping deadlines</h4>
              </div>
              <Separator className="border-orange-200 my-3" />
              <ul className="space-y-2 text-sm text-orange-900 font-light">
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
