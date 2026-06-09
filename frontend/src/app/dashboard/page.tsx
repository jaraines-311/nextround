'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mic, MessageSquare, FileText, Briefcase, ArrowRight, BarChart3, Plus, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge, statusBadgeVariant } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuthStore } from '@/lib/store/auth.store';
import { interviewsApi } from '@/lib/api/interviews';
import { jobsApi } from '@/lib/api/profile';
import { formatCredits, relativeTime, planDisplayName } from '@/lib/utils';

// ─── Credit meter ──────────────────────────────────────────────────────────

function CreditMeter({ total, plan }: { total: number; plan: string }) {
  const monthlyMax = plan === 'PREMIUM' ? 30000 : plan === 'PRO' ? 10000 : 1500;
  const pct = Math.min(100, (total / monthlyMax) * 100);
  const low = pct < 20;

  return (
    <div className={`card p-5 ${low ? 'border-warning-600/30 bg-warning-50' : ''}`}>
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">AI Credits</p>
          <p className="mt-1 text-3xl font-extrabold text-neutral-900 tabular-nums">{formatCredits(total)}</p>
        </div>
        {low && (
          <div className="rounded-full bg-warning-100 px-2.5 py-1 text-xs font-semibold text-warning-700">Low</div>
        )}
      </div>

      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${low ? 'bg-warning-600' : 'bg-plum-900'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500">{planDisplayName(plan)} plan</p>
        <Link href="/billing" className="text-xs font-semibold text-plum-900 hover:text-plum-dark">
          Buy more →
        </Link>
      </div>
    </div>
  );
}

// ─── Quick start card ──────────────────────────────────────────────────────

function StartInterviewCard() {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-6 text-white"
      style={{ background: 'linear-gradient(135deg, #4A154B 0%, #7a1e8a 100%)' }}
    >
      {/* Decorative rings */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full border border-white/10" />

      <div className="relative">
        <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
          <Mic className="h-3 w-3" />
          Ready to practice
        </div>
        <h2 className="mt-3 text-xl font-bold">Start a new interview session</h2>
        <p className="mt-1.5 text-sm text-white/75">
          Choose your interview type, paste a job description, and the AI will guide you through a realistic practice session.
        </p>
        <Link href="/interviews/new">
          <button className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-plum-900 shadow-sm hover:bg-white/90 transition-colors">
            <Plus className="h-4 w-4" />
            New interview
          </button>
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

function daysUntil(date: string) {
  const d = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  if (d === 0) return 'today';
  if (d === 1) return 'tomorrow';
  return `in ${d} days`;
}

function interviewTypeLabel(value: string) {
  const map: Record<string, string> = {
    RECRUITER_SCREEN: 'Recruiter Screen',
    HIRING_MANAGER: 'Hiring Manager',
    TECHNICAL: 'Technical',
    BEHAVIORAL: 'Behavioral',
    GENERAL: 'Interview',
  };
  return map[value] ?? value;
}

export default function DashboardPage() {
  const user    = useAuthStore((s) => s.user);
  const [interviews, setInterviews]               = useState<any[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      interviewsApi.list(1, 5).then((r) => r.data ?? []),
      jobsApi.upcomingInterviews().catch(() => []),
    ]).then(([sessions, upcoming]) => {
      setInterviews(sessions);
      setUpcomingInterviews(upcoming);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const creditTotal =
    (user?.creditBalance?.subscriptionCredits ?? 0) +
    (user?.creditBalance?.purchasedCredits ?? 0);

  const plan = user?.subscription?.plan ?? 'FREE';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <DashboardLayout>
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          {greeting}, {user?.firstName}.
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {interviews.length > 0
            ? `You have ${interviews.length} practice sessions so far. Keep going.`
            : 'Start your first practice session to build interview confidence.'}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left column: 2 wide */}
        <div className="space-y-5 lg:col-span-2">
          <StartInterviewCard />

          {/* Upcoming interview nudges */}
          {upcomingInterviews.length > 0 && (
            <div className="space-y-2">
              {upcomingInterviews.map((ui: any) => {
                const company = ui.job?.company || ui.job?.title || 'your interview';
                const typeLabel = interviewTypeLabel(ui.type);
                const when = daysUntil(ui.scheduledAt);
                return (
                  <div key={ui.id} className="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <Calendar className="h-5 w-5 flex-shrink-0 text-amber-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-amber-900">
                        {typeLabel} with {company} — {when}
                      </p>
                      <p className="text-xs text-amber-700">Have you practiced yet?</p>
                    </div>
                    <Link
                      href={`/interviews/new?jobId=${ui.job?.id}&type=${ui.type === 'GENERAL' ? 'BEHAVIORAL' : ui.type}`}
                      className="flex-shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors"
                    >
                      Practice now
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent interviews */}
          <div className="card">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-neutral-900">Recent Interview Sessions</h2>
              <Link href="/interviews" className="flex items-center gap-1 text-xs font-medium text-plum-900 hover:text-plum-dark">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-px">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-neutral-100" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-40 animate-pulse rounded-full bg-neutral-100" />
                      <div className="h-3 w-24 animate-pulse rounded-full bg-neutral-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : interviews.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No interviews yet"
                description="Start a practice session to see it here."
                action={{ label: 'Start interview', href: '/interviews/new' }}
              />
            ) : (
              <div>
                {interviews.map((s, i) => (
                  <Link
                    key={s.id}
                    href={`/interviews/${s.id}`}
                    className={`flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors ${i < interviews.length - 1 ? 'border-b border-neutral-100' : ''}`}
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-plum-50">
                      <MessageSquare className="h-4 w-4 text-plum-900" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-neutral-900">
                          {s.type?.replace('_', ' ')} Interview
                        </p>
                        <Badge variant={statusBadgeVariant(s.status)} size="sm" dot>
                          {s.status}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-neutral-500">
                        {s.job?.title || 'General practice'} · {relativeTime(s.createdAt)}
                      </p>
                    </div>
                    {s.feedbackReport?.overallScore && (
                      <div className="flex-shrink-0 text-right">
                        <span className="text-lg font-bold text-plum-900">
                          {s.feedbackReport.overallScore?.toFixed(1)}
                        </span>
                        <p className="text-2xs text-neutral-400">/10</p>
                      </div>
                    )}
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-neutral-300" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <CreditMeter total={creditTotal} plan={plan} />

          {/* Quick actions */}
          <div className="card">
            <div className="border-b border-neutral-200 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-neutral-900">Quick Actions</h2>
            </div>
            <div className="divide-y divide-neutral-100">
              {[
                { href: '/resume',    icon: FileText,     label: 'Upload your resume',       sub: 'AI extracts your skills' },
                { href: '/jobs/new',  icon: Briefcase,    label: 'Add a job prospect',       sub: 'Personalise your questions' },
                { href: '/profile',   icon: BarChart3,    label: 'Complete your profile',    sub: 'Improve question relevance' },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                    <action.icon className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900">{action.label}</p>
                    <p className="text-xs text-neutral-500">{action.sub}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-neutral-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Plan card */}
          {plan === 'FREE' && (
            <div className="card border-plum-200 bg-plum-50 p-5">
              <h3 className="text-sm font-semibold text-plum-900">Upgrade to Pro</h3>
              <p className="mt-1 text-xs text-plum-700">
                Get 5,000 AI credits/month, unlimited voice interviews, and enhanced coaching reports.
              </p>
              <Link href="/billing">
                <button className="mt-3 w-full rounded-lg bg-plum-900 py-2 text-xs font-semibold text-white hover:bg-plum-dark transition-colors">
                  See plans
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
