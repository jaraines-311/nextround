'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mic, MessageSquare, ChevronLeft } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { interviewsApi } from '@/lib/api/interviews';
import { resumeApi, jobsApi } from '@/lib/api/profile';
import { cn } from '@/lib/utils';

const INTERVIEW_TYPES = [
  {
    value: 'RECRUITER_SCREEN',
    label: 'Recruiter Screen',
    description: '15–30 min · Background, motivation, and culture fit',
  },
  {
    value: 'HIRING_MANAGER',
    label: 'Hiring Manager',
    description: '45–60 min · Role-specific expectations and leadership',
  },
  {
    value: 'TECHNICAL',
    label: 'Technical Interview',
    description: '60 min · System design, coding, and problem-solving',
  },
  {
    value: 'BEHAVIORAL',
    label: 'Behavioral Interview',
    description: '30–45 min · Situation and competency-based questions',
  },
];

const MODES = [
  {
    value: 'TEXT',
    label: 'Text',
    icon: MessageSquare,
    description: 'Type your answers at your own pace',
  },
  {
    value: 'VOICE',
    label: 'Voice',
    icon: Mic,
    description: 'Speak your answers — just like a real interview',
  },
];

export default function NewInterviewPage() {
  return <Suspense><NewInterviewForm /></Suspense>;
}

function NewInterviewForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [type, setType]           = useState(searchParams.get('type') ?? 'TECHNICAL');
  const [mode, setMode]           = useState<'TEXT' | 'VOICE'>('TEXT');
  const [resumeId, setResumeId]   = useState('');
  const [jobId, setJobId]         = useState(searchParams.get('jobId') ?? '');
  const [resumes, setResumes]     = useState<any[]>([]);
  const [jobs, setJobs]           = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    Promise.all([resumeApi.list(), jobsApi.list()])
      .then(([r, j]) => { setResumes(r); setJobs(j); })
      .catch(() => {});
  }, []);

  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await interviewsApi.create({
        type,
        mode,
        resumeId: resumeId || undefined,
        jobId: jobId || undefined,
      });
      router.push(`/interviews/${result.session.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start. Please check your AI Credit balance.');
      setLoading(false);
    }
  };

  const resumeOptions = [
    { value: '', label: 'No resume — use general context' },
    ...resumes.map((r) => ({ value: r.id, label: r.name })),
  ];

  const jobOptions = [
    { value: '', label: 'No specific role — general interview' },
    ...jobs.map((j) => ({ value: j.id, label: `${j.title || 'Untitled'}${j.company ? ` @ ${j.company}` : ''}` })),
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link href="/interviews" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-4">
            <ChevronLeft className="h-4 w-4" />
            Back to practice sessions
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">Set up your practice session</h1>
          <p className="mt-1 text-sm text-neutral-500">
            The more context you provide, the more targeted your practice session will be.
          </p>
        </div>

        <div className="space-y-6">
          {/* Interview type */}
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-semibold text-neutral-900">Interview type</h2>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {INTERVIEW_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={cn(
                    'flex flex-col items-start rounded-lg border-2 p-4 text-left transition-all duration-150',
                    type === t.value
                      ? 'border-plum-900 bg-plum-50'
                      : 'border-neutral-200 bg-neutral-0 hover:border-neutral-300',
                  )}
                >
                  <p className={cn('text-sm font-semibold', type === t.value ? 'text-plum-900' : 'text-neutral-800')}>
                    {t.label}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-semibold text-neutral-900">Interview mode</h2>
            <div className="grid grid-cols-2 gap-3">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMode(m.value as 'TEXT' | 'VOICE')}
                  className={cn(
                    'flex flex-col items-start rounded-lg border-2 p-4 text-left transition-all duration-150',
                    mode === m.value
                      ? 'border-plum-900 bg-plum-50'
                      : 'border-neutral-200 bg-neutral-0 hover:border-neutral-300',
                  )}
                >
                  <m.icon className={cn('mb-2 h-5 w-5', mode === m.value ? 'text-plum-900' : 'text-neutral-400')} />
                  <p className={cn('text-sm font-semibold', mode === m.value ? 'text-plum-900' : 'text-neutral-800')}>
                    {m.label}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">{m.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Context */}
          <div className="card p-5 space-y-4">
            <div>
              <h2 className="mb-0.5 text-sm font-semibold text-neutral-900">Add context</h2>
              <p className="text-xs text-neutral-500">Selecting a resume and job description makes questions significantly more relevant.</p>
            </div>
            <Select
              label="Resume"
              optional
              options={resumeOptions}
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
            />
            <Select
              label="Job description"
              optional
              options={jobOptions}
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
            />
            {(resumes.length === 0 || jobs.length === 0) && (
              <p className="text-xs text-neutral-500">
                {resumes.length === 0 && (
                  <><Link href="/resume" className="font-medium text-plum-900 hover:underline">Upload a resume</Link> to get more personalised questions. </>
                )}
                {jobs.length === 0 && (
                  <><Link href="/jobs/new" className="font-medium text-plum-900 hover:underline">Add a job description</Link> to practice for a specific role.</>
                )}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-600">
              {error}
            </div>
          )}

          <Button
            className="w-full"
            size="xl"
            onClick={handleStart}
            loading={loading}
          >
            {loading ? 'Starting your interview...' : (
              <>
                <Mic className="h-5 w-5" />
                Begin interview
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
