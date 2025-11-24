/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler-client';

export async function POST() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let apiKey = user.user_metadata?.lemonsqueezy_api_key;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'No Lemon Squeezy API Key found. Please add it in Settings.' },
                { status: 400 }
            );
        }

        apiKey = apiKey.trim();

        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
        };

        const ordersResponse = await fetch('https://api.lemonsqueezy.com/v1/orders', { headers });

        if (!ordersResponse.ok) {
            const errorText = await ordersResponse.text();
            console.error('Lemon Squeezy Orders Error:', errorText);
            throw new Error(`Failed to fetch orders: ${ordersResponse.statusText}`);
        }

        const ordersData = await ordersResponse.json();

        const paymentsData = ordersData.data.map((order: any) => ({
            user_id: user.id,
            stripe_payment_intent_id: `ls_${order.id}`, // Using LS ID as surrogate
            stripe_charge_id: `ls_charge_${order.id}`,
            stripe_customer_id: order.attributes.customer_id?.toString() || 'unknown',
            amount: order.attributes.total,
            currency: order.attributes.currency,
            status: order.attributes.status,
            description: `Order #${order.attributes.identifier} - ${order.attributes.user_email}`,
            receipt_url: order.attributes.receipt_url,
            paid_at: order.attributes.created_at,
            created_at: order.attributes.created_at,
            updated_at: new Date().toISOString(),
            project_name: 'Lemon Squeezy',
        }));

        if (paymentsData.length > 0) {
            const { error } = await supabase.from('payments').upsert(paymentsData, {
                onConflict: 'stripe_charge_id',
                ignoreDuplicates: false
            });

            if (error) console.error('Error upserting LS payments:', error);
        }

        const subsResponse = await fetch('https://api.lemonsqueezy.com/v1/subscriptions', { headers });

        let subscriptionsData: any[] = [];

        if (!subsResponse.ok) {
            console.error('Lemon Squeezy Subscriptions Error:', await subsResponse.text());
        } else {
            const subsData = await subsResponse.json();

            subscriptionsData = subsData.data.map((sub: any) => ({
                user_id: user.id,
                stripe_subscription_id: `ls_sub_${sub.id}`,
                stripe_customer_id: sub.attributes.customer_id?.toString(),
                status: sub.attributes.status,
                plan_name: sub.attributes.product_name || 'Subscription',
                amount: sub.attributes.total,
                currency: sub.attributes.currency || 'usd',
                interval: sub.attributes.variant_name?.toLowerCase().includes('year') ? 'year' : 'month',
                interval_count: 1,
                current_period_start: sub.attributes.renews_at ? new Date(sub.attributes.renews_at).toISOString() : new Date().toISOString(),
                current_period_end: sub.attributes.renews_at,
                cancel_at_period_end: sub.attributes.ends_at ? true : false,
                canceled_at: sub.attributes.ends_at,
                created_at: sub.attributes.created_at,
                updated_at: new Date().toISOString(),
                project_name: 'Lemon Squeezy'
            }));

            if (subscriptionsData.length > 0) {
                const { error } = await supabase.from('subscriptions').upsert(subscriptionsData, {
                    onConflict: 'stripe_subscription_id',
                    ignoreDuplicates: false
                });
                if (error) console.error('Error upserting LS subscriptions:', error);
            }
        }

        return NextResponse.json({
            success: true,
            count: {
                payments: paymentsData.length,
                subscriptions: subscriptionsData.length
            }
        });

    } catch (error: any) {
        console.error('Error syncing Lemon Squeezy data:', error);
        return NextResponse.json(
            { error: 'Failed to sync Lemon Squeezy data', message: error.message },
            { status: 500 }
        );
    }
}
