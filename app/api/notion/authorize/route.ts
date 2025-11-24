import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID!;
const NOTION_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/notion/callback`
  : 'http://localhost:3000/api/notion/callback';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${request.nextUrl.origin}/auth`);
    }

    const notionAuthUrl = new URL('https://api.notion.com/v1/oauth/authorize');
    notionAuthUrl.searchParams.set('client_id', NOTION_CLIENT_ID);
    notionAuthUrl.searchParams.set('redirect_uri', NOTION_REDIRECT_URI);
    notionAuthUrl.searchParams.set('response_type', 'code');
    notionAuthUrl.searchParams.set('owner', 'user');

    return NextResponse.redirect(notionAuthUrl.toString());
  } catch (error) {
    console.error('Notion authorize error:', error);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/dashboard?error=${encodeURIComponent('Failed to start Notion authorization')}`
    );
  }
}
