'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Mic, MessageSquare, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { interviewsApi } from '@/lib/api/interviews';
import { resumeApi, jobsApi } from '@/lib/api/profile';

const interviewTypes = [
  { value: 'RECRUITER_SCREEN', label: 'Recruiter Screen' },
  { value: 'HIRING_MANAGER', label: 'Hiring Manager' },
  { value: 'TECHNICAL', label: 'Technical Interview' },
  { value: 'BEHAVIORAL', label: 'Behavioral Interview' },
];

export default function NewInterviewPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [mode, setMode] = useState<'TEXT' | 'VOICE'>('TEXT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { type: 'TECHNICAL', resumeId: '', jobId: '' },
  });

  useEffect(() => {
    Promise.all([resumeApi.list(), jobsApi.list()])
      .then(([r, j]) => { setResumes(r); setJobs(j); })
      .catch(() => {});
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      const result = await interviewsApi.create({
        type: data.type,
        mode,
        resumeId: data.resumeId || undefined,
        jobId: data.jobId || undefined,
      });
      router.push(`/interviews/${result.session.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start interview. Check your AI Credit balance.');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-bold text-gray-900">Start a new interview</h1>
        <p className="mt-1 text-gray-600">Configure your practice session and let the AI take it from there.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {/* Interview type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Interview type</label>
            <div className="grid grid-cols-2 gap-3">
              {interviewTypes.map((type) => (
                <label key={type.value} className="cursor-pointer">
                  <input type="radio" value={type.value} {...register('type')} className="peer sr-only" />
                  <div className="rounded-xl border-2 border-gray-200 p-4 text-center text-sm font-medium text-gray-700 peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:text-brand-700 hover:border-gray-300">
                    {type.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Interview mode */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Interview mode</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'TEXT', label: 'Text', icon: MessageSquare, description: 'Type your answers' },
                { value: 'VOICE', label: 'Voice', icon: Mic, description: 'Speak your answers' },
              ].map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMode(m.value as 'TEXT' | 'VOICE')}
                  className={`rounded-xl border-2 p-4 text-left transition-colors ${
                    mode === m.value
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <m.icon className={`h-5 w-5 ${mode === m.value ? 'text-brand-600' : 'text-gray-400'}`} />
                  <div className={`mt-1 text-sm font-semibold ${mode === m.value ? 'text-brand-700' : 'text-gray-700'}`}>
                    {m.label}
                  </div>
                  <div className="text-xs text-gray-500">{m.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Resume */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Resume <span className="font-normal text-gray-400">(optional but recommended)</span>
            </label>
            <select
              {...register('resumeId')}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">No resume — use general context</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Job description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Job description <span className="font-normal text-gray-400">(optional but recommended)</span>
            </label>
            <select
              {...register('jobId')}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">No specific role — general interview</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title} {j.company ? `@ ${j.company}` : ''}</option>
              ))}
            </select>
          </div>

          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-4 text-base font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
            {loading ? 'Starting interview...' : 'Begin interview'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
