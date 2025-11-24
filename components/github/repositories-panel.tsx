/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Star, GitFork, Eye, ExternalLink, Clock, Archive } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { createClient } from '@/lib/supabase/client';

interface Repository {
  id: string;
  github_repo_id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  is_private: boolean;
  is_fork: boolean;
  is_archived: boolean;
  html_url: string;
  stars_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  github_updated_at: string;
  github_pushed_at: string;
}

export function RepositoriesPanel() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'name'>('updated');

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('github_repositories')
        .select('*')
        .order('github_updated_at', { ascending: false });

      if (error) throw error;
      setRepos(data || []);
    } catch (error) {
      console.error('Error loading repositories:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedRepos = [...repos].sort((a, b) => {
    if (sortBy === 'stars') return b.stars_count - a.stars_count;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return new Date(b.github_updated_at).getTime() - new Date(a.github_updated_at).getTime();
  });

  const stats = {
    total: repos.length,
    public: repos.filter((r) => !r.is_private).length,
    private: repos.filter((r) => r.is_private).length,
    archived: repos.filter((r) => r.is_archived).length,
  };

  const languageStats = repos.reduce((acc: any, repo) => {
    if (!repo.language) return acc;
    acc[repo.language] = (acc[repo.language] || 0) + 1;
    return acc;
  }, {});

  const topLanguages = Object.entries(languageStats)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="p-6 text-center text-neutral-500">
        <p className="text-base font-light">Loading repositories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-neutral-100 shadow-sm rounded-2xl bg-white p-4">
          <p className="text-xs text-neutral-500 font-light mb-1">Total Repos</p>
          <p className="text-2xl font-semibold text-neutral-900">{stats.total}</p>
        </Card>
        <Card className="border-green-100 shadow-sm rounded-2xl bg-green-50/30 p-4">
          <p className="text-xs text-green-600 font-light mb-1">Public</p>
          <p className="text-2xl font-semibold text-green-600">{stats.public}</p>
        </Card>
        <Card className="border-orange-100 shadow-sm rounded-2xl bg-orange-50/30 p-4">
          <p className="text-xs text-orange-600 font-light mb-1">Private</p>
          <p className="text-2xl font-semibold text-orange-600">{stats.private}</p>
        </Card>
        <Card className="border-neutral-100 shadow-sm rounded-2xl bg-neutral-50/30 p-4">
          <p className="text-xs text-neutral-600 font-light mb-1">Archived</p>
          <p className="text-2xl font-semibold text-neutral-600">{stats.archived}</p>
        </Card>
      </div>
      
      {topLanguages.length > 0 && (
        <Card className="border-orange-100 shadow-sm rounded-2xl bg-white p-4">
          <h3 className="text-sm font-medium text-neutral-900 mb-3">Top Languages</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {topLanguages.map(([language, count]: any) => (
              <Badge key={language} className="bg-neutral-100 text-neutral-700 border-neutral-200 text-xs">
                {language} ({count})
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-500">Sort by:</span>
        {(['updated', 'stars', 'name'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${sortBy === s
              ? 'bg-orange-100 text-orange-600'
              : 'text-neutral-600 hover:bg-neutral-50'
              }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedRepos.length === 0 ? (
          <Card className="col-span-2 border-neutral-100 shadow-sm rounded-2xl bg-white p-8 text-center">
            <Code className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 font-light">No repositories found</p>
          </Card>
        ) : (
          sortedRepos.map((repo, index) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="border-neutral-100 shadow-sm rounded-2xl bg-white p-4 hover:shadow-md transition-all duration-300 h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-2">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-neutral-900 hover:text-orange-600 transition-colors flex items-center gap-2"
                    >
                      {repo.name}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {repo.is_private && (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                        Private
                      </Badge>
                    )}
                    {repo.is_archived && (
                      <Badge className="bg-neutral-100 text-neutral-700 border-neutral-200 text-xs flex items-center gap-1">
                        <Archive className="w-3 h-3" />
                        Archived
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500 mb-3 line-clamp-2 flex-1">
                    {repo.description || 'No description'}
                  </p>

                  <div className="space-y-2">
                    {repo.language && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-neutral-600">{repo.language}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {repo.stars_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork className="w-3 h-3" />
                        {repo.forks_count}
                      </div>
                      {repo.open_issues_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Code className="w-3 h-3" />
                          {repo.open_issues_count} issues
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-neutral-400">
                      Updated {new Date(repo.github_updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
