export interface StripeCustomer {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'canceled';

export interface Payment {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_customer_id: string;

  amount: number;
  currency: string;
  status: PaymentStatus;

  project_name: string | null;
  project_id: string | null;
  description: string | null;

  payment_method: string | null;
  receipt_url: string | null;
  invoice_url: string | null;

  paid_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'unpaid'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused';

export type BillingInterval = 'day' | 'week' | 'month' | 'year';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;

  status: SubscriptionStatus;
  plan_name: string;
  plan_id: string | null;

  amount: number;
  currency: string;
  interval: BillingInterval;
  interval_count: number;

  project_name: string | null;
  project_id: string | null;

  trial_start: string | null;
  trial_end: string | null;

  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  ended_at: string | null;

  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | 'payment_received'
  | 'subscription_created'
  | 'subscription_renewed'
  | 'refund_issued';

export interface PaymentNotification {
  id: string;
  user_id: string;
  payment_id: string | null;

  type: NotificationType;
  title: string;
  message: string;

  amount: number;
  currency: string;
  project_name: string | null;

  is_read: boolean;
  read_at: string | null;

  created_at: string;
}

export interface PaymentStats {
  total_revenue: number;
  payment_count: number;
  avg_payment: number;
  last_payment_date: string | null;
  active_subscriptions: number;
  monthly_recurring_revenue: number;
}

export interface ProjectStats {
  project_name: string;
  total_revenue: number;
  payment_count: number;
  subscription_count: number;
  last_payment_date: string | null;
}

export interface DailyPaymentStat {
  date: string;
  payment_count: number;
  total_amount: number;
  avg_amount: number;
  unique_customers: number;
  project_name: string | null;
}

export interface MonthlyRevenue {
  month: string;
  payment_count: number;
  total_revenue: number;
  unique_customers: number;
  project_name: string | null;
}

export interface ActiveSubscriptionSummary {
  status: SubscriptionStatus;
  plan_name: string;
  project_name: string | null;
  subscription_count: number;
  monthly_recurring_revenue: number;
}

export function formatCurrency(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export function getStatusColor(status: PaymentStatus | SubscriptionStatus): string {
  switch (status) {
    case 'succeeded':
    case 'active':
      return 'green';
    case 'pending':
    case 'trialing':
      return 'yellow';
    case 'failed':
    case 'canceled':
    case 'past_due':
      return 'red';
    default:
      return 'gray';
  }
}

export function getStatusBadgeClass(status: PaymentStatus | SubscriptionStatus): string {
  switch (status) {
    case 'succeeded':
    case 'active':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'pending':
    case 'trialing':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'failed':
    case 'canceled':
    case 'past_due':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-neutral-100 text-neutral-700 border-neutral-200';
  }
}

export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'payment_received':
      return '💰';
    case 'subscription_created':
      return '🚀';
    case 'subscription_renewed':
      return '♻️';
    case 'refund_issued':
      return '💸';
    default:
      return '🔔';
  }
}
