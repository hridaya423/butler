import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler-client';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.SLACK_CLIENT_ID;

    const url = new URL(request.url);
    const redirectUri = `${url.origin}/api/slack/callback`;

    if (!clientId) {
        return NextResponse.json({ error: 'Missing SLACK_CLIENT_ID env variable' }, { status: 500 });
    }

    const scopes = [
        'channels:read',
        'groups:read',
        'im:read',
        'mpim:read',
        'users:read',
        'channels:history',
        'groups:history',
        'im:history',
        'mpim:history'
    ].join(' ');

    const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=&user_scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${user.id}`;

    return NextResponse.redirect(slackAuthUrl);
}
