import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-11-17.clover',
  });
}

export async function GET(request: NextRequest) {
  try {
    const stripe = getStripeClient();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Stripe OAuth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?stripe_error=${error}`
      );
    }

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing authorization code or state' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== state) {
      return NextResponse.json(
        { error: 'Invalid state parameter' },
        { status: 400 }
      );
    }

    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });

    const { stripe_user_id, access_token, refresh_token } = response;

    const account = stripe_user_id
      ? await stripe.accounts.retrieve(stripe_user_id, {
          stripeAccount: stripe_user_id,
        })
      : null;

    if (!account) {
      return NextResponse.json(
        { error: 'Failed to retrieve Stripe account' },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from('stripe_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('stripe_user_id', stripe_user_id)
      .single();

    if (existing) {
      await supabase
        .from('stripe_connections')
        .update({
          access_token,
          refresh_token,
          account_email: account.email || null,
          account_name: account.business_profile?.name || account.email || null,
          account_country: account.country || null,
          charges_enabled: account.charges_enabled || false,
          payouts_enabled: account.payouts_enabled || false,
          is_active: true,
          disconnected_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('stripe_connections').insert({
        user_id: user.id,
        stripe_user_id,
        access_token,
        refresh_token,
        stripe_account_type: account.type || 'standard',
        account_email: account.email || null,
        account_name: account.business_profile?.name || account.email || null,
        account_country: account.country || null,
        charges_enabled: account.charges_enabled || false,
        payouts_enabled: account.payouts_enabled || false,
        is_active: true,
      });
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?stripe_connected=true`
    );
  } catch (error) {
    console.error('Error in Stripe OAuth callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?stripe_error=connection_failed`
    );
  }
}
