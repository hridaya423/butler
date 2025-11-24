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
    const filter = searchParams.get('filter') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('gmail_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (filter === 'unread') {
      query = query.eq('is_read', false);
    } else if (filter === 'starred') {
      query = query.eq('is_starred', true);
    } else if (filter === 'sent') {
      query = query.contains('labels', ['SENT']);
    } else if (filter === 'inbox') {
      query = query.contains('labels', ['INBOX']);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('Error fetching Gmail messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error('Gmail messages API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    const { messageId, isRead } = body;

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('gmail_messages')
      .update({ is_read: isRead })
      .eq('id', messageId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating message:', error);
      return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Gmail update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
