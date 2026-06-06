'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Zap, ArrowUpRight, Check, ExternalLink } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge, statusBadgeVariant } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/ui/stat-card';
import { billingApi } from '@/lib/api/billing';
import { useAuthStore } from '@/lib/store/auth.store';
import { formatCredits, planDisplayName } from '@/lib/utils';

const PLANS = [
  {
    name: 'Pro',
    price: '$9.99/mo',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro',
    credits: '5,000',
    features: ['Unlimited voice interviews', 'Enhanced feedback reports', '5,000 AI Credits / month'],
  },
  {
    name: 'Premium',
    price: '$19.99/mo',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || 'price_premium',
    credits: '15,000',
    features: ['Everything in Pro', 'Premium coaching reports', '15,000 AI Credits / month'],
  },
];

const CREDIT_PACKS = [
  { label: '1,000 Credits', amount: 1000, price: '$4.99',  sub: '≈ 10 reports',    priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_1000_PRICE_ID || '' },
  { label: '5,000 Credits', amount: 5000, price: '$19.99', sub: '≈ 50 reports',    priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_5000_PRICE_ID || '' },
  { label: '10,000 Credits',amount: 10000,price: '$34.99', sub: '≈ 100 reports',   priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_10000_PRICE_ID || '' },
];

export default function BillingPage() {
  const user  = useAuthStore((s) => s.user);
  const [sub, setSub]           = useState<any>(null);
  const [balance, setBalance]   = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([billingApi.getSubscription(), billingApi.getBalance(), billingApi.getTransactions()])
      .then(([s, b, t]) => { setSub(s); setBalance(b); setTransactions(t.data ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const checkout = async (priceId: string) => {
    try {
      const { url } = await billingApi.createCheckout({
        priceId,
        successUrl: `${window.location.origin}/billing?success=1`,
        cancelUrl:  `${window.location.origin}/billing`,
      });
      window.location.href = url;
    } catch { alert('Failed to open checkout. Please try again.'); }
  };

  const buyCredits = async (pack: typeof CREDIT_PACKS[0]) => {
    try {
      const { url } = await billingApi.purchaseCredits({
        priceId: pack.priceId,
        creditAmount: pack.amount,
        successUrl: `${window.location.origin}/billing?credits=1`,
        cancelUrl:  `${window.location.origin}/billing`,
      });
      window.location.href = url;
    } catch { alert('Failed to open checkout.'); }
  };

  const openPortal = async () => {
    try {
      const { url } = await billingApi.createPortalSession(`${window.location.origin}/billing`);
      window.location.href = url;
    } catch { alert('Failed to open billing portal.'); }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Billing">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-100" />)}
        </div>
      </DashboardLayout>
    );
  }

  const plan         = sub?.plan ?? 'FREE';
  const subCredits   = balance?.subscriptionCredits ?? 0;
  const purchCredits = balance?.purchasedCredits ?? 0;
  const total        = subCredits + purchCredits;
  const monthlyMax   = plan === 'PREMIUM' ? 15000 : plan === 'PRO' ? 5000 : 1500;

  return (
    <DashboardLayout
      pageTitle="Billing"
      actions={
        plan !== 'FREE' && (
          <Button variant="secondary" size="sm" onClick={openPortal}>
            <ExternalLink className="h-3.5 w-3.5" />
            Manage subscription
          </Button>
        )
      }
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Current plan */}
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">Current Plan</p>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-neutral-900">{planDisplayName(plan)}</h2>
                <Badge variant={statusBadgeVariant(plan)} size="md">{plan}</Badge>
              </div>
              {sub?.billingPeriodEnd && (
                <p className="mt-1 text-sm text-neutral-500">
                  Renews {new Date(sub.billingPeriodEnd).toLocaleDateString()}
                </p>
              )}
              {sub?.pendingPlan && (
                <p className="mt-1 text-xs text-warning-700">
                  Downgrading to {planDisplayName(sub.pendingPlan)} at next renewal
                </p>
              )}
            </div>
            <CreditCard className="h-6 w-6 text-neutral-300" />
          </div>
        </div>

        {/* Credit balance */}
        <div className="card p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">AI Credits</p>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <span className="text-4xl font-extrabold text-neutral-900 tabular-nums">{formatCredits(total)}</span>
              <span className="ml-2 text-sm text-neutral-500">remaining</span>
            </div>
            <Zap className="h-6 w-6 text-plum-900" />
          </div>
          <Progress value={total} max={monthlyMax * 2} size="md" color="plum" />
          <div className="mt-3 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Subscription</p>
              <p className="text-lg font-bold text-neutral-900 tabular-nums">{formatCredits(subCredits)}</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Purchased</p>
              <p className="text-lg font-bold text-neutral-900 tabular-nums">{formatCredits(purchCredits)}</p>
            </div>
          </div>
        </div>

        {/* Upgrade plans */}
        {plan === 'FREE' && (
          <div>
            <h2 className="mb-3 text-sm font-semibold text-neutral-900">Upgrade your plan</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {PLANS.map((p) => (
                <div key={p.name} className="card p-5">
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="font-semibold text-neutral-900">{p.name}</h3>
                    <span className="text-sm font-bold text-plum-900">{p.price}</span>
                  </div>
                  <p className="mb-3 text-xs text-neutral-500">{p.credits} credits/month</p>
                  <ul className="mb-4 space-y-1.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-neutral-600">
                        <Check className="h-3.5 w-3.5 flex-shrink-0 text-success-600" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" size="sm" onClick={() => checkout(p.priceId)}>
                    Upgrade to {p.name}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Credit packs */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-neutral-900">Buy additional credits</h2>
          <p className="mb-3 text-xs text-neutral-500">Purchased credits never expire and bypass rollover limits.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {CREDIT_PACKS.map((pack) => (
              <div key={pack.label} className="card p-4 text-center">
                <Zap className="mx-auto mb-2 h-5 w-5 text-plum-900" />
                <p className="text-sm font-semibold text-neutral-900">{pack.label}</p>
                <p className="text-xs text-neutral-400">{pack.sub}</p>
                <p className="mt-2 text-xl font-bold text-plum-900">{pack.price}</p>
                <button
                  onClick={() => buyCredits(pack)}
                  className="mt-3 w-full rounded-lg border border-neutral-200 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Buy now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction history */}
        {transactions.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold text-neutral-900">Credit history</h2>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">Credits</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-medium capitalize text-neutral-700">
                        {tx.type.toLowerCase().replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-600">{tx.description || '—'}</td>
                      <td className={`px-4 py-3 text-right text-sm font-semibold tabular-nums ${tx.amount > 0 ? 'text-success-600' : 'text-danger-600'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-neutral-400">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
