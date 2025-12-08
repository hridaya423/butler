
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, ExternalLink, MessageCircle, User } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { createClient } from '@/lib/supabase/client';
import { ContextAwareWrapper } from '../ai/context-aware-wrapper';

interface Issue {
  id: string;
  github_issue_number: number;
  repo_full_name: string;
  title: string;
  body: string | null;
  state: string;
  author_username: string;
  author_avatar_url: string;
  is_author: boolean;
  is_assigned: boolean;
  html_url: string;
  comments_count: number;
  labels: any;
  milestone_title: string | null;
  github_created_at: string;
  github_updated_at: string;
  github_closed_at: string | null;
}

export function IssuesPanel() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('github_issues')
        .select('*')
        .order('github_updated_at', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'all') return true;
    return issue.state === filter;
  });

  const stats = {
    total: issues.length,
    open: issues.filter((i) => i.state === 'open').length,
    closed: issues.filter((i) => i.state === 'closed').length,
    assigned: issues.filter((i) => i.is_assigned).length,
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-neutral-500">
        <p className="text-base font-light">Loading issues...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-neutral-100 shadow-sm rounded-2xl bg-white p-4">
          <p className="text-xs text-neutral-500 font-light mb-1">Total Issues</p>
          <p className="text-2xl font-semibold text-neutral-900">{stats.total}</p>
        </Card>
        <Card className="border-red-100 shadow-sm rounded-2xl bg-red-50/30 p-4">
          <p className="text-xs text-red-600 font-light mb-1">Open</p>
          <p className="text-2xl font-semibold text-red-600">{stats.open}</p>
        </Card>
        <Card className="border-green-100 shadow-sm rounded-2xl bg-green-50/30 p-4">
          <p className="text-xs text-green-600 font-light mb-1">Closed</p>
          <p className="text-2xl font-semibold text-green-600">{stats.closed}</p>
        </Card>
        <Card className="border-blue-100 shadow-sm rounded-2xl bg-blue-50/30 p-4">
          <p className="text-xs text-blue-600 font-light mb-1">Assigned to me</p>
          <p className="text-2xl font-semibold text-blue-600">{stats.assigned}</p>
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
        {filteredIssues.length === 0 ? (
          <Card className="border-neutral-100 shadow-sm rounded-2xl bg-white p-8 text-center">
            <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 font-light">No issues found</p>
          </Card>
        ) : (
          filteredIssues.map((issue, index) => (
            <ContextAwareWrapper key={issue.id} contextType="github_issue" data={issue} className="block">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-neutral-100 shadow-sm rounded-2xl bg-white p-4 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${issue.state === 'open' ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                        {issue.state === 'open' ? (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <a
                            href={issue.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-neutral-900 hover:text-orange-600 transition-colors"
                          >
                            {issue.title}
                          </a>
                          <ExternalLink className="w-3 h-3 text-neutral-400" />
                        </div>

                        <div className="flex items-center gap-2 mb-2 text-xs text-neutral-500">
                          <span className="font-mono">{issue.repo_full_name}</span>
                          <span>•</span>
                          <span>#{issue.github_issue_number}</span>
                          {issue.is_author && (
                            <>
                              <span>•</span>
                              <span className="text-orange-600">Author</span>
                            </>
                          )}
                          {issue.is_assigned && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600">Assigned</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-xs ${issue.state === 'open'
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : 'bg-green-100 text-green-700 border-green-200'
                            }`}>
                            {issue.state === 'open' ? 'Open' : 'Closed'}
                          </Badge>

                          {issue.milestone_title && (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                              {issue.milestone_title}
                            </Badge>
                          )}

                          {issue.labels && JSON.parse(issue.labels).length > 0 && (
                            JSON.parse(issue.labels).slice(0, 3).map((label: any, i: number) => (
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
                      {issue.comments_count > 0 && (
                        <div className="flex items-center gap-1 text-xs text-neutral-500 mb-2">
                          <MessageCircle className="w-3 h-3" />
                          {issue.comments_count}
                        </div>
                      )}
                      <p className="text-xs text-neutral-400">
                        {new Date(issue.github_updated_at).toLocaleDateString()}
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
