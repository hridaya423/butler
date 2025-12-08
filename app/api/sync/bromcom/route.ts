import { NextRequest, NextResponse } from 'next/server';
import { scrapeBromcom } from '@/scripts/scrape-bromcom';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { encrypt, decrypt } from '@/lib/encryption';

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

    let payload: { email?: string; password?: string; saveCredentials?: boolean } = {};
    try {
      payload = await request.json();
    } catch {
    }

    let { email, password } = payload;
    const { saveCredentials } = payload;

    if (!email || !password) {
      const { data: savedProfile } = await supabase
        .from('bromcom_profiles')
        .select('email_encrypted, password_encrypted')
        .eq('user_id', user.id)
        .single();

      if (savedProfile) {
        try {
          email = decrypt(savedProfile.email_encrypted);
          password = decrypt(savedProfile.password_encrypted);
        } catch (decryptError) {
          return respond({ error: 'Saved credentials corrupted. Please re-enter.' }, { status: 400 });
        }
      }
    }

    if (!email || !password) {
      return respond({ error: 'Bromcom credentials required', needsCredentials: true }, { status: 400 });
    }

    if (saveCredentials) {
      const { error: saveError } = await supabase
        .from('bromcom_profiles')
        .upsert({
          user_id: user.id,
          email_encrypted: encrypt(email),
          password_encrypted: encrypt(password),
        }, { onConflict: 'user_id' });

      if (saveError) {
      }
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

      await supabase
        .from('bromcom_profiles')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('user_id', user.id);

      return respond({
        success: true,
        itemsProcessed: processed,
        total: assignments.length,
      });
    } catch (scraperError: unknown) {
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return respond(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 },
    );
  }
}

