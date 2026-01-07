
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GitPullRequest, GitMerge, ExternalLink, X, MessageCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { createClient } from '@/lib/supabase/client';
import { ContextAwareWrapper } from '../ai/context-aware-wrapper';

interface PullRequest {
  id: string;
  github_pr_number: number;
  repo_full_name: string;
  title: string;
  body: string | null;
  state: string;
  author_username: string;
  author_avatar_url: string;
  head_branch: string;
  base_branch: string;
  html_url: string;
  is_draft: boolean;
  is_merged: boolean;
  comments_count: number;
  additions: number;
  deletions: number;
  changed_files: number;
  labels: any;
  github_created_at: string;
  github_updated_at: string;
  github_merged_at: string | null;
}

export function PullRequestsPanel() {
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  useEffect(() => {
    loadPRs();
  }, []);

  const loadPRs = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('github_pull_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('github_updated_at', { ascending: false });

      if (error) throw error;
      setPrs(data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const filteredPRs = prs.filter((pr) => {
    if (filter === 'all') return true;
    return pr.state === filter;
  });

  const stats = {
    total: prs.length,
    open: prs.filter((pr) => pr.state === 'open').length,
    merged: prs.filter((pr) => pr.is_merged).length,
    closed: prs.filter((pr) => pr.state === 'closed' && !pr.is_merged).length,
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-neutral-500">
        <p className="text-base font-light">Loading pull requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-neutral-100 shadow-sm rounded-2xl bg-white p-4">
          <p className="text-xs text-neutral-500 font-light mb-1">Total PRs</p>
          <p className="text-2xl font-semibold text-neutral-900">{stats.total}</p>
        </Card>
        <Card className="border-green-100 shadow-sm rounded-2xl bg-green-50/30 p-4">
          <p className="text-xs text-green-600 font-light mb-1">Open</p>
          <p className="text-2xl font-semibold text-green-600">{stats.open}</p>
        </Card>
        <Card className="border-purple-100 shadow-sm rounded-2xl bg-purple-50/30 p-4">
          <p className="text-xs text-purple-600 font-light mb-1">Merged</p>
          <p className="text-2xl font-semibold text-purple-600">{stats.merged}</p>
        </Card>
        <Card className="border-neutral-100 shadow-sm rounded-2xl bg-neutral-50/30 p-4">
          <p className="text-xs text-neutral-600 font-light mb-1">Closed</p>
          <p className="text-2xl font-semibold text-neutral-600">{stats.closed}</p>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        {(['all', 'open', 'closed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${filter === f
              ? 'bg-orange-100 text-orange-600'
              : 'text-neutral-600 hover:bg-neutral-50'
              }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredPRs.length === 0 ? (
          <Card className="border-neutral-100 shadow-sm rounded-2xl bg-white p-8 text-center">
            <GitPullRequest className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 font-light">No pull requests found</p>
          </Card>
        ) : (
          filteredPRs.map((pr, index) => (
            <ContextAwareWrapper key={pr.id} contextType="github_pr" data={pr} className="block">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-neutral-100 shadow-sm rounded-2xl bg-white p-4 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${pr.is_merged ? 'bg-purple-100' :
                        pr.state === 'open' ? 'bg-green-100' : 'bg-neutral-100'
                        }`}>
                        {pr.is_merged ? (
                          <GitMerge className="w-5 h-5 text-purple-600" />
                        ) : pr.state === 'open' ? (
                          <GitPullRequest className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-neutral-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <a
                            href={pr.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-neutral-900 hover:text-orange-600 transition-colors"
                          >
                            {pr.title}
                          </a>
                          <ExternalLink className="w-3 h-3 text-neutral-400" />
                        </div>

                        <div className="flex items-center gap-2 mb-2 text-xs text-neutral-500">
                          <span className="font-mono">{pr.repo_full_name}</span>
                          <span>•</span>
                          <span>#{pr.github_pr_number}</span>
                          <span>•</span>
                          <span>{pr.head_branch} → {pr.base_branch}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {pr.is_draft && (
                            <Badge className="bg-neutral-100 text-neutral-700 border-neutral-200 text-xs">
                              Draft
                            </Badge>
                          )}
                          {pr.is_merged && (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                              <GitMerge className="w-3 h-3 mr-1" />
                              Merged
                            </Badge>
                          )}
                          {pr.state === 'open' && !pr.is_merged && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                              Open
                            </Badge>
                          )}
                          {pr.state === 'closed' && !pr.is_merged && (
                            <Badge className="bg-neutral-100 text-neutral-700 border-neutral-200 text-xs">
                              Closed
                            </Badge>
                          )}

                          {pr.labels && JSON.parse(pr.labels).length > 0 && (
                            JSON.parse(pr.labels).slice(0, 3).map((label: any, i: number) => (
                              <Badge
                                key={i}
                                className="text-xs"
                                style={{
                                  backgroundColor: `#${label.color}20`,
                                  color: `#${label.color}`,
                                  borderColor: `#${label.color}40`,
                                }}
                              >
                                {label.name}
                              </Badge>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-3 text-xs text-neutral-500 mb-2">
                        {pr.comments_count > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {pr.comments_count}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-green-600">
                          +{pr.additions}
                        </div>
                        <div className="flex items-center gap-1 text-red-600">
                          -{pr.deletions}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-400">
                        {new Date(pr.github_updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </ContextAwareWrapper>
          ))
        )}
      </div>
    </div>
  );
}
