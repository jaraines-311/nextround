'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle,
  BookOpen, MessageSquare, ArrowRight,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ScoreBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { feedbackApi } from '@/lib/api/interviews';
import { scoreToLabel } from '@/lib/utils';

// ─── Overall score ring ───────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const pct  = (score / 10) * 100;
  const circ = 2 * Math.PI * 52; // r=52
  const { label, color } = scoreToLabel(score);

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg className="-rotate-90 absolute" width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="52" fill="none" stroke="#f0f0f0" strokeWidth="12" />
        <circle
          cx="80" cy="80" r="52"
          fill="none"
          stroke="#4A154B"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="text-center">
        <p className="text-4xl font-extrabold text-neutral-900 tabular-nums">{score?.toFixed(1)}</p>
        <p className={`text-xs font-semibold ${color}`}>{label}</p>
      </div>
    </div>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────

function Section({ title, icon: Icon, children, defaultOpen = true }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen((o: boolean) => !o)}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100">
            <Icon className="h-4 w-4 text-neutral-600" />
          </div>
          <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
        </div>
        <ChevronRight className={`h-4 w-4 text-neutral-400 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && <div className="border-t border-neutral-200 px-5 py-4">{children}</div>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function FeedbackPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const [report, setReport]       = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    feedbackApi.getBySession(id)
      .then(setReport)
      .catch(async () => {
        setGenerating(true);
        try {
          const r = await feedbackApi.generate(id);
          setReport(r);
        } catch (e: any) {
          setError(e.response?.data?.message || 'Unable to generate feedback. Please try again.');
        } finally {
          setGenerating(false);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || generating) {
    return (
      <DashboardLayout>
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-plum-100 border-t-plum-900" />
          <div className="text-center">
            <p className="font-semibold text-neutral-800">
              {generating ? 'Generating your coaching report…' : 'Loading…'}
            </p>
            <p className="text-sm text-neutral-500">This takes about 15 seconds</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-96 flex-col items-center justify-center gap-3">
          <AlertCircle className="h-10 w-10 text-danger-500" />
          <p className="font-semibold text-neutral-800">Feedback unavailable</p>
          <p className="max-w-sm text-center text-sm text-neutral-500">{error}</p>
          <Button variant="secondary" size="sm" onClick={() => router.push('/interviews')}>
            Back to interviews
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!report) return null;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        {/* Back */}
        <Link
          href="/interviews"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to interviews
        </Link>

        {/* Report header */}
        <div className="card mb-5 overflow-hidden">
          <div className="flex flex-col items-center gap-6 bg-plum-50 px-6 py-8 sm:flex-row sm:gap-8">
            <ScoreRing score={report.overallScore} />
            <div className="text-center sm:text-left">
              <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge variant="plum" size="lg">{report.session?.type?.replace('_', ' ')}</Badge>
                <Badge variant="default" size="lg">{report.session?.mode}</Badge>
              </div>
              <h1 className="text-2xl font-bold text-neutral-900">Interview Coaching Report</h1>
              {report.session?.job && (
                <p className="mt-1 text-sm text-neutral-600">
                  {report.session.job.title}
                  {report.session.job.company ? ` at ${report.session.job.company}` : ''}
                </p>
              )}
              <p className="mt-1 text-xs text-neutral-400">
                {new Date(report.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="grid gap-5 border-t border-neutral-200 px-6 py-5 sm:grid-cols-2">
            <ScoreBar label="Communication"   score={report.communicationScore} />
            <ScoreBar label="Technical Depth" score={report.technicalDepthScore} />
            <ScoreBar label="Role Fit"        score={report.roleFitScore} />
            <ScoreBar label="Confidence"      score={report.confidenceScore} />
          </div>
        </div>

        {/* Strengths */}
        {report.strengths?.length > 0 && (
          <Section title="Strengths" icon={CheckCircle2} defaultOpen={true}>
            <ul className="space-y-3">
              {report.strengths.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success-600" />
                  <p className="text-sm text-neutral-700">{s}</p>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Areas to improve */}
        {report.weaknesses?.length > 0 && (
          <Section title="Areas to Improve" icon={AlertCircle} defaultOpen={true}>
            <ul className="space-y-3">
              {report.weaknesses.map((w: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-warning-600" />
                  <p className="text-sm text-neutral-700">{w}</p>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Study topics */}
        {report.studyTopics?.length > 0 && (
          <Section title="Recommended Study Topics" icon={BookOpen} defaultOpen={true}>
            <div className="flex flex-wrap gap-2">
              {report.studyTopics.map((t: string, i: number) => (
                <span
                  key={i}
                  className="rounded-full border border-plum-200 bg-plum-50 px-3 py-1 text-xs font-medium text-plum-900"
                >
                  {t}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Follow-up questions */}
        {report.followUpQuestions?.length > 0 && (
          <Section title="Practice These Next" icon={MessageSquare} defaultOpen={false}>
            <ol className="space-y-3">
              {report.followUpQuestions.map((q: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500">
                    {i + 1}
                  </span>
                  <p className="text-sm text-neutral-700">{q}</p>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* CTA */}
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/interviews/new')}
          >
            Practice again
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="lg" onClick={() => router.push('/feedback')}>
            All reports
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
