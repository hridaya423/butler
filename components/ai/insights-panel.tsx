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
  CheckCircle2,
  ArrowRight,
  Loader2,
  StickyNote,
  ListTodo,
  History,
  ExternalLink
} from "lucide-react";
import { Button } from "../ui/button";
import type { AssignmentInsights } from "@/lib/ai/client";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";

type ApiResponse = {
  insights: AssignmentInsights | string;
};

type Memory = {
  id: string;
  content: any;
  type: 'note' | 'task';
  created_at: string;
  context_type: string;
};

type GitHubIssue = {
  id: string;
  title: string;
  html_url: string;
  state: string;
  labels: Array<{ name: string; color: string }>;
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
  const [memories, setMemories] = useState<Memory[]>([]);
  const [githubIssues, setGithubIssues] = useState<GitHubIssue[]>([]);

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
      const message = err instanceof Error ? err.message : "Failed to load AI insights";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemories = async () => {
    if (!hasSupabase) return;
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('ai_memories')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setMemories(data.map((m: any) => ({
        ...m,
        content: typeof m.content === 'string' ? JSON.parse(m.content) : m.content
      })));
    }
  };

  const getMemoryUrl = (memory: Memory) => {
    if (memory.context_type === 'github_pr' || memory.context_type === 'github_issue') {

      if (typeof memory.content === 'object' && memory.content.html_url) {
        return memory.content.html_url;
      }
    }
    return null;
  };

  const getMemoryTitle = (memory: Memory) => {
    if (typeof memory.content === 'string') {
      return memory.content;
    }
    if (typeof memory.content === 'object') {
      return memory.content.title || memory.content.text || JSON.stringify(memory.content);
    }
    return JSON.stringify(memory.content);
  };

  const fetchGitHubIssues = async () => {
    if (!hasSupabase) return;
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('assignments')
      .select('*')
      .eq('source', 'github')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (data) {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      setGithubIssues(data.map((item: any) => {
        const createdAt = new Date(item.created_at);
        const isStale = createdAt < sevenDaysAgo;

        return {
          id: item.id,
          title: item.title,
          html_url: item.external_url || '',
          state: isStale ? 'stale' : (item.status || 'open'),
          labels: []
        };
      }));
    }
  };

  useEffect(() => {
    if (hasSupabase) {
      fetchInsights();
      fetchMemories();
      fetchGitHubIssues();
    } else {
      setError("Configure Supabase to enable AI insights");
    }
  }, [hasSupabase]);

  useEffect(() => {
    const handleSyncComplete = () => {
      fetchInsights();
      fetchMemories();
      fetchGitHubIssues();
    };

    window.addEventListener('butler:sync-complete', handleSyncComplete);
    return () => window.removeEventListener('butler:sync-complete', handleSyncComplete);
  }, [hasSupabase]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">AI Overview</h3>
              <p className="text-sm text-neutral-500">Your daily briefing</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { fetchInsights(); fetchMemories(); }}
            disabled={loading}
            className="text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {loading && !insights && !fallbackText && (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Analyzing your workspace...</p>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {!loading && !error && fallbackText && (
          <Card className="p-6 border-neutral-100 shadow-sm bg-white rounded-2xl">
            <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{fallbackText}</p>
          </Card>
        )}

        {!loading && !error && insights && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="p-5 border-neutral-100 shadow-sm bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
                  <Brain className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-neutral-900 mb-2">Good Evening</h4>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-4">{insights.summary}</p>

                  <div className="flex flex-wrap gap-2">
                    {insights.immediateActions.slice(0, 3).map((action, i) => (
                      <button
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-indigo-50 border border-neutral-200 hover:border-indigo-300 rounded-full text-xs font-medium text-neutral-700 hover:text-indigo-700 transition-all cursor-pointer shadow-sm"
                        onClick={() => { }}
                      >
                        <Target className="w-3 h-3 text-orange-500" />
                        <span className="truncate max-w-[120px]">{action.title}</span>
                        <ArrowRight className="w-3 h-3 opacity-50" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-neutral-700 font-medium text-sm px-1">
                <Target className="w-3.5 h-3.5 text-orange-500" />
                <span>Priorities</span>
                <Badge variant="secondary" className="text-[10px] ml-auto">{insights.immediateActions.length}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {insights.immediateActions.map((item, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-neutral-100 rounded-xl text-sm hover:border-neutral-200 hover:shadow-sm transition-all"
                  >
                    <span className={`w-2 h-2 rounded-full ${item.priority === 'high' ? 'bg-red-500' :
                      item.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                      }`} />
                    <span className="font-medium text-neutral-800 truncate max-w-[200px]">{item.title}</span>
                    <span className="text-[10px] text-neutral-400">{formatDueDate(item.dueDate)}</span>
                  </div>
                ))}
              </div>
            </div>

            {githubIssues.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-neutral-700 font-medium text-sm px-1">
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-600" />
                  <span>GitHub Issues</span>
                  <Badge variant="secondary" className="text-[10px] ml-auto">{githubIssues.length}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {githubIssues.map((issue) => (
                    <a
                      key={issue.id}
                      href={issue.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-3 py-2 bg-white border rounded-xl text-sm hover:shadow-sm transition-all cursor-pointer ${issue.state === 'stale'
                        ? 'border-amber-200 hover:border-amber-300 hover:bg-amber-50/30'
                        : 'border-neutral-100 hover:border-blue-200 hover:bg-blue-50/30'
                        }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${issue.state === 'stale' ? 'bg-amber-500' : 'bg-green-500'}`} />
                      <span className="font-medium text-neutral-800 truncate max-w-[200px]">{issue.title}</span>
                      {issue.state === 'stale' && <Badge variant="secondary" className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0">stale</Badge>}
                      <ExternalLink className="w-3 h-3 text-neutral-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 h-[42px]">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <History className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Memory Stream</h3>
            <p className="text-sm text-neutral-500">Recent saved items</p>
          </div>
        </div>

        <div className="space-y-4">
          {memories.length === 0 ? (
            <Card className="p-8 border-dashed border-neutral-200 bg-neutral-50/50 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                <Sparkles className="w-5 h-5 text-neutral-400" />
              </div>
              <p className="text-sm font-medium text-neutral-900">No memories yet</p>
              <p className="text-xs text-neutral-500 mt-1 max-w-[200px]">
                Use the AI assistant to save notes and create tasks from your dashboard.
              </p>
            </Card>
          ) : (
            memories.map((memory, i) => {
              const url = getMemoryUrl(memory);
              const title = getMemoryTitle(memory);
              const CardWrapper = url ? 'a' : 'div';

              return (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <CardWrapper
                    {...(url ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="block"
                  >
                    <Card className={`p-4 border-neutral-100 shadow-sm bg-white rounded-xl group transition-all ${url ? 'hover:shadow-md hover:border-indigo-200 cursor-pointer' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${memory.type === 'task' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                          {memory.type === 'task' ? <ListTodo className="w-4 h-4" /> : <StickyNote className="w-4 h-4" />}
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide h-5 px-1.5">
                              {memory.context_type}
                            </Badge>
                            <span className="text-[10px] text-neutral-400">
                              {new Date(memory.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-700 font-medium line-clamp-2">
                            {title}
                          </p>
                          {url && (
                            <div className="flex items-center gap-1 text-[10px] text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ExternalLink className="w-3 h-3" />
                              <span>View source</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </CardWrapper>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
