'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, Zap, DollarSign, BarChart3, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { analyticsApi } from '@/lib/api/profile';

function StatCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-3 text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
      {sub && <div className="text-xs text-gray-500">{sub}</div>}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    analyticsApi.getDashboard()
      .then(setData)
      .catch(() => setError('Failed to load analytics. Admin access required.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="p-8 text-red-600">{error}</div></DashboardLayout>;
  if (!data) return null;

  const fmt = (n: number) => n?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) ?? '—';
  const fmtCurrency = (n: number) => `$${(n ?? 0).toFixed(2)}`;

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="mb-8 text-2xl font-bold text-gray-900">Admin Analytics Dashboard</h1>

        {/* Revenue */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">Revenue</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="MRR" value={fmtCurrency(data.revenue.mrr)} icon={DollarSign} color="text-emerald-600 bg-emerald-50" />
            <StatCard label="ARR (est.)" value={fmtCurrency(data.revenue.arr)} icon={TrendingUp} color="text-blue-600 bg-blue-50" />
            <StatCard label="New Subs (month)" value={fmt(data.revenue.newSubscriptionsThisMonth)} icon={BarChart3} color="text-brand-600 bg-brand-50" />
            <StatCard label="Active Subscribers" value={fmt(data.revenue.activeSubscriptions)} icon={Users} color="text-purple-600 bg-purple-50" />
          </div>
        </section>

        {/* Users */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">Users</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Total Users" value={fmt(data.users.total)} icon={Users} color="text-gray-600 bg-gray-100" />
            <StatCard label="Free Users" value={fmt(data.users.free)} icon={Users} color="text-gray-600 bg-gray-100" />
            <StatCard label="Pro Users" value={fmt(data.users.pro)} icon={Users} color="text-brand-600 bg-brand-50" />
            <StatCard label="Premium Users" value={fmt(data.users.premium)} icon={Users} color="text-purple-600 bg-purple-50" />
          </div>
        </section>

        {/* Credits */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">AI Credits (this month)</h2>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Granted" value={fmt(data.credits.grantedThisMonth)} icon={Zap} color="text-emerald-600 bg-emerald-50" />
            <StatCard label="Purchased" value={fmt(data.credits.purchasedThisMonth)} icon={Zap} color="text-brand-600 bg-brand-50" />
            <StatCard label="Consumed" value={fmt(data.credits.consumedThisMonth)} icon={Zap} color="text-red-600 bg-red-50" />
          </div>
        </section>

        {/* AI Costs */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">AI Costs & Profitability</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="AI Cost Today" value={fmtCurrency(data.aiCosts.today)} icon={DollarSign} color="text-red-600 bg-red-50" />
            <StatCard label="AI Cost (month)" value={fmtCurrency(data.aiCosts.thisMonth)} icon={DollarSign} color="text-orange-600 bg-orange-50" />
            <StatCard label="Gross Margin" value={`${data.aiCosts.grossMarginPercent?.toFixed(1)}%`} icon={TrendingUp} color="text-emerald-600 bg-emerald-50" />
            <StatCard label="Gross Profit (month)" value={fmtCurrency(data.aiCosts.grossProfit)} icon={DollarSign} color="text-emerald-600 bg-emerald-50" />
          </div>
        </section>

        {/* Usage */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">Usage</h2>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total Interviews" value={fmt(data.usage.totalInterviews)} icon={BarChart3} color="text-brand-600 bg-brand-50" />
            <StatCard label="Voice Interviews" value={fmt(data.usage.voiceInterviews)} icon={BarChart3} color="text-brand-600 bg-brand-50" />
            <StatCard label="Feedback Reports" value={fmt(data.usage.totalFeedbackReports)} icon={BarChart3} color="text-brand-600 bg-brand-50" />
          </div>
        </section>

        {/* Top users */}
        {data.topUsersByConsumption?.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-700">Top Users by AI Consumption</h2>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">User ID</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Credits Consumed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.topUsersByConsumption.map((u: any) => (
                    <tr key={u.userId}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{u.userId}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {fmt(u._sum.creditsConsumed)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
