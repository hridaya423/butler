/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const NOTION_VERSION = '2022-06-28';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('notion_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Notion not connected. Please connect your Notion workspace first.' },
        { status: 400 }
      );
    }

    const { access_token, default_database_id } = profile;

    if (!default_database_id) {
      return NextResponse.json(
        { error: 'No default database configured. Please set a default database in settings.' },
        { status: 400 }
      );
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
      return NextResponse.json({ error: 'Failed to create sync job' }, { status: 500 });
    }

    try {
      const response = await fetch(`https://api.notion.com/v1/databases/${default_database_id}/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          'Notion-Version': NOTION_VERSION,
        },
        body: JSON.stringify({
          page_size: 100,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch Notion database');
      }

      const data = await response.json();
      const results = Array.isArray(data?.results) ? data.results : [];

      let processed = 0;
      for (const page of results) {
        if (!page || typeof page !== 'object' || !('properties' in page)) continue;

        const properties: Record<string, any> = (page as any).properties ?? {};

        const [, titleProperty] = Object.entries<any>(properties).find(([, prop]) => prop?.type === 'title') ?? [];
        let title = 'Untitled';
        if (titleProperty?.type === 'title' && Array.isArray(titleProperty.title) && titleProperty.title.length > 0) {
          title = titleProperty.title.map((segment: any) => segment?.plain_text || '').join('').trim() || title;
        }

        const [, statusProperty] = Object.entries<any>(properties).find(([, prop]) => prop?.type === 'status') ?? [];
        let status: 'pending' | 'completed' | 'archived' = 'pending';
        if (statusProperty?.type === 'status') {
          const statusName = statusProperty.status?.name || 'Not started';
          if (statusName === 'Completed') status = 'completed';
          else if (statusName === 'In progress') status = 'pending';
        }

        const [, dateProperty] = Object.entries<any>(properties).find(([, prop]) => prop?.type === 'date') ?? [];
        const dueDate = dateProperty?.date?.start || null;

        const [, priorityProperty] = Object.entries<any>(properties).find(([, prop]) => prop?.type === 'select') ?? [];
        let priority: 'low' | 'medium' | 'high' = 'medium';
        if (priorityProperty?.type === 'select' && priorityProperty.select?.name) {
          const name = priorityProperty.select.name;
          if (name === 'Low') priority = 'low';
          else if (name === 'High') priority = 'high';
        }

        const [, tagsProperty] = Object.entries<any>(properties).find(([, prop]) => prop?.type === 'multi_select') ?? [];
        const tags = tagsProperty?.type === 'multi_select'
          ? tagsProperty.multi_select.map((tag: any) => tag?.name).filter(Boolean)
          : [];

        const [, descriptionProperty] = Object.entries<any>(properties).find(([, prop]) => prop?.type === 'rich_text') ?? [];
        const description = descriptionProperty?.type === 'rich_text'
          ? descriptionProperty.rich_text.map((t: any) => t?.plain_text || '').join('').trim() || null
          : null;

        try {
          await supabase.from('assignments').upsert(
            {
              user_id: user.id,
              source: 'notion',
              external_id: (page as any).id,
              title,
              description: description || (tags?.join(', ') || null),
              subject: tags?.[0] ?? null,
              due_date: dueDate ? new Date(dueDate).toISOString() : null,
              priority,
              status,
            },
            {
              onConflict: 'user_id,source,external_id',
            }
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

      await supabase
        .from('notion_profiles')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('user_id', user.id);

      return NextResponse.json({
        success: true,
        itemsProcessed: processed,
        total: results.length,
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

      return NextResponse.json(
        { error: 'Notion sync failed', details: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Notion API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
