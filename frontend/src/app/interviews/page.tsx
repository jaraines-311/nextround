'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Plus, Loader2, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { interviewsApi } from '@/lib/api/interviews';

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-gray-100 text-gray-600',
  ABANDONED: 'bg-gray-100 text-gray-400',
};

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = (p = 1) => {
    interviewsApi.list(p, 10).then((r) => {
      setInterviews(r.data);
      setTotalPages(r.totalPages);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interview Sessions</h1>
            <p className="text-gray-600">Your complete interview history.</p>
          </div>
          <Link href="/interviews/new" className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            <Plus className="h-4 w-4" />
            New interview
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div>
        ) : interviews.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 font-medium text-gray-600">No interviews yet</p>
            <Link href="/interviews/new" className="mt-2 inline-block text-sm font-semibold text-brand-600 hover:underline">Start your first →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.map((session) => (
              <Link key={session.id} href={`/interviews/${session.id}`} className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-brand-200 hover:shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{session.type?.replace('_', ' ')} Interview</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[session.status]}`}>
                        {session.status}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{session.mode}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {session.job?.title || 'General'} · {session.turnCount} turns · {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {session.feedbackReport?.overallScore && (
                      <div className="text-xl font-bold text-brand-600">{session.feedbackReport.overallScore}/10</div>
                    )}
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`h-8 w-8 rounded-lg text-sm font-medium ${page === p ? 'bg-brand-600 text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
