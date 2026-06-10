import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { NrSymbol } from '@/components/brand/NrSymbol';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    tagline: 'Get started and experience NextRound.',
    features: [
      '3 voice interview sessions',
      'Text interview sessions',
      'Resume & JD analysis',
      'Basic feedback reports',
      '1,500 AI Credits included',
    ],
    cta: 'Start free',
    href: '/auth/register',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    tagline: 'For professionals preparing consistently.',
    features: [
      'Everything in Free',
      'Unlimited voice interviews',
      'Enhanced coaching reports',
      'Advanced coaching prompts',
      '5,000 AI Credits / month',
      'Credits roll over up to 10,000',
    ],
    cta: 'Get Pro',
    href: '/auth/register?plan=pro',
    highlight: true,
  },
  {
    name: 'Premium',
    price: '$19.99',
    period: '/month',
    tagline: 'For serious job seekers who want the most.',
    features: [
      'Everything in Pro',
      'Premium coaching reports',
      'Priority feature access',
      'Advanced interview simulations',
      '15,000 AI Credits / month',
      'Credits roll over up to 30,000',
    ],
    cta: 'Get Premium',
    href: '/auth/register?plan=premium',
    highlight: false,
  },
];

const packs = [
  { credits: '1,000',  price: '$4.99',  sub: '≈ 10 feedback reports' },
  { credits: '5,000',  price: '$19.99', sub: '≈ 50 feedback reports' },
  { credits: '10,000', price: '$34.99', sub: '≈ 100 feedback reports' },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-plum-900">
              <NrSymbol className="h-5 w-5" />
            </div>
            <span className="text-[15px] font-bold text-neutral-900">
              <span>Next</span><span className="text-plum-900">Round</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">Sign in</Link>
            <Link href="/auth/register" className="rounded-md bg-plum-900 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-dark transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6">
        {/* Header */}
        <div className="mx-auto max-w-3xl py-20 text-center">
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-neutral-900">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-neutral-600">
            Start free, upgrade when you're ready. No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* Plans */}
        <div className="mx-auto mb-20 max-w-5xl">
          <div className="grid gap-5 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl p-7 ${
                  plan.highlight
                    ? 'bg-plum-900 text-white shadow-xl ring-2 ring-plum-900'
                    : 'border border-neutral-200 bg-white shadow-sm'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-neutral-900 px-4 py-1 text-2xs font-bold uppercase tracking-widest text-white">
                    Most Popular
                  </div>
                )}

                <div className="mb-5">
                  <h2 className={`text-lg font-bold ${plan.highlight ? 'text-white' : 'text-neutral-900'}`}>
                    {plan.name}
                  </h2>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-neutral-900'}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={plan.highlight ? 'text-plum-200 text-sm' : 'text-neutral-500 text-sm'}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className={`mt-2 text-sm ${plan.highlight ? 'text-plum-100' : 'text-neutral-600'}`}>
                    {plan.tagline}
                  </p>
                </div>

                <ul className="mb-7 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${plan.highlight ? 'text-plum-200' : 'text-success-600'}`} />
                      <span className={`text-sm ${plan.highlight ? 'text-plum-50' : 'text-neutral-700'}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href}>
                  <button
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors ${
                      plan.highlight
                        ? 'bg-white text-plum-900 hover:bg-plum-50'
                        : 'bg-plum-900 text-white hover:bg-plum-dark'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Credit packs */}
        <div className="mx-auto mb-20 max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-neutral-900">Need more AI Credits?</h2>
            <p className="mt-2 text-neutral-600">
              Top up anytime. Purchased credits never expire and bypass rollover limits.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {packs.map((pack) => (
              <div key={pack.credits} className="rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
                <p className="text-sm font-medium text-neutral-500">AI Credits</p>
                <p className="mt-1 text-3xl font-extrabold text-neutral-900">{pack.credits}</p>
                <p className="mt-1 text-xs text-neutral-400">{pack.sub}</p>
                <p className="mt-3 text-2xl font-bold text-plum-900">{pack.price}</p>
                <p className="text-xs text-neutral-400">one-time · never expires</p>
                <Link href="/auth/register">
                  <button className="mt-4 w-full rounded-lg border border-neutral-200 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors">
                    Buy credits
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto mb-24 max-w-2xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-neutral-900">Questions</h2>
          <dl className="space-y-6">
            {[
              { q: 'What are AI Credits?', a: 'AI Credits are how NextRound measures AI usage. Each feature — questions, feedback reports, resume analysis — consumes credits. You only ever see credits, never raw token counts or API costs.' },
              { q: 'Do unused credits roll over?', a: 'Subscription credits roll over, capped at 2× your monthly allocation (10,000 for Pro, 30,000 for Premium). Purchased credits never expire and don\'t count towards rollover caps.' },
              { q: 'Can I upgrade or downgrade?', a: 'Upgrades take effect immediately with Stripe proration. Downgrades take effect at your next billing cycle — you keep full access until then.' },
              { q: 'What happens if I run out of credits?', a: 'AI-powered features pause and you\'re prompted to purchase additional credits or upgrade your plan. Basic navigation always works.' },
            ].map((item) => (
              <div key={item.q} className="border-b border-neutral-200 pb-6">
                <dt className="font-semibold text-neutral-900">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-neutral-600">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </main>

      <footer className="border-t border-neutral-200 bg-neutral-50 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-sm font-bold text-neutral-900">NextRound</Link>
          <p className="text-sm text-neutral-400">© {new Date().getFullYear()} NextRound</p>
        </div>
      </footer>
    </div>
  );
}
