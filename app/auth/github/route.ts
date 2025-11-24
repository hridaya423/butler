import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: `${requestUrl.origin}/auth/callback`,
            scopes: 'repo read:user user:email',
        },
    });

    if (error) {
        return NextResponse.redirect(`${requestUrl.origin}/dashboard?error=github_connect_failed`);
    }

    if (data.url) {
        return NextResponse.redirect(data.url);
    }

    return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
