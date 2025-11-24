import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler-client';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const state = requestUrl.searchParams.get('state');

    if (error) {
        return NextResponse.redirect(`${requestUrl.origin}/settings?tab=accounts&error=${error}`);
    }

    if (!code) {
        return NextResponse.redirect(`${requestUrl.origin}/settings?tab=accounts&error=no_code`);
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== state) {
        if (!user) {
            return NextResponse.redirect(`${requestUrl.origin}/auth?next=/settings`);
        }
    }

    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const redirectUri = `${requestUrl.origin}/api/slack/callback`;

    if (!clientId || !clientSecret) {
        return NextResponse.redirect(`${requestUrl.origin}/settings?tab=accounts&error=missing_config`);
    }

    try {
        const response = await fetch('https://slack.com/api/oauth.v2.access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: redirectUri,
            }),
        });

        const data = await response.json();

        if (!data.ok) {
            console.error('Slack OAuth Error:', data.error);
            return NextResponse.redirect(`${requestUrl.origin}/settings?tab=accounts&error=${data.error}`);
        }

        const accessToken = data.authed_user?.access_token;
        const slackUserId = data.authed_user?.id;
        const teamId = data.team?.id;
        const teamName = data.team?.name;

        if (!accessToken) {
            return NextResponse.redirect(`${requestUrl.origin}/settings?tab=accounts&error=no_token`);
        }

        const { error: dbError } = await supabase.from('slack_profiles').upsert({
            user_id: user.id,
            slack_user_id: slackUserId,
            slack_team_id: teamId,
            slack_team_name: teamName,
            access_token: accessToken,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        });

        if (dbError) {
            console.error('Database Error:', dbError);
            return NextResponse.redirect(`${requestUrl.origin}/settings?tab=accounts&error=db_error`);
        }

        return NextResponse.redirect(`${requestUrl.origin}/settings?tab=accounts&success=slack_synced`);

    } catch (err) {
        console.error('Callback Error:', err);
        return NextResponse.redirect(`${requestUrl.origin}/settings?tab=accounts&error=server_error`);
    }
}
