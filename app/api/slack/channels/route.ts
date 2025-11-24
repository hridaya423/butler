/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: channels, error: channelsError } = await supabase
      .from('slack_channels')
      .select('*')
      .eq('user_id', user.id)
      .order('unread_count', { ascending: false })
      .order('channel_name', { ascending: true });

    if (channelsError) {
      console.error('Error fetching channels:', channelsError);
      return NextResponse.json(
        { error: 'Failed to fetch channels' },
        { status: 500 }
      );
    }

    const grouped = {
      dms: channels?.filter((c) => c.is_im) || [],
      groupChats: channels?.filter((c) => c.is_mpim) || [],
      publicChannels:
        channels?.filter((c) => c.is_channel && !c.is_private && !c.is_archived) || [],
      privateChannels: channels?.filter((c) => c.is_group || c.is_private) || [],
      archived: channels?.filter((c) => c.is_archived) || [],
    };

    const stats = {
      total: channels?.length || 0,
      totalUnread: channels?.reduce((sum: number, c: any) => sum + (c.unread_count || 0), 0) || 0,
      memberChannels: channels?.filter((c) => c.is_member).length || 0,
    };

    return NextResponse.json({
      success: true,
      channels: channels || [],
      grouped,
      stats,
    });
  } catch (error) {
    console.error('Error in /api/slack/channels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
