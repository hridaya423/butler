import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler-client';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.session) {
            const providerToken = data.session.provider_token;
            const user = data.session.user;

            if (providerToken && user) {
                const githubIdentity = user.identities?.find(id => id.provider === 'github');

                if (githubIdentity) {
                    const supabaseAdmin = createServiceRoleClient();
                    await supabaseAdmin.from('github_profiles').upsert({
                        user_id: user.id,
                        github_user_id: githubIdentity.id,
                        github_username: (githubIdentity.identity_data as any)?.user_name || (githubIdentity.identity_data as any)?.preferred_username,
                        github_name: (githubIdentity.identity_data as any)?.full_name || (githubIdentity.identity_data as any)?.name,
                        github_avatar_url: (githubIdentity.identity_data as any)?.avatar_url,
                        github_email: (githubIdentity.identity_data as any)?.email,
                        access_token: providerToken,
                        last_synced_at: new Date().toISOString(),
                    }, { onConflict: 'user_id' });
                }
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    return NextResponse.redirect(`${origin}/auth?error=Could not authenticate user`);
}
