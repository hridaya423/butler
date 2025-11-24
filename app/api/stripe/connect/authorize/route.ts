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

    const clientId = process.env.STRIPE_CONNECT_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/connect/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Stripe Connect not configured' },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      client_id: clientId,
      state: user.id,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'read_write',
    });

    const stripeOAuthUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;

    return NextResponse.json({ url: stripeOAuthUrl });
  } catch (error) {
    console.error('Error initiating Stripe Connect:', error);
    return NextResponse.json(
      { error: 'Failed to initiate connection' },
      { status: 500 }
    );
  }
}
