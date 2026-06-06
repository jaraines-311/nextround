'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { jobsApi } from '@/lib/api/profile';

export default function NewJobPage() {
  const router = useRouter();
  const [title,       setTitle]       = useState('');
  const [company,     setCompany]     = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  const handleSave = async () => {
    if (!description.trim()) return;
    setSaving(true);
    setError('');
    try {
      await jobsApi.create({
        title:          title || undefined,
        company:        company || undefined,
        rawDescription: description,
      });
      router.push('/jobs');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Add Job Description">
      <div className="mx-auto max-w-2xl">
        <Link href="/jobs" className="mb-5 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700">
          <ChevronLeft className="h-4 w-4" />
          Back to jobs
        </Link>

        <div className="card p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Job details</h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              Paste the full job description. NextRound's AI will extract skills, seniority, and requirements to tailor your interview questions.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Job title"
              optional
              placeholder="Senior Software Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              label="Company"
              optional
              placeholder="Acme Corp"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <Textarea
            label="Full job description"
            hint="Paste the complete job posting for the most accurate question generation."
            rows={14}
            placeholder="We're looking for a Senior Software Engineer to join our platform team…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {error && (
            <div className="rounded-md border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-600">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!description.trim()} loading={saving}>
              {saving ? 'Analysing…' : 'Save job description'}
            </Button>
            <Button variant="secondary" onClick={() => router.push('/jobs')}>Cancel</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
