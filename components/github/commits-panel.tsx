
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GitCommit, ExternalLink, Plus, Minus } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { createClient } from '@/lib/supabase/client';

interface Commit {
  id: string;
  commit_sha: string;
  repo_full_name: string;
  message: string;
  message_short: string;
  author_name: string;
  author_username: string;
  author_avatar_url: string;
  additions: number;
  deletions: number;
  total_changes: number;
  html_url: string;
  committed_at: string;
}

export function CommitsPanel() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommits();
  }, []);

  const loadCommits = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('github_commits')
        .select('*')
        .order('committed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCommits(data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const groupedCommits = commits.reduce((acc: any, commit) => {
    const date = new Date(commit.committed_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(commit);
    return acc;
  }, {});

  const stats = {
    total: commits.length,
    totalAdditions: commits.reduce((sum: number, c: any) => sum + (c.additions || 0), 0),
    totalDeletions: commits.reduce((sum: number, c: any) => sum + (c.deletions || 0), 0),
    repos: new Set(commits.map((c) => c.repo_full_name)).size,
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-neutral-500">
        <p className="text-base font-light">Loading commits...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-neutral-100 shadow-sm rounded-2xl bg-white p-4">
          <p className="text-xs text-neutral-500 font-light mb-1">Recent Commits</p>
          <p className="text-2xl font-semibold text-neutral-900">{stats.total}</p>
        </Card>
        <Card className="border-blue-100 shadow-sm rounded-2xl bg-blue-50/30 p-4">
          <p className="text-xs text-blue-600 font-light mb-1">Repositories</p>
          <p className="text-2xl font-semibold text-blue-600">{stats.repos}</p>
        </Card>
        <Card className="border-green-100 shadow-sm rounded-2xl bg-green-50/30 p-4">
          <p className="text-xs text-green-600 font-light mb-1">Additions</p>
          <p className="text-2xl font-semibold text-green-600">+{stats.totalAdditions}</p>
        </Card>
        <Card className="border-red-100 shadow-sm rounded-2xl bg-red-50/30 p-4">
          <p className="text-xs text-red-600 font-light mb-1">Deletions</p>
          <p className="text-2xl font-semibold text-red-600">-{stats.totalDeletions}</p>
        </Card>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedCommits).length === 0 ? (
          <Card className="border-neutral-100 shadow-sm rounded-2xl bg-white p-8 text-center">
            <GitCommit className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 font-light">No recent commits found</p>
          </Card>
        ) : (
          Object.entries(groupedCommits).map(([date, dateCommits]: [string, any]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-neutral-700 mb-3 sticky top-0 bg-white/80 backdrop-blur-sm py-2">
                {date}
              </h3>
              <div className="space-y-2">
                {dateCommits.map((commit: Commit, index: number) => (
                  <motion.div
                    key={commit.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <Card className="border-neutral-100 shadow-sm rounded-2xl bg-white p-4 hover:shadow-md transition-all duration-300">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                          <GitCommit className="w-4 h-4 text-neutral-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <a
                                href={commit.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-neutral-900 hover:text-orange-600 transition-colors inline-flex items-center gap-2"
                              >
                                {commit.message_short || commit.message.split('\n')[0]}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                                <span className="font-mono">{commit.repo_full_name}</span>
                                <span>•</span>
                                <span className="font-mono text-[10px]">
                                  {commit.commit_sha.substring(0, 7)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs flex-shrink-0">
                              {commit.additions > 0 && (
                                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs flex items-center gap-1">
                                  <Plus className="w-3 h-3" />
                                  {commit.additions}
                                </Badge>
                              )}
                              {commit.deletions > 0 && (
                                <Badge className="bg-red-100 text-red-700 border-red-200 text-xs flex items-center gap-1">
                                  <Minus className="w-3 h-3" />
                                  {commit.deletions}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {commit.author_avatar_url && (
                              <img
                                src={commit.author_avatar_url}
                                alt={commit.author_name}
                                className="w-4 h-4 rounded-full"
                              />
                            )}
                            <span className="text-xs text-neutral-500">
                              {commit.author_name}
                            </span>
                            <span className="text-xs text-neutral-400">
                              {new Date(commit.committed_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
