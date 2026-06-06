'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Zap, ArrowUpRight, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { billingApi } from '@/lib/api/billing';
import { useAuthStore } from '@/lib/store/auth.store';

const PLANS = [
  {
    name: 'Pro',
    price: '$9.99/mo',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
    features: ['5,000 AI Credits/month', 'Unlimited voice interviews', 'Enhanced feedback'],
  },
  {
    name: 'Premium',
    price: '$19.99/mo',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || '',
    features: ['15,000 AI Credits/month', 'Premium coaching', 'Priority access'],
  },
];

const CREDIT_PACKS = [
  { label: '1,000 Credits', price: '$4.99', amount: 1000, priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_1000_PRICE_ID || '' },
  { label: '5,000 Credits', price: '$19.99', amount: 5000, priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_5000_PRICE_ID || '' },
  { label: '10,000 Credits', price: '$34.99', amount: 10000, priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_10000_PRICE_ID || '' },
];

export default function BillingPage() {
  const user = useAuthStore((s) => s.user);
  const [subscription, setSubscription] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([billingApi.getSubscription(), billingApi.getBalance(), billingApi.getTransactions()])
      .then(([sub, bal, tx]) => {
        setSubscription(sub);
        setBalance(bal);
        setTransactions(tx.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = async (priceId: string) => {
    try {
      const { url } = await billingApi.createCheckout({
        priceId,
        successUrl: `${window.location.origin}/billing?success=1`,
        cancelUrl: `${window.location.origin}/billing`,
      });
      window.location.href = url;
    } catch (e) {
      alert('Failed to create checkout session');
    }
  };

  const handleCreditPurchase = async (pack: typeof CREDIT_PACKS[0]) => {
    try {
      const { url } = await billingApi.purchaseCredits({
        priceId: pack.priceId,
        creditAmount: pack.amount,
        successUrl: `${window.location.origin}/billing?credits=1`,
        cancelUrl: `${window.location.origin}/billing`,
      });
      window.location.href = url;
    } catch (e) {
      alert('Failed to create credit purchase session');
    }
  };

  const handlePortal = async () => {
    try {
      const { url } = await billingApi.createPortalSession(`${window.location.origin}/billing`);
      window.location.href = url;
    } catch (e) {
      alert('Failed to open billing portal');
    }
  };

  if (loading) return <DashboardLayout><div className="p-8 text-gray-500">Loading billing...</div></DashboardLayout>;

  const currentPlan = subscription?.plan ?? 'FREE';
  const totalCredits = (balance?.subscriptionCredits ?? 0) + (balance?.purchasedCredits ?? 0);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="mb-8 text-2xl font-bold text-gray-900">Billing & Credits</h1>

        {/* Current plan */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Current Plan</h2>
              <p className="mt-1 text-2xl font-bold text-brand-600">{currentPlan}</p>
              {subscription?.billingPeriodEnd && (
                <p className="text-sm text-gray-500">
                  Renews {new Date(subscription.billingPeriodEnd).toLocaleDateString()}
                </p>
              )}
              {subscription?.pendingPlan && (
                <p className="mt-1 text-sm text-amber-600">
                  Downgrading to {subscription.pendingPlan} at next renewal
                </p>
              )}
            </div>
            {currentPlan !== 'FREE' && (
              <button
                onClick={handlePortal}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <CreditCard className="h-4 w-4" />
                Manage subscription
              </button>
            )}
          </div>
        </div>

        {/* Credit balance */}
        <div className="mb-8 rounded-2xl border border-brand-100 bg-brand-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-brand-900">AI Credit Balance</h2>
              <p className="mt-1 text-4xl font-extrabold text-brand-600">{totalCredits.toLocaleString()}</p>
              <div className="mt-2 flex gap-4 text-sm text-brand-700">
                <span>Subscription: {(balance?.subscriptionCredits ?? 0).toLocaleString()}</span>
                <span>Purchased: {(balance?.purchasedCredits ?? 0).toLocaleString()}</span>
              </div>
            </div>
            <Zap className="h-10 w-10 text-brand-300" />
          </div>
        </div>

        {/* Upgrade plans */}
        {currentPlan === 'FREE' && (
          <div className="mb-8">
            <h2 className="mb-4 font-semibold text-gray-900">Upgrade your plan</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {PLANS.map((plan) => (
                <div key={plan.name} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <span className="font-bold text-brand-600">{plan.price}</span>
                  </div>
                  <ul className="my-4 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleCheckout(plan.priceId)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    Upgrade to {plan.name}
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Credit packs */}
        <div className="mb-8">
          <h2 className="mb-4 font-semibold text-gray-900">Buy additional credits</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {CREDIT_PACKS.map((pack) => (
              <div key={pack.label} className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
                <div className="text-lg font-bold text-gray-900">{pack.label}</div>
                <div className="mt-1 text-2xl font-extrabold text-brand-600">{pack.price}</div>
                <div className="mt-1 text-xs text-gray-500">never expires</div>
                <button
                  onClick={() => handleCreditPurchase(pack)}
                  className="mt-3 w-full rounded-lg bg-gray-100 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
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
            <h2 className="mb-4 font-semibold text-gray-900">Credit History</h2>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Description</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Amount</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-4 py-3 font-medium capitalize text-gray-700">{tx.type.replace('_', ' ').toLowerCase()}</td>
                      <td className="px-4 py-3 text-gray-600">{tx.description}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">
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
