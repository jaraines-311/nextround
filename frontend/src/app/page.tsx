import Link from 'next/link';
import { ArrowRight, Check, Mic, MessageSquare, Star, BarChart3, ChevronRight } from 'lucide-react';
import { NrSymbol } from '@/components/brand/NrSymbol';

// ─── Nav ───────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-plum-900">
            <NrSymbol className="h-5 w-5" />
          </div>
          <span className="text-[15px] font-bold text-neutral-900 tracking-tight">
            <span>Next</span><span className="text-plum-900">Round</span>
          </span>
        </div>
        <nav className="hidden items-center gap-7 md:flex">
          <Link href="/pricing" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-1.5 rounded-md bg-plum-900 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-plum-dark transition-colors"
          >
            Get started free
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-24 md:py-32">
      {/* Subtle background gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, #f9e8fc, transparent)',
        }}
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-plum-200 bg-plum-50 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-plum-900" />
          <span className="text-xs font-semibold text-plum-900">AI-powered interview practice</span>
        </div>

        <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-neutral-900 md:text-6xl lg:text-7xl">
          Practice the interview{' '}
          <span className="text-gradient">before it matters.</span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-neutral-600">
          NextRound gives you a realistic interview experience with adaptive AI questions,
          voice support, and detailed coaching — so you walk in confident, not anxious.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 rounded-lg bg-plum-900 px-7 py-3.5 text-base font-semibold text-white shadow-md hover:bg-plum-dark transition-all duration-150 hover:shadow-lg"
          >
            Start practicing free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-7 py-3.5 text-base font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-colors"
          >
            See pricing
          </Link>
        </div>

        <p className="mt-4 text-sm text-neutral-500">
          No credit card required · 3 free voice interviews included
        </p>
      </div>
    </section>
  );
}

// ─── Social Proof Strip ───────────────────────────────────────────────────

function SocialProof() {
  return (
    <section className="border-y border-neutral-100 bg-neutral-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Built for professionals at every level
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { value: '4 types',  label: 'Interview formats' },
            { value: '6+',       label: 'Target industries' },
            { value: 'Voice',    label: '& text modes' },
            { value: 'Instant',  label: 'AI feedback reports' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-extrabold text-plum-900">{s.value}</div>
              <div className="mt-0.5 text-sm text-neutral-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Upload your resume and job description',
      body: 'Paste your resume and the job you\'re targeting. NextRound\'s AI reads both to understand your background and tailor every question to the specific role.',
    },
    {
      step: '02',
      title: 'Choose your interview type and mode',
      body: 'Select recruiter screen, technical, behavioral, or hiring manager. Practice by typing or speaking — both modes are fully supported with transcript storage.',
    },
    {
      step: '03',
      title: 'Answer adaptive AI questions',
      body: 'The AI follows your answers with natural follow-up questions — just like a real interviewer. No fixed scripts, no predictable patterns.',
    },
    {
      step: '04',
      title: 'Receive your coaching report',
      body: 'Get scored across five dimensions with specific strengths, improvement areas, suggested better answers, and a personalised study roadmap.',
    },
  ];

  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-neutral-900">How NextRound works</h2>
          <p className="text-lg text-neutral-600">Four steps from nervous to ready.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {steps.map((s) => (
            <div key={s.step} className="flex gap-5">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-plum-50 text-sm font-bold text-plum-900">
                  {s.step}
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-base font-semibold text-neutral-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-600">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────

function Features() {
  const features = [
    {
      icon: Mic,
      title: 'Voice interviews that feel real',
      body: 'Speak your answers naturally. NextRound transcribes and scores them — because reading answers is very different from saying them out loud.',
    },
    {
      icon: MessageSquare,
      title: 'Questions that actually follow up',
      body: 'The AI listens to your answers and probes deeper, just like a human interviewer would. Preparation for scripted questions doesn\'t prepare you for real ones.',
    },
    {
      icon: BarChart3,
      title: 'Coaching reports, not just scores',
      body: 'Every session generates a detailed coaching report: what you did well, where to improve, better example answers, and a personalised study plan.',
    },
    {
      icon: Star,
      title: 'Built for your specific role',
      body: 'Paste any job description and NextRound adapts the entire interview to that company, role, and seniority level — not generic software engineering questions.',
    },
  ];

  return (
    <section className="bg-neutral-50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-neutral-900">
            Interview prep that actually prepares you
          </h2>
          <p className="text-lg text-neutral-600">
            Most prep tools give you a question list. NextRound gives you a practice room.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-plum-50">
                <f.icon className="h-5 w-5 text-plum-900" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-neutral-900">{f.title}</h3>
              <p className="text-sm leading-relaxed text-neutral-600">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Mock Feedback Preview ────────────────────────────────────────────────

function FeedbackPreview() {
  const scores = [
    { label: 'Communication',   score: 8.2 },
    { label: 'Technical Depth', score: 7.8 },
    { label: 'Role Fit',        score: 8.5 },
    { label: 'Confidence',      score: 7.1 },
  ];

  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-plum-900">Feedback Reports</div>
            <h2 className="mb-5 text-3xl font-extrabold tracking-tight text-neutral-900">
              The coaching report you wished you had after every interview.
            </h2>
            <p className="mb-6 text-lg text-neutral-600">
              Detailed scores, specific feedback, example answers, and a study plan — delivered instantly after every session.
            </p>
            <ul className="space-y-3">
              {[
                'Score breakdown across 5 key dimensions',
                'Specific strengths and improvement areas',
                'Example better answers to your exact questions',
                'Personalised study topics and follow-up practice',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-neutral-700">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Mock report card */}
          <div className="card overflow-hidden shadow-lg">
            <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-neutral-500">Technical Interview · Senior SWE Role</p>
                  <h4 className="mt-0.5 text-sm font-semibold text-neutral-900">Interview Feedback Report</h4>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-plum-900">8.2</div>
                  <p className="text-xs text-neutral-500">Overall Score</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 space-y-4">
              {scores.map((s) => (
                <div key={s.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm text-neutral-700">{s.label}</span>
                    <span className="text-sm font-bold text-neutral-900">{s.score}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-plum-900 transition-all"
                      style={{ width: `${(s.score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-200 px-5 py-3">
              <p className="text-xs font-semibold text-success-600 mb-1">Key Strength</p>
              <p className="text-xs text-neutral-600">Clear communication with well-structured technical explanations.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="bg-plum-900 px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-white">
          Walk into your next interview ready.
        </h2>
        <p className="mb-10 text-lg text-plum-200">
          Join NextRound today. Your first three voice interview sessions are completely free — no credit card needed.
        </p>
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-plum-900 shadow-lg hover:bg-plum-50 transition-colors"
        >
          Create your free account
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: 'What interview types does NextRound support?',
    a: 'Recruiter screens, hiring manager interviews, technical interviews, and behavioral interviews. More types are being added regularly.',
  },
  {
    q: 'Can I practice for a specific job I\'m applying to?',
    a: 'Yes — paste any job description and NextRound tailors every question to that role, company context, and seniority level.',
  },
  {
    q: 'What are AI Credits?',
    a: 'AI Credits are the platform\'s internal currency. Each AI-powered feature — questions, feedback reports, resume analysis — consumes a small number of credits. You start with enough for three complete voice interviews free.',
  },
  {
    q: 'Is voice interviewing available on all plans?',
    a: 'Free users get 3 voice interview sessions. Pro and Premium users have unlimited voice interviews as part of their monthly credit allocation.',
  },
  {
    q: 'Which industries does NextRound support?',
    a: 'NextRound is optimised for Software Engineering and Data Engineering today, with Product Management, Sales, Marketing, and Customer Success support also available.',
  },
];

function FAQ() {
  return (
    <section className="bg-neutral-50 px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-12 text-center text-3xl font-extrabold tracking-tight text-neutral-900">
          Frequently asked questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.q} className="border-b border-neutral-200 pb-6">
              <h3 className="mb-2 text-base font-semibold text-neutral-900">{faq.q}</h3>
              <p className="text-sm leading-relaxed text-neutral-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-plum-900">
            <NrSymbol className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-neutral-900">NextRound</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-neutral-500">
          <Link href="/pricing" className="hover:text-neutral-800 transition-colors">Pricing</Link>
          <Link href="/auth/login" className="hover:text-neutral-800 transition-colors">Sign in</Link>
          <Link href="/auth/register" className="hover:text-neutral-800 transition-colors">Get started</Link>
        </div>
        <p className="text-sm text-neutral-400">© {new Date().getFullYear()} NextRound. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        <Hero />
        <SocialProof />
        <HowItWorks />
        <Features />
        <FeedbackPreview />
        <CTA />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
