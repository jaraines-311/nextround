'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Save } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { profileApi } from '@/lib/api/profile';

const industries = [
  { value: 'SOFTWARE_ENGINEERING', label: 'Software Engineering' },
  { value: 'DATA_ENGINEERING', label: 'Data Engineering' },
  { value: 'PRODUCT_MANAGEMENT', label: 'Product Management' },
  { value: 'SALES', label: 'Sales' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'CUSTOMER_SUCCESS', label: 'Customer Success' },
  { value: 'OTHER', label: 'Other' },
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    profileApi.get()
      .then((profile) => {
        reset({
          summary: profile.summary,
          yearsOfExperience: profile.yearsOfExperience,
          targetIndustry: profile.targetIndustry,
          skills: profile.skills?.join(', '),
          targetRoles: profile.targetRoles?.join(', '),
          strengths: profile.strengths?.join(', '),
          weaknesses: profile.weaknesses?.join(', '),
          userNotes: profile.userNotes,
          linkedinUrl: profile.linkedinUrl,
          githubUrl: profile.githubUrl,
          portfolioUrl: profile.portfolioUrl,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data: any) => {
    setSaving(true);
    setSaved(false);
    try {
      await profileApi.update({
        ...data,
        yearsOfExperience: data.yearsOfExperience ? parseInt(data.yearsOfExperience) : undefined,
        skills: data.skills ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        targetRoles: data.targetRoles ? data.targetRoles.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        strengths: data.strengths ? data.strengths.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        weaknesses: data.weaknesses ? data.weaknesses.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  if (loading) return <DashboardLayout><div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl p-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Candidate Profile</h1>
        <p className="mb-8 text-gray-600">Your profile helps AI generate more relevant interview questions.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Professional Info</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target industry</label>
              <select {...register('targetIndustry')} className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none">
                {industries.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of experience</label>
              <input type="number" {...register('yearsOfExperience')} min={0} max={50} className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
              <textarea {...register('summary')} rows={3} className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" placeholder="Brief professional summary..." />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Skills & Goals</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills <span className="text-gray-400">(comma-separated)</span></label>
              <input {...register('skills')} className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" placeholder="Python, TypeScript, PostgreSQL, Docker" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target roles <span className="text-gray-400">(comma-separated)</span></label>
              <input {...register('targetRoles')} className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" placeholder="Senior Software Engineer, Staff Engineer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Strengths <span className="text-gray-400">(comma-separated)</span></label>
              <input {...register('strengths')} className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" placeholder="System design, leadership, problem-solving" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Areas to improve <span className="text-gray-400">(comma-separated)</span></label>
              <input {...register('weaknesses')} className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" placeholder="Public speaking, conciseness" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Links</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input {...register('linkedinUrl')} type="url" className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
              <input {...register('githubUrl')} type="url" className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" placeholder="https://github.com/..." />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save profile
            </button>
            {saved && <span className="text-sm text-emerald-600 font-medium">Saved!</span>}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
