'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Link2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { jobsApi } from '@/lib/api/profile';

type Mode = 'url' | 'paste';

export default function NewJobPage() {
  const router = useRouter();

  const [mode, setMode]             = useState<Mode>('url');
  const [url, setUrl]               = useState('');
  const [fetching, setFetching]     = useState(false);
  const [fetchError, setFetchError] = useState('');

  const [title,       setTitle]       = useState('');
  const [company,     setCompany]     = useState('');
  const [description, setDescription] = useState('');
  const [salaryMin,   setSalaryMin]   = useState('');
  const [salaryMax,   setSalaryMax]   = useState('');
  const [targetAsk,   setTargetAsk]   = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleFetch = async () => {
    if (!url.trim()) return;
    setFetching(true);
    setFetchError('');
    try {
      const data = await jobsApi.fetchUrl(url.trim());
      if (data.title)   setTitle(data.title);
      if (data.company) setCompany(data.company);
      if (data.rawDescription) setDescription(data.rawDescription);
      if (data.salaryMin) setSalaryMin(String(data.salaryMin));
      if (data.salaryMax) setSalaryMax(String(data.salaryMax));
    } catch (e: any) {
      setFetchError(e.response?.data?.message || 'Could not fetch that URL. Try pasting the description instead.');
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!description.trim()) return;
    setSaving(true);
    setError('');
    try {
      await jobsApi.create({
        title:          title || undefined,
        company:        company || undefined,
        rawDescription: description,
        salaryMin:      salaryMin ? parseInt(salaryMin, 10) : undefined,
        salaryMax:      salaryMax ? parseInt(salaryMax, 10) : undefined,
        targetAsk:      targetAsk ? parseInt(targetAsk, 10) : undefined,
        sourceUrl:      url || undefined,
      });
      router.push('/jobs');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const hasDetails = !!description.trim();

  return (
    <DashboardLayout pageTitle="Add Job Prospect">
      <div className="mx-auto max-w-2xl">
        <Link href="/jobs" className="mb-5 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700">
          <ChevronLeft className="h-4 w-4" />
          Back to job prospects
        </Link>

        <div className="card p-5 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Job details</h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              Import from a URL or paste the job description. AI will extract skills and requirements to tailor your interview questions.
            </p>
          </div>

          {/* Mode tabs */}
          <div className="flex gap-1 rounded-lg bg-neutral-100 p-1">
            {(['url', 'paste'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                  mode === m
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {m === 'url' ? 'Import from URL' : 'Paste description'}
              </button>
            ))}
          </div>

          {mode === 'url' && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    label="Job posting URL"
                    placeholder="https://jobs.lever.co/company/role-id"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                  />
                </div>
                <div className="mt-5">
                  <Button onClick={handleFetch} disabled={!url.trim() || fetching} variant="secondary">
                    {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                    {fetching ? 'Importing…' : 'Import'}
                  </Button>
                </div>
              </div>
              {fetchError && (
                <p className="text-xs text-danger-600">{fetchError}</p>
              )}
              {hasDetails && !fetchError && (
                <p className="text-xs text-green-600">Details imported — review and save below.</p>
              )}
            </div>
          )}

          {mode === 'paste' && (
            <Textarea
              label="Full job description"
              hint="Paste the complete job posting for the most accurate question generation."
              rows={12}
              placeholder="We're looking for a Senior Software Engineer to join our platform team…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          )}

          {/* Always-visible fields once there's content, or in paste mode */}
          {(hasDetails || mode === 'paste') && (
            <div className="space-y-4 border-t border-neutral-100 pt-4">
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

              {mode === 'url' && (
                <Textarea
                  label="Job description"
                  hint="Imported from URL — edit if needed."
                  rows={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label="Pay range min"
                  optional
                  placeholder="120000"
                  hint="Annual, no commas"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value.replace(/\D/g, ''))}
                />
                <Input
                  label="Pay range max"
                  optional
                  placeholder="150000"
                  hint="Annual, no commas"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value.replace(/\D/g, ''))}
                />
                <Input
                  label="I'll ask for"
                  optional
                  placeholder="140000"
                  hint="Your target ask"
                  value={targetAsk}
                  onChange={(e) => setTargetAsk(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-600">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!hasDetails} loading={saving}>
              {saving ? 'Analysing…' : 'Save prospect'}
            </Button>
            <Button variant="secondary" onClick={() => router.push('/jobs')}>Cancel</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
