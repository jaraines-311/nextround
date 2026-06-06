'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, BarChart3, FileText, Briefcase, ArrowRight, Mic, Zap } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/lib/store/auth.store';
import { interviewsApi } from '@/lib/api/interviews';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [recentInterviews, setRecentInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewsApi.list(1, 5)
      .then((r) => setRecentInterviews(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const creditTotal =
    (user?.creditBalance?.subscriptionCredits ?? 0) +
    (user?.creditBalance?.purchasedCredits ?? 0);

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}
          </h1>
          <p className="mt-1 text-gray-600">Ready to practice? Start a new interview session below.</p>
        </div>

        {/* Quick stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'AI Credits', value: creditTotal.toLocaleString(), icon: Zap, color: 'text-brand-600 bg-brand-50' },
            { label: 'Plan', value: user?.subscription?.plan ?? 'Free', icon: BarChart3, color: 'text-purple-600 bg-purple-50' },
            { label: 'Total Interviews', value: recentInterviews.length, icon: MessageSquare, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Industry', value: user?.targetIndustry?.replace('_', ' ') ?? '—', icon: Briefcase, color: 'text-amber-600 bg-amber-50' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div className="mt-3 text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Start interview CTA */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Start a new interview</h2>
              <p className="mt-1 text-brand-100">
                Practice with AI — text or voice, recruiter screen to technical deep-dives.
              </p>
            </div>
            <Link
              href="/interviews/new"
              className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-600 hover:bg-brand-50"
            >
              <Mic className="h-4 w-4" />
              Start interview
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent interviews */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Recent Interviews</h3>
              <Link href="/interviews" className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : recentInterviews.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">No interviews yet. Start one above!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInterviews.map((session) => (
                  <Link
                    key={session.id}
                    href={`/interviews/${session.id}`}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {session.type?.replace('_', ' ')} Interview
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.job?.title || 'No job description'} · {session.status}
                      </p>
                    </div>
                    {session.feedbackReport?.overallScore && (
                      <div className="text-lg font-bold text-brand-600">
                        {session.feedbackReport.overallScore}/10
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-900">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { href: '/resume', icon: FileText, label: 'Upload your resume', description: 'AI extracts your skills and experience' },
                { href: '/jobs/new', icon: Briefcase, label: 'Add a job description', description: 'Get targeted interview questions' },
                { href: '/profile', icon: BarChart3, label: 'Complete your profile', description: 'Personalize your practice sessions' },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-4 rounded-lg border border-gray-100 p-4 hover:bg-gray-50"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50">
                    <action.icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{action.label}</p>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
