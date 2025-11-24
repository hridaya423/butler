'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  FileText,
  MoreHorizontal,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { format } from 'date-fns';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  formatCurrency,
  getStatusBadgeClass,
  type PaymentStats,
  type ProjectStats,
  type Payment,
  type Subscription,
  type DailyPaymentStat,
  type MonthlyRevenue,
} from '@/lib/types/payments';
import {
  getPaymentStats,
  getProjectStats,
  getPayments,
  getActiveSubscriptions,
  getDailyStats,
  getMonthlyRevenue,
} from '@/lib/supabase/payments';

const COLORS = {
  primary: '#FB7C1C',
  secondary: '#6366F1',
  success: '#10B981',
  info: '#3B82F6',
  purple: '#A855F7',
  gray: '#E5E5E5',
};

const PIE_COLORS = ['#FB7C1C', '#6366F1', '#10B981', '#3B82F6', '#A855F7', '#F59E0B'];

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyPaymentStat[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [statsData, projectData, paymentsData, subsData, dailyData, monthlyData] =
        await Promise.all([
          getPaymentStats(),
          getProjectStats(),
          getPayments('succeeded', 10),
          getActiveSubscriptions(),
          getDailyStats(timeRange),
          getMonthlyRevenue(),
        ]);

      setStats(statsData);
      setProjectStats(projectData);
      setRecentPayments(paymentsData);
      setSubscriptions(subsData);
      setDailyStats(dailyData);
      setMonthlyRevenue(monthlyData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvData = recentPayments.map((payment) => ({
      Project: payment.project_name || 'N/A',
      Description: payment.description || 'Payment',
      Amount: payment.amount / 100,
      Currency: payment.currency,
      Date: payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : 'N/A',
      Status: payment.status,
    }));

    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map((row) => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(
      {
        stats,
        projectStats,
        payments: recentPayments,
        subscriptions,
        exportDate: new Date().toISOString(),
      },
      null,
      2
    );

    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <DollarSign className="w-8 h-8 text-neutral-300" />
        </div>
        <p className="text-base font-medium text-neutral-900">Loading analytics...</p>
        <p className="text-sm text-neutral-500">Crunching the numbers for you.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            Payment Analytics
          </h2>
          <p className="text-sm text-neutral-500">
            Overview of your revenue and transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-neutral-100/50 p-1 rounded-lg border border-neutral-200/50">
            {([7, 30, 90] as const).map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${timeRange === days
                  ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-black/5'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50'
                  }`}
              >
                {days}d
              </button>
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-9 text-xs font-medium bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-all shadow-sm">
                <Download className="w-3.5 h-3.5" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleExportCSV} className="gap-2 text-xs">
                <FileText className="w-3.5 h-3.5" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON} className="gap-2 text-xs">
                <FileText className="w-3.5 h-3.5" />
                Export JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Total Revenue"
          value={formatCurrency(stats?.total_revenue || 0)}
          trend={null}
          color="green"
        />
        <StatCard
          icon={<CreditCard className="w-5 h-5" />}
          label="Total Payments"
          value={stats?.payment_count?.toString() || '0'}
          trend={null}
          color="blue"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Monthly Recurring"
          value={formatCurrency(stats?.monthly_recurring_revenue || 0)}
          trend={null}
          color="purple"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Active Subscriptions"
          value={stats?.active_subscriptions?.toString() || '0'}
          trend={null}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-neutral-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">Revenue Trend</h3>
                <p className="text-xs text-neutral-500">Daily revenue over time</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value: string) => format(new Date(value), 'MMM dd')}
                    stroke="#a3a3a3"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card className="border-neutral-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">Monthly Revenue</h3>
                <p className="text-xs text-neutral-500">Revenue breakdown by month</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(value: string) => format(new Date(value), 'MMM')}
                    stroke="#a3a3a3"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #f0f0f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill={COLORS.primary} radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
        <Card className="border-neutral-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">Revenue Distribution</h3>
                <p className="text-xs text-neutral-500">Revenue share by project</p>
              </div>
            </div>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="total_revenue"
                    nameKey="project_name"
                  >
                    {projectStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #f0f0f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card className="border-neutral-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">Growth</h3>
                <p className="text-xs text-neutral-500">Payments vs Customers</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value: string) => format(new Date(value), 'MMM dd')}
                    stroke="#a3a3a3"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #f0f0f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="payment_count"
                    name="Payments"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="unique_customers"
                    name="Customers"
                    stroke={COLORS.secondary}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-neutral-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <div className="p-6 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">Revenue by Project</h3>
                <p className="text-xs text-neutral-500">Breakdown of earnings per project</p>
              </div>
            </div>
          </div>

          <div className="p-0">
            {projectStats.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-neutral-500">No project data yet</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-50">
                {projectStats.map((project, index) => (
                  <div
                    key={project.project_name}
                    className="p-4 hover:bg-neutral-50/50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-600">
                        {project.project_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-neutral-900">
                          {project.project_name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <span>{project.payment_count} payments</span>
                          <span>•</span>
                          <span>{project.subscription_count} subs</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900">
                      {formatCurrency(project.total_revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="border-neutral-100 shadow-sm rounded-2xl bg-white overflow-hidden">
          <div className="p-6 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">Active Subscriptions</h3>
                <p className="text-xs text-neutral-500">Current recurring revenue streams</p>
              </div>
            </div>
          </div>

          <div className="p-0">
            {subscriptions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-neutral-500">No active subscriptions</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-50">
                {subscriptions.map((sub, index) => (
                  <div
                    key={sub.id}
                    className="p-4 hover:bg-neutral-50/50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-neutral-900">
                          {sub.plan_name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          {sub.project_name && (
                            <span className="font-medium text-neutral-700">{sub.project_name}</span>
                          )}
                          <span>•</span>
                          <span>Renews {new Date(sub.current_period_end).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-neutral-900">
                        {formatCurrency(sub.amount, sub.currency)}
                        <span className="text-xs text-neutral-500 font-normal">/{sub.interval}</span>
                      </p>
                      <Badge className={`mt-1 text-[10px] h-4 px-1.5 ${getStatusBadgeClass(sub.status)}`}>
                        {sub.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="border-neutral-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Recent Payments</h3>
              <p className="text-xs text-neutral-500">Latest successful transactions</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-neutral-500 hover:text-neutral-900">
              View All
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100">
                <th className="text-left py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-neutral-500">
                    <p className="text-sm">No payments yet</p>
                  </td>
                </tr>
              ) : (
                recentPayments.map((payment, index) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-neutral-50/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-neutral-900">
                        {payment.project_name || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-neutral-600">
                        {payment.description || 'Payment'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-semibold text-neutral-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-neutral-500">
                        {payment.paid_at
                          ? new Date(payment.paid_at).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={`text-[10px] h-5 px-2 ${getStatusBadgeClass(payment.status)}`}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-neutral-900">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: { value: number; isPositive: boolean } | null;
  color: 'green' | 'blue' | 'purple' | 'orange';
}

function StatCard({ icon, label, value, trend, color }: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <Card className="border-neutral-100 shadow-sm rounded-2xl bg-white hover:shadow-md transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <p className="text-sm text-neutral-500 font-medium mb-1">{label}</p>
        <p className="text-2xl font-semibold text-neutral-900 tracking-tight">
          {value}
        </p>
      </div>
    </Card>
  );
}
