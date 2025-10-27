import { NextRequest, NextResponse } from 'next/server';
import { generateAssignmentInsights } from '@/lib/ai/groq';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

type AssignmentRow = {
  title: string;
  subject: string | null;
  due_date: string | null;
  priority: string;
  description: string | null;
};

export async function GET(request: NextRequest) {
  const { supabase, applyCookies } = createServerSupabaseClient(request);

  const respond = (body: unknown, init?: ResponseInit) => {
    const response = NextResponse.json(body, init);
    applyCookies(response);
    return response;
  };

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return respond({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select('title, subject, due_date, priority, description')
      .eq('status', 'pending')
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(10);

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
      return respond({ error: 'Failed to fetch assignments' }, { status: 500 });
    }

    const safeAssignments = (assignments as AssignmentRow[] | null)?.map((assignment) => ({
      title: assignment.title,
      subject: assignment.subject ?? undefined,
      due_date: assignment.due_date ?? undefined,
      priority: assignment.priority ?? 'medium',
      description: assignment.description ?? undefined,
    })) ?? [];

    const insights = await generateAssignmentInsights(safeAssignments);
    return respond({ insights });
  } catch (error) {
    console.error('AI insights error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return respond(
      { error: 'Failed to generate insights', details: errorMessage },
      { status: 500 },
    );
  }
}
