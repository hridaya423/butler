
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface GitHubAIFollowupProps {
  activeTab: 'prs' | 'issues' | 'repos' | 'commits';
}

interface Issue {
  id: string;
  title: string;
  state: string;
  is_assigned: boolean;
  comments_count: number;
  labels: any;
  github_created_at: string;
  author_username: string;
  html_url: string;
}

interface PR {
  id: string;
  title: string;
  state: string;
  draft: boolean;
  merged: boolean;
  review_status: string;
  comments_count: number;
  github_created_at: string;
  html_url: string;
}

export function GitHubAIFollowup({ activeTab }: GitHubAIFollowupProps) {
  const [aiThoughts, setAiThoughts] = useState<Array<{
    id: string;
    tone: 'casual' | 'urgent' | 'excited' | 'helpful' | 'analytical';
    message: string;
    timestamp: Date;
    context: string;
    actions: Array<{
      label: string;
      action: () => void;
      primary?: boolean;
    }>;
  }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    setIsProcessing(true);
    analyzeAndRespond();

    const interval = setInterval(() => {
      analyzeAndRespond();
      setPulseKey(prev => prev + 1);
    }, 15000);

    return () => clearInterval(interval);
  }, [activeTab, pulseKey]);

  const analyzeAndRespond = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsProcessing(false);
        return;
      }

      const contextData = await fetchContextData(activeTab);

      if (contextData && contextData.items.length > 0) {
        const dynamicInsights = generateDynamicInsights(contextData, activeTab, pulseKey);

        if (dynamicInsights.length > 0) {
          setTimeout(() => {
            setAiThoughts(dynamicInsights);
          }, 400);
        }
      }

      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
    }
  };

  const generateDynamicInsights = (context: { items: any[], metrics: any }, tab: string, key: number) => {
    const thoughts: any[] = [];
    const { items, metrics } = context;
    const now = new Date();

    const patterns = extractPatterns(items);

    if (tab === 'issues') {
      const open = items.filter((i: any) => i.state === 'open');
      const unassigned = open.filter((i: any) => !i.is_assigned);
      const stale = open.filter((i: any) => (Date.now() - new Date(i.github_created_at).getTime()) > (7 * 24 * 60 * 60 * 1000));
      const highActivity = open.filter((i: any) => i.comments_count > 5);
      const newlyCreated = open.filter((i: any) => (Date.now() - new Date(i.github_created_at).getTime()) < (24 * 60 * 60 * 1000));

      if (unassigned.length > 0) {
        const oldest = unassigned.sort((a: any, b: any) => new Date(a.github_created_at).getTime() - new Date(b.github_created_at).getTime())[0];
        const ageInDays = Math.floor((Date.now() - new Date(oldest.github_created_at).getTime()) / (1000 * 60 * 60 * 24));

        thoughts.push({
          id: `unassigned-${key}-${oldest.id}`,
          tone: patterns.urgent ? 'urgent' : 'helpful',
          message: patterns.urgent
            ? `We've got ${unassigned.length} unassigned issues sitting around, and one of them is ${ageInDays} days old. "${oldest.title}" - might be time to either assign it or close it.`
            : `Found ${unassigned.length} issues that don't have anyone assigned. The one about "${oldest.title}" has been waiting the longest - want to bump it?`,
          timestamp: now,
          context: `${unassigned.length} unassigned`,
          actions: [{
            label: `Review ${unassigned.length > 1 ? 'them' : 'it'}`,
            action: () => toast(`Looking at ${unassigned.length} unassigned...`, { icon: "📋" }),
            primary: true
          }]
        });
      }

      if (stale.length > 0) {
        thoughts.push({
          id: `stale-${key}`,
          tone: 'casual' as const,
          message: stale.length > 3
            ? `Yikes, ${stale.length} issues have been open for over a week. Some might just need a gentle nudge to get closed.`
            : `I see ${stale.length} issues gathering dust - they've been open for a week+. Let's clean house?`,
          timestamp: now,
          context: `${stale.length} stale`,
          actions: [{
            label: "Show me",
            action: () => toast("Filtering stale issues...", { icon: "⏰" })
          }]
        });
      }

      if (highActivity.length > 0) {
        const mostActive = highActivity.sort((a: any, b: any) => b.comments_count - a.comments_count)[0];
        thoughts.push({
          id: `active-${key}-${mostActive.id}`,
          tone: 'excited' as const,
          message: `Whoa, "${mostActive.title}" has ${mostActive.comments_count} comments! That's heating up - might want to jump in before it becomes a problem.`,
          timestamp: now,
          context: "High activity",
          actions: [{
            label: "View",
            action: () => {
              window.open(mostActive.html_url, '_blank');
              toast("Opening most active...", { icon: "🔥" });
            },
            primary: true
          }]
        });
      }

      if (newlyCreated.length > 0 && newlyCreated.length < 4) {
        thoughts.push({
          id: `new-${key}`,
          tone: 'analytical' as const,
          message: `Just noticed ${newlyCreated.length} new issue${newlyCreated.length > 1 ? 's' : ''} popped up in the last 24 hours. Fresh ones are usually easier to tackle before they age.`,
          timestamp: now,
          context: `${newlyCreated.length} new`,
          actions: [{
            label: "Check them out",
            action: () => toast("Showing new issues...", { icon: "✨" })
          }]
        });
      }

      if (open.length === 0 && items.length > 0) {
        const completedCount = items.filter((i: any) => i.state === 'closed').length;
        thoughts.push({
          id: `clear-${key}`,
          tone: 'excited' as const,
          message: [
            `All issues closed! Beautiful. Your repo is cleaner than my apartment.`,
            `Zero open issues! You're in maintenance mode now - want me to help with something else?`,
            `Clean slate! All ${completedCount} issues are resolved. High five! ✋`,
            `Perfect. All issues wrapped up. Your future self will thank you.`
          ][Math.floor(Math.random() * 4)],
          timestamp: now,
          context: "All clear",
          actions: []
        });
      }
    }

    if (tab === 'prs') {
      const open = items.filter((p: any) => p.state === 'open');
      const draft = open.filter((p: any) => p.draft);
      const pendingReview = open.filter((p: any) => !p.draft && p.review_status === 'pending');
      const approved = open.filter((p: any) => p.review_status === 'approved');
      const authorCounts = countAuthors(items);

      if (approved.length > 0) {
        thoughts.push({
          id: `ready-${key}`,
          tone: 'excited' as const,
          message: [
            `${approved.length} PR${approved.length > 1 ? 's' : ''} are approved and just... sitting there! Merge that green button and feel the dopamine hit.`,
            `Looks like ${approved.length} PR${approved.length > 1 ? 's are' : ' is'} ready to merge. Want me to help you batch them?`,
            `${approved.length} green checkmarks waiting for you. You could clear those in, what, 2 minutes?`
          ][Math.floor(Math.random() * 3)],
          timestamp: now,
          context: `${approved.length} ready to merge`,
          actions: [{
            label: "View merge queue",
            action: () => toast("Loading approved PRs...", { icon: "🚀" }),
            primary: true
          }]
        });
      }

      if (pendingReview.length > 0) {
        const oldest = pendingReview.sort((a: any, b: any) => new Date(a.github_created_at).getTime() - new Date(b.github_created_at).getTime())[0];
        const daysWaiting = Math.floor((Date.now() - new Date(oldest.github_created_at).getTime()) / (1000 * 60 * 60 * 24));

        thoughts.push({
          id: `stuck-${key}`,
          tone: daysWaiting > 3 ? 'urgent' : 'casual' as const,
          message: daysWaiting > 3
            ? `Oof, a PR's been waiting ${daysWaiting} days for review. That's the bottleneck right there.`
            : `${pendingReview.length} PR${pendingReview.length > 1 ? 's' : ''} need review. The oldest is from ${daysWaiting} days ago - might be worth checking with your team.`,
          timestamp: now,
          context: "Needs review",
          actions: [{
            label: "Ping reviewers",
            action: () => toast("Drafting nudges...", { icon: "👀" })
          }]
        });
      }

      if (draft.length > 0) {
        thoughts.push({
          id: `draft-${key}`,
          tone: 'casual' as const,
          message: draft.length > 2
            ? `${draft.length} draft PRs hanging out. Some might be abandoned, some might just need help.`
            : `Spotted ${draft.length} draft PR${draft.length > 1 ? 's' : ''}. I can help you check if any are ready to graduate to "real PR".`,
          timestamp: now,
          context: `${draft.length} draft${draft.length > 1 ? 's' : ''}`,
          actions: [{
            label: "Check drafts",
            action: () => toast("Loading drafts...", { icon: "📝" })
          }]
        });
      }

      const goodUnderReview = authorCounts.filter((a: any) => a.value <= 2 && a.value > 0);
      if (goodUnderReview.length > 2) {
        thoughts.push({
          id: `balance-${key}`,
          tone: 'analytical' as const,
          message: `Nice work spreading reviews across the team - ${goodUnderReview.length} different people are involved. Keeping the bus factor healthy!`,
          timestamp: now,
          context: "Team balance",
          actions: []
        });
      }
    }

    return thoughts;
  };


  const extractPatterns = (items: any[]) => {
    const patterns = {
      urgent: false,
      randomness: Math.random(),
      timeOfDay: new Date().getHours(),
    };

    const stale = items.filter(i => (Date.now() - new Date(i.github_created_at || i.created_at).getTime()) > (7 * 24 * 60 * 60 * 1000));
    if (stale.length > 3) patterns.urgent = true;

    return patterns;
  };

  const determineTone = (openCount: number, patterns: any) => {
    return {
      urgent: openCount > 10 || patterns.urgent,
      casual: patterns.randomness > 0.7,
      excited: patterns.randomness > 0.85,
      helpful: patterns.randomness > 0.5 && !patterns.urgent
    };
  };

  const countAuthors = (items: any[]) => {
    const authorMap = new Map();
    items.forEach(item => {
      const author = item.author_username;
      if (author) {
        authorMap.set(author, (authorMap.get(author) || 0) + 1);
      }
    });
    return Array.from(authorMap.entries()).map(([name, value]) => ({ name, value }));
  };

  const keys = {
    pick: (arr: string[]) => arr[Math.floor(Math.random() * arr.length)],
    pickConditional: (condition: boolean, ifTrue: string, ifFalse: string) => condition ? ifTrue : ifFalse
  };

  const fetchContextData = async (tab: string) => {
    const supabase = createClient();
    if (tab === 'issues') {
      const { data } = await supabase.from('github_issues').select('*').order('github_updated_at', { ascending: false });
      return { items: data || [], metrics: { total: data?.length || 0 } };
    }
    if (tab === 'prs') {
      const { data } = await supabase.from('github_pull_requests').select('*').order('github_created_at', { ascending: false });
      return { items: data || [], metrics: { total: data?.length || 0 } };
    }
    return { items: [], metrics: {} };
  };

  return (
    <AnimatePresence>
      {aiThoughts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          {aiThoughts.map((thought, index) => (
            <motion.div
              key={thought.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15, type: "spring", stiffness: 300, damping: 24 }}
            >
              <Card className="p-4 bg-gradient-to-br from-white to-neutral-50 border border-neutral-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isProcessing ? 'bg-purple-100 animate-pulse' : 'bg-purple-50'
                      }`}>
                      <Sparkles className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={
                      thought.tone === 'excited' ? 'text-[15px] font-semibold text-neutral-900 leading-relaxed' :
                        thought.tone === 'urgent' ? 'text-[15px] font-semibold text-orange-700 leading-relaxed' :
                          'text-[15px] text-neutral-900 leading-relaxed'
                    }>
                      {thought.message}
                    </div>

                    {thought.actions.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {thought.actions.map((action, i) => (
                          <button
                            key={i}
                            onClick={action.action}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${action.primary
                              ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                              : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                              }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <div className="text-[11px] text-neutral-500 font-mono">
                      {thought.context}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
