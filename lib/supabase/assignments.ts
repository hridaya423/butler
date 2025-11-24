/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from './client';
import type { Assignment, AssignmentPriority, AssignmentStatus } from '../types/assignment';

export async function getAssignments(status?: 'pending' | 'completed' | 'archived') {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    let query = supabase
      .from('assignments')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: assignmentsData, error: assignmentsError } = await query;

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
      return [];
    }

    let allItems: Assignment[] = (assignmentsData as Assignment[]) || [];

    if (!status || status === 'pending') {
      const { data: prs } = await supabase
        .from('github_pull_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('state', 'open');

      if (prs) {
        const prAssignments: Assignment[] = prs.map((pr: any) => ({
          id: `github-${pr.id}`,
          user_id: user.id,
          title: pr.title,
          description: `Pull Request #${pr.github_pr_number} in ${pr.repo_full_name}`,
          subject: pr.repo_full_name,
          due_date: null,
          status: 'pending',
          priority: 'medium',
          source: 'github',
          external_id: pr.github_pr_id.toString(),
          created_at: pr.created_at,
          updated_at: pr.updated_at,
        }));
        allItems = [...allItems, ...prAssignments];
      }

      const { data: slackNotes } = await supabase
        .from('slack_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('slack_created_at', { ascending: false });

      if (slackNotes) {
        const slackAssignments: Assignment[] = slackNotes.map((note: any) => ({
          id: `slack-${note.id}`,
          user_id: user.id,
          title: `Message from ${note.sender_name}`,
          description: note.text_preview,
          subject: note.channel_name,
          due_date: null,
          status: 'pending',
          priority: note.priority > 5 ? 'high' : 'medium',
          source: 'slack',
          external_id: note.slack_message_ts,
          created_at: note.created_at,
          updated_at: note.created_at,
        }));
        allItems = [...allItems, ...slackAssignments];
      }
    }

    return allItems.sort((a, b) => {
      const dateA = a.due_date ? new Date(a.due_date).getTime() : new Date(a.created_at).getTime();
      const dateB = b.due_date ? new Date(b.due_date).getTime() : new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error in getAssignments:', error);
    return [];
  }
}

export async function createAssignment(assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('assignments')
    .insert({
      ...assignment,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }

  return data as Assignment;
}

export async function updateAssignment(id: string, updates: Partial<Assignment>) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('assignments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating assignment:', error);
    throw error;
  }

  return data as Assignment;
}

export async function deleteAssignment(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
}

export async function getDashboardStats() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: assignments } = await supabase
      .from('assignments')
      .select('status, priority, due_date')
      .eq('user_id', user.id);

    const { count: openIssues } = await supabase
      .from('github_issues')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('state', 'open');

    const { count: mergedPRs } = await supabase
      .from('github_pull_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_merged', true);

    const { count: activePRs } = await supabase
      .from('github_pull_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('state', 'open');

    if (!assignments) return null;

    type AssignmentStatsRow = {
      status: AssignmentStatus;
      priority: AssignmentPriority;
      due_date: string | null;
    };

    const statsAssignments = assignments as AssignmentStatsRow[];

    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      total: statsAssignments.length,
      pending: statsAssignments.filter((assignment) => assignment.status === 'pending').length,
      completed: statsAssignments.filter((assignment) => assignment.status === 'completed').length,
      dueToday: statsAssignments.filter(
        (assignment) =>
          assignment.status === 'pending' &&
          assignment.due_date &&
          new Date(assignment.due_date) <= todayEnd,
      ).length,
      dueThisWeek: statsAssignments.filter(
        (assignment) =>
          assignment.status === 'pending' &&
          assignment.due_date &&
          new Date(assignment.due_date) <= weekEnd,
      ).length,
      highPriority: statsAssignments.filter(
        (assignment) =>
          assignment.status === 'pending' && assignment.priority === 'high',
      ).length,
      github: {
        openIssues: openIssues || 0,
        mergedPRs: mergedPRs || 0,
        activePRs: activePRs || 0,
      }
    };
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return null;
  }
}

export async function upsertBromcomAssignment(
  externalId: string,
  assignmentData: Omit<Assignment, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'source' | 'external_id'>
) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('assignments')
    .upsert({
      user_id: user.id,
      source: 'bromcom',
      external_id: externalId,
      ...assignmentData,
    }, {
      onConflict: 'user_id,source,external_id',
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting Bromcom assignment:', error);
    throw error;
  }

  return data as Assignment;
}
