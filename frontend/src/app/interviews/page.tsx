'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Plus, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge, statusBadgeVariant } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { interviewsApi } from '@/lib/api/interviews';
import { relativeTime } from '@/lib/utils';

export default function InterviewsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotal]  = useState(1);

  const load = (p = 1) => {
    setLoading(true);
    interviewsApi.list(p, 12)
      .then((r) => { setSessions(r.data ?? []); setTotal(r.totalPages ?? 1); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]);

  return (
    <DashboardLayout
      pageTitle="Practice Sessions"
      pageDescription="Your complete AI practice history."
      actions={
        <Link href="/interviews/new">
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            New session
          </Button>
        </Link>
      }
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-100" />)}
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No practice sessions yet"
          description="Start your first AI practice session to build interview confidence."
          action={{ label: 'Start practice', href: '/interviews/new' }}
        />
      ) : (
        <>
          <div className="card overflow-hidden">
            {sessions.map((s, i) => (
              <Link
                key={s.id}
                href={`/interviews/${s.id}`}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors ${i < sessions.length - 1 ? 'border-b border-neutral-100' : ''}`}
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-plum-50">
                  <MessageSquare className="h-4 w-4 text-plum-900" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-neutral-900">
                      {s.type?.replace('_', ' ')} Interview
                    </p>
                    <Badge variant={statusBadgeVariant(s.status)} size="sm" dot>{s.status}</Badge>
                    <Badge variant="default" size="sm">{s.mode}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {s.job?.title ? `${s.job.title}${s.job.company ? ` @ ${s.job.company}` : ''}` : 'General practice'}
                    {' · '}{s.turnCount} turns · {relativeTime(s.createdAt)}
                  </p>
                </div>
                {s.feedbackReport?.overallScore != null && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-lg font-bold text-plum-900 tabular-nums">
                      {s.feedbackReport.overallScore?.toFixed(1)}
                    </p>
                    <p className="text-2xs text-neutral-400">/ 10</p>
                  </div>
                )}
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-neutral-300" />
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-5 flex justify-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 min-w-[2rem] rounded-lg px-2 text-sm font-medium transition-colors ${
                    page === p
                      ? 'bg-plum-900 text-white'
                      : 'border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
