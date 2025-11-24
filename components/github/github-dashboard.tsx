'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitPullRequest,
  GitBranch,
  GitCommit,
  AlertCircle,
  Code,
  RefreshCw,
  Users,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { PullRequestsPanel } from './pull-requests-panel';
import { IssuesPanel } from './issues-panel';
import { RepositoriesPanel } from './repositories-panel';
import { CommitsPanel } from './commits-panel';

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
  const [activeTab, setActiveTab] = useState<'prs' | 'issues' | 'repos' | 'commits'>('prs');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/github/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error loading GitHub profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/github/sync', { method: 'POST' });
      if (response.ok) {
        await loadProfile();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error syncing GitHub data:', error);
    } finally {
      setSyncing(false);
    }
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
    <div className="space-y-8">
      <div className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <GitBranch className="w-32 h-32" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {profile.github_avatar_url ? (
              <img
                src={profile.github_avatar_url}
                alt={profile.github_username}
                className="w-20 h-20 rounded-2xl border-4 border-white shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-neutral-100 flex items-center justify-center border-4 border-white shadow-sm">
                <Users className="w-8 h-8 text-neutral-400" />
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                {profile.github_name || profile.github_username}
              </h2>
              <a
                href={`https://github.com/${profile.github_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-500 hover:text-orange-600 transition-colors flex items-center gap-1"
              >
                @{profile.github_username}
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-4 mt-3 text-xs font-medium text-neutral-600">
                <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1 rounded-md border border-neutral-100">
                  <Code className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{profile.public_repos} Repos</span>
                </div>
                <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1 rounded-md border border-neutral-100">
                  <Users className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{profile.followers} Followers</span>
                </div>
                <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1 rounded-md border border-neutral-100">
                  <Users className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{profile.following} Following</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <div className="text-right hidden md:block mr-2">
              <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Last Synced</p>
              <p className="text-xs text-neutral-600 font-medium flex items-center justify-end gap-1.5">
                <Calendar className="w-3 h-3 text-neutral-400" />
                {profile.last_synced_at
                  ? new Date(profile.last_synced_at).toLocaleString()
                  : 'Never'}
              </p>
            </div>
            <Button
              onClick={handleSync}
              disabled={syncing}
              variant="outline"
              className="gap-2 bg-white hover:bg-neutral-50 transition-all shadow-sm h-10 px-4"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Data'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-6">
        <div className="flex items-center p-1 bg-neutral-100/50 rounded-2xl border border-neutral-200/50 w-full md:w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-black/5'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50'
                }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-orange-600' : 'text-neutral-400'}`} />
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
