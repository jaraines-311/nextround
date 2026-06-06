'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Briefcase } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { jobsApi } from '@/lib/api/profile';

export default function NewJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const job = await jobsApi.create({ title: title || undefined, company: company || undefined, rawDescription: description });
      router.push('/jobs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save job description');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl p-8">
        <div className="mb-6 flex items-center gap-3">
          <Briefcase className="h-6 w-6 text-brand-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add job description</h1>
            <p className="text-gray-600">AI will parse the JD and generate targeted interview questions.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job title <span className="text-gray-400">(optional)</span></label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior Software Engineer" className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company <span className="text-gray-400">(optional)</span></label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={14}
              placeholder="Paste the full job description here..."
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              required
            />
          </div>

          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div className="flex gap-3">
            <button type="submit" disabled={!description.trim() || submitting} className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save job description
            </button>
            <button type="button" onClick={() => router.push('/jobs')} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
