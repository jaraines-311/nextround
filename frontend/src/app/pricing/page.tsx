import Link from 'next/link';
import { Check, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started and experience NextRound with 3 complete voice interview sessions.',
    features: [
      'Account & profile creation',
      'Resume & job description upload',
      '3 free voice interview sessions',
      'Basic feedback reports',
      'Interview question generation',
      '1,500 AI Credits included',
    ],
    cta: 'Get started free',
    href: '/auth/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'For engineers who want consistent, high-quality interview practice every month.',
    features: [
      'Everything in Free',
      'Unlimited voice interviews',
      'Enhanced feedback reports',
      'Advanced coaching prompts',
      '5,000 AI Credits / month',
      'Credits roll over (up to 10,000)',
    ],
    cta: 'Start Pro',
    href: '/auth/register?plan=pro',
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '$19.99',
    period: '/month',
    description: 'For serious job seekers who want the full coaching experience and priority access.',
    features: [
      'Everything in Pro',
      'Premium coaching reports',
      'Priority access to new features',
      'Advanced industry simulations',
      '15,000 AI Credits / month',
      'Credits roll over (up to 30,000)',
    ],
    cta: 'Start Premium',
    href: '/auth/register?plan=premium',
    highlighted: false,
  },
];

const creditPacks = [
  { credits: '1,000', price: '$4.99', priceId: 'STRIPE_CREDITS_1000_PRICE_ID' },
  { credits: '5,000', price: '$19.99', priceId: 'STRIPE_CREDITS_5000_PRICE_ID' },
  { credits: '10,000', price: '$34.99', priceId: 'STRIPE_CREDITS_10000_PRICE_ID' },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-brand-600" />
            <span className="text-xl font-bold">NextRound</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Log in</Link>
            <Link href="/auth/register" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-4xl font-extrabold text-gray-900">Simple, transparent pricing</h1>
            <p className="text-xl text-gray-600">Start free, upgrade when you're ready. Cancel anytime.</p>
          </div>

          {/* Plans */}
          <div className="mb-20 grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-brand-600 text-white shadow-2xl'
                    : 'border border-gray-200 bg-white shadow-sm'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-amber-900">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <h2 className={`text-2xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h2>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    <span className={plan.highlighted ? 'text-brand-200' : 'text-gray-500'}>{plan.period}</span>
                  </div>
                  <p className={`mt-3 text-sm ${plan.highlighted ? 'text-brand-100' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${plan.highlighted ? 'text-brand-200' : 'text-brand-600'}`} />
                      <span className={`text-sm ${plan.highlighted ? 'text-brand-50' : 'text-gray-700'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-white text-brand-600 hover:bg-brand-50'
                      : 'bg-brand-600 text-white hover:bg-brand-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Credit packs */}
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-3 text-center text-2xl font-bold text-gray-900">Need more AI Credits?</h2>
            <p className="mb-8 text-center text-gray-600">Purchase additional credits that never expire and never count against rollover limits.</p>
            <div className="grid gap-4 md:grid-cols-3">
              {creditPacks.map((pack) => (
                <div key={pack.credits} className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                  <div className="text-3xl font-extrabold text-gray-900">{pack.credits}</div>
                  <div className="text-sm text-gray-500">AI Credits</div>
                  <div className="mt-3 text-2xl font-bold text-brand-600">{pack.price}</div>
                  <div className="mt-1 text-xs text-gray-500">one-time · never expires</div>
                  <Link
                    href="/auth/register"
                    className="mt-4 block rounded-lg bg-gray-100 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                  >
                    Buy credits
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mx-auto mt-24 max-w-2xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Frequently asked questions</h2>
            <dl className="space-y-6">
              {[
                {
                  q: 'What are AI Credits?',
                  a: 'AI Credits are the platform\'s internal currency for measuring AI usage. Each feature like voice interviews, feedback generation, and resume analysis consumes a set number of credits. You\'ll never see raw token counts.',
                },
                {
                  q: 'Do credits roll over?',
                  a: 'Subscription credits roll over, but there\'s a cap of 2× your monthly allocation. Purchased credits never expire and are not subject to rollover limits.',
                },
                {
                  q: 'Can I upgrade or downgrade anytime?',
                  a: 'Upgrades take effect immediately with Stripe proration. Downgrades take effect at your next billing cycle — you keep full access until then.',
                },
                {
                  q: 'What happens when I run out of credits?',
                  a: 'AI-powered features will be paused and you\'ll be prompted to purchase additional credits or upgrade your plan.',
                },
              ].map((item) => (
                <div key={item.q} className="border-b border-gray-200 pb-6">
                  <dt className="font-semibold text-gray-900">{item.q}</dt>
                  <dd className="mt-2 text-gray-600">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}
