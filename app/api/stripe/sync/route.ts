/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler-client';
import Stripe from 'stripe';

export async function POST() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let stripeKey = user.user_metadata?.stripe_api_key;

        if (!stripeKey) {
            return NextResponse.json(
                { error: 'No Stripe API Key found. Please add it in Settings.' },
                { status: 400 }
            );
        }

        stripeKey = stripeKey.trim();

        const stripe = new Stripe(stripeKey, {
            apiVersion: '2025-11-17.clover',
        });
        const charges = await stripe.charges.list({ limit: 100 });

        const paymentsData = charges.data.map((charge) => ({
            user_id: user.id,
            stripe_payment_intent_id: typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id,
            stripe_charge_id: charge.id,
            stripe_customer_id: typeof charge.customer === 'string' ? charge.customer : charge.customer?.id || 'unknown',
            amount: charge.amount,
            currency: charge.currency,
            status: charge.status,
            description: charge.description,
            receipt_url: charge.receipt_url,
            paid_at: charge.created ? new Date(charge.created * 1000).toISOString() : null,
            created_at: new Date(charge.created * 1000).toISOString(),
            updated_at: new Date().toISOString(),
        }));

        if (paymentsData.length > 0) {
            const { error } = await supabase.from('payments').upsert(paymentsData, {
                onConflict: 'stripe_charge_id',
                ignoreDuplicates: false
            });

            if (error) console.error('Error upserting payments:', error);
        }

        const subscriptions = await stripe.subscriptions.list({ limit: 100, status: 'all' });

        const subscriptionsData = subscriptions.data.map((sub) => ({
            user_id: user.id,
            stripe_subscription_id: sub.id,
            stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id,
            status: sub.status,
            plan_name: sub.items.data[0]?.price.nickname || 'Standard Plan',
            amount: sub.items.data[0]?.price.unit_amount || 0,
            currency: sub.currency,
            interval: sub.items.data[0]?.price.recurring?.interval || 'month',
            interval_count: sub.items.data[0]?.price.recurring?.interval_count || 1,
            current_period_start: new Date((sub as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end,
            canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
            created_at: new Date(sub.created * 1000).toISOString(),
            updated_at: new Date().toISOString(),
        }));

        if (subscriptionsData.length > 0) {
            const { error } = await supabase.from('subscriptions').upsert(subscriptionsData, {
                onConflict: 'stripe_subscription_id',
                ignoreDuplicates: false
            });
            if (error) console.error('Error upserting subscriptions:', error);
        }

        return NextResponse.json({
            success: true,
            count: {
                payments: paymentsData.length,
                subscriptions: subscriptionsData.length
            }
        });

    } catch (error: any) {
        console.error('Error syncing Stripe data:', error);
        return NextResponse.json(
            { error: 'Failed to sync Stripe data', message: error.message },
            { status: 500 }
        );
    }
}
