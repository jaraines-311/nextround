import Link from 'next/link';
import { ArrowRight, Mic, MessageSquare, BarChart3, Zap, Shield, Award } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">NextRound</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">Pricing</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Log in</Link>
            <Link
              href="/auth/register"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-brand-50 to-white px-6 py-24 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
              <Zap className="h-3.5 w-3.5" />
              AI-powered interview simulator
            </div>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 md:text-6xl">
              Practice interviews like{' '}
              <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                a flight simulator
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-600">
              NextRound gives software and data engineers a realistic AI interview experience — with follow-up questions, voice support, and detailed coaching feedback after every session.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/auth/register"
                className="flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-brand-700"
              >
                Start your first interview free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="rounded-xl border border-gray-200 px-8 py-4 text-base font-semibold text-gray-700 hover:bg-gray-50"
              >
                See pricing
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">No credit card required · 3 free voice interviews included</p>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-16 text-center text-3xl font-bold text-gray-900">
              Everything you need to ace your next interview
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Mic,
                  title: 'Voice & Text Interviews',
                  description: 'Practice naturally with voice-based interviews or text-based sessions. Transcripts saved automatically.',
                },
                {
                  icon: MessageSquare,
                  title: 'Adaptive AI Questions',
                  description: "Questions adapt to your answers in real-time — just like a real interviewer. No fixed scripts.",
                },
                {
                  icon: BarChart3,
                  title: 'Detailed Feedback Reports',
                  description: 'Receive scores on communication, technical depth, confidence, and role fit — with specific improvements.',
                },
                {
                  icon: Zap,
                  title: 'All Interview Types',
                  description: 'Recruiter screen, hiring manager, technical, and behavioral interviews across multiple industries.',
                },
                {
                  icon: Shield,
                  title: 'Resume & JD Analysis',
                  description: 'AI extracts skills and context from your resume and job description to create tailored questions.',
                },
                {
                  icon: Award,
                  title: 'Study Roadmap',
                  description: 'Every feedback report includes study topics, suggested better answers, and follow-up practice questions.',
                },
              ].map((feature) => (
                <div key={feature.title} className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                    <feature.icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="bg-gray-50 px-6 py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Built for engineers, by engineers</h2>
            <p className="mx-auto mb-12 max-w-2xl text-gray-600">
              Optimized for Software Engineering and Data Engineering roles today, with Product Management, Sales, and more coming soon.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { stat: '10+', label: 'Interview types supported' },
                { stat: '6+', label: 'Target industries' },
                { stat: '100%', label: 'AI-generated feedback' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white p-8 shadow-sm">
                  <div className="text-4xl font-extrabold text-brand-600">{item.stat}</div>
                  <div className="mt-2 text-gray-600">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-24 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Ready to level up your interview game?</h2>
            <p className="mb-8 text-gray-600">Get 3 free voice interviews when you sign up — no credit card needed.</p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-brand-700"
            >
              Create your free account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-brand-600" />
              <span className="font-semibold text-gray-900">NextRound</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
              <Link href="/auth/login" className="hover:text-gray-900">Login</Link>
            </div>
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} NextRound. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
