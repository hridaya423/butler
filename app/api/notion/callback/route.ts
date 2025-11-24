import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID!;
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET!;
const NOTION_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/notion/callback`
  : 'http://localhost:3000/api/notion/callback';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/dashboard?error=${encodeURIComponent('Notion authorization failed')}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/dashboard?error=${encodeURIComponent('No authorization code received')}`
    );
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/auth?error=${encodeURIComponent('Please sign in first')}`
      );
    }

    const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: NOTION_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Notion token exchange failed:', errorData);
      return NextResponse.redirect(
        `${request.nextUrl.origin}/dashboard?error=${encodeURIComponent('Failed to connect Notion')}`
      );
    }

    const tokenData = await tokenResponse.json();
    const {
      access_token,
      workspace_id,
      workspace_name,
      workspace_icon,
      bot_id,
    } = tokenData;

    const { error: upsertError } = await supabase.from('notion_profiles').upsert({
      user_id: user.id,
      workspace_id,
      workspace_name,
      workspace_icon,
      bot_id,
      access_token,
    });

    if (upsertError) {
      console.error('Error storing Notion profile:', upsertError);
      return NextResponse.redirect(
        `${request.nextUrl.origin}/dashboard?error=${encodeURIComponent('Failed to save Notion connection')}`
      );
    }

    return NextResponse.redirect(
      `${request.nextUrl.origin}/dashboard?section=settings&tab=accounts&notion=connected`
    );
  } catch (err) {
    console.error('Notion OAuth error:', err);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/dashboard?error=${encodeURIComponent('An error occurred connecting Notion')}`
    );
  }
}
