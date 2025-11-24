/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from './client';
import type {
  Payment,
  Subscription,
  PaymentNotification,
  PaymentStats,
  ProjectStats,
  DailyPaymentStat,
  MonthlyRevenue,
} from '../types/payments';

export async function getPayments(status?: string, limit = 50): Promise<Payment[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .order('paid_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }

  return data || [];
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching payment:', error);
    return null;
  }

  return data;
}

export async function getPaymentsByProject(projectName: string): Promise<Payment[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .eq('project_name', projectName)
    .order('paid_at', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('Error fetching payments by project:', error);
    throw error;
  }

  return data || [];
}

export async function getSubscriptions(status?: string): Promise<Subscription[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }

  return data || [];
}

export async function getActiveSubscriptions(): Promise<Subscription[]> {
  return getSubscriptions('active');
}

export async function getPaymentNotifications(
  unreadOnly = false,
  limit = 20
): Promise<PaymentNotification[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from('payment_notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }

  return data || [];
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('payment_notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from('payment_notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

export async function getPaymentStats(): Promise<PaymentStats> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      total_revenue: 0,
      payment_count: 0,
      avg_payment: 0,
      last_payment_date: null,
      active_subscriptions: 0,
      monthly_recurring_revenue: 0,
    };
  }

  const { data: payments } = await supabase
    .from('payments')
    .select('amount, paid_at')
    .eq('user_id', user.id)
    .eq('status', 'succeeded');

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('amount')
    .eq('user_id', user.id)
    .eq('status', 'active');

  const totalRevenue = payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
  const paymentCount = payments?.length || 0;
  const avgPayment = paymentCount > 0 ? totalRevenue / paymentCount : 0;
  const lastPaymentDate =
    payments && payments.length > 0
      ? payments.reduce((latest: string | null, p: any) => {
          if (!p.paid_at) return latest;
          return !latest || new Date(p.paid_at) > new Date(latest) ? p.paid_at : latest;
        }, null as string | null)
      : null;

  const activeSubscriptions = subscriptions?.length || 0;
  const monthlyRecurringRevenue = subscriptions?.reduce((sum: number, s: any) => sum + s.amount, 0) || 0;

  return {
    total_revenue: totalRevenue,
    payment_count: paymentCount,
    avg_payment: avgPayment,
    last_payment_date: lastPaymentDate,
    active_subscriptions: activeSubscriptions,
    monthly_recurring_revenue: monthlyRecurringRevenue,
  };
}

export async function getProjectStats(): Promise<ProjectStats[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: payments } = await supabase
    .from('payments')
    .select('project_name, amount, paid_at')
    .eq('user_id', user.id)
    .eq('status', 'succeeded');

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('project_name')
    .eq('user_id', user.id)
    .eq('status', 'active');

  const projectMap = new Map<string, ProjectStats>();

  payments?.forEach((payment: any) => {
    const projectName = payment.project_name || 'Unknown';
    const existing = projectMap.get(projectName);

    if (existing) {
      existing.total_revenue += payment.amount;
      existing.payment_count += 1;
      if (
        payment.paid_at &&
        (!existing.last_payment_date ||
          new Date(payment.paid_at) > new Date(existing.last_payment_date))
      ) {
        existing.last_payment_date = payment.paid_at;
      }
    } else {
      projectMap.set(projectName, {
        project_name: projectName,
        total_revenue: payment.amount,
        payment_count: 1,
        subscription_count: 0,
        last_payment_date: payment.paid_at,
      });
    }
  });

  subscriptions?.forEach((sub: any) => {
    const projectName = sub.project_name || 'Unknown';
    const existing = projectMap.get(projectName);

    if (existing) {
      existing.subscription_count += 1;
    } else {
      projectMap.set(projectName, {
        project_name: projectName,
        total_revenue: 0,
        payment_count: 0,
        subscription_count: 1,
        last_payment_date: null,
      });
    }
  });

  return Array.from(projectMap.values());
}

export async function getDailyStats(days = 30): Promise<DailyPaymentStat[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('daily_payment_stats')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching daily stats:', error);
    throw error;
  }

  return data || [];
}

export async function getMonthlyRevenue(months = 12): Promise<MonthlyRevenue[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('monthly_revenue')
    .select('*')
    .eq('user_id', user.id)
    .limit(months)
    .order('month', { ascending: true });

  if (error) {
    console.error('Error fetching monthly revenue:', error);
    throw error;
  }

  return data || [];
}

export function subscribeToPaymentNotifications(
  callback: (notification: PaymentNotification) => void
) {
  const supabase = createClient();

  return supabase
    .channel('payment_notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'payment_notifications',
      },
      (payload: any) => {
        callback(payload.new as PaymentNotification);
      }
    )
    .subscribe();
}

export function subscribeToPayments(callback: (payment: Payment) => void) {
  const supabase = createClient();

  return supabase
    .channel('payments')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'payments',
      },
      (payload: { new: Payment }) => {
        callback(payload.new);
      }
    )
    .subscribe();
}
