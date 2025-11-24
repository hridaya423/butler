/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface SlackConversation {
  id: string;
  name?: string;
  is_channel?: boolean;
  is_group?: boolean;
  is_im?: boolean;
  is_mpim?: boolean;
  is_private?: boolean;
  is_archived?: boolean;
  is_general?: boolean;
  is_member?: boolean;
  topic?: { value: string };
  purpose?: { value: string };
  num_members?: number;
  unread_count?: number;
  latest?: any;
}

interface SlackMessage {
  type: string;
  user?: string;
  text: string;
  ts: string;
  thread_ts?: string;
  reply_count?: number;
  reactions?: Array<{ name: string; count: number }>;
  files?: any[];
  attachments?: any[];
  bot_id?: string;
}

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profileData, error: profileError } = await supabase
      .from('slack_profiles')
      .select('access_token')
      .eq('user_id', user.id)
      .single();

    const accessToken = profileData?.access_token;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No Slack sync token found. Please click "Enable Sync" in settings.' },
        { status: 400 }
      );
    }

    console.log('🔄 Syncing Slack data for user:', user.id);

    const identityResponse = await fetch('https://slack.com/api/auth.test', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const identityData = await identityResponse.json();

    if (!identityData.ok) {
      return NextResponse.json(
        { error: 'Failed to verify Slack identity' },
        { status: 500 }
      );
    }

    const { team, team_id, user_id, user: slackUsername } = identityData;

    await supabase.from('slack_profiles').upsert({
      user_id: user.id,
      slack_team_id: team_id,
      slack_team_name: team,
      slack_user_id: user_id,
      slack_username: slackUsername,
      last_synced_at: new Date().toISOString(),
    });

    const userInfoResponse = await fetch(
      'https://slack.com/api/users.info?' + new URLSearchParams({ user: user_id }),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const userInfo = await userInfoResponse.json();
    if (userInfo.ok && userInfo.user) {
      await supabase.from('slack_profiles').update({
        slack_display_name: userInfo.user.real_name || userInfo.user.name,
        slack_email: userInfo.user.profile?.email,
        slack_avatar_url: userInfo.user.profile?.image_72,
      }).eq('user_id', user.id);
    }

    console.log('📋 Fetching conversations...');

    const conversationsResponse = await fetch(
      'https://slack.com/api/conversations.list?' +
      new URLSearchParams({
        types: 'public_channel,private_channel,im,mpim',
        exclude_archived: 'false',
        limit: '200',
      }),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const conversationsData = await conversationsResponse.json();

    if (!conversationsData.ok) {
      console.error('Failed to fetch conversations:', conversationsData.error);
      return NextResponse.json(
        { error: `Slack API error: ${conversationsData.error}` },
        { status: 500 }
      );
    }

    const conversations: SlackConversation[] = conversationsData.channels || [];
    console.log(`📁 Found ${conversations.length} conversations`);

    const channelData = conversations.map((conv) => ({
      user_id: user.id,
      slack_channel_id: conv.id,
      channel_name: conv.name || (conv.is_im ? 'Direct Message' : 'Unknown'),
      channel_type: conv.is_im
        ? 'im'
        : conv.is_mpim
          ? 'mpim'
          : conv.is_private
            ? 'private_channel'
            : 'public_channel',
      is_channel: conv.is_channel || false,
      is_group: conv.is_group || false,
      is_im: conv.is_im || false,
      is_mpim: conv.is_mpim || false,
      is_private: conv.is_private || false,
      is_archived: conv.is_archived || false,
      is_general: conv.is_general || false,
      is_member: conv.is_member || false,
      topic: conv.topic?.value,
      purpose: conv.purpose?.value,
      member_count: conv.num_members || 0,
      unread_count: conv.unread_count || 0,
      latest_message_ts: conv.latest?.ts,
    }));

    if (channelData.length > 0) {
      await supabase.from('slack_channels').upsert(channelData, {
        onConflict: 'user_id,slack_channel_id',
      });
    }

    const { data: channelsWithIds } = await supabase
      .from('slack_channels')
      .select('id, slack_channel_id')
      .eq('user_id', user.id);

    const channelIdMap = new Map(
      channelsWithIds?.map((ch) => [ch.slack_channel_id, ch.id]) || []
    );

    const usersCache = new Map<string, any>();

    async function getUserInfo(userId: string) {
      if (usersCache.has(userId)) return usersCache.get(userId);

      try {
        const resp = await fetch(
          'https://slack.com/api/users.info?' + new URLSearchParams({ user: userId }),
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const data = await resp.json();
        if (data.ok && data.user) {
          usersCache.set(userId, data.user);
          return data.user;
        }
      } catch (error) {
        console.error(`Failed to fetch user ${userId}:`, error);
      }
      return null;
    }

    console.log('💬 Fetching messages and creating notifications...');

    const notifications: any[] = [];
    const activeConversations = conversations.filter(
      (conv) =>
        (conv.is_member || conv.is_im) &&
        !conv.is_archived &&
        (conv.unread_count || 0) > 0
    );

    console.log(`🔔 Processing ${activeConversations.length} conversations with activity`);

    const conversationsToProcess = activeConversations.slice(0, 20);

    for (const conv of conversationsToProcess) {
      try {
        const historyResponse = await fetch(
          'https://slack.com/api/conversations.history?' +
          new URLSearchParams({ channel: conv.id, limit: '50' }),
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const historyData = await historyResponse.json();
        if (!historyData.ok) continue;

        const messages: SlackMessage[] = historyData.messages || [];

        for (const message of messages) {
          if (message.bot_id || message.user === user_id) continue;

          const isMention = message.text.includes(`<@${user_id}>`);
          const isDM = conv.is_im;
          const isReply = !!message.thread_ts && message.thread_ts !== message.ts;

          if (!isMention && !isDM && !isReply) continue;

          let notificationType: string;
          let priority: number;

          if (isMention) {
            notificationType = 'mention';
            priority = 10;
          } else if (isDM) {
            notificationType = 'dm';
            priority = 8;
          } else if (isReply) {
            notificationType = 'reply';
            priority = 6;
          } else {
            notificationType = 'channel_message';
            priority = 3;
          }

          const sender = message.user ? await getUserInfo(message.user) : null;
          const channelDbId = channelIdMap.get(conv.id);

          notifications.push({
            user_id: user.id,
            slack_channel_id: channelDbId,
            slack_message_ts: message.ts,
            slack_thread_ts: message.thread_ts,
            notification_type: notificationType,
            text: message.text,
            text_preview: message.text.substring(0, 100),
            sender_slack_user_id: message.user || 'unknown',
            sender_name: sender?.real_name || sender?.name || 'Unknown',
            sender_avatar: sender?.profile?.image_72,
            channel_name: conv.name || 'Direct Message',
            channel_slack_id: conv.id,
            has_attachments: (message.files?.length || 0) > 0 || (message.attachments?.length || 0) > 0,
            has_reactions: (message.reactions?.length || 0) > 0,
            reactions: message.reactions || [],
            is_thread_parent: message.reply_count && message.reply_count > 0,
            is_thread_reply: isReply,
            reply_count: message.reply_count || 0,
            priority,
            slack_created_at: new Date(parseFloat(message.ts) * 1000).toISOString(),
          });
        }
      } catch (error) {
        console.error(`Error processing conversation ${conv.id}:`, error);
        continue;
      }
    }

    console.log(`📥 Storing ${notifications.length} notifications...`);

    if (notifications.length > 0) {
      await supabase.from('slack_notifications').upsert(notifications, {
        onConflict: 'user_id,slack_message_ts',
        ignoreDuplicates: true,
      });
    }

    await supabase
      .from('slack_profiles')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('user_id', user.id);

    console.log('✅ Slack sync complete');

    return NextResponse.json({
      success: true,
      synced: {
        channels: channelData.length,
        notifications: notifications.length,
        workspace: team,
      },
    });
  } catch (error: any) {
    console.error('Error syncing Slack data:', error);
    return NextResponse.json(
      { error: 'Failed to sync Slack data', message: error.message },
      { status: 500 }
    );
  }
}
