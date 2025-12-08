
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const GITHUB_API = 'https://api.github.com';

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const providerToken = session?.provider_token;

    if (!providerToken) {
      return NextResponse.json({
        success: false,
        error: 'Token expired',
        message: 'GitHub token expired. Please re-connect GitHub to continue auto-sync.',
        needs_reauth: true
      }, { status: 401 });
    }


    const profileResponse = await fetch(`${GITHUB_API}/user`, {
      headers: {
        Authorization: `Bearer ${providerToken}`,
        Accept: 'application/vnd.github+json',
      },
    });


    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      throw new Error(`Failed to fetch GitHub profile: ${profileResponse.status}`);
    }

    const profile = await profileResponse.json();

    const { error: profileError } = await supabase.from('github_profiles').upsert({
      user_id: user.id,
      github_user_id: profile.id.toString(),
      github_username: profile.login,
      github_name: profile.name,
      github_email: profile.email,
      github_avatar_url: profile.avatar_url,
      github_bio: profile.bio,
      github_company: profile.company,
      github_location: profile.location,
      public_repos: profile.public_repos,
      public_gists: profile.public_gists,
      followers: profile.followers,
      following: profile.following,
      last_synced_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (profileError) {
    } else {
    }

    const reposResponse = await fetch(
      `${GITHUB_API}/user/repos?sort=updated&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${providerToken}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (reposResponse.ok) {
      const repos = await reposResponse.json();

      const repoData = repos.map((repo: any) => ({
        user_id: user.id,
        github_repo_id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        language: repo.language,
        default_branch: repo.default_branch,
        is_private: repo.private,
        is_fork: repo.fork,
        is_archived: repo.archived,
        owner_username: repo.owner.login,
        html_url: repo.html_url,
        clone_url: repo.clone_url,
        stars_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        watchers_count: repo.watchers_count,
        open_issues_count: repo.open_issues_count,
        size: repo.size,
        github_created_at: repo.created_at,
        github_updated_at: repo.updated_at,
        github_pushed_at: repo.pushed_at,
      }));

      if (repoData.length > 0) {
        await supabase.from('github_repositories').upsert(repoData, { onConflict: 'github_repo_id' });
      }
    }

    const prsResponse = await fetch(
      `${GITHUB_API}/search/issues?q=author:${profile.login}+type:pr&sort=updated&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${providerToken}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (prsResponse.ok) {
      const prsData = await prsResponse.json();
      const prs = prsData.items || [];

      const prDetailsPromises = prs.slice(0, 50).map(async (pr: any) => {
        const prUrl = pr.pull_request?.url;
        if (!prUrl) return null;

        const prDetailResponse = await fetch(prUrl, {
          headers: {
            Authorization: `Bearer ${providerToken}`,
            Accept: 'application/vnd.github+json',
          },
        });

        if (!prDetailResponse.ok) return null;
        return prDetailResponse.json();
      });

      const prDetails = (await Promise.all(prDetailsPromises)).filter(Boolean);

      const prData = prDetails.map((pr: any) => ({
        user_id: user.id,
        github_pr_id: pr.id,
        github_pr_number: pr.number,
        repo_full_name: pr.base.repo.full_name,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        author_username: pr.user.login,
        author_avatar_url: pr.user.avatar_url,
        is_author: pr.user.login === profile.login,
        head_branch: pr.head.ref,
        base_branch: pr.base.ref,
        html_url: pr.html_url,
        is_draft: pr.draft,
        is_merged: pr.merged,
        mergeable_state: pr.mergeable_state,
        comments_count: pr.comments,
        review_comments_count: pr.review_comments,
        commits_count: pr.commits,
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files: pr.changed_files,
        labels: JSON.stringify(pr.labels.map((l: any) => ({ name: l.name, color: l.color }))),
        assignees: JSON.stringify(pr.assignees.map((a: any) => ({ login: a.login, avatar_url: a.avatar_url }))),
        requested_reviewers: JSON.stringify(pr.requested_reviewers?.map((r: any) => ({ login: r.login })) || []),
        github_created_at: pr.created_at,
        github_updated_at: pr.updated_at,
        github_closed_at: pr.closed_at,
        github_merged_at: pr.merged_at,
      }));

      if (prData.length > 0) {
        await supabase.from('github_pull_requests').upsert(prData, { onConflict: 'github_pr_id' });
      }
    }

    const issuesResponse = await fetch(
      `${GITHUB_API}/search/issues?q=involves:${profile.login}+type:issue&sort=updated&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${providerToken}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (issuesResponse.ok) {
      const issuesData = await issuesResponse.json();
      const issues = issuesData.items || [];

      const issueData = issues.map((issue: any) => {
        const repoFullName = issue.repository_url.split('/repos/')[1];
        const isAssigned = issue.assignees?.some((a: any) => a.login === profile.login) || false;

        return {
          user_id: user.id,
          github_issue_id: issue.id,
          github_issue_number: issue.number,
          repo_full_name: repoFullName,
          title: issue.title,
          body: issue.body,
          state: issue.state,
          author_username: issue.user.login,
          author_avatar_url: issue.user.avatar_url,
          is_author: issue.user.login === profile.login,
          assignee_username: issue.assignee?.login,
          assignees: JSON.stringify(issue.assignees?.map((a: any) => ({ login: a.login, avatar_url: a.avatar_url })) || []),
          is_assigned: isAssigned,
          html_url: issue.html_url,
          comments_count: issue.comments,
          labels: JSON.stringify(issue.labels.map((l: any) => ({ name: l.name, color: l.color }))),
          milestone_title: issue.milestone?.title,
          milestone_number: issue.milestone?.number,
          github_created_at: issue.created_at,
          github_updated_at: issue.updated_at,
          github_closed_at: issue.closed_at,
        };
      });

      if (issueData.length > 0) {
        await supabase.from('github_issues').upsert(issueData, { onConflict: 'github_issue_id' });
      }
    }

    const eventsResponse = await fetch(
      `${GITHUB_API}/users/${profile.login}/events?per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${providerToken}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (eventsResponse.ok) {
      const events = await eventsResponse.json();
      const pushEvents = events.filter((e: any) => e.type === 'PushEvent');

      const commits: any[] = [];

      pushEvents.forEach((event: any) => {
        const repoFullName = event.repo.name;
        event.payload.commits?.forEach((commit: any) => {
          commits.push({
            user_id: user.id,
            commit_sha: commit.sha,
            repo_full_name: repoFullName,
            message: commit.message,
            message_short: commit.message.split('\n')[0].substring(0, 100),
            author_name: commit.author.name,
            author_email: commit.author.email,
            author_username: profile.login,
            author_avatar_url: profile.avatar_url,
            html_url: `https://github.com/${repoFullName}/commit/${commit.sha}`,
            committed_at: event.created_at,
          });
        });
      });

      if (commits.length > 0) {
        await supabase.from('github_commits').upsert(commits.slice(0, 100), { onConflict: 'commit_sha' });
      }
    }


    return NextResponse.json({
      success: true,
      synced: {
        profile: true,
        repositories: true,
        pullRequests: true,
        issues: true,
        commits: true,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to sync GitHub data', message: error.message },
      { status: 500 }
    );
  }
}
