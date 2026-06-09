'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Plus, Trash2, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { jobsApi } from '@/lib/api/profile';
import { relativeTime } from '@/lib/utils';

function formatSalary(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
}

export default function JobsPage() {
  const [jobs, setJobs]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    jobsApi.list().then(setJobs).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job prospect?')) return;
    await jobsApi.remove(id); load();
  };

  return (
    <DashboardLayout
      pageTitle="Job Prospects"
      pageDescription="Saved prospects generate targeted, role-specific interview questions."
      actions={
        <Link href="/jobs/new">
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            Add prospect
          </Button>
        </Link>
      }
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-100" />)}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job prospects yet"
          description="Add a job you're targeting and NextRound will tailor every question to that role."
          action={{ label: 'Add job prospect', href: '/jobs/new' }}
        />
      ) : (
        <div className="card overflow-hidden">
          {jobs.map((job, i) => (
            <div
              key={job.id}
              className={`flex items-center gap-4 px-5 py-4 ${i < jobs.length - 1 ? 'border-b border-neutral-100' : ''}`}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                <Briefcase className="h-4 w-4 text-neutral-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {job.title || 'Untitled Job'}
                  </p>
                  <Badge variant="default" size="sm">{job.seniorityLevel ?? 'MID'}</Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-neutral-500">
                  {job.company || 'No company'}
                  {job.salaryMin || job.salaryMax
                    ? ` · ${job.salaryMin ? formatSalary(job.salaryMin) : '?'} – ${job.salaryMax ? formatSalary(job.salaryMax) : '?'}`
                    : ''}
                  {job.targetAsk ? ` · asking ${formatSalary(job.targetAsk)}` : ''}
                  {job.requiredSkills?.length > 0 ? ` · ${job.requiredSkills.slice(0, 3).join(', ')}` : ''}
                  {' · '}{relativeTime(job.createdAt)}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Link
                  href={`/interviews/new?jobId=${job.id}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-plum-50 px-3 py-1.5 text-xs font-semibold text-plum-900 hover:bg-plum-100 transition-colors"
                >
                  Practice
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-danger-50 hover:text-danger-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
