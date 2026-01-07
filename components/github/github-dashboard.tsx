'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { PullRequestsPanel } from './pull-requests-panel';
import { IssuesPanel } from './issues-panel';
import { RepositoriesPanel } from './repositories-panel';
import { CommitsPanel } from './commits-panel';
import {
  Sparkles, Brain, Zap, MessageSquare, Activity, TrendingUp,
  GitPullRequest, AlertCircle, Code, GitCommit,
  GitBranch, ExternalLink, Users, Calendar, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { shouldAnalyze } from '@/lib/ai-data-settings';

interface GitHubProfile {
  github_username: string;
  github_name: string | null;
  github_avatar_url: string | null;
  public_repos: number;
  followers: number;
  following: number;
  last_synced_at: string | null;
}

export function GitHubDashboard() {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'prs' | 'issues' | 'repos' | 'commits'>('issues');

  const [aiInsights, setAiInsights] = useState<Array<{
    id: string;
    type: 'summary' | 'alert' | 'opportunity' | 'trend';
    message: string;
    tone: 'casual' | 'excited' | 'urgent' | 'analytical';
    context?: string;
    data?: any;
    actions?: Array<{ label: string; action: () => void; primary?: boolean }>;
  }>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    loadProfile();
    analyzeGitHubData();
  }, []);

  useEffect(() => {
    const handleSyncComplete = () => {
      loadProfile();
      analyzeGitHubData();
    };

    window.addEventListener('butler:sync-complete', handleSyncComplete);
    return () => window.removeEventListener('butler:sync-complete', handleSyncComplete);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      analyzeGitHubData();
      setPulseKey(prev => prev + 1);
    }, 20000);
    return () => clearInterval(interval);
  }, [activeTab, pulseKey]);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/github/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/github/sync', { method: 'POST' });

      if (response.status === 401 || response.status === 403) {
        const supabase = createClient();
        toast('GitHub token expired', {
          description: 'Your session has expired. Please re-authenticate to sync.',
          action: {
            label: 'Re-authenticate',
            onClick: async () => {
              const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                  scopes: 'repo read:user user:email'
                }
              });
              if (error) {
                toast('Failed to start re-authentication', { icon: '❌' });
              } else if (data?.url) {
                window.location.href = data.url;
              }
            }
          },
          duration: 10000
        });
        return;
      }

      if (response.ok) {
        await loadProfile();
        analyzeGitHubData();
        toast('GitHub data synced successfully', { icon: '✅' });
      } else {
        const data = await response.json();
        toast(data.error || 'Failed to sync GitHub data', { icon: '❌' });
      }
    } catch (error) {
      toast('Failed to sync GitHub data', { icon: '❌' });
    } finally {
      setSyncing(false);
    }
  };

  const analyzeGitHubData = async () => {
    if (!shouldAnalyze('github')) {
      setAiInsights([]);
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAnalyzing(false);
        return;
      }

      if (activeTab === 'issues') {
        const { data } = await supabase.from('github_issues').select('*').eq('user_id', user.id).order('github_updated_at', { ascending: false });
        if (data && data.length > 0) {
          generateIssueInsights(data);
        }
      } else if (activeTab === 'prs') {
        const { data } = await supabase.from('github_pull_requests').select('*').eq('user_id', user.id).order('github_created_at', { ascending: false });
        if (data && data.length > 0) {
          generatePRInsights(data);
        }
      }
    } catch (error) {
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateIssueInsights = (issues: any[]) => {
    const open = issues.filter(i => i.state === 'open');
    const unassigned = open.filter(i => !i.is_assigned);
    const stale = open.filter(i => (Date.now() - new Date(i.github_created_at).getTime()) > (7 * 24 * 60 * 60 * 1000));
    const insights: typeof aiInsights = [];

    if (open.length > 0) {
      const oldestStale = stale.length > 0 ?
        stale.map(i => ({ title: i.title, age: Math.floor((Date.now() - new Date(i.github_created_at).getTime()) / (1000 * 60 * 60 * 24)) }))
          .sort((a, b) => b.age - a.age)[0] : null;

      const summary = `Found ${open.length} open issues. ${stale.length > 0 ? `${stale.length} are getting stale (oldest: "${oldestStale?.title}" from ${oldestStale?.age} days ago).` : 'All fresh.'} ${unassigned.length > 0 ? `${unassigned.length} need assignment.` : ''}`;

      insights.push({
        id: `issues-summary-${Date.now()}`,
        type: 'summary',
        tone: stale.length > 3 ? 'urgent' : 'casual',
        message: stale.length > 3 ? `You've got a backlog here — ${stale.length} issues are aging. ${unassigned.length > 0 ? `${unassigned.length} aren't even assigned.` : ''} Time to clean house?` : summary,
        context: `${open.length} open • ${stale.length} stale`,
        actions: stale.length > 0 ? [{ label: "Review stale ones", action: () => toast("Filtering stale issues...", { icon: "⏰" }) }] : []
      });
    }

    const highActivity = open.filter(i => i.comments_count > 5);
    if (highActivity.length > 0) {
      const mostActive = highActivity.sort((a, b) => b.comments_count - a.comments_count)[0];
      insights.push({
        id: `active-issue-${Date.now()}`,
        type: 'alert',
        tone: 'excited',
        message: `"${mostActive.title}" is heating up — ${mostActive.comments_count} comments. Might want to check in before it escalates.`,
        context: `${mostActive.comments_count} comments`,
        actions: [{ label: "View", action: () => window.open(mostActive.html_url, '_blank') }]
      });
    }

    const authors: Record<string, number> = {};
    issues.forEach(i => {
      const user = i.author_username;
      if (user) {
        authors[user] = (authors[user] || 0) + 1;
      }
    });

    const sortedAuthors = Object.entries(authors).sort((a, b) => b[1] - a[1]);
    if (sortedAuthors.length > 0) {
      const topAuthor = sortedAuthors[0];
      if (topAuthor && topAuthor[1] > 3) {
        insights.push({
          id: `workload-${Date.now()}`,
          type: 'trend' as const,
          tone: 'analytical' as const,
          message: `${topAuthor[0]} has opened ${topAuthor[1]} of the recent issues — might want to check if they need help.`,
          context: "Bus factor",
          actions: []
        });
      }
    }

    setAiInsights(insights);
  };

  const generatePRInsights = (prs: any[]) => {
    const open = prs.filter(p => p.state === 'open' && !p.draft);
    const draft = prs.filter(p => p.draft);
    const approved = open.filter(p => p.review_status === 'approved');
    const pending = open.filter(p => p.review_status === 'pending');
    const mergedThisWeek = prs.filter(p => p.merged && (Date.now() - new Date(p.merged_at || p.github_updated_at).getTime()) < (7 * 24 * 60 * 60 * 1000));

    const insights: typeof aiInsights = [];

    if (open.length > 0) {
      const summary = `${approved.length} ready to merge • ${pending.length} waiting review • ${draft.length} in draft`;
      insights.push({
        id: `pr-summary-${Date.now()}`,
        type: 'summary',
        tone: approved.length > 0 ? 'excited' : 'casual',
        message: approved.length > 0 ? `Your PR pipeline is clear — ${approved.length} PR${approved.length > 1 ? 's are' : ' is'} approved and ready to merge. Quick wins!` : `${open.length} open PR${open.length > 1 ? 's' : ''} — ${pending.length} need review, ${approved.length} ready to ship.`,
        context: summary,
        actions: approved.length > 0 ? [{ label: "View queue", action: () => toast("Loading approved PRs...", { icon: "🚀" }) }] : []
      });
    }

    if (pending.length > 3) {
      const oldest = pending.sort((a, b) => new Date(a.github_created_at).getTime() - new Date(b.github_created_at).getTime())[0];
      const daysWaiting = Math.floor((Date.now() - new Date(oldest.github_created_at).getTime()) / (1000 * 60 * 60 * 24));
      insights.push({
        id: `bottleneck-${Date.now()}`,
        type: 'alert',
        tone: daysWaiting > 5 ? 'urgent' : 'casual',
        message: daysWaiting > 5 ? `Review bottleneck — "${oldest.title}" has been waiting ${daysWaiting} days. Your team might be blocked.` : `${pending.length} PRs in review queue. "${oldest.title}" is ${daysWaiting} days old.`,
        context: `${pending.length} review${pending.length > 1 ? 's' : ''} pending`,
        actions: [{ label: "Nudge reviewers", action: () => toast("Drafting team nudge...", { icon: "👀" }) }]
      });
    }

    if (mergedThisWeek.length > 0) {
      insights.push({
        id: `velocity-${Date.now()}`,
        type: 'trend',
        tone: 'excited',
        message: `${mergedThisWeek.length} PR${mergedThisWeek.length > 1 ? 's' : ''} merged this week. Your velocity is looking solid!`,
        context: "Last 7 days",
        actions: []
      });
    }

    setAiInsights(insights);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <GitBranch className="w-8 h-8 text-neutral-300" />
        </div>
        <p className="text-base font-medium text-neutral-900">Loading GitHub data...</p>
        <p className="text-sm text-neutral-500">Fetching your repositories and activity.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="w-20 h-20 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
          <GitBranch className="w-10 h-10 text-neutral-400" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">
          GitHub Not Connected
        </h3>
        <p className="text-sm text-neutral-500 max-w-sm mb-8">
          Connect your GitHub account to see your repositories, pull requests, issues, and commits all in one place.
        </p>
        <Button
          onClick={() => window.location.href = '/auth/github'}
          className="gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-6 h-11 rounded-xl"
        >
          <GitBranch className="w-4 h-4" />
          Connect GitHub
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'prs', label: 'Pull Requests', icon: GitPullRequest },
    { id: 'issues', label: 'Issues', icon: AlertCircle },
    { id: 'repos', label: 'Repositories', icon: Code },
    { id: 'commits', label: 'Activity', icon: GitCommit },
  ] as const;

  return (
    <div className="space-y-7">
      {}
      <div className="bg-gradient-to-br from-white to-neutral-50 border border-neutral-200/60 shadow-sm rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {profile.github_avatar_url ? (
              <img
                src={profile.github_avatar_url}
                alt={profile.github_username}
                className="w-20 h-20 rounded-2xl border-3 border-white shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center border-3 border-white shadow-md">
                <Users className="w-8 h-8 text-neutral-400" />
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight mb-1">
                {profile.github_name || profile.github_username}
              </h1>
              <a
                href={`https://github.com/${profile.github_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-500 hover:text-purple-600 transition-colors flex items-center gap-1.5 mb-3"
              >
                @{profile.github_username}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-neutral-200 font-medium">
                  <Code className="w-4 h-4 text-purple-500" />
                  <span>{profile.public_repos} repositories</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-neutral-200 font-medium">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>{profile.followers} followers</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-neutral-200 font-medium">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>Following {profile.following}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <div className="text-right hidden md:block">
              <p className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wide mb-1">Last synced</p>
              <p className="text-xs text-neutral-600 font-medium flex items-center justify-end gap-2">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                {profile.last_synced_at
                  ? new Date(profile.last_synced_at).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
            <Button
              onClick={handleSync}
              disabled={syncing}
              className="gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white transition-all h-10 px-5 rounded-xl font-medium shadow-sm hover:shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync data'}
            </Button>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden shadow-sm">
        {}
        <div className="border-b border-neutral-100/80 px-6 py-4 bg-gradient-to-r from-purple-50/50 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                {isAnalyzing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  >
                    <Brain className="w-4 h-4 text-purple-600" />
                  </motion.div>
                ) : (
                  <Sparkles className="w-4 h-4 text-purple-600" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">AI Assistant</h3>
                <p className="text-xs text-neutral-500">
                  {isAnalyzing ? `Analyzing ${activeTab} data...` : 'Live monitoring'}
                </p>
              </div>
            </div>
            {aiInsights.length > 0 && (
              <div className="hidden md:flex items-center gap-2 text-xs text-neutral-500">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span>Live updated</span>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="p-5 space-y-3">
          <AnimatePresence mode="wait">
            {aiInsights.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 0.5 }}
                className="py-12 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-10 h-10 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-5 h-5 text-neutral-400" />
                  </div>
                  <p className="text-sm text-neutral-500 font-medium">AI is watching your back...</p>
                </div>
              </motion.div>
            ) : (
              aiInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.3 }}
                  className="group"
                >
                  <div className="p-4 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-white transition-all cursor-default">
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: insight.type === 'alert' ? 'rgba(251, 191, 36, 0.15)' :
                            insight.type === 'trend' ? 'rgba(59, 130, 246, 0.15)' :
                              'rgba(168, 85, 247, 0.15)'
                        }}>
                        {insight.type === 'summary' && <Zap className="w-4 h-4 text-purple-600" />}
                        {insight.type === 'alert' && <AlertCircle className="w-4 h-4 text-orange-600" />}
                        {insight.type === 'opportunity' && <TrendingUp className="w-4 h-4 text-green-600" />}
                        {insight.type === 'trend' && <Activity className="w-4 h-4 text-blue-600" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-[0.95rem] leading-relaxed mb-2 ${insight.tone === 'urgent' ? 'text-orange-700 font-medium' :
                          insight.tone === 'excited' ? 'text-neutral-900 font-medium' :
                            'text-neutral-700'
                          }`}>
                          {insight.message}
                        </p>

                        {insight.context && (
                          <div className="mb-3">
                            <span className="text-xs text-neutral-500 bg-neutral-50 px-2.5 py-1 rounded-md font-medium">
                              {insight.context}
                            </span>
                          </div>
                        )}

                        {insight.actions && insight.actions.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            {insight.actions.map((action, i) => (
                              <motion.button
                                key={i}
                                onClick={action.action}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`px-3.5 py-1.5 rounded-md transition-all text-xs font-medium flex items-center gap-1 ${action.primary
                                  ? 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm'
                                  : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                                  }`}
                              >
                                {action.label}
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {}
      <div className="flex flex-col space-y-6 mt-2">
        <div className="flex items-center p-1 bg-neutral-100/60 rounded-2xl border border-neutral-200/60 w-full md:w-fit backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                ? 'bg-white text-neutral-900 shadow-md ring-1 ring-black/5'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/60'
                }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-purple-500' : 'text-neutral-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'prs' && <PullRequestsPanel />}
            {activeTab === 'issues' && <IssuesPanel />}
            {activeTab === 'repos' && <RepositoriesPanel />}
            {activeTab === 'commits' && <CommitsPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
