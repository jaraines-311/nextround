'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Star } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { feedbackApi } from '@/lib/api/interviews';

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = (score / 10) * 100;
  const color = pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{score?.toFixed(1)}/10</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    feedbackApi.getBySession(id)
      .then(setReport)
      .catch(async () => {
        // Try to generate if not yet created
        setGenerating(true);
        try {
          const generated = await feedbackApi.generate(id);
          setReport(generated);
        } catch (e: any) {
          setError(e.response?.data?.message || 'Failed to generate feedback.');
        } finally {
          setGenerating(false);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || generating) {
    return (
      <DashboardLayout>
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          <p className="text-sm text-gray-600">
            {generating ? 'Generating your feedback report...' : 'Loading...'}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => router.push('/interviews')} className="text-sm text-brand-600 hover:underline">
            Back to interviews
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!report) return null;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl p-8">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => router.push('/interviews')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" />
            Back to interviews
          </button>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interview Feedback</h1>
            <p className="text-gray-600">{report.session?.type?.replace('_', ' ')} Interview</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-extrabold text-brand-600">{report.overallScore?.toFixed(1)}</div>
            <div className="text-sm text-gray-500">Overall Score</div>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">Score Breakdown</h2>
          <ScoreBar label="Communication" score={report.communicationScore} />
          <ScoreBar label="Technical Depth" score={report.technicalDepthScore} />
          <ScoreBar label="Role Fit" score={report.roleFitScore} />
          <ScoreBar label="Confidence" score={report.confidenceScore} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Strengths */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
            <h2 className="mb-3 font-semibold text-emerald-800">Strengths</h2>
            <ul className="space-y-2">
              {report.strengths?.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                  <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6">
            <h2 className="mb-3 font-semibold text-amber-800">Areas to Improve</h2>
            <ul className="space-y-2">
              {report.weaknesses?.map((w: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Study topics */}
        {report.studyTopics?.length > 0 && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 font-semibold text-gray-900">Recommended Study Topics</h2>
            <div className="flex flex-wrap gap-2">
              {report.studyTopics.map((topic: string, i: number) => (
                <span key={i} className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up questions */}
        {report.followUpQuestions?.length > 0 && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 font-semibold text-gray-900">Practice These Next</h2>
            <ul className="space-y-3">
              {report.followUpQuestions.map((q: string, i: number) => (
                <li key={i} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                  <span className="font-bold text-brand-600">{i + 1}.</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => router.push('/interviews/new')}
            className="rounded-xl bg-brand-600 px-8 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Start another interview
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
