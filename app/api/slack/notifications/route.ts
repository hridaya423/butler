import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limitParam = searchParams.get('limit');
    const typeFilter = searchParams.get('type');

    const limit = limitParam ? Math.min(parseInt(limitParam), 200) : 50;

    let query = supabase
      .from('slack_notifications')
      .select('*')
      .eq('user_id', user.id);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    if (typeFilter) {
      query = query.eq('notification_type', typeFilter);
    }

    query = query
      .order('priority', { ascending: false })
      .order('slack_created_at', { ascending: false })
      .limit(limit);

    const { data: notifications, error: notificationsError } = await query;

    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    const { data: stats } = await supabase
      .from('slack_notifications')
      .select('notification_type, is_read')
      .eq('user_id', user.id);

    const summary = {
      total: stats?.length || 0,
      unread: stats?.filter((n) => !n.is_read).length || 0,
      mentions: stats?.filter((n) => n.notification_type === 'mention' && !n.is_read).length || 0,
      dms: stats?.filter((n) => n.notification_type === 'dm' && !n.is_read).length || 0,
      replies: stats?.filter((n) => n.notification_type === 'reply' && !n.is_read).length || 0,
    };

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      summary,
      filters: {
        unreadOnly,
        limit,
        type: typeFilter,
      },
    });
  } catch (error) {
    console.error('Error in /api/slack/notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAllRead } = body;

    if (notificationIds && Array.isArray(notificationIds)) {
      const { error } = await supabase
        .from('slack_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .in('id', notificationIds)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notifications as read:', error);
        return NextResponse.json(
          { error: 'Failed to update notifications' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        markedRead: notificationIds.length,
      });
    }

    if (markAllRead) {
      const { error, count } = await supabase
        .from('slack_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all as read:', error);
        return NextResponse.json(
          { error: 'Failed to mark all as read' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        markedRead: count || 0,
      });
    }

    return NextResponse.json(
      { error: 'Either notificationIds or markAllRead must be provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/slack/notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
