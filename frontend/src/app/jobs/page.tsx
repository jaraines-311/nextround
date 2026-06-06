'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Plus, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { jobsApi } from '@/lib/api/profile';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => jobsApi.list().then(setJobs).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job?')) return;
    await jobsApi.remove(id);
    load();
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Descriptions</h1>
            <p className="text-gray-600">Saved jobs power targeted interview questions.</p>
          </div>
          <Link href="/jobs/new" className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            <Plus className="h-4 w-4" />
            Add job
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 font-medium text-gray-600">No job descriptions yet</p>
            <Link href="/jobs/new" className="mt-2 inline-block text-sm font-semibold text-brand-600 hover:underline">Add one now →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-900">{job.title || 'Untitled Job'}</p>
                    <p className="text-sm text-gray-500">
                      {job.company || 'No company'} · {job.seniorityLevel} · {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                    {job.requiredSkills?.length > 0 && (
                      <p className="mt-1 text-xs text-gray-400">{job.requiredSkills.slice(0, 5).join(', ')}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/interviews/new?jobId=${job.id}`} className="flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-100">
                    Practice <ArrowRight className="h-3 w-3" />
                  </Link>
                  <button onClick={() => handleDelete(job.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
