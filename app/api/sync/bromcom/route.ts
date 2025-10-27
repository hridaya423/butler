import { NextRequest, NextResponse } from 'next/server';
import { scrapeBromcom } from '@/scripts/scrape-bromcom';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
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

    let payload: unknown;
    try {
      payload = await request.json();
    } catch (parseError) {
      console.error('Invalid Bromcom sync payload', parseError);
      return respond({ error: 'Invalid request payload' }, { status: 400 });
    }

    if (payload === null || typeof payload !== 'object') {
      return respond({ error: 'Invalid request payload' }, { status: 400 });
    }

    const { email, password } = payload as { email?: string; password?: string };

    if (!email || !password) {
      return respond({ error: 'Bromcom credentials required' }, { status: 400 });
    }

    const { data: syncJob, error: syncJobError } = await supabase
      .from('sync_jobs')
      .insert({
        user_id: user.id,
        source: 'bromcom',
        status: 'running',
      })
      .select()
      .single();

    if (syncJobError || !syncJob) {
      console.error('Error creating sync job:', syncJobError);
      return respond({ error: 'Failed to create sync job' }, { status: 500 });
    }

    try {
      const assignments = await scrapeBromcom(email, password);
      let processed = 0;
      for (const assignment of assignments) {
        try {
          await supabase
            .from('assignments')
            .upsert(
              {
                user_id: user.id,
                source: 'bromcom',
                external_id: assignment.externalId,
                title: assignment.title,
                description: assignment.description,
                subject: assignment.subject,
                due_date: assignment.dueDate ? new Date(assignment.dueDate).toISOString() : null,
                priority: assignment.priority,
                status: assignment.status === 'Completed' ? 'completed' : 'pending',
              },
              {
                onConflict: 'user_id,source,external_id',
              },
            );

          processed++;
        } catch (err) {
          console.error('Error saving assignment:', err);
        }
      }

      await supabase
        .from('sync_jobs')
        .update({
          status: 'completed',
          items_processed: processed,
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncJob.id);

      return respond({
        success: true,
        itemsProcessed: processed,
        total: assignments.length,
      });
    } catch (scraperError: unknown) {
      console.error('Scraper error:', scraperError);
      const errorMessage = scraperError instanceof Error ? scraperError.message : 'Unknown error';

      await supabase
        .from('sync_jobs')
        .update({
          status: 'failed',
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncJob.id);

      return respond(
        { error: 'Scraping failed', details: errorMessage },
        { status: 500 },
      );
    }
  } catch (error: unknown) {
    console.error('API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return respond(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 },
    );
  }
}
