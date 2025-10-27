/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getNotionTasks } from '@/lib/notion/client';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

type NotionSyncPayload = {
  databaseId?: string;
  apiKey?: string;
};

const normalizeDatabaseId = (raw: string) => {
  if (!raw) return null;

  const trimmed = raw.trim();

  const urlMatch = trimmed.match(/([0-9a-fA-F]{32})/);
  if (urlMatch) {
    const id = urlMatch[1];
    return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
  }

  const hyphenated = trimmed.replace(/[{}\u200b]/g, '');
  if (/^[0-9a-fA-F-]{36}$/.test(hyphenated)) {
    return hyphenated;
  }

  if (/^[0-9a-fA-F]{32}$/.test(trimmed)) {
    return `${trimmed.slice(0, 8)}-${trimmed.slice(8, 12)}-${trimmed.slice(12, 16)}-${trimmed.slice(16, 20)}-${trimmed.slice(20)}`;
  }

  return null;
};

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
      console.error('Invalid Notion sync payload', parseError);
      return respond({ error: 'Invalid request payload' }, { status: 400 });
    }

    if (!payload || typeof payload !== 'object') {
      return respond({ error: 'Invalid request payload' }, { status: 400 });
    }

    const { databaseId, apiKey } = payload as NotionSyncPayload;

    if (!databaseId || !apiKey) {
      return respond({ error: 'Notion API key and database ID required' }, { status: 400 });
    }

    const normalizedDatabaseId = normalizeDatabaseId(databaseId);

    if (!normalizedDatabaseId) {
      return respond({ error: 'Unable to parse Notion database ID. Copy the full ID or database URL from Notion.' }, { status: 400 });
    }

    const { data: syncJob, error: syncJobError } = await supabase
      .from('sync_jobs')
      .insert({
        user_id: user.id,
        source: 'notion',
        status: 'running',
      })
      .select()
      .single();

    if (syncJobError || !syncJob) {
      console.error('Error creating Notion sync job:', syncJobError);
      return respond({ error: 'Failed to create sync job' }, { status: 500 });
    }

    try {
      console.log('Fetching Notion tasks for user:', user.id);
      const tasks = await getNotionTasks(normalizedDatabaseId, apiKey);
      console.log(`Fetched ${tasks.length} tasks from Notion`);

      let processed = 0;
      for (const task of tasks) {
        try {
          let status: 'pending' | 'completed' | 'archived' = 'pending';
          if (task.status === 'Completed') status = 'completed';
          else if (task.status === 'In progress') status = 'pending';

          let priority: 'low' | 'medium' | 'high' = 'medium';
          if (task.priority === 'Low') priority = 'low';
          else if (task.priority === 'High') priority = 'high';

          await supabase
            .from('assignments')
            .upsert(
              {
                user_id: user.id,
                source: 'notion',
              external_id: task.id,
              title: task.title,
              description: task.description || (task.tags?.join(', ') || null),
                subject: task.tags?.[0] ?? null,
                due_date: task.dueDate ? new Date(task.dueDate).toISOString() : null,
                priority,
                status,
              },
              {
                onConflict: 'user_id,source,external_id',
              },
            );

          processed += 1;
        } catch (taskError) {
          console.error('Error saving Notion task:', taskError);
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
        total: tasks.length,
      });
    } catch (notionError) {
      console.error('Notion sync error:', notionError);
      const errorMessage = notionError instanceof Error ? notionError.message : 'Unknown error';

      await supabase
        .from('sync_jobs')
        .update({
          status: 'failed',
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncJob.id);

      const statusCode = typeof (notionError as any)?.status === 'number' ? (notionError as any).status : 500;
      const safeStatus = statusCode >= 400 && statusCode < 600 ? statusCode : 500;
      const clientMessage = safeStatus === 500 ? 'Notion sync failed' : errorMessage;

      return respond(
        { error: clientMessage, details: errorMessage },
        { status: safeStatus },
      );
    }
  } catch (error) {
    console.error('Notion API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return respond(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 },
    );
  }
}
