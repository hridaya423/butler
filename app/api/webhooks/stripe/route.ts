/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-11-17.clover',
  });
}

export async function POST(req: Request) {
  try {
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'STRIPE_WEBHOOK_SECRET is not configured' },
        { status: 500 }
      );
    }

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('⚠️  Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const connectedAccountId = event.account;

    if (!connectedAccountId) {
      console.error('No connected account ID in webhook event');
      return NextResponse.json(
        { error: 'Missing connected account ID' },
        { status: 400 }
      );
    }

    const { data: connection } = await supabase
      .from('stripe_connections')
      .select('id, user_id')
      .eq('stripe_user_id', connectedAccountId)
      .eq('is_active', true)
      .single();

    if (!connection) {
      console.error('Connection not found for account:', connectedAccountId);
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }

    await supabase.from('stripe_webhook_events').insert({
      stripe_connection_id: connection.id,
      user_id: connection.user_id,
      stripe_event_id: event.id,
      event_type: event.type,
      processed: false,
    });

    console.log(`🔔 Received Stripe event: ${event.type} for user ${connection.user_id}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent,
          connection,
          supabase
        );
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent,
          connection,
          supabase
        );
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge, connection, supabase);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(
          event.data.object as Stripe.Subscription,
          connection,
          supabase
        );
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
          connection,
          supabase
        );
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice,
          connection,
          supabase
        );
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account, connection, supabase);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    await supabase
      .from('stripe_webhook_events')
      .update({ processed: true })
      .eq('stripe_event_id', event.id);

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', message: error.message },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  connection: { id: string; user_id: string },
  supabase: any
) {
  console.log('💰 Payment succeeded:', paymentIntent.id);

  const { customer, amount, currency, metadata } = paymentIntent;
  const charges = (paymentIntent as any).charges;
  const charge = charges?.data?.[0];

  const customerEmail = charge?.billing_details?.email || metadata?.customer_email;
  const customerName = charge?.billing_details?.name || metadata?.customer_name;

  const { data: payment } = await supabase
    .from('payments')
    .insert({
      user_id: connection.user_id,
      stripe_connection_id: connection.id,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_charge_id: charge?.id,
      stripe_customer_id: customer as string,
      amount,
      currency,
      status: 'succeeded',
      project_name: metadata?.project_name || null,
      project_id: metadata?.project_id || null,
      description: metadata?.description || paymentIntent.description || null,
      payment_method: charge?.payment_method_details?.type || null,
      receipt_url: charge?.receipt_url || null,
      customer_email: customerEmail || null,
      customer_name: customerName || null,
      paid_at: new Date(paymentIntent.created * 1000).toISOString(),
    })
    .select()
    .single();

  await supabase.from('payment_notifications').insert({
    user_id: connection.user_id,
    payment_id: payment?.id,
    type: 'payment_received',
    title: 'Payment Received! 🎉',
    message: `You received ${formatAmount(amount, currency)} ${metadata?.project_name ? `for ${metadata.project_name}` : ''}`,
    amount,
    currency,
    project_name: metadata?.project_name || null,
  });

  console.log('✅ Payment record created and notification sent');
}

async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  connection: { id: string; user_id: string },
  supabase: any
) {
  console.log('❌ Payment failed:', paymentIntent.id);

  const { customer, amount, currency, metadata } = paymentIntent;

  await supabase.from('payments').insert({
    user_id: connection.user_id,
    stripe_connection_id: connection.id,
    stripe_payment_intent_id: paymentIntent.id,
    stripe_customer_id: customer as string,
    amount,
    currency,
    status: 'failed',
    project_name: metadata?.project_name || null,
    project_id: metadata?.project_id || null,
    description: metadata?.description || paymentIntent.description || null,
  });
}

async function handleChargeRefunded(
  charge: Stripe.Charge,
  connection: { id: string; user_id: string },
  supabase: any
) {
  console.log('💸 Charge refunded:', charge.id);

  const { data: payment } = await supabase
    .from('payments')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString(),
    })
    .eq('stripe_charge_id', charge.id)
    .eq('user_id', connection.user_id)
    .select()
    .single();

  if (payment) {
    await supabase.from('payment_notifications').insert({
      user_id: connection.user_id,
      payment_id: payment.id,
      type: 'refund_issued',
      title: 'Refund Processed',
      message: `Refund of ${formatAmount(charge.amount_refunded, charge.currency)} has been issued`,
      amount: charge.amount_refunded,
      currency: charge.currency,
      project_name: payment.project_name,
    });
  }
}

async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  connection: { id: string; user_id: string },
  supabase: any
) {
  console.log('📋 Subscription updated:', subscription.id);

  const { customer, status, items, metadata } = subscription;
  const plan = items.data[0]?.price;
  const subAny = subscription as any;

  const subscriptionData = {
    user_id: connection.user_id,
    stripe_connection_id: connection.id,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: customer as string,
    status,
    plan_name: metadata?.plan_name || plan?.nickname || 'Subscription',
    plan_id: plan?.id || null,
    amount: plan?.unit_amount || 0,
    currency: plan?.currency || 'usd',
    interval: plan?.recurring?.interval || 'month',
    interval_count: plan?.recurring?.interval_count || 1,
    project_name: metadata?.project_name || null,
    project_id: metadata?.project_id || null,
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    current_period_start: new Date(subAny.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subAny.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
  };

  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (existingSub) {
    await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('stripe_subscription_id', subscription.id);
  } else {
    await supabase.from('subscriptions').insert(subscriptionData);

    if (subscription.status === 'active') {
      await supabase.from('payment_notifications').insert({
        user_id: connection.user_id,
        type: 'subscription_created',
        title: 'New Subscription! 🚀',
        message: `New ${subscriptionData.plan_name} subscription ${metadata?.project_name ? `for ${metadata.project_name}` : ''}`,
        amount: subscriptionData.amount,
        currency: subscriptionData.currency,
        project_name: metadata?.project_name || null,
      });
    }
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  connection: { id: string; user_id: string },
  supabase: any
) {
  console.log('🗑️  Subscription deleted:', subscription.id);

  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      ended_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
    .eq('user_id', connection.user_id);
}

async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
  connection: { id: string; user_id: string },
  supabase: any
) {
  console.log('📄 Invoice paid:', invoice.id);

  const invoiceSubscription = (invoice as any).subscription;
  if (!invoiceSubscription) return;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('user_id, project_name')
    .eq('stripe_subscription_id', invoiceSubscription)
    .eq('user_id', connection.user_id)
    .single();

  if (subscription && invoice.billing_reason === 'subscription_cycle') {
    await supabase.from('payment_notifications').insert({
      user_id: connection.user_id,
      type: 'subscription_renewed',
      title: 'Subscription Renewed ♻️',
      message: `Your subscription was automatically renewed for ${formatAmount(invoice.amount_paid, invoice.currency)}`,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      project_name: subscription.project_name,
    });
  }
}

async function handleAccountUpdated(
  account: Stripe.Account,
  connection: { id: string; user_id: string },
  supabase: any
) {
  console.log('🔄 Account updated:', account.id);

  await supabase
    .from('stripe_connections')
    .update({
      account_email: account.email || null,
      account_name: account.business_profile?.name || account.email || null,
      account_country: account.country || null,
      charges_enabled: account.charges_enabled || false,
      payouts_enabled: account.payouts_enabled || false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', connection.id);
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}
