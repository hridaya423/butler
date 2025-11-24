import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: connection, error: fetchError } = await supabase
      .from('stripe_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (fetchError || !connection) {
      return NextResponse.json(
        { error: 'No active connection found' },
        { status: 404 }
      );
    }

    const account = await stripe.accounts.retrieve(connection.stripe_user_id, {
      stripeAccount: connection.stripe_user_id,
    });

    const { data: updated, error: updateError } = await supabase
      .from('stripe_connections')
      .update({
        account_email: account.email || null,
        account_name: account.business_profile?.name || account.email || null,
        account_country: account.country || null,
        charges_enabled: account.charges_enabled || false,
        payouts_enabled: account.payouts_enabled || false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ connection: updated });
  } catch (error) {
    console.error('Error refreshing Stripe connection:', error);
    return NextResponse.json(
      { error: 'Failed to refresh connection' },
      { status: 500 }
    );
  }
}
