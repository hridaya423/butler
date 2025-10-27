import { createClient } from './client';
import type { Assignment, AssignmentPriority, AssignmentStatus } from '../types/assignment';

export async function getAssignments(status?: 'pending' | 'completed' | 'archived') {
  try {
    const supabase = createClient();

    let query = supabase
      .from('assignments')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }

    return (data as Assignment[]) || [];
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

    const { data: assignments, error } = await supabase
      .from('assignments')
      .select('status, priority, due_date');

    if (error) {
      console.error('Error fetching stats:', error);
      return null;
    }

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
