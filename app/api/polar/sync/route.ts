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

        let apiKey = user.user_metadata?.polar_api_key;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'No Polar API Key found. Please add it in Settings.' },
                { status: 400 }
            );
        }

        apiKey = apiKey.trim();

        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
        };

        const ordersResponse = await fetch('https://api.polar.sh/v1/orders', { headers });

        if (!ordersResponse.ok) {
            const errorText = await ordersResponse.text();
            console.error('Polar Orders Error:', errorText);
            throw new Error(`Failed to fetch Polar orders: ${ordersResponse.statusText}`);
        }

        const ordersData = await ordersResponse.json();

        const paymentsData = ordersData.items.map((order: any) => ({
            user_id: user.id,
            stripe_payment_intent_id: `polar_${order.id}`,
            stripe_charge_id: `polar_charge_${order.id}`,
            stripe_customer_id: order.customer_id || 'unknown',
            amount: order.amount,
            currency: order.currency,
            status: 'succeeded',
            description: `Polar Order #${order.id} - ${order.product.name}`,
            receipt_url: null,
            paid_at: order.created_at,
            created_at: order.created_at,
            updated_at: new Date().toISOString(),
            project_name: 'Polar',
        }));

        if (paymentsData.length > 0) {
            const { error } = await supabase.from('payments').upsert(paymentsData, {
                onConflict: 'stripe_charge_id',
                ignoreDuplicates: false
            });

            if (error) console.error('Error upserting Polar payments:', error);
        }

        const subsResponse = await fetch('https://api.polar.sh/v1/subscriptions', { headers });

        if (!subsResponse.ok) {
            console.error('Polar Subscriptions Error:', await subsResponse.text());
        } else {
            const subsData = await subsResponse.json();

            const subscriptionsData = subsData.items.map((sub: any) => ({
                user_id: user.id,
                stripe_subscription_id: `polar_sub_${sub.id}`,
                stripe_customer_id: sub.customer_id,
                status: sub.status,
                plan_name: sub.product.name,
                amount: sub.amount || 0,
                currency: sub.currency || 'usd',
                interval: sub.recurring_interval,
                interval_count: 1,
                current_period_start: sub.current_period_start ? new Date(sub.current_period_start).toISOString() : new Date().toISOString(),
                current_period_end: sub.current_period_end ? new Date(sub.current_period_end).toISOString() : new Date().toISOString(),
                cancel_at_period_end: sub.cancel_at_period_end,
                canceled_at: sub.canceled_at,
                created_at: sub.created_at,
                updated_at: new Date().toISOString(),
                project_name: 'Polar'
            }));

            if (subscriptionsData.length > 0) {
                const { error } = await supabase.from('subscriptions').upsert(subscriptionsData, {
                    onConflict: 'stripe_subscription_id',
                    ignoreDuplicates: false
                });
                if (error) console.error('Error upserting Polar subscriptions:', error);
            }
        }

        return NextResponse.json({
            success: true,
            count: {
                payments: paymentsData.length,
                subscriptions: 0
            }
        });

    } catch (error: any) {
        console.error('Error syncing Polar data:', error);
        return NextResponse.json(
            { error: 'Failed to sync Polar data', message: error.message },
            { status: 500 }
        );
    }
}
